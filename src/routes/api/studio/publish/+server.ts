import type { RequestHandler } from './$types';
import { Octokit } from '@octokit/rest';
import { GITHUB_OWNER, GITHUB_REPO } from '$lib/config/github';

export const prerender = false;

const OWNER = GITHUB_OWNER;
const REPO = GITHUB_REPO;
const BASE_BRANCH = 'master';

interface StagingState {
	branch: string;
	files: string[];
}

export const POST: RequestHandler = async ({ request, locals, platform }) => {
	if (!locals.studioUser) {
		return new Response(JSON.stringify({ error: 'Unauthorized' }), {
			status: 401,
			headers: { 'Content-Type': 'application/json' }
		});
	}

	let body: { message: string };
	try {
		body = await request.json();
	} catch {
		return new Response(JSON.stringify({ error: 'Invalid JSON body' }), {
			status: 400,
			headers: { 'Content-Type': 'application/json' }
		});
	}

	const { message } = body;
	if (!message?.trim()) {
		return new Response(JSON.stringify({ error: 'PR description is required' }), {
			status: 400,
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

	const githubToken = platform?.env?.STUDIO_GITHUB_TOKEN;
	if (!githubToken) {
		return new Response(JSON.stringify({ error: 'GitHub token not configured' }), {
			status: 500,
			headers: { 'Content-Type': 'application/json' }
		});
	}

	const handle = locals.studioUser.handle;
	const state = (await kv.get(`studio_staging:${handle}`, 'json')) as StagingState | null;

	if (!state?.branch || !state?.files?.length) {
		return new Response(JSON.stringify({ error: 'No staged changes to publish' }), {
			status: 400,
			headers: { 'Content-Type': 'application/json' }
		});
	}

	try {
		const octokit = new Octokit({ auth: githubToken });

		// Check if a PR already exists for this branch (e.g. previous publish still open)
		const { data: existingPrs } = await octokit.pulls.list({
			owner: OWNER,
			repo: REPO,
			head: `${OWNER}:${state.branch}`,
			state: 'open'
		});

		// Bring studio branch up to date with master (content-only edits never conflict)
		try {
			await octokit.repos.merge({
				owner: OWNER,
				repo: REPO,
				base: state.branch,
				head: BASE_BRANCH,
				commit_message: `Merge master into ${state.branch}`
			});
		} catch {
			// 204 (already up-to-date) or any other non-fatal error — proceed
		}

		let prNumber: number;
		let prUrl: string;

		if (existingPrs.length > 0) {
			prNumber = existingPrs[0].number;
			prUrl = existingPrs[0].html_url;
		} else {
			const fileList = state.files.map((f) => `- \`${f}\``).join('\n');
			const { data: pr } = await octokit.pulls.create({
				owner: OWNER,
				repo: REPO,
				title: `content: ${message.slice(0, 72)}`,
				body: `${message}\n\n**Edited by @${handle} via VizChitra Studio**\n\n### Changed files\n${fileList}`,
				head: state.branch,
				base: BASE_BRANCH
			});
			prNumber = pr.number;
			prUrl = pr.html_url;
		}

		// Enable auto-squash-merge so the PR merges itself after CI passes
		try {
			await octokit.graphql(
				`mutation($prId: ID!) {
					enablePullRequestAutoMerge(input: { pullRequestId: $prId, mergeMethod: SQUASH }) {
						clientMutationId
					}
				}`,
				{
					prId: (await octokit.pulls.get({ owner: OWNER, repo: REPO, pull_number: prNumber })).data
						.node_id
				}
			);
		} catch {
			// Auto-merge may be disabled on the repo — non-fatal, editor can merge manually
		}

		// Clear staging state from KV so the next save creates a fresh branch
		await kv.delete(`studio_staging:${handle}`);

		return new Response(JSON.stringify({ ok: true, prUrl }), {
			status: 200,
			headers: { 'Content-Type': 'application/json' }
		});
	} catch (e) {
		const message_err = e instanceof Error ? e.message : 'GitHub API error';
		return new Response(JSON.stringify({ error: message_err }), {
			status: 500,
			headers: { 'Content-Type': 'application/json' }
		});
	}
};
