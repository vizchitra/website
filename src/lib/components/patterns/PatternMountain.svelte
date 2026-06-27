<script lang="ts">
	type Tone = 'blue' | 'teal' | 'orange' | 'pink' | 'yellow';

	interface Props {
		tone?: Tone;
		variation?: number;
		width?: number;
		height?: number;
		class?: string;
		ariaLabel?: string;
	}

	let {
		tone = 'yellow',
		variation = 0.5,
		width = 400,
		height = 500,
		class: className = '',
		ariaLabel
	}: Props = $props();

	type Layer = { d: string; fill: string; opacity?: number; hatched?: boolean };

	const tonePalette: Record<Tone, { light: string; normal: string; dark: string }> = {
		blue: {
			light: 'var(--color-viz-blue-light)',
			normal: 'var(--color-viz-blue)',
			dark: 'var(--color-viz-blue-dark)'
		},
		teal: {
			light: 'var(--color-viz-teal-light)',
			normal: 'var(--color-viz-teal)',
			dark: 'var(--color-viz-teal-dark)'
		},
		orange: {
			light: 'var(--color-viz-orange-light)',
			normal: 'var(--color-viz-orange)',
			dark: 'var(--color-viz-orange-dark)'
		},
		pink: {
			light: 'var(--color-viz-pink-light)',
			normal: 'var(--color-viz-pink)',
			dark: 'var(--color-viz-pink-dark)'
		},
		yellow: {
			light: 'var(--color-viz-yellow-light)',
			normal: 'var(--color-viz-yellow)',
			dark: 'var(--color-viz-yellow-dark)'
		}
	};

	let palette = $derived(tonePalette[tone]);

	const HATCH_SPACING = 30;
	const HATCH_STROKE = 1;
	const SEGMENTS = 64;

	let viewBox = $derived(`0 0 ${width} ${height}`);
	let ariaHidden = $derived(!ariaLabel);

	// Smooth raised-cosine bump: 0 at the edges of [center±halfWidth], 1 at center.
	// Zero derivative at both edges — no visible join corners with neighbouring terrain.
	function smoothBump(p: number, center: number, halfWidth: number): number {
		const t = (p - center) / halfWidth;
		if (Math.abs(t) >= 1) return 0;
		const s = Math.sin(((t + 1) * Math.PI) / 2);
		return s * s;
	}

	// Asymmetric single arch: rises from 0 at p=0 to 1 at peakPos, back to 0 at p=1.
	function asymArch(p: number, peakPos: number): number {
		if (p <= peakPos) return Math.sin((p / peakPos) * (Math.PI / 2));
		return Math.sin(((1 - p) / (1 - peakPos)) * (Math.PI / 2));
	}

	// Build a filled ridge path from a Y-function: up the left edge → across ridge → down right.
	function mountainPath(yFunc: (p: number) => number): string {
		const step = width / SEGMENTS;
		let d = `M 0 ${height} L 0 ${yFunc(0)}`;
		for (let i = 0; i <= SEGMENTS; i++) {
			d += ` L ${i * step} ${yFunc(i / SEGMENTS)}`;
		}
		d += ` L ${width} ${height} Z`;
		return d;
	}

	function createMountainLayers(): Layer[] {
		const v = Math.max(0, Math.min(1, Number(variation)));
		// Base amplitude: calibrated so v=0.5 matches the reference composition.
		const baseAmp = height * (0.3 + v * 0.12);

		// ── LIGHT layer ────────────────────────────────────────────────────────────
		// Single arch peaking between the two hatched bumps (at 52% from left).
		// Rises high so it shows through the valley of the hatched layer.
		const lightLeftY = height * 0.9; // very low on left — gradual flowing rise like the dark layer
		const lightRightY = height * 0.6; // clearly higher on right — strong asymmetry
		const lightAmp = baseAmp * 1.2;
		const lightSecondaryAmp = baseAmp * 1.1; // peak is off-screen left; only its tail enters the canvas

		function lightY(p: number): number {
			const base = lightLeftY + (lightRightY - lightLeftY) * p;
			const main = lightAmp * asymArch(p, 0.58);
			const secondary = lightSecondaryAmp * smoothBump(p, -0.08, 0.2);
			return base - main - secondary;
		}

		// ── NORMAL hatched layer ───────────────────────────────────────────────────
		// Two bumps: left bump taller & narrower (at 20%), right bump shorter & wider (at 76%).
		// Different widths and heights make them visually distinct.
		const hatLeftY = height * 0.72;
		const hatRightY = height * 0.56; // right edge higher than left
		const hatAmp1 = baseAmp * 0.55; // left peak: taller
		const hatAmp2 = baseAmp * 0.38; // right peak: shorter

		function midY(p: number): number {
			const base = hatLeftY + (hatRightY - hatLeftY) * p;
			const b1 = smoothBump(p, 0.2, 0.22);
			const b2 = smoothBump(p, 0.76, 0.26);
			return base - hatAmp1 * b1 - hatAmp2 * b2;
		}

		// ── DARK layer ─────────────────────────────────────────────────────────────
		// Single asymmetric arch: starts low on left, peak at 60%, ends higher on right.
		const darkLeftY = height * 0.94;
		const darkRightY = height * 0.74; // right edge clearly higher than left
		const darkAmp = baseAmp * 0.45;

		function darkY(p: number): number {
			const base = darkLeftY + (darkRightY - darkLeftY) * p;
			let arch: number;
			if (p <= 0.6) {
				// sin² → zero derivative at left edge (flat start) easing into peak
				const t = Math.sin((p / 0.6) * (Math.PI / 2));
				arch = t * t;
			} else {
				arch = Math.sin(((1 - p) / 0.4) * (Math.PI / 2));
			}
			return base - darkAmp * arch;
		}

		return [
			{ d: mountainPath(lightY), fill: palette.light, opacity: 1 },
			{ d: mountainPath(midY), fill: palette.normal, hatched: true, opacity: 1 },
			{ d: mountainPath(darkY), fill: palette.dark, opacity: 1 }
		];
	}

	const layers = $derived(createMountainLayers());
	const hatchId = `pattern-hatch-mountain`;
</script>

<svg
	class={className}
	{width}
	{height}
	{viewBox}
	fill="none"
	xmlns="http://www.w3.org/2000/svg"
	role="img"
	aria-label={ariaLabel}
	aria-hidden={ariaHidden}
>
	<defs>
		<pattern
			id={hatchId}
			patternUnits="userSpaceOnUse"
			width={HATCH_SPACING}
			height={HATCH_SPACING}
		>
			<path
				d={`M 0 0 L 0 ${HATCH_SPACING}`}
				stroke="rgba(0,0,0,0.5)"
				stroke-width={HATCH_STROKE}
				stroke-linecap="square"
			/>
			<path
				d={`M 0 0 L ${HATCH_SPACING} 0`}
				stroke="rgba(0,0,0,0.5)"
				stroke-width={HATCH_STROKE}
				stroke-linecap="square"
			/>
		</pattern>
	</defs>

	{#each layers as layer}
		<path d={layer.d} fill={layer.fill} fill-opacity={layer.opacity ?? 1} aria-hidden="true" />
		{#if layer.hatched}
			<path d={layer.d} fill={`url(#${hatchId})`} opacity="0.95" aria-hidden="true" />
		{/if}
	{/each}
</svg>
