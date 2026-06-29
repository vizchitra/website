<script lang="ts">
	import type { Speaker } from '$lib/utils/sessions';

	interface Props {
		speakers: Speaker[];
		size?: 'sm' | 'md' | 'lg';
	}

	let { speakers, size = 'md' }: Props = $props();

	const IMG: Record<string, number> = { sm: 80, md: 120, lg: 160 };
	const imgSize = $derived(IMG[size] ?? 120);

	// Positions in units of imgSize: { left, bottom, zIndex, rotate? }
	// Overlap is 20% (left step = 0.80 per speaker)
	// For 3-speaker fan: center is slightly lower (bottom: -0.04) to look "forward"
	// For 4-speaker 2×2: back row offset up by 0.35 units
	type Pos = { left: number; bottom: number; z: number; rotate?: number };

	const PRESETS: Record<number, Pos[]> = {
		2: [
			{ left: 0.0, bottom: 0, z: 1 },
			{ left: 0.8, bottom: 0, z: 1 }
		],
		3: [
			{ left: 0.0, bottom: 0, z: 2, rotate: -7 }, // left, leaning in
			{ left: 0.78, bottom: -0.04, z: 3, rotate: 0 }, // center, forward
			{ left: 1.56, bottom: 0, z: 2, rotate: 7 } // right, leaning in
		],
		4: [
			{ left: 0.0, bottom: 0.35, z: 1 }, // back-left
			{ left: 0.82, bottom: 0.35, z: 3 }, // back-right
			{ left: 0.28, bottom: 0, z: 2 }, // front-left
			{ left: 1.1, bottom: 0, z: 4 } // front-right
		]
	};

	// Container bounding box (in imgSize units) so nothing clips
	const BOUNDS: Record<number, { w: number; h: number }> = {
		2: { w: 1.8, h: 1.0 },
		3: { w: 2.56, h: 1.12 },
		4: { w: 2.1, h: 1.38 }
	};

	const count = $derived(Math.min(4, Math.max(2, speakers.length)));
	const preset = $derived(PRESETS[count] ?? PRESETS[2]);
	const bounds = $derived(BOUNDS[count] ?? BOUNDS[2]);
</script>

<!--
  Relatively-positioned container sized exactly to the cluster bounding box.
  Images are absolutely positioned inside using the preset offsets.
-->
<div class="relative" style:width="{bounds.w * imgSize}px" style:height="{bounds.h * imgSize}px">
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
				style:transform={pos.rotate ? `rotate(${pos.rotate}deg)` : undefined}
				style:transform-origin="bottom center"
				style:object-fit="cover"
				style:pointer-events="none"
				style:user-select="none"
			/>
		{/if}
	{/each}
</div>
