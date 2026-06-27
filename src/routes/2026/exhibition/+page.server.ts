import type { PageServerLoad } from './$types';
import { markdownToHtml } from '$lib/utils/markdown';
import { resolveAllSessions } from '$lib/utils/sessions';

export const prerender = true;

export const load: PageServerLoad = async () => {
	const { sessions: rawSessions } = resolveAllSessions();

	const exhibitions = rawSessions
		.filter((s) => s.sessionType === 'Exhibition' && s.display && s.exhibitNumber != null)
		.sort((a, b) => (a.exhibitNumber ?? 99) - (b.exhibitNumber ?? 99));

	const enriched = await Promise.all(
		exhibitions.map(async (s) => {
			const longDescriptionHtml = s.longDescription ? await markdownToHtml(s.longDescription) : '';
			const speakerAboutHtml = s.speakers?.[0]?.about?.trim()
				? await markdownToHtml(s.speakers[0].about)
				: '';
			const speaker2AboutHtml = s.speakers?.[1]?.about?.trim()
				? await markdownToHtml(s.speakers[1].about)
				: '';
			return { ...s, longDescriptionHtml, speakerAboutHtml, speaker2AboutHtml };
		})
	);

	return {
		exhibitions: enriched,
		pageMeta: {
			title: 'Data, Otherwise | VizChitra 2026',
			description:
				'Eight works exploring climate and ecological change through immersive data visualization at VizChitra 2026.',
			ogImage: 'https://vizchitra.com/images/preview/preview-exhibition.jpg',
			noSuffix: true
		}
	};
};
