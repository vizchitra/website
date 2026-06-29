<script lang="ts">
	import type { Speaker } from '$lib/utils/sessions';

	interface Props {
		speakers: Speaker[];
		/** Named size preset. Ignored when imgSize is set. */
		size?: 'sm' | 'md' | 'lg';
		/** Explicit image dimension in px — overrides size. */
		imgSize?: number;
		/** Step between the two front images (default 0.65 = 35% overlap). */
		gap?: number;
		/** How far the back row is raised above the baseline in imgSize units (default 0.28). */
		backBaseline?: number;
		/** Horizontal shift of the back image(s), in imgSize units (+ = right, − = left). */
		backHShift?: number;
		/** Step between the two back images for 4-speaker layout (default = gap). */
		backGap?: number;
	}

	let {
		speakers,
		size = 'md',
		imgSize: imgSizeProp,
		gap: gapProp,
		backBaseline: backBaselineProp,
		backHShift: backHShiftProp,
		backGap: backGapProp
	}: Props = $props();

	const SIZE_MAP: Record<string, number> = { sm: 80, md: 120, lg: 160 };
	const imgSize = $derived(imgSizeProp ?? SIZE_MAP[size] ?? 120);
	const gap = $derived(gapProp ?? 0.75);
	const backBaseline = $derived(backBaselineProp ?? 0.3);
	const backHShift = $derived(backHShiftProp ?? 0);
	const backGap = $derived(backGapProp ?? 0.6);

	type Pos = { left: number; bottom: number; z: number };

	const count = $derived(Math.min(4, Math.max(1, speakers.length)));

	// Right-anchored, additive layout.
	// Container is ALWAYS 1 × imgSize wide. The anchor (rightmost) image is at left: 0.
	// Every additional image is placed at a NEGATIVE left value and overflows leftward.
	// This ensures the transform % on the wrapper is always relative to the same width,
	// so the anchor position on the card never changes regardless of speaker count.
	//
	//   1: anchor at left: 0
	//   2: anchor + front-left at left: -gap
	//   3: front pair + back image centred between them (negative region), raised
	//   4: front pair + back-right + back-left further left by backGap
	const preset = $derived.by((): Pos[] => {
		const backR = -(gap / 2) + backHShift; // back centre x (negative = left of anchor)

		if (count === 1) return [{ left: 0, bottom: 0, z: 1 }];
		if (count === 2)
			return [
				{ left: -gap, bottom: 0, z: 1 }, // front-left (added to left)
				{ left: 0, bottom: 0, z: 1 } // anchor
			];
		if (count === 3)
			return [
				{ left: -gap, bottom: 0, z: 2 }, // front-left
				{ left: 0, bottom: 0, z: 2 }, // anchor
				{ left: backR, bottom: backBaseline, z: 1 } // back-centre
			];
		return [
			{ left: -gap, bottom: 0, z: 3 }, // front-left
			{ left: 0, bottom: 0, z: 4 }, // anchor
			{ left: backR, bottom: backBaseline, z: 2 }, // back-right
			{ left: backR - backGap, bottom: backBaseline, z: 1 } // back-left
		];
	});

	// Container is always exactly 1 image wide — all extra images overflow left.
	const bounds = $derived({ w: 1 });
</script>

<div
	class="relative"
	style:width="{bounds.w * imgSize}px"
	style:height="{imgSize}px"
	style:overflow="visible"
>
	{#each speakers.slice(0, 4) as sp, i}
		{@const pos = preset[i]}
		{#if sp.image && pos}
			<img
				src={sp.image}
				alt={sp.name ?? ''}
				draggable="false"
				style:position="absolute"
				style:width="{imgSize}px"
				style:height="{imgSize}px"
				style:left="{pos.left * imgSize}px"
				style:bottom="{pos.bottom * imgSize}px"
				style:z-index={pos.z}
				style:transform-origin="bottom center"
				style:pointer-events="none"
				style:user-select="none"
			/>
		{/if}
	{/each}
</div>
