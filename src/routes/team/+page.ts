import type { PageLoad } from './$types';

export const load: PageLoad = () => {
	return {
		// re-randomised each load; used to shuffle the team + alumni order
		seed: Math.floor(Math.random() * 2 ** 31),
		document: {
			banner: 'square' as const,
			color: 'orange' as const
		},
		pageMeta: {
			title: 'Team',
			description: 'Meet the team behind VizChitra'
		},
		pageLayout: {
			banner: 'square' as const,
			color: 'orange' as const
		}
	};
};
