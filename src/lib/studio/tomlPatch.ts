import { stringify as stringifyToml } from 'smol-toml';

/**
 * Update one item (matched by `slug`) inside a TOML array-of-tables file
 * WITHOUT reserialising the whole document. Every other block — and all of the
 * file's comments — are kept byte-for-byte; only the edited block is regenerated
 * (via smol-toml), with its leading comment line(s) left intact.
 *
 * This is what lets the Studio editor persist a change (e.g. `soldOut = true`)
 * to `sessions.toml` without scrubbing the hand-authored comments and layout.
 *
 * Throws if the slug can't be located, so callers can fall back to a full
 * reserialise (e.g. when adding a brand-new item).
 */
export function patchTomlArrayItem(
	raw: string,
	rootKey: string,
	slug: string,
	mergedItem: Record<string, unknown>
): string {
	const lines = raw.split('\n');
	const header = `[[${rootKey}]]`;

	// Top-level array-of-tables headers only (not `[[rootKey.sub]]`).
	const headerIdx: number[] = [];
	for (let i = 0; i < lines.length; i++) {
		if (lines[i].trim() === header) headerIdx.push(i);
	}

	// Find the block whose top-level `slug = "..."` matches.
	let target = -1;
	for (let h = 0; h < headerIdx.length; h++) {
		const end = h + 1 < headerIdx.length ? headerIdx[h + 1] : lines.length;
		for (let i = headerIdx[h]; i < end; i++) {
			const m = lines[i].match(/^\s*slug\s*=\s*["']([^"']*)["']/);
			if (m && m[1] === slug) {
				target = h;
				break;
			}
		}
		if (target >= 0) break;
	}
	if (target < 0) throw new Error(`patchTomlArrayItem: slug "${slug}" not found`);

	const blockStart = headerIdx[target];

	// End of this block's body = just before the NEXT block's leading
	// comment/blank lines (those belong to the next block, not this one).
	let regionEnd: number;
	if (target + 1 < headerIdx.length) {
		let j = headerIdx[target + 1] - 1;
		while (j > blockStart && (lines[j].trim().startsWith('#') || lines[j].trim() === '')) j--;
		regionEnd = j + 1;
	} else {
		regionEnd = lines.length;
	}

	// Regenerate only this one block; its leading comment (above blockStart) is
	// part of `before` and therefore preserved.
	const block = stringifyToml({ [rootKey]: [mergedItem] }).replace(/\s+$/, '');
	let out = [...lines.slice(0, blockStart), ...block.split('\n'), ...lines.slice(regionEnd)].join(
		'\n'
	);
	if (!out.endsWith('\n')) out += '\n';
	return out;
}
