import type { PageServerLoad } from './$types';
import { marked } from 'marked';
import { resolveAllSessions, getSessionOrder } from '$lib/utils/sessions';

export const prerender = true;

export const load: PageServerLoad = async () => {
	const { sessions: rawSessions, formats } = resolveAllSessions();

	const sessions = await Promise.all(
		rawSessions.map(async (s) => {
			if (s.tbd || !s.shortDescription) return { ...s, descriptionHtml: '' };

			const descriptionHtml = await marked.parseInline(s.shortDescription);
			return { ...s, descriptionHtml };
		})
	);

	sessions.sort((a, b) => getSessionOrder(a) - getSessionOrder(b));
	sessions.sort((a, b) => (a.soldOut ? 1 : 0) - (b.soldOut ? 1 : 0));
	sessions.sort((a, b) => Number(a.tbd) - Number(b.tbd));

	return {
		sessions,
		formats,
		pageMeta: {
			title: 'Sessions | VizChitra 2026',
			description:
				'Explore the confirmed sessions for VizChitra 2026 — talks, dialogues, workshops, and exhibitions.',
			ogImage: 'https://vizchitra.com/images/preview/preview-2026.jpg',
			noSuffix: true
		}
	};
};
