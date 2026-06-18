import type { RequestHandler } from './$types';
import { dev } from '$app/environment';
import { Octokit } from '@octokit/rest';
import { createSignedSession, buildSessionCookie } from '$lib/studio/session';
import { GITHUB_OWNER, GITHUB_REPO } from '$lib/config/github';

export const GET: RequestHandler = async ({ platform, url, request }) => {
	const code = url.searchParams.get('code');
	const stateParam = url.searchParams.get('state') ?? '';

	if (!code) {
		return new Response(null, {
			status: 302,
			headers: { Location: '/studio/login?error=missing_code' }
		});
	}

	const clientId = platform?.env?.STUDIO_GITHUB_CLIENT_ID;
	const clientSecret = platform?.env?.STUDIO_GITHUB_CLIENT_SECRET;
	const sessionSecret = platform?.env?.STUDIO_SESSION_SECRET;
	const githubBotToken = platform?.env?.STUDIO_GITHUB_TOKEN;
	const origin = platform?.env?.STUDIO_BASE_URL ?? url.origin;
	const callbackUrl = `${origin}/studio/auth/callback`;

	if (!clientId || !clientSecret) {
		return new Response('OAuth not configured', { status: 500 });
	}
	if (!sessionSecret) {
		return new Response('Session secret not configured', { status: 500 });
	}

	const [state, encodedNext] = stateParam.split(':');
	const next = encodedNext ? decodeURIComponent(encodedNext) : '/studio';

	const cookieHeader = request.headers.get('cookie') ?? '';
	const cookieState =
		cookieHeader
			.split(';')
			.map((c) => c.trim())
			.find((c) => c.startsWith('oauth_state='))
			?.slice('oauth_state='.length) ?? '';

	const clearStateCookie = 'oauth_state=; Path=/; Max-Age=0; HttpOnly; SameSite=Lax; Secure';

	if (!state || !cookieState || cookieState !== state) {
		return new Response(null, {
			status: 302,
			headers: { Location: '/studio/login?error=invalid_state' }
		});
	}

	const tokenRes = await fetch('https://github.com/login/oauth/access_token', {
		method: 'POST',
		headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
		body: JSON.stringify({
			client_id: clientId,
			client_secret: clientSecret,
			code,
			redirect_uri: callbackUrl
		})
	});

	if (!tokenRes.ok) {
		return new Response(null, {
			status: 302,
			headers: { Location: '/studio/login?error=token_exchange', 'Set-Cookie': clearStateCookie }
		});
	}

	const tokenData = (await tokenRes.json()) as { access_token?: string; error?: string };
	if (!tokenData.access_token) {
		return new Response(null, {
			status: 302,
			headers: { Location: '/studio/login?error=no_token', 'Set-Cookie': clearStateCookie }
		});
	}

	const userRes = await fetch('https://api.github.com/user', {
		headers: { Authorization: `Bearer ${tokenData.access_token}`, 'User-Agent': 'VizChitra-Studio' }
	});

	if (!userRes.ok) {
		return new Response(null, {
			status: 302,
			headers: { Location: '/studio/login?error=user_fetch', 'Set-Cookie': clearStateCookie }
		});
	}

	const userData = (await userRes.json()) as { login?: string };
	const handle = userData.login;

	if (!handle) {
		return new Response(null, {
			status: 302,
			headers: { Location: '/studio/login?error=no_handle', 'Set-Cookie': clearStateCookie }
		});
	}

	// Check GitHub repo collaborator status using the bot token.
	// Anyone added as a collaborator on vizchitra repo can log in.
	if (githubBotToken) {
		try {
			const octokit = new Octokit({ auth: githubBotToken });
			await octokit.repos.checkCollaborator({
				owner: GITHUB_OWNER,
				repo: GITHUB_REPO,
				username: handle
			});
		} catch {
			return new Response(null, {
				status: 302,
				headers: { Location: '/studio/login?error=unauthorized', 'Set-Cookie': clearStateCookie }
			});
		}
	}

	// Create a signed cookie — no KV write, no eventual-consistency delay.
	// The HMAC signature lets hooks.server.ts verify the session without any
	// network call to KV, so auth works immediately on every edge node.
	const token = await createSignedSession(handle, sessionSecret);
	const sessionCookie = buildSessionCookie(token, !dev);

	const safePath = next.startsWith('/') && !next.startsWith('//') ? next : '/studio';
	const headers = new Headers({ Location: safePath });
	headers.append('Set-Cookie', sessionCookie);
	headers.append('Set-Cookie', clearStateCookie);

	return new Response(null, { status: 302, headers });
};
