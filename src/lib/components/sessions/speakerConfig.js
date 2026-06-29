/**
 * Controls how the ImageCluster is positioned on a session card.
 *
 * - x: horizontal translate % of cluster width (positive = right).
 * - y: vertical translate % of cluster height (negative = up).
 * - scale: zoom multiplier applied to the cluster.
 *
 * Add a named entry to speakerImageTransforms only when a specific speaker
 * genuinely needs different positioning from the default.
 */

/** @type {{ x: number; y: number; scale: number }} */
export const DEFAULT_TRANSFORM = { x: 10, y: -40, scale: 1.2 };

/** @type {Record<string, { x?: number; y?: number; scale?: number }>} */
export const speakerImageTransforms = {};

/**
 * @param {string | undefined} name
 * @param {number} [screenWidth]
 * @returns {string}
 */
export function buildSpeakerImageTransform(name, screenWidth = 1000) {
	const override = name ? speakerImageTransforms[name] : undefined;
	const t = override ?? DEFAULT_TRANSFORM;
	const tx = t.x ?? DEFAULT_TRANSFORM.x;
	const ty = screenWidth < 768 ? (t.y ?? DEFAULT_TRANSFORM.y) - 6 : (t.y ?? DEFAULT_TRANSFORM.y);
	const s = t.scale ?? DEFAULT_TRANSFORM.scale;
	return `translate(${tx}%, ${ty}%) scale(${s})`;
}
