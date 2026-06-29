/**
 * Resize speaker headshots to a consistent 400x600 canvas.
 * Outputs to static/images/speakers/2026-resized/ (does NOT overwrite originals).
 *
 * Each image is scaled to fit within 400x600 with `contain`, keeping aspect ratio,
 * padded with transparent background. Result saved as WebP.
 *
 * Usage: node scripts/resize-speakers.mjs
 */

import sharp from 'sharp';
import { readdir, mkdir } from 'fs/promises';
import { join, basename, extname } from 'path';

const SRC = 'static/images/speakers/2026';
const DEST = 'static/images/speakers/2026-resized';
const W = 400;
const H = 600;

await mkdir(DEST, { recursive: true });

const files = (await readdir(SRC)).filter(
	(f) => /\.(webp|avif|png|jpg|jpeg)$/i.test(f) && !f.includes('placeholder')
);

for (const f of files) {
	const src = join(SRC, f);
	const name = basename(f, extname(f));
	const dest = join(DEST, `${name}.webp`);

	await sharp(src)
		.resize(W, H, {
			fit: 'contain',
			position: 'top', // anchor subject to top so head isn't cut
			background: { r: 255, g: 255, b: 255, alpha: 0 }
		})
		.webp({ quality: 85 })
		.toFile(dest);

	console.log(`✓ ${f} → ${name}.webp`);
}

console.log(`\nDone — ${files.length} images written to ${DEST}`);
