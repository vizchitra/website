<script lang="ts">
	import { onMount } from 'svelte';
	import { getColorHex, getTheme, colors, type Color } from '$lib/tokens';

	interface Props {
		tone?: Color;
	}

	let { tone = undefined }: Props = $props();

	let width: number | null = $state(null);
	const height = 80;

	// Use brand colors directly like DividerPolygon
	const brandColors = colors.filter((c) => c !== 'grey');

	// Shuffle array using Fisher-Yates
	function shuffleArray<T>(array: T[]): T[] {
		const shuffled = [...array];
		for (let i = shuffled.length - 1; i > 0; i--) {
			const j = Math.floor(Math.random() * (i + 1));
			[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
		}
		return shuffled;
	}

	const STROKE_WIDTH = 4;
	const NUM_DOTS = 5; // 4 dots = 3 segments
	const DOT_RADIUS = 3; // outer white circle radius (prevents cutoff at edges)

	interface DotData {
		cx: number;
		cy: number;
		fill: string;
	}

	interface SegmentData {
		path: string;
		stroke: string;
	}

	let segments: SegmentData[] = $state([]);
	let dots: DotData[] = $state([]);

	// Calculate point on cubic bezier at parameter t
	function bezierPoint(t: number, p0: number, p1: number, p2: number, p3: number): number {
		return (
			Math.pow(1 - t, 3) * p0 +
			3 * Math.pow(1 - t, 2) * t * p1 +
			3 * (1 - t) * Math.pow(t, 2) * p2 +
			Math.pow(t, 3) * p3
		);
	}

	function generateCurve() {
		if (!width) return;

		// Single-tone mode: use shades of one color; multi-color mode: shuffle brand colors
		const shuffledColors = tone
			? shuffleArray([
					getTheme(tone).dark,
					getTheme(tone).base,
					getTheme(tone).solid,
					getTheme(tone).muted,
					getTheme(tone).light
				])
			: shuffleArray(brandColors).map((c) => getColorHex(c));

		// Padding must match the outer circle radius to prevent edge clipping
		const edgePad = DOT_RADIUS + 3;
		const paddedWidth = width - 2 * edgePad;

		// Random start and end Y positions
		const startY = Math.random() * (height - STROKE_WIDTH * 2) + STROKE_WIDTH;
		const endY = Math.random() * (height - STROKE_WIDTH * 2) + STROKE_WIDTH;

		// Create control points for a flowing bezier curve (with padding)
		const cp1x = edgePad + paddedWidth * 0.25 + (Math.random() - 0.5) * paddedWidth * 0.2;
		const cp1y = Math.random() * height;
		const cp2x = edgePad + paddedWidth * 0.75 + (Math.random() - 0.5) * paddedWidth * 0.2;
		const cp2y = Math.random() * height;

		// Generate dot positions along the curve
		const newDots: DotData[] = [];
		const dotPositions: { x: number; y: number }[] = [];

		for (let i = 0; i < NUM_DOTS; i++) {
			const t = i / (NUM_DOTS - 1); // 0, 0.25, 0.5, 0.75, 1
			const x = bezierPoint(t, edgePad, cp1x, cp2x, edgePad + paddedWidth);
			const y = bezierPoint(t, startY, cp1y, cp2y, endY);
			dotPositions.push({ x, y });
			newDots.push({ cx: x, cy: y, fill: getColorHex('grey') });
		}

		// Generate segments between dots using quadratic bezier for smooth connection
		const newSegments: SegmentData[] = [];
		for (let i = 0; i < NUM_DOTS - 1; i++) {
			const from = dotPositions[i];
			const to = dotPositions[i + 1];

			// Calculate control point for smooth curve segment
			const midX = (from.x + to.x) / 2;
			const midT = (i + 0.5) / (NUM_DOTS - 1);
			const targetMidY = bezierPoint(midT, startY, cp1y, cp2y, endY);

			// Quadratic bezier control point
			const cpY = 2 * targetMidY - (from.y + to.y) / 2;

			const path = `M ${from.x} ${from.y} Q ${midX} ${cpY}, ${to.x} ${to.y}`;
			newSegments.push({
				path,
				stroke: shuffledColors[i % shuffledColors.length]
			});
		}

		segments = newSegments;
		dots = newDots;
	}

	// Reactive: regenerate curve when width changes
	$effect(() => {
		if (width) {
			generateCurve();
		}
	});
</script>

<div class="divider-container my-12 w-full" style:height="{height}px" bind:clientWidth={width}>
	{#if width && segments.length > 0}
		<svg
			{height}
			viewBox="0 0 {width} {height}"
			preserveAspectRatio="xMidYMid meet"
			class="block w-full"
		>
			{#each segments as segment}
				<path
					d={segment.path}
					stroke={segment.stroke}
					stroke-width={STROKE_WIDTH}
					fill="none"
					stroke-linecap="round"
				/>
			{/each}

			{#each dots as dot}
				<circle cx={dot.cx} cy={dot.cy} r={DOT_RADIUS + 3} fill="white" />
				<circle cx={dot.cx} cy={dot.cy} r={DOT_RADIUS + 1} fill={dot.fill} />
			{/each}
		</svg>
	{/if}
</div>
