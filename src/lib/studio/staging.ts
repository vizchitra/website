import type { Octokit } from '@octokit/rest';
import { GITHUB_OWNER, GITHUB_REPO } from '$lib/config/github';

const OWNER = GITHUB_OWNER;
const REPO = GITHUB_REPO;
const BASE_BRANCH = 'master';

export interface StagingState {
	branch: string;
	files: string[];
}

export function stagingKey(handle: string): string {
	return `studio_staging:${handle}`;
}

/**
 * Returns a valid staging branch for `handle`, creating one if needed.
 *
 * Handles three edge cases that previously caused "Save Failed":
 *  1. KV has a stale branch reference (branch was deleted after PR merge).
 *  2. KV is empty but the branch already exists on GitHub (created same day,
 *     e.g. after a publish that cleared KV but before the PR was merged).
 *  3. Normal first-save — branch doesn't exist anywhere yet.
 */
export async function ensureStagingBranch(
	octokit: Octokit,
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	kv: any,
	handle: string
): Promise<{ branchName: string; existing: StagingState | null }> {
	const existing = (await kv.get(stagingKey(handle), 'json')) as StagingState | null;

	if (existing?.branch) {
		// Verify the branch is still live on GitHub (may have been deleted after merge)
		try {
			await octokit.git.getRef({
				owner: OWNER,
				repo: REPO,
				ref: `heads/${existing.branch}`
			});
			return { branchName: existing.branch, existing };
		} catch {
			// Branch gone — fall through to create a fresh one
		}
	}

	// Close any stale open PRs from previous studio branches for this user
	try {
		const { data: openPrs } = await octokit.pulls.list({
			owner: OWNER,
			repo: REPO,
			state: 'open',
			per_page: 20
		});
		const stalePrs = openPrs.filter(
			(pr) => pr.head.ref.startsWith(`studio/${handle}/`) && pr.head.ref !== existing?.branch
		);
		await Promise.all(
			stalePrs.map((pr) =>
				octokit.pulls.update({ owner: OWNER, repo: REPO, pull_number: pr.number, state: 'closed' })
			)
		);
	} catch {
		// Non-fatal — stale PR cleanup is best-effort
	}

	// Determine new branch name from today's date
	const date = new Date().toISOString().slice(0, 10);
	const branchName = `studio/${handle}/${date}`;

	// Get master HEAD SHA to base the new branch on
	const { data: masterRef } = await octokit.git.getRef({
		owner: OWNER,
		repo: REPO,
		ref: `heads/${BASE_BRANCH}`
	});

	try {
		await octokit.git.createRef({
			owner: OWNER,
			repo: REPO,
			ref: `refs/heads/${branchName}`,
			sha: masterRef.object.sha
		});
	} catch (e) {
		// 422 = branch already exists (e.g. created moments ago after a publish).
		// That's fine — just use it.
		const msg = e instanceof Error ? e.message : '';
		if (!msg.includes('Reference already exists')) throw e;
	}

	return { branchName, existing: null };
}
