<script lang="ts">
	import { BannerPolygon, BannerCurve, BannerSquare, BannerBlob, FullBleed } from '$lib/components';
	import {
		CURVE_PALETTE_ORANGE,
		CURVE_PALETTE_BLUE,
		CURVE_PALETTE_TEAL,
		CURVE_PALETTE_PINK,
		CURVE_PALETTE_YELLOW
	} from '$lib/tokens';

	const CURVE_TONE_PALETTES: Partial<Record<string, readonly string[]>> = {
		orange: CURVE_PALETTE_ORANGE,
		blue: CURVE_PALETTE_BLUE,
		teal: CURVE_PALETTE_TEAL,
		pink: CURVE_PALETTE_PINK,
		yellow: CURVE_PALETTE_YELLOW
	};

	interface Props {
		title?: string;
		banner?: 'polygon' | 'curve' | 'square' | 'blob';
		color?: 'yellow' | 'teal' | 'blue' | 'orange' | 'pink' | 'grey';
	}

	let { title = '', banner = 'polygon', color }: Props = $props();

	const curveColors = $derived(color ? CURVE_TONE_PALETTES[color] : undefined);

	// Curve has no tranparncy layer ; others share centered layout
	const addTransparencyLayer = $derived(banner !== 'curve');
</script>

<FullBleed>
	<div class="sketch-header relative h-50 overflow-visible">
		<!-- Banner layer -->
		<div class="sketch-bg absolute inset-0 z-0">
			{#if banner === 'curve'}
				<BannerCurve direction="header" colors={curveColors} />
			{:else if banner === 'square'}
				<BannerSquare {color} />
			{:else if banner === 'blob'}
				<BannerBlob {color} />
			{:else}
				<BannerPolygon />
			{/if}
		</div>

		<!-- Transparency layer -->
		{#if addTransparencyLayer}
			<div
				class="to-viz-white pointer-events-none absolute inset-0 z-1 bg-linear-to-b from-transparent via-transparent via-90%"
			></div>
		{/if}

		<!-- Content layer -->

		<!-- Centered title -->
		<!-- <div class="pointer-events-none absolute inset-0 z-2 flex items-center justify-center">
			<h1
				class="font-display bg-viz-white mx-3 w-fit max-w-[40ch] rounded-2xl px-4 text-center text-4xl font-bold text-balance md:mx-0"
			>
				{title}
			</h1>
		</div> -->
	</div>
</FullBleed>
