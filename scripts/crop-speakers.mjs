/**
 * Crop speaker headshots to 400×400 by keeping the top 2/3 of each 400×600 image.
 * Overwrites WebP files in static/images/speakers/2026/ in-place.
 *
 * Usage: node scripts/crop-speakers.mjs
 */

import sharp from 'sharp';
import { readdir } from 'fs/promises';
import { join } from 'path';

const DIR = 'static/images/speakers/2026';
const TARGET_H = 400;

const files = (await readdir(DIR)).filter((f) => /\.webp$/i.test(f) && !f.includes('placeholder'));

let count = 0;
for (const f of files) {
	const path = join(DIR, f);
	const meta = await sharp(path).metadata();
	const cropH = Math.min(TARGET_H, meta.height ?? TARGET_H);
	await sharp(path)
		.extract({ left: 0, top: 0, width: meta.width ?? 400, height: cropH })
		.webp({ quality: 85 })
		.toFile(path + '.tmp');

	// rename .tmp → original
	const { rename } = await import('fs/promises');
	await rename(path + '.tmp', path);

	console.log(`✓ ${f} → ${meta.width}×${meta.height} → ${meta.width}×${cropH}`);
	count++;
}

console.log(`\nDone — ${count} images cropped to ${TARGET_H}px height`);
