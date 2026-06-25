import type { PageLoad } from './$types';

export const ssr = false;

export const load: PageLoad = ({ url }) => {
	return {
		initialUrl: url.searchParams.get('url') ?? ''
	};
};
