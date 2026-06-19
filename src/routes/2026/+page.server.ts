import type { PageServerLoad } from './$types';
import { marked } from 'marked';
import { resolveConfirmedSessions, getSessionOrder } from '$lib/utils/sessions';

export const prerender = true;

export const load: PageServerLoad = async () => {
	const raw = resolveConfirmedSessions();

	const selectedSessions = await Promise.all(
		raw.map(async (s) => {
			if (!s.shortDescription) return { ...s, descriptionHtml: '' };
			const descriptionHtml = await marked.parseInline(s.shortDescription);
			return { ...s, descriptionHtml };
		})
	);

	selectedSessions.sort((a, b) => getSessionOrder(a) - getSessionOrder(b));
	selectedSessions.sort((a, b) => (a.soldOut ? 1 : 0) - (b.soldOut ? 1 : 0));

	return {
		selectedSessions,
		pageMeta: {
			title: 'VizChitra 2026',
			description: 'VizChitra 2026 is happening on 3rd and 4th July, 2026 in Bangalore',
			ogImage: 'https://vizchitra.com/images/preview/preview-2026.jpg',
			noSuffix: true
		}
	};
};
