import { redirect } from '@sveltejs/kit';
import type { PageLoad } from './$types';

const PRESETS: Record<string, string> = {
	'2026': 'https://vizchitra.com/2026',
	tickets: 'https://vizchitra.com/2026/tickets',
	workshops: 'https://vizchitra.com/2026/workshops'
};

export const load: PageLoad = ({ params }) => {
	const url = PRESETS[params.preset.toLowerCase()];
	if (url) {
		redirect(302, `/tools/qr?url=${encodeURIComponent(url)}`);
	}
	redirect(302, '/tools/qr');
};
