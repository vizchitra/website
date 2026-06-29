import { readdir } from 'fs/promises';
import { join } from 'path';

export async function load() {
	const dir = join(process.cwd(), 'static/images/speakers/2026');
	const files = (await readdir(dir))
		.filter((f) => /\.webp$/i.test(f) && !f.includes('placeholder'))
		.sort();

	const speakers = files.map((f) => {
		const slug = f.replace(/\.webp$/, '').replace(/^speaker-/, '');
		const name = slug
			.split('-')
			.map((w) => w.charAt(0).toUpperCase() + w.slice(1))
			.join(' ');
		return {
			name,
			image: `/images/speakers/2026/${f}`,
			designation: '',
			organisation: '',
			about: '',
			social: {} as Record<string, string>
		};
	});

	return { speakers };
}
