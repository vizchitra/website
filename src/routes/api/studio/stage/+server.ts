import type { RequestHandler } from './$types';
import { Octokit } from '@octokit/rest';
import matter from 'gray-matter';
import { ensureStagingBranch, stagingKey, type StagingState } from '$lib/studio/staging';
import { GITHUB_OWNER, GITHUB_REPO } from '$lib/config/github';

export const prerender = false;

const OWNER = GITHUB_OWNER;
const REPO = GITHUB_REPO;

const ALLOWED_PREFIXES = ['content/'];

function isAllowedPath(filePath: string): boolean {
	const normalised = filePath.replace(/\\/g, '/').replace(/^\/+/, '');
	if (normalised.includes('..')) return false;
	return ALLOWED_PREFIXES.some((prefix) => normalised.startsWith(prefix));
}

const json500 = (msg: string) =>
	new Response(JSON.stringify({ error: msg }), {
		status: 500,
		headers: { 'Content-Type': 'application/json' }
	});

export const POST: RequestHandler = async (event) => {
	try {
		return await handlePost(event);
	} catch (e) {
		return json500(e instanceof Error ? e.message : String(e));
	}
};

async function handlePost({ request, locals, platform }: Parameters<RequestHandler>[0]) {
	if (!locals.studioUser) {
		return new Response(JSON.stringify({ error: 'Unauthorized' }), {
			status: 401,
			headers: { 'Content-Type': 'application/json' }
		});
	}

	let body: { filePath: string; body: string; frontmatter: Record<string, unknown> };
	try {
		body = await request.json();
	} catch {
		return new Response(JSON.stringify({ error: 'Invalid JSON body' }), {
			status: 400,
			headers: { 'Content-Type': 'application/json' }
		});
	}

	const { filePath, body: markdownBody, frontmatter } = body;

	if (!filePath || typeof filePath !== 'string' || !isAllowedPath(filePath)) {
		return new Response(JSON.stringify({ error: 'Invalid or disallowed file path' }), {
			status: 400,
			headers: { 'Content-Type': 'application/json' }
		});
	}

	const githubToken = platform?.env?.STUDIO_GITHUB_TOKEN;
	if (!githubToken) return json500('GitHub token not configured');

	const kv = platform?.env?.STUDIO_SESSIONS;
	if (!kv) return json500('KV not available');

	const handle = locals.studioUser.handle;
	const octokit = new Octokit({ auth: githubToken });
	const repoPath = filePath.replace(/^\/+/, '');
	const serialised = matter.stringify(markdownBody, frontmatter);
	const content = btoa(unescape(encodeURIComponent(serialised)));

	try {
		const { branchName, existing } = await ensureStagingBranch(octokit, kv, handle);

		// Get current file SHA on the staging branch
		let sha: string | undefined;
		try {
			const { data: fileData } = await octokit.repos.getContent({
				owner: OWNER,
				repo: REPO,
				path: repoPath,
				ref: branchName
			});
			sha = Array.isArray(fileData) ? undefined : (fileData as { sha: string }).sha;
		} catch {
			// File may not exist yet on branch — that's fine
		}

		// Commit file to staging branch
		const slugPart = repoPath.split('/').pop() ?? repoPath;
		await octokit.repos.createOrUpdateFileContents({
			owner: OWNER,
			repo: REPO,
			path: repoPath,
			message: `content: edit ${slugPart} via Studio (@${handle})`,
			content,
			sha,
			branch: branchName
		});

		// Update KV staging state
		const stagedFiles = existing?.files ?? [];
		if (!stagedFiles.includes(repoPath)) stagedFiles.push(repoPath);
		const newState: StagingState = { branch: branchName, files: stagedFiles };
		// 7-day TTL — staging branches should not linger
		await kv.put(stagingKey(handle), JSON.stringify(newState), { expirationTtl: 7 * 24 * 60 * 60 });

		return new Response(JSON.stringify({ ok: true, stagedCount: stagedFiles.length }), {
			status: 200,
			headers: { 'Content-Type': 'application/json' }
		});
	} catch (e) {
		return json500(e instanceof Error ? e.message : 'GitHub API error');
	}
}
