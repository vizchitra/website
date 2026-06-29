import { readdir } from 'fs/promises';
import { join } from 'path';

export async function load() {
	const dir = join(process.cwd(), 'static/images/speakers/2026');
	const files = (await readdir(dir))
		.filter((f) => /\.(webp|png)$/i.test(f) && !f.includes('placeholder'))
		.toSorted();

	const speakers = files.map((f) => {
		const slug = f.replace(/\.(webp|png)$/, '').replace(/^speaker-/, '');
		const name = slug
			.split('-')
			.map((w) => w.charAt(0).toUpperCase() + w.slice(1))
			.join(' ');
		return { file: f, slug, name, src: `/images/speakers/2026/${f}` };
	});

	return { speakers };
}
