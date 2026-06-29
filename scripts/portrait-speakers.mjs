/**
 * Re-crops speaker portraits based on visual alignment transforms from /tools/speakers.
 *
 * Each transform { x, y, scale } was tuned so that `translate(x%, y%) scale(s)` centers
 * the face in the circle/square preview. This script inverts the transform math to find
 * the corresponding source crop region and outputs a clean 400×400 portrait.
 *
 * Math (for a 400×400 source image):
 *   cropSize       = 400 / s
 *   srcLeft        = 200 − (200 + 4·tx) / s
 *   srcTop         = 200 − (200 + 4·ty) / s
 *
 * A generous padding is applied before extracting so negative coordinates are handled
 * gracefully (some shots need to reach slightly above/left of the original canvas).
 *
 * Usage: node scripts/portrait-speakers.mjs
 */

import sharp from 'sharp';
import { join } from 'path';
import { rename } from 'fs/promises';

const DIR = 'static/images/speakers/2026';
const OUT_W = 400;
const OUT_H = 400;
const PAD = 200; // padding on each side before extracting

/** slug → { x?, y?, scale? } — from /tools/speakers visual review */
const transforms = {
	abhiram: { y: 33, scale: 1.5 },
	aditya: { scale: 0.95 },
	adolfo: { x: 8, y: 18, scale: 1.2 },
	agriya: { y: 23, scale: 1.25 },
	aman: { y: 4, scale: 1.05 },
	anand: { y: 5, scale: 0.85 },
	areena: { y: 22, scale: 1.25 },
	arko: { y: 4 },
	arshi: { y: 2, scale: 0.9 },
	aswanth: { y: 6, scale: 1.15 },
	bargava: { y: 4, scale: 0.9 },
	hamsa: { x: 8, y: 10, scale: 1.5 },
	jaidev: { y: 3, scale: 0.9 },
	karthik: { y: 3, scale: 1.1 },
	lakshmi: { x: -11, y: 24, scale: 1.3 },
	meghana: { y: 7, scale: 0.9 },
	nithya: { scale: 1.1 },
	prakriti: { x: -6, y: 18, scale: 1.3 },
	prasanta: { y: 21, scale: 1.3 },
	priti: { y: 6, scale: 0.85 },
	'rohit-saran': { scale: 1.1 },
	rohit: { x: 8, y: 33, scale: 1.4 },
	sadhana: { y: 5, scale: 1.05 },
	'sandeep-karmarkar': { scale: 1.05 },
	saurabh: { y: 8 },
	shalaka: { y: 12, scale: 1.1 },
	shobana: { scale: 0.95 },
	shreya: { scale: 1.15 },
	shubhra: { y: 13, scale: 1.15 },
	siddharth: { y: 8, scale: 0.95 },
	sneha: { x: -3, y: 17, scale: 1.05 },
	supriya: { x: -7, y: 11, scale: 1.1 },
	surbhi: { scale: 1.2 },
	'tony-joy': { y: 8, scale: 1.25 },
	vivek: { y: 4, scale: 1.15 }
};

let count = 0;
for (const [slug, t] of Object.entries(transforms)) {
	const src = join(DIR, `speaker-${slug}.webp`);
	const tx = t.x ?? 0;
	const ty = t.y ?? 0;
	const s = t.scale ?? 1;

	const cropSize = 400 / s;
	const srcLeft = 200 - (200 + 4 * tx) / s;
	const srcTop = 200 - (200 + 4 * ty) / s;

	// In padded-image coordinates
	const exLeft = Math.round(srcLeft + PAD);
	const exTop = Math.round(srcTop + PAD);
	const exSize = Math.round(cropSize);

	const tmp = src + '.tmp';
	const padded = await sharp(src)
		.extend({
			top: PAD,
			bottom: PAD,
			left: PAD,
			right: PAD,
			background: { r: 255, g: 255, b: 255, alpha: 0 }
		})
		.toBuffer();
	await sharp(padded)
		.extract({ left: exLeft, top: exTop, width: exSize, height: exSize })
		.resize(OUT_W, OUT_H)
		.webp({ quality: 85 })
		.toFile(tmp);

	await rename(tmp, src);
	count++;
	console.log(
		`✓ speaker-${slug.padEnd(20)} tx=${String(tx).padStart(3)} ty=${String(ty).padStart(3)} s=${s.toFixed(2)}` +
			`  crop ${exSize}×${exSize} @ (${Math.round(srcLeft)}, ${Math.round(srcTop)})`
	);
}

console.log(`\nDone — ${count} portraits re-cropped to ${OUT_W}×${OUT_H}`);
