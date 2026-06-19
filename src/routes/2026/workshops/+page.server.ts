import type { PageServerLoad } from './$types';
import { marked } from 'marked';
import { resolveAllSessions, getSessionOrder } from '$lib/utils/sessions';

export const prerender = true;

export const load: PageServerLoad = async () => {
	const { sessions: rawSessions } = resolveAllSessions();

	const workshops = rawSessions.filter((s) => s.sessionType === 'Workshops');

	const sessions = await Promise.all(
		workshops.map(async (s) => {
			if (s.tbd || !s.shortDescription) return { ...s, descriptionHtml: '' };

			const descriptionHtml = await marked.parseInline(s.shortDescription);
			return { ...s, descriptionHtml };
		})
	);

	// Sort by configured order, then push sold-out entries, then TBD entries last
	sessions.sort((a, b) => getSessionOrder(a) - getSessionOrder(b));
	sessions.sort((a, b) => (a.soldOut ? 1 : 0) - (b.soldOut ? 1 : 0));
	sessions.sort((a, b) => Number(a.tbd) - Number(b.tbd));

	return {
		sessions,
		pageMeta: {
			title: 'Workshops | VizChitra 2026',
			description:
				'Explore the workshops lined up for VizChitra 2026 — hands-on sessions with leading practitioners.',
			ogImage: 'https://vizchitra.com/images/preview/preview-2026.jpg',
			noSuffix: true
		}
	};
};
