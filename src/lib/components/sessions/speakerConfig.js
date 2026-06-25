/**
 * Per-speaker translate / scale tweaks for the photo on SessionCardExpanded.
 *
 * Keys are either:
 *   - bare speaker name (matches `speakerName` in sessions.json), or
 *   - `${speakerName}__${sessionType}` for a session-type-specific override.
 *
 * Lookup tries the scoped key first, then falls back to the bare name.
 * Use this when the same speaker appears in two session types and the cards
 * need different photo positioning.
 *
 * - x / y: percentage offset.
 * - scale: number (1 = no scaling).
 *
 * Omit fields you don't need; defaults are no translate, scale 1.
 */

/** @type {Record<string, { x?: number; y?: number; scale?: number }>} */
export const speakerImageTransforms = {
	// Workshops
	'Kenneth Dsouza': { x: 10, y: -65, scale: 1.3 },
	'Rasagy Sharma': { x: 10, y: -65, scale: 1.3 },
	'Areena Arora': { x: 10, y: 5, scale: 1.1 },
	'Schubert de Abreu': { x: 14, y: -25, scale: 1.1 },
	'Priti Pandurangan': { x: 15, y: -30, scale: 0.9 },
	'Adolfo Arranz': { x: 15, y: -30, scale: 1.2 },
	'Prakriti Bakshi': { x: 0, y: 12, scale: 1.2 },
	'Prasanta Kumar Dutta': { x: 15, y: -25, scale: 1.3 },
	'Karthik Shashidhar': { x: 15, y: -30, scale: 1.3 },

	// Talks
	'Arvind Satyanarayan': { x: 10, y: -35, scale: 1.25 },
	'Saurabh Arora': { x: 10, y: -35, scale: 1.2 },
	'Shubhra Agarwal': { x: 10, y: -35, scale: 1.2 },
	'Bargava Subramanian': { x: 10, y: -25, scale: 1.15 },
	'Supriya Joshi': { x: 10, y: 0, scale: 1.1 },
	'Shalaka Shinde': { x: 10, y: -35, scale: 1.15 },
	'Jaidev Deshpande': { x: 15, y: -25, scale: 1.15 },
	'Sneha Kaul': { x: 10, y: 5, scale: 1.1 },
	'Abhiram Jois': { x: 10, y: -15, scale: 1.3 },
	'Siddharth Agarwal': { x: 10, y: -15, scale: 1.1 },
	'Rohit Bhardwaj': { x: 10, y: -25, scale: 1.2 },
	'Surbhi Bhatia__Talks': { x: 10, y: -40, scale: 1.5 },
	'Rohit Saran': { x: 10, y: -45, scale: 1.4 },
	'Aman Bhargava': { x: 10, y: -45, scale: 1.3 },
	'Sandeep Karmarkar': { x: 10, y: -40, scale: 1.25 },
	'Tony Joy': { x: 10, y: -40, scale: 1.4 },

	// Dialogues
	'Anand S': { x: 15, y: -30, scale: 0.8 },
	'Agriya Khetarpal': { x: 15, y: -5, scale: 1.3 },
	'Lakshmi Chockalingam': { x: 5, y: 15, scale: 1.4 },

	// Exhibitions
	'Shreya Dan': { x: 10, y: -25, scale: 1.2 },
	'Aswanth Choyan': { x: 10, y: -25, scale: 1.4 },
	'Kashvi Bansal': { x: 10, y: -25, scale: 1.2 },
	'Surbhi Bhatia': { x: 10, y: -25, scale: 1.2 },
	'Sadhana Lokesh': { x: 10, y: -25, scale: 1.2 },
	'Nithya Kirti': { x: 10, y: -25, scale: 1.2 },
	'Arkoprabho Bhattacharjee': { x: 10, y: -25, scale: 1.2 },
	'Vishal Garg': { x: 10, y: -25, scale: 1.2 },
	'Meghana Singh': { x: 10, y: -25, scale: 1.1 },
	'Kuhu Gupta': { x: 10, y: -25, scale: 1.1 }
};

/**
 * @param {string | undefined} name
 * @param {string | undefined} [sessionType]
 * @returns {{ x?: number; y?: number; scale?: number } | undefined}
 */
function lookupSpeakerConfig(name, sessionType) {
	if (!name) return undefined;
	if (sessionType) {
		const scoped = speakerImageTransforms[`${name}__${sessionType}`];
		if (scoped) return scoped;
	}
	return speakerImageTransforms[name];
}

/**
 * @param {string | undefined} name
 * @param {number} [screenWidth]
 * @param {string | undefined} [sessionType]
 * @returns {string}
 */
export function buildSpeakerImageTransform(name, screenWidth = 1000, sessionType) {
	const t = lookupSpeakerConfig(name, sessionType) || {};
	const tx = t.x ?? 0;
	const ty = screenWidth < 768 ? (t.y ?? 0) - 6 : (t.y ?? 0);
	const s = t.scale ?? 1;

	return `translate(${tx}%, ${ty}%) scale(${s})`;
}
