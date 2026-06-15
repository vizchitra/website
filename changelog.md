# Changelog

Append-only running log for AI agents. Add a new entry at the top each session.
Format: date, what changed, why, key files, notes for the next agent.

---

## 2026-05-10 — feat: studio UI improvements (grouped tables, panel layout, collaborator auth)

**What changed:**

1. Sessions and Submissions on the Studio dashboard are now grouped by type (Talks, Dialogues, Workshop, Exhibition, Panels) with collapsible `<details>` per group and a count badge — matching the Guides tree pattern.
2. New generic `GroupedTableCard.svelte` component handles any grouped table via Svelte 5 snippets — reusable for future data tables.
3. Staged files in the "Ready to publish" section are now clickable links back to the editable page.
4. Studio dashboard shows a two-step Edit → Publish workflow explanation instead of the old misleading "changes go live immediately" text.
5. `StudioPanel`: social og:image preview and optional `previewCard` snippet now appear _below_ frontmatter fields (not above). Parent pages can pass `{#snippet previewCard()}` for e.g. a `SessionCardExpanded` preview.
6. Auth now checks GitHub repo collaborator status via the bot token instead of a static `STUDIO_ALLOWED_USERS` env var. Anyone added as a collaborator on `vizchitra/website` can log in — no redeployment needed to add/remove editors.
7. Staged files are now loaded in the server `load()` function (from KV) with URLs resolved, removing the client-side `loadStaged()` fetch.

**Key files:** `src/lib/studio/GroupedTableCard.svelte` (new), `src/routes/studio/+page.svelte`, `src/routes/studio/+page.server.ts`, `src/lib/studio/editor/StudioPanel.svelte`, `src/routes/studio/auth/callback/+server.ts`, `src/lib/studio/session.ts`, `src/app.d.ts`, `studio.config.ts`

**Notes for next agent:** `STUDIO_ALLOWED_USERS` CF Pages secret can be removed — it is no longer read. `STUDIO_GITHUB_TOKEN` must be set (it was already required for stage/publish) — it is now also used for the collaborator check at login.

---

## 2026-05-10 — fix: publish auto-merges master into studio branch and enables PR auto-merge

**What changed:**

- `publish/+server.ts`: before creating the PR, merge master → studio branch via GitHub API so it's always up-to-date (content-only edits never conflict)
- After creating the PR, enable auto-squash-merge via GraphQL so the PR merges itself once CI passes — content editors never need to touch GitHub

**Key files:** `src/routes/api/studio/publish/+server.ts`

---

## 2026-05-10 — feat: move publish to Studio dashboard, auto-close stale PRs

**What changed:**

1. Removed publish form from `StudioPanel`. After saving, the panel now shows "✓ Staged. Go to Studio to publish when ready." with a link, and a teal button "N staged changes — publish in Studio" linking to `/studio`. Publish lives only on the Studio dashboard.
2. `ensureStagingBranch` now closes any open PRs from previous `studio/{handle}/*` branches before creating a new one. Runs as best-effort (non-fatal on error).

**Why:** Publish button in the side panel gave the false impression that each page must be published individually. Auto-close prevents stale PR accumulation across editing sessions.

**Key files:** `src/lib/studio/editor/StudioPanel.svelte`, `src/lib/studio/staging.ts`

---

## 2026-05-10 — fix: publish fails when PR already exists for staging branch

**What changed:** Publish endpoint now checks for an existing open PR on the staging branch before calling `pulls.create`. If one exists, it returns that PR's URL instead of failing with "A pull request already exists". Also surfaced the real server error in `StudioPanel` instead of the hardcoded "Publish failed — try again".

**Why:** After publishing, KV staging state is cleared but the branch and PR remain open until merged. A subsequent save reuses the same branch, then a second publish attempt fails because GitHub rejects creating a duplicate PR.

**Key files:** `src/routes/api/studio/publish/+server.ts`, `src/lib/studio/editor/StudioPanel.svelte`

---

## 2026-05-10 — fix: ArrayBuffer cast in session.ts, rename CI step

**What changed:** Cast `providedSig.buffer as ArrayBuffer` to satisfy `BufferSource` type (TypeScript rejects `SharedArrayBuffer`). Renamed CI step from "Svelte type-check" to "Svelte Check" in `pr-checks.yml`.

**Key files:** `src/lib/studio/session.ts`, `.github/workflows/pr-checks.yml`

---

## 2026-05-10 — fix: session.ts type errors (Uint8Array/ArrayBuffer)

**What changed:** Fixed two TypeScript errors in `src/lib/studio/session.ts` that failed svelte-check: `b64url` now accepts `ArrayBuffer | Uint8Array`, and `crypto.subtle.verify` receives `.buffer` to satisfy the `BufferSource` type.

**Key files:** `src/lib/studio/session.ts`

---

## 2026-05-10 — fix: signed cookie auth, prettier content ignore, build info placement

**What changed:**

1. Replaced KV-backed sessions with HMAC-signed cookies (`createSignedSession` / `verifySignedSession` in `session.ts`). Auth is now verified by checking the cookie signature — no KV lookup, no eventual-consistency delay. Requires `STUDIO_SESSION_SECRET` CF Pages secret (any long random string, e.g. `openssl rand -hex 32`).
2. Added `content/` to `.prettierignore` so studio-generated PR content files no longer fail the Prettier CI check.
3. Moved build info on `/studio/login` to below the sign-in button.

**Why:** KV eventual consistency caused every login to bounce back to `/studio/login` — the session write at one CF edge wasn't visible at another edge when the redirect landed. Signed cookies eliminate the round-trip entirely.

**Key files:** `src/lib/studio/session.ts`, `src/routes/studio/auth/callback/+server.ts`, `src/hooks.server.ts`, `src/routes/studio/logout/+server.ts`, `src/app.d.ts`, `.prettierignore`, `src/routes/studio/login/+page.svelte`

**Notes for next agent:** `STUDIO_SESSION_SECRET` must be set in CF Pages dashboard → Settings → Environment variables → as a secret. Without it, login returns 500 "Session secret not configured".

---

## 2026-05-10 — fix: stage 500 error, build info footer, wrangler compat bump

**What changed:**

1. Stage endpoint wrapped in top-level try/catch so all errors return JSON instead of an HTML 500 page. Error messages will now surface correctly in the studio UI.
2. Build SHA and branch injected at build time via `vite.config.js` `define` using `CF_PAGES_COMMIT_SHA` / `CF_PAGES_BRANCH`. Shown as `#abc1234 · branch` in footer of both `/studio` and `/studio/login`.
3. `wrangler.toml` bumped to `compatibility_date = "2025-05-01"` and `nodejs_compat_v2` flag to enable latest Node.js API polyfills in CF Workers.

**Why:** Stage endpoint was returning HTML 500 (crashing before JSON response), hiding the real error. Build info footer needed for deployment visibility. Older compat date may have caused Worker import failures with `@octokit/rest`.

**Key files:** `src/routes/api/studio/stage/+server.ts`, `vite.config.js`, `src/lib/build.ts` (new), `src/routes/studio/+page.svelte`, `src/routes/studio/login/+page.svelte`, `wrangler.toml`

---

## 2026-05-10 — fix: studio auth KV consistency and save error messages

**What changed:** Two fixes:

1. OAuth callback now verifies the KV session write is readable before redirecting to `/studio`, fixing the Safari bounce-back-to-login issue caused by Cloudflare KV eventual consistency.
2. StudioPanel save errors now show the actual server error message and HTTP status instead of a generic "Save failed".

**Why:** Safari was completing OAuth but landing back on `/studio/login` because the KV write hadn't propagated to the edge node serving `/studio`. Save failures showed a useless fallback message, hiding the real cause.

**Key files:** `src/routes/studio/auth/callback/+server.ts`, `src/lib/studio/editor/StudioPanel.svelte`

---

## 2026-05-10 — fix: studio login imports Header instead of Hero

**What changed:** `src/routes/studio/login/+page.svelte` was importing `Hero.svelte` under the alias `Header`. Updated import to point to `Header.svelte`.

**Why:** Login page was rendering the animated Hero component instead of the static Header.

**Key files:** `src/routes/studio/login/+page.svelte`

---

## 2026-05-10 — chore: automated commit for PR

**What changed:** Staged current workspace edits and prepared branch for PR.

**Why:** User requested a commit and pull request; this entry records the automated save.

**Key files:** see staged changes in the commit.

**Notes for next agent:** Replace this placeholder with a detailed changelog entry describing the grouped changes before merging.

---

## 2026-05-10 — refactor(studio): replace [var(--color-*)] with Tailwind tokens

**What changed:** Replaced all `text-[var(--color-grey-500)]` / `bg-[var(--color-viz-blue-subtle)]` arbitrary Tailwind class values with direct token names (`text-grey-500`, `bg-viz-blue-subtle`, etc.) across studio editor components and the studio dashboard.

**Why:** In Tailwind v4, all `--color-*` variables in `@theme static` automatically generate utility classes — no need for the `[var()]` escape hatch. Direct token names are shorter, readable, and correctly scanned by Tailwind's JIT. (This was in PR #295 but merged before the commit landed.)

**Key files:** `src/lib/studio/editor/SessionPanel.svelte`, `StudioPanel.svelte`, `PanelShell.svelte`, `FeedbackPanel.svelte`, `EditableFeedback.svelte`, `src/routes/studio/+page.svelte`

---

## 2026-05-10 — feat(studio): login banner, save fix, persistent panel, social previews

**What changed:**

1. **Login banner** — replaced the bare centered card with a `<Hero banner="square" color="grey">` at the top + form below, matching the site aesthetic.
2. **Save Failed fix** — `/api/studio/data` had its own inline staging-branch logic that didn't use `ensureStagingBranch()` from `staging.ts`, so the 422 "Reference already exists" fix from PR #291 never applied to session saves. Replaced with `ensureStagingBranch()`. Also fixed `SessionPanel` to surface the actual API error message instead of always showing "Save failed".
3. **Persistent panel** — added `src/routes/+layout.server.ts` to expose `studioUser`, and a new `ViewOnlyStrip.svelte` component rendered by the root layout when logged in and no real editable panel is present. Eliminates content-shift when navigating between editable and non-editable pages.
4. **Social preview** — added `socialImage` prop to `PanelShell`, `StudioPanel`, and `SessionPanel`. Pages pass `data.pageMeta.ogImage` to show the og:image inside the Preview section of the panel.

**Why:** Studio panel was jumpy (appearing/disappearing between pages), save was broken for sessions, login page was bare.

**Key files:** `src/routes/studio/login/+page.svelte`, `src/routes/api/studio/data/+server.ts`, `src/lib/studio/editor/SessionPanel.svelte`, `src/lib/studio/editor/PanelShell.svelte`, `src/lib/studio/editor/StudioPanel.svelte`, `src/lib/studio/editor/ViewOnlyStrip.svelte` (new), `src/routes/+layout.server.ts` (new), `src/routes/+layout.svelte`

**Notes for next agent:** `ViewOnlyStrip` sets `panelStore` to `'collapsed'` on mount and `'hidden'` on destroy. It only renders when `data.studioUser && !pathname.startsWith('/studio') && $panelStore === 'hidden'`. The `pageMeta.ogImage` must be set in page `load()` for the social preview to appear.

---

## 2026-05-10 — fix(redirects): handle all redirects in hooks.server before routing (PR #294)

**What changed:** Moved all `_redirects` handling into `hooks.server.ts` using a `?raw` Vite import. The hook runs before any routing, so redirects fire before SvelteKit can serve a prerendered 404 page.

**Why:** Workshop session URLs with old numbered slugs (e.g. `/2026/sessions/dataviz-crash-course-without-the-crash-out-19`) were returning 404. The `/2026/sessions/[slug]` route has `prerender = true` — for slugs not in the prerendered set, SvelteKit serves the static 404 page and the `load` function never runs. CF Pages `_redirects` also didn't fire because the CF Worker handles `/*` first. `hooks.server.ts` is the only place that runs unconditionally before routing in all environments.

**Key files:** `src/hooks.server.ts`

**Notes for next agent:** `hooks.server.ts` is now the single runtime redirect handler (uses `?raw` Vite import — no `node:fs`). The `_redirects` file at project root is still needed for CF Pages native redirects (non-Worker paths). The redirect check in `src/routes/2026/sessions/[slug]/+page.server.ts` (from PR #293) is now redundant but harmless.

---

## 2026-05-10 — fix(redirects): move \_redirects to static/ and add missing -19 entry

**What changed:** Moved `_redirects` from project root to `static/` so `adapter-cloudflare` includes it in the build output (`.svelte-kit/cloudflare`). Previously the file was never deployed — all redirects were silently broken in production. Also updated `svelte.config.js` to read from `static/_redirects`. Added the missing `/2026/sessions/interactive-dataviz-using-ai-coding-19` redirect (old URL shared in workshop communications).

**Why:** Cloudflare Pages only serves files from the `pages_build_output_dir` (`.svelte-kit/cloudflare`). The adapter copies `static/` there at build time; the project root is not included.

**Key files:** `static/_redirects` (moved from `_redirects`), `svelte.config.js`

**Notes for next agent:** `static/_redirects` is now the single source of truth for Cloudflare redirects. Add new entries there. The `svelte.config.js` reads this file at build time to exclude redirect paths from prerender error handling.

---

## 2026-05-10 — fix(studio): Save Failed on stage/feedback endpoints

**What changed:** Extracted `ensureStagingBranch` helper in `src/lib/studio/staging.ts` and used it in both `stage` and `feedback` API endpoints. The helper handles three cases that previously caused "Save Failed": (1) KV has a stale branch reference (branch deleted after PR merge — `getRef` now verifies the branch is still live before using it); (2) branch already exists on GitHub but KV is empty (after a same-day publish — `createRef` 422 is now caught and treated as success); (3) normal first save (unchanged).

**Why:** After publishing a PR and clearing KV, if the user made another edit the same day, `createRef` threw "Reference already exists" (422) because the branch wasn't deleted yet on GitHub. This surfaced as a generic "Save Failed" error in the UI.

**Key files:** `src/lib/studio/staging.ts` (new), `src/routes/api/studio/stage/+server.ts`, `src/routes/api/studio/feedback/+server.ts`

**Notes for next agent:** `STUDIO_GITHUB_TOKEN` must be set as a Cloudflare secret (not in wrangler.toml). If save still fails after this fix, check that secret is configured in the CF Pages dashboard.

---

## 2026-05-10 — Quality gates, changelog enforcement & faster CI

**What changed:** Added pre-commit hooks via `lefthook` that run oxfmt, prettier, oxlint, and a changelog guard on staged files. Split `pnpm lint` into `lint:fmt` (oxfmt for TS/JS/JSON, ~800ms) and `lint:fmt:svelte` (prettier for Svelte/MD only). Updated CI to run both as separate steps with individual pass/fail rows in the PR comment. Added a Changelog section to `agents.md` requiring agents to update `changelog.md` before committing when source files change.

**Why:** Prettier format check was failing in CI but never caught locally (no pre-commit gate). Changelog was being skipped by agents. CI was slow running prettier over all files including TS/JS that oxfmt handles faster.

**Key files:** `lefthook.yml` (new), `package.json`, `.github/workflows/pr-checks.yml`, `agents.md`

**Notes for next agent:** `pnpm install` auto-installs lefthook hooks via the `prepare` script. The changelog guard checks whether any `src/`, `content/`, or `studio.config.ts` file is staged — if so, `changelog.md` must also be staged. All TS/JS/JSON files in the repo were reformatted by oxfmt (double quotes, 2-space indent) as part of this change.

---

## 2026-05-10 — Studio OAuth & Cloudflare Workers fixes (PRs #287, #288)

### fix(studio): node:fs crash in CF Workers + auth error visibility

**What changed:** `buildContentTree()` in the studio dashboard called `await import('node:fs')` without a try-catch. Cloudflare Workers have no real filesystem — the import throws at runtime, crashing `/studio` for authenticated users. Fixed by probing `node:fs` first (`try { await import('node:fs') } catch { return [] }`); the page now loads with an empty content list if the filesystem is unavailable. Also surfaced the specific OAuth error code in the login error banner (`Sign-in failed (no_token)`) instead of the generic catch-all message.

**Why:** After fixing the OAuth CSRF bug (below), users could complete GitHub auth but landed on a broken studio page. The generic error message made it impossible to diagnose which OAuth step was failing.

**Key files:** `src/routes/studio/+page.server.ts`, `src/routes/studio/login/+page.svelte`

**Notes for next agent:** `buildContentTree` always returns `[]` in production (CF Workers have no filesystem). To make the content list work in prod, the options are: (a) pre-build the tree at build time and bundle it as a static import, or (b) fetch the file list from the GitHub API at runtime using `STUDIO_GITHUB_TOKEN`.

---

### fix(studio/oauth): replace KV CSRF state with cookie; add redirect_uri to token exchange

**What changed:** The CSRF state token was written to KV during `/studio/auth/github` and read back during `/studio/auth/callback`. These run as separate CF Worker invocations that may land on different Cloudflare edge locations — KV eventual consistency (up to 60s propagation) caused the callback to return `invalid_state` every time. Replaced with a short-lived `SameSite=Lax; HttpOnly; Secure` cookie (the standard OAuth pattern; `SameSite=Lax` ensures the cookie survives the cross-site GET redirect from GitHub). Also added the missing `redirect_uri` parameter to the token exchange call (GitHub requires it when `redirect_uri` was sent in the authorization request).

**Why:** Production OAuth was always failing at the CSRF state validation step.

**Key files:** `src/routes/studio/auth/github/+server.ts`, `src/routes/studio/auth/callback/+server.ts`

**Notes for next agent:** KV (`STUDIO_SESSIONS`) is still used for actual session storage — only the ephemeral CSRF state was moved to cookies. The session cookie (`studio_session`) is `SameSite=Strict` (set by our own callback, not cross-site). The CSRF state cookie (`oauth_state`) is `SameSite=Lax` and is cleared on every callback response (success or error).

---

### fix(routing): CF Worker not serving nested studio routes (PRs #285, #286)

**What changed:** `adapter-cloudflare` was configured with an explicit `include` list that didn't cover all nested studio paths. Routes like `/studio/auth/callback` and `/studio/auth/github` weren't reaching the Worker and returned 404. Fixed by setting `include: ['/*']` (with specific `exclude` patterns for static assets) in `svelte.config.js`.

**Why:** GitHub OAuth callback URL was reachable in the browser but the Worker never handled it.

**Key files:** `svelte.config.js`

---

## 2026-05-10 — feat(studio): editorial studio (PR #283)

**What changed:** Full editorial studio at `/studio` — GitHub OAuth login, Markdown/JSON content editor, CFP/CFE feedback management, session editing, and PR-based publishing workflow.

**Why:** The team needed a web UI to edit site content and manage conference submissions without pushing directly to git.

**Key files:** `src/routes/studio/` (all files), `src/lib/studio/session.ts`, `src/hooks.server.ts`, `wrangler.toml`, `studio.config.ts`

**Architecture summary:**

- **Auth:** GitHub OAuth app. Required env vars: `STUDIO_GITHUB_CLIENT_ID`, `STUDIO_GITHUB_CLIENT_SECRET`, `STUDIO_ALLOWED_USERS` (comma-separated GitHub handles), `STUDIO_BASE_URL` (`https://vizchitra.com` — set in wrangler.toml `[vars]`).
- **Sessions:** KV namespace `STUDIO_SESSIONS` (binding in wrangler.toml). Session ID stored in `studio_session` cookie (7-day TTL, `HttpOnly; SameSite=Strict; Secure`).
- **Dev mode:** `hooks.server.ts` always injects a fake `studioUser` in dev — no login page, no OAuth, no KV needed locally.
- **Publishing:** Edits are staged to a `studio/{handle}/{date}` GitHub branch, then a PR is opened to `master` via `@octokit/rest` using `STUDIO_GITHUB_TOKEN`.
- **Content tree:** Built at runtime by reading the filesystem (`node:fs`). Works in dev; returns `[]` in CF Workers (see note above).

**Notes for next agent:**

- `STUDIO_ALLOWED_USERS` must be set in Cloudflare Pages environment variables (the `[vars]` section in wrangler.toml is for non-secret vars; secrets go in the CF dashboard).
- The studio's `+layout.ts` exports `prerender = false` — all studio routes are dynamic, none are prerendered.
- `studio.config.ts` at repo root defines the content collections (name, path, type, URL template). Edit this to add/remove editable content sections.
