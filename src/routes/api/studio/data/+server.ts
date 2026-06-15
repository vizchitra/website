/**
 * /api/studio/data  — stage an update to a JSON data file.
 *
 * For array files (e.g. sessions.json):
 *   POST { filePath, key: slug, data: { ...fields } }
 *   Finds the array item where item.slug === key and shallow-merges `data` into it.
 *
 * For object files (e.g. a settings map):
 *   POST { filePath, key: someKey, data: { ...fields } }
 *   Merges data into file[key].
 *
 * Allowed paths: content/ only (same restriction as /api/studio/stage).
 */
import type { RequestHandler } from './$types';
import { Octokit } from '@octokit/rest';
import { ensureStagingBranch, stagingKey, type StagingState } from '$lib/studio/staging';
import { GITHUB_OWNER, GITHUB_REPO } from '$lib/config/github';

export const prerender = false;

const OWNER = GITHUB_OWNER;
const REPO = GITHUB_REPO;
const BASE_BRANCH = 'master';
const ALLOWED_PREFIX = 'content/';

function isAllowed(filePath: string): boolean {
	const norm = filePath.replace(/\\/g, '/').replace(/^\/+/, '');
	return (
		!norm.includes('..') &&
		norm.startsWith(ALLOWED_PREFIX) &&
		(norm.endsWith('.json') || norm.endsWith('.toml'))
	);
}

export const POST: RequestHandler = async ({ request, locals, platform }) => {
	if (!locals.studioUser) {
		return new Response(JSON.stringify({ error: 'Unauthorized' }), {
			status: 401,
			headers: { 'Content-Type': 'application/json' }
		});
	}

	let body: { filePath: string; key: string; data: Record<string, unknown> };
	try {
		body = await request.json();
	} catch {
		return new Response(JSON.stringify({ error: 'Invalid JSON body' }), {
			status: 400,
			headers: { 'Content-Type': 'application/json' }
		});
	}

	const { filePath, key, data } = body;

	if (!filePath || !isAllowed(filePath) || !key || !data || typeof data !== 'object') {
		return new Response(JSON.stringify({ error: 'Invalid payload' }), {
			status: 400,
			headers: { 'Content-Type': 'application/json' }
		});
	}

	const githubToken = platform?.env?.STUDIO_GITHUB_TOKEN;
	const kv = platform?.env?.STUDIO_SESSIONS;

	// Dev: write directly to disk instead of going through GitHub
	if (!githubToken || !kv) {
		try {
			const { resolve, normalize } = await import('node:path');
			const { readFileSync, writeFileSync } = await import('node:fs');

			const ALLOWED_ROOT = resolve('content');
			const repoPathDev = filePath.replace(/^\/+/, '');
			const absolute = resolve(normalize(repoPathDev));
			if (!absolute.startsWith(ALLOWED_ROOT + '/')) {
				return new Response(JSON.stringify({ error: 'Path traversal detected' }), {
					status: 400,
					headers: { 'Content-Type': 'application/json' }
				});
			}

			const raw = readFileSync(absolute, 'utf-8');
			const isToml = absolute.endsWith('.toml');
			let currentData: unknown;
			if (isToml) {
				const { parse: parseToml } = await import('smol-toml');
				currentData = parseToml(raw);
			} else {
				currentData = JSON.parse(raw);
			}

			// TOML array files are stored as { session: [...] }
			const arrayData = isToml
				? (currentData as Record<string, unknown[]>)[Object.keys(currentData as object)[0]]
				: currentData;
			const rootKey = isToml ? Object.keys(currentData as object)[0] : null;

			let updated: unknown;
			if (Array.isArray(arrayData)) {
				const updatedArray = arrayData.map((item: Record<string, unknown>) =>
					item.slug === key ? { ...item, ...data } : item
				);
				updated = isToml ? { [rootKey!]: updatedArray } : updatedArray;
			} else if (currentData && typeof currentData === 'object') {
				updated = {
					...(currentData as Record<string, unknown>),
					[key]: {
						...((currentData as Record<string, unknown>)[key] as Record<string, unknown>),
						...data
					}
				};
			} else {
				throw new Error('Cannot parse existing file');
			}

			let serialised: string;
			if (isToml) {
				const { stringify: stringifyToml } = await import('smol-toml');
				serialised = stringifyToml(updated as Record<string, unknown>);
			} else {
				serialised = JSON.stringify(updated, null, '\t') + '\n';
			}
			writeFileSync(absolute, serialised, 'utf-8');

			// Store the override in globalThis so resolveAllSessions can apply it
			// immediately without waiting for Vite's file-watcher to invalidate
			// the stale module cache (race condition vs invalidateAll()).
			const g = globalThis as Record<string, unknown>;
			if (!g.__studioDataOverrides) g.__studioDataOverrides = {};
			const overrides = g.__studioDataOverrides as Record<
				string,
				Record<string, Record<string, unknown>>
			>;
			if (!overrides[filePath]) overrides[filePath] = {};
			overrides[filePath][key] = data as Record<string, unknown>;

			return new Response(JSON.stringify({ ok: true }), {
				status: 200,
				headers: { 'Content-Type': 'application/json' }
			});
		} catch (e) {
			const message = e instanceof Error ? e.message : 'Dev write failed';
			return new Response(JSON.stringify({ error: message }), {
				status: 500,
				headers: { 'Content-Type': 'application/json' }
			});
		}
	}

	const handle = locals.studioUser.handle;
	const octokit = new Octokit({ auth: githubToken });
	const repoPath = filePath.replace(/^\/+/, '');

	try {
		const { branchName, existing } = await ensureStagingBranch(octokit, kv, handle);

		// Fetch current file from staging branch (fall back to master)
		let currentData: unknown = null;
		let sha: string | undefined;
		for (const ref of [branchName, BASE_BRANCH]) {
			try {
				const { data: fileData } = await octokit.repos.getContent({
					owner: OWNER,
					repo: REPO,
					path: repoPath,
					ref
				});
				if (!Array.isArray(fileData) && fileData.type === 'file') {
					const binaryStr = atob(fileData.content.replace(/\n/g, ''));
					const decoded = new TextDecoder('utf-8').decode(
						Uint8Array.from(binaryStr, (c) => c.charCodeAt(0))
					);
					if (repoPath.endsWith('.toml')) {
						const { parse: parseToml } = await import('smol-toml');
						currentData = parseToml(decoded);
					} else {
						currentData = JSON.parse(decoded);
					}
					if (ref === branchName) sha = fileData.sha;
				}
				break;
			} catch {
				// not found on this ref, try next
			}
		}

		// Apply the update
		const isToml = repoPath.endsWith('.toml');
		const arrayData = isToml
			? (currentData as Record<string, unknown[]>)[Object.keys(currentData as object)[0]]
			: currentData;
		const rootKey = isToml ? Object.keys(currentData as object)[0] : null;

		let updated: unknown;
		if (Array.isArray(arrayData)) {
			const updatedArray = arrayData.map((item: Record<string, unknown>) =>
				item.slug === key ? { ...item, ...data } : item
			);
			updated = isToml ? { [rootKey!]: updatedArray } : updatedArray;
		} else if (currentData && typeof currentData === 'object') {
			// Object file: merge into key
			updated = {
				...(currentData as Record<string, unknown>),
				[key]: {
					...((currentData as Record<string, unknown>)[key] as Record<string, unknown>),
					...data,
					updatedAt: new Date().toISOString(),
					updatedBy: handle
				}
			};
		} else {
			return new Response(JSON.stringify({ error: 'Cannot parse existing file' }), {
				status: 500,
				headers: { 'Content-Type': 'application/json' }
			});
		}

		// Write updated file to staging branch
		let serialised: string;
		if (isToml) {
			const { stringify: stringifyToml } = await import('smol-toml');
			serialised = stringifyToml(updated as Record<string, unknown>);
		} else {
			serialised = JSON.stringify(updated, null, 2) + '\n';
		}
		const content = btoa(unescape(encodeURIComponent(serialised)));

		await octokit.repos.createOrUpdateFileContents({
			owner: OWNER,
			repo: REPO,
			path: repoPath,
			message: `content: update ${key} in ${repoPath} via Studio (@${handle})`,
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
