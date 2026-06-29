import type { PageServerLoad } from './$types';
import { redirect } from '@sveltejs/kit';
import matter from 'gray-matter';
import { studioConfig, type StudioCollection } from '../../../studio.config';
import { parseCFPProposals, parseCFEProposals } from '$lib/utils/csv-parser';
import { resolveAllSessions } from '$lib/utils/sessions';
import cfpRaw from '../../../content/2026/data/cfp.csv?raw';
import cfeRaw from '../../../content/2026/data/cfe.csv?raw';
import cfpFeedback from '../../../content/2026/feedback/cfp.json';
import cfeFeedback from '../../../content/2026/feedback/cfe.json';

// Vite pre-bundles all studio content files at build time.
// Works in both dev (HMR keeps it live) and Cloudflare Workers (no node:fs needed).
const _rawMarkdown = import.meta.glob<{ default: string }>('/content/**/*.md', {
	query: '?raw',
	eager: true
});
// Normalise keys: '/content/pages/about.md' → 'content/pages/about.md'
const markdownContent: Record<string, string> = Object.fromEntries(
	Object.entries(_rawMarkdown).map(([p, m]) => [p.replace(/^\//, ''), m.default])
);

export interface SubmissionRow {
	id: string;
	slug: string;
	title: string;
	submitter: string;
	format: string;
	status: string;
	notes: string;
	url: string;
}

export interface SessionRow {
	slug: string;
	sessionType: string;
	title: string;
	speakerName: string;
	organisation: string;
	date: string;
	time: string;
	display: boolean;
	url: string;
}

// ── Shared types ─────────────────────────────────────────────────────────────

export interface TableGroup<T> {
	name: string;
	count: number;
	rows: T[];
}

export interface FileEntry {
	title: string;
	filePath: string;
	url: string; // empty = no link (e.g. data files)
}

export interface FlatGroup {
	kind: 'flat';
	name: string;
	files: FileEntry[];
}

export interface GuideSubGroup {
	name: string; // display name, e.g. "Talks"
	slug: string; // URL slug, e.g. "talks"
	files: FileEntry[];
}

export interface TreeGroup {
	kind: 'tree';
	name: string;
	groups: GuideSubGroup[];
}

export type ContentGroup = FlatGroup | TreeGroup;

// ── Content tree builder ──────────────────────────────────────────────────────

function buildContentTree(collections: StudioCollection[]): ContentGroup[] {
	function getTitle(filePath: string): string {
		const raw = markdownContent[filePath];
		if (!raw)
			return (
				filePath
					.split('/')
					.pop()
					?.replace(/\.[^.]+$/, '') ?? filePath
			);
		try {
			return (
				(matter(raw).data?.title as string) ??
				filePath
					.split('/')
					.pop()
					?.replace(/\.[^.]+$/, '') ??
				filePath
			);
		} catch {
			return (
				filePath
					.split('/')
					.pop()
					?.replace(/\.[^.]+$/, '') ?? filePath
			);
		}
	}

	function getFrontmatterField(filePath: string, field: string): string {
		const raw = markdownContent[filePath];
		if (!raw) return '';
		try {
			return (matter(raw).data?.[field] as string) ?? '';
		} catch {
			return '';
		}
	}

	function resolveUrl(template: string, slug: string, dirSlug: string, filePath: string): string {
		let url = template.replace('{dirSlug}', dirSlug).replace('{slug}', slug);
		if (url.includes('{section}')) {
			url = url.replace('{section}', getFrontmatterField(filePath, 'section'));
		}
		// Unresolved tokens, empty trailing segment, or double slashes → no link
		if (url.includes('{') || url.endsWith('/') || url.includes('//')) return '';
		return url;
	}

	function filesForCollection(col: StudioCollection): FileEntry[] {
		const dirSlug = col.path.split('/').pop() ?? '';
		const prefix = col.path + '/';
		const filenames = Object.keys(markdownContent)
			.filter((p) => p.startsWith(prefix) && !p.slice(prefix.length).includes('/'))
			.filter((p) => {
				const f = p.slice(prefix.length);
				return !f.startsWith('.') && f.endsWith('.md');
			})
			.map((p) => p.slice(prefix.length))
			.sort();

		return filenames.map((f) => {
			const filePath = `${col.path}/${f}`;
			const slug = f.replace(/\.md$/, '');
			const title = getTitle(filePath);
			const url = col.urlTemplate ? resolveUrl(col.urlTemplate, slug, dirSlug, filePath) : '';
			return { title, filePath, url };
		});
	}

	// Process in config order, merging grouped collections into TreeGroups
	type OrderedEntry =
		| { kind: 'flat'; col: StudioCollection }
		| { kind: 'tree'; groupName: string; cols: StudioCollection[] };

	const ordered: OrderedEntry[] = [];
	const groupMap = new Map<string, StudioCollection[]>();

	for (const col of collections) {
		if (col.group) {
			if (!groupMap.has(col.group)) {
				const cols: StudioCollection[] = [];
				groupMap.set(col.group, cols);
				ordered.push({ kind: 'tree', groupName: col.group, cols });
			}
			groupMap.get(col.group)!.push(col);
		} else {
			ordered.push({ kind: 'flat', col });
		}
	}

	return ordered.map((entry): ContentGroup => {
		if (entry.kind === 'flat') {
			return { kind: 'flat', name: entry.col.name, files: filesForCollection(entry.col) };
		}
		return {
			kind: 'tree',
			name: entry.groupName,
			groups: entry.cols.map((col) => ({
				name: col.name,
				slug: col.path.split('/').pop() ?? col.name.toLowerCase(),
				files: filesForCollection(col)
			}))
		};
	});
}

function groupBy<T>(rows: T[], key: (r: T) => string, order: string[]): TableGroup<T>[] {
	return order
		.map((name) => ({ name, count: 0, rows: [] as T[] }))
		.map((g) => {
			g.rows = rows.filter((r) => key(r) === g.name);
			g.count = g.rows.length;
			return g;
		})
		.filter((g) => g.count > 0);
}

// ── Load ──────────────────────────────────────────────────────────────────────

export const load: PageServerLoad = async ({ locals, platform }) => {
	if (!locals.studioUser) {
		throw redirect(302, '/studio/login');
	}

	const contentGroups = buildContentTree(studioConfig.collections);

	// ── Submissions + feedback ────────────────────────────────────────────────
	type FeedbackMap = Record<string, { status?: string; notes?: string }>;
	const cfpFb = cfpFeedback as FeedbackMap;
	const cfeFb = cfeFeedback as FeedbackMap;

	const cfpSubmissions: SubmissionRow[] = parseCFPProposals(cfpRaw).map((p) => ({
		id: p.id,
		slug: p.slug,
		title: p.title,
		submitter: p.firstName,
		format: p.proposalType,
		status: cfpFb[p.id]?.status ?? 'Under Review',
		notes: cfpFb[p.id]?.notes ?? '',
		url: `/2026/submissions/${p.slug}`
	}));

	const cfeSubmissions: SubmissionRow[] = parseCFEProposals(cfeRaw).map((p) => ({
		id: p.id,
		slug: p.slug,
		title: p.projectTitle,
		submitter: p.firstName,
		format: p.submissionType ?? 'Exhibition',
		status: cfeFb[p.id]?.status ?? 'Under Review',
		notes: cfeFb[p.id]?.notes ?? '',
		url: `/2026/submissions/${p.slug}`
	}));

	const { sessions: allSessions } = resolveAllSessions();
	const sessionRows: SessionRow[] = allSessions.map((s) => ({
		slug: s.slug,
		sessionType: s.sessionType,
		title: s.title || '(TBD)',
		speakerName: s.speakers?.[0]?.name || '—',
		organisation: s.speakers?.[0]?.organisation || '',
		date: s.date,
		time: s.time,
		display: s.display,
		url: s.slug ? `/2026/sessions/${s.slug}` : ''
	}));

	const SESSION_TYPES = ['Talks', 'Dialogues', 'Workshops', 'Exhibition', 'Panels'];
	const CFP_FORMATS = ['Talks', 'Dialogues', 'Workshop'];
	const sessionGroups = groupBy(sessionRows, (r) => r.sessionType, SESSION_TYPES);
	const cfpGroups = groupBy(cfpSubmissions, (r) => r.format, CFP_FORMATS);
	const cfeGroups = groupBy(cfeSubmissions, (r) => r.format, [
		'Exhibition',
		'Individual',
		'Collective'
	]);

	// ── Staged files with resolved URLs ──────────────────────────────────────────
	const fileUrlMap = new Map<string, string>();
	for (const group of contentGroups) {
		if (group.kind === 'flat') {
			for (const f of group.files) fileUrlMap.set(f.filePath, f.url);
		} else {
			for (const sub of group.groups) {
				for (const f of sub.files) fileUrlMap.set(f.filePath, f.url);
			}
		}
	}

	interface StagingState {
		branch: string;
		files: string[];
	}
	const kv = platform?.env?.STUDIO_SESSIONS;
	const stagingState = kv
		? ((await kv.get(`studio_staging:${locals.studioUser.handle}`, 'json')) as StagingState | null)
		: null;
	const stagedFiles = (stagingState?.files ?? []).map((path) => ({
		path,
		url: fileUrlMap.get(path) ?? ''
	}));

	return {
		user: locals.studioUser,
		config: studioConfig,
		contentGroups,
		stagedFiles,
		sessionGroups,
		cfpGroups,
		cfeGroups,
		pageMeta: {
			title: 'Studio',
			description: 'VizChitra content editor',
			ogImage: '/images/preview/preview-studio.jpg'
		}
	};
};
