import { error, redirect } from '@sveltejs/kit';
import type { PageServerLoad, EntryGenerator } from './$types';
import { markdownToHtml } from '$lib/utils/markdown';
import { resolveAllSessions } from '$lib/utils/sessions';
import redirectsRaw from '../../../../../_redirects?raw';

const redirectMap = new Map<string, string>(
	redirectsRaw
		.split('\n')
		.filter((line) => line.trim() && !line.startsWith('#'))
		.flatMap((line) => {
			const [from, to, code] = line.split(/\s+/);
			return from && to ? [[from, to] as [string, string]] : [];
		})
);

export const prerender = true;

export const entries: EntryGenerator = async () => {
	const { sessions } = resolveAllSessions();
	return sessions.filter((s) => !s.tbd && s.slug).map((s) => ({ slug: s.slug }));
};

export const load: PageServerLoad = async ({ params }) => {
	const { sessions } = resolveAllSessions();
	const confirmed = sessions.filter((s) => !s.tbd);

	const session = confirmed.find((s) => s.slug === params.slug);

	if (!session) {
		const target = redirectMap.get(`/2026/sessions/${params.slug}`);
		if (target) throw redirect(301, target);
		throw error(404, `Session "${params.slug}" not found`);
	}

	const descriptionHtml = await markdownToHtml(session.longDescription);
	const speakerAboutHtml = await markdownToHtml(session.speakerAbout);

	// Related sessions: prioritise same theme (sessionType), then others
	const relatedSessions = confirmed
		.filter((s) => s.slug !== session.slug)
		.sort((a, b) => {
			const aMatch = a.sessionType === session.sessionType ? 1 : 0;
			const bMatch = b.sessionType === session.sessionType ? 1 : 0;
			return bMatch - aMatch;
		})
		.slice(0, 3);

	return {
		session,
		descriptionHtml,
		speakerAboutHtml,
		relatedSessions,
		pageMeta: {
			title: `${session.title} | VizChitra 2026 Sessions`,
			noSuffix: true,
			description:
				session.shortDescription ||
				session.longDescription.split('\n')[0] ||
				session.longDescription.substring(0, 150),
			ogImage: 'https://vizchitra.com/images/preview/preview-2026.jpg'
		}
	};
};
