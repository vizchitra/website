import type { RequestHandler } from './$types';
import { Octokit } from '@octokit/rest';
import { ensureStagingBranch, stagingKey, type StagingState } from '$lib/studio/staging';
import { GITHUB_OWNER, GITHUB_REPO } from '$lib/config/github';

export const prerender = false;

const OWNER = GITHUB_OWNER;
const REPO = GITHUB_REPO;
const BASE_BRANCH = 'master';

type SubmissionType = 'cfp' | 'cfe';

function feedbackPath(type: SubmissionType): string {
	return `content/2026/feedback/${type}.json`;
}

interface FeedbackEntry {
	status: 'Under Review' | 'Selected' | 'Not Proceeding';
	notes: string;
	updatedAt: string;
	updatedBy: string;
}

export const POST: RequestHandler = async ({ request, locals, platform }) => {
	if (!locals.studioUser) {
		return new Response(JSON.stringify({ error: 'Unauthorized' }), {
			status: 401,
			headers: { 'Content-Type': 'application/json' }
		});
	}

	let body: { type: SubmissionType; id: string; status: string; notes: string };
	try {
		body = await request.json();
	} catch {
		return new Response(JSON.stringify({ error: 'Invalid JSON body' }), {
			status: 400,
			headers: { 'Content-Type': 'application/json' }
		});
	}

	const { type, id, status, notes } = body;

	if (!['cfp', 'cfe'].includes(type) || !id || !status) {
		return new Response(JSON.stringify({ error: 'Invalid payload' }), {
			status: 400,
			headers: { 'Content-Type': 'application/json' }
		});
	}

	const githubToken = platform?.env?.STUDIO_GITHUB_TOKEN;
	if (!githubToken) {
		return new Response(JSON.stringify({ error: 'GitHub token not configured' }), {
			status: 500,
			headers: { 'Content-Type': 'application/json' }
		});
	}

	const kv = platform?.env?.STUDIO_SESSIONS;
	if (!kv) {
		return new Response(JSON.stringify({ error: 'KV not available' }), {
			status: 500,
			headers: { 'Content-Type': 'application/json' }
		});
	}

	const handle = locals.studioUser.handle;
	const octokit = new Octokit({ auth: githubToken });
	const repoPath = feedbackPath(type as SubmissionType);

	try {
		const { branchName, existing } = await ensureStagingBranch(octokit, kv, handle);

		// Fetch current feedback JSON from the staging branch (fall back to master)
		let currentFeedback: Record<string, FeedbackEntry> = {};
		let sha: string | undefined;
		for (const ref of [branchName, BASE_BRANCH]) {
			try {
				const { data } = await octokit.repos.getContent({
					owner: OWNER,
					repo: REPO,
					path: repoPath,
					ref
				});
				if (!Array.isArray(data) && data.type === 'file') {
					const decoded = atob(data.content.replace(/\n/g, ''));
					currentFeedback = JSON.parse(decoded);
					if (ref === branchName) sha = data.sha;
				}
				break;
			} catch {
				// not found on this ref, try next
			}
		}

		// Merge in the new entry
		const entry: FeedbackEntry = {
			status: status as FeedbackEntry['status'],
			notes: notes ?? '',
			updatedAt: new Date().toISOString(),
			updatedBy: handle
		};
		currentFeedback[id] = entry;

		// Write updated JSON to staging branch
		const serialised = JSON.stringify(currentFeedback, null, 2) + '\n';
		const content = btoa(unescape(encodeURIComponent(serialised)));

		await octokit.repos.createOrUpdateFileContents({
			owner: OWNER,
			repo: REPO,
			path: repoPath,
			message: `content: update ${type} feedback for ${id} via Studio (@${handle})`,
			content,
			sha,
			branch: branchName
		});

		// Update KV staging state
		const stagedFiles = existing?.files ?? [];
		if (!stagedFiles.includes(repoPath)) stagedFiles.push(repoPath);
		const newState: StagingState = { branch: branchName, files: stagedFiles };
		await kv.put(stagingKey(handle), JSON.stringify(newState), {
			expirationTtl: 7 * 24 * 60 * 60
		});

		return new Response(JSON.stringify({ ok: true, stagedCount: stagedFiles.length }), {
			status: 200,
			headers: { 'Content-Type': 'application/json' }
		});
	} catch (e) {
		const message = e instanceof Error ? e.message : 'GitHub API error';
		return new Response(JSON.stringify({ error: message }), {
			status: 500,
			headers: { 'Content-Type': 'application/json' }
		});
	}
};
