import { readFileSync } from 'fs';
import { join } from 'path';

export function load() {
	const fundingPath = join(process.cwd(), 'static/funding.json');
	const fundingJson = readFileSync(fundingPath, 'utf-8');
	const fundingData = JSON.parse(fundingJson);

	return {
		fundingData,
		pageMeta: {
			title: 'Support VizChitra — Funding',
			description:
				"Support VizChitra's community programs and annual data visualization conference.",
			ogImage: 'https://vizchitra.com/images/preview/preview-funding.jpg'
		}
	};
}
