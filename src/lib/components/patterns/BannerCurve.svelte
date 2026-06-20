<script module lang="ts">
	import { CURVE_PALETTE } from '$lib/tokens';

	// Canonical sequence of colors for the curve banner (module-level, SSR-safe)
	// Uses the 8-color palette (5 main + 3 light variants) from tokens
	export const DEFAULT_CURVE_COLORS = [...CURVE_PALETTE];

	// Varying amplitude for each curve (module-level)
	export const AMPLITUDE_MULTIPLIERS = [0.6, 0.8, 1.2, 1.5, 1.3, 1.0, 0.9, 0.7];

	export const CURSOR_SIZE = 24;
	export const UPDATE_INTERVAL = 16;
	export const NUM_CURVES = 8;
	export const POINTS_PER_CURVE = 120;
	export const BASE_AMPLITUDE = 70;
	export const CURVE_HEIGHT_RATIO = 0.7;
	export const OVERFLOW_EXTENSION = 100; // Extra canvas height for overflow
</script>

<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { browser } from '$app/environment';
	import MousePointer from '$lib/assets/images/MousePointer.svelte';

	interface Props {
		interactive?: boolean;
		direction?: 'header' | 'footer';
		colors?: readonly string[];
	}

	let {
		interactive = false,
		direction = 'header',
		colors = DEFAULT_CURVE_COLORS
	}: Props = $props();

	// Shuffle array using Fisher-Yates algorithm
	function shuffleArray<T>(array: T[]): T[] {
		const shuffled = [...array];
		for (let i = shuffled.length - 1; i > 0; i--) {
			const j = Math.floor(Math.random() * (i + 1));
			[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
		}
		return shuffled;
	}

	// Initialize resolved colors from prop or module defaults (SSR-safe)
	let resolvedColors: string[] = $derived([...colors]);

	// Randomize color order for each instance
	let shuffledColorOrder: number[] = $derived(
		shuffleArray([...Array(resolvedColors.length).keys()])
	);

	let canvas: HTMLCanvasElement = $state();
	let ctx: CanvasRenderingContext2D;
	let width = $state(0);
	let height = $state(0);
	let cursorX = $state(0);
	let cursorY = $state(0);
	let showCursor = $state(false);
	let lastUpdate = 0;
	let scheduledRaf = 0;
	let initialTimer: number | null = null;

	// Extended canvas height for overflow
	const extendedHeight = $derived(height + OVERFLOW_EXTENSION);

	interface CurvePoint {
		x: number;
		y: number;
		baseY: number;
	}

	const getColor = (index: number) => {
		const shuffledIndex = shuffledColorOrder[index % shuffledColorOrder.length] ?? index;
		return resolvedColors[shuffledIndex] || '#000000';
	};

	function generateCurvePoints(curveIndex: number, totalCurves: number): CurvePoint[] {
		if (!width || !height) return [];

		const points: CurvePoint[] = [];
		const step = width / (POINTS_PER_CURVE - 1);
		const amplitude = BASE_AMPLITUDE * AMPLITUDE_MULTIPLIERS[curveIndex];

		for (let i = 0; i < POINTS_PER_CURVE; i++) {
			const x = i * step;
			const xProgress = x / width; // 0 to 1 from left to right

			// Create diagonal effect based on direction
			// header: waves from top-left going down-right (white in bottom-right)
			// footer: waves from bottom-right going up-left (white in top-left)
			const diagonalOffset =
				direction === 'header'
					? xProgress * height * 0.4 // Goes down toward right
					: (1 - xProgress) * height * 0.4; // Goes down toward left

			const baseY =
				direction === 'header'
					? (curveIndex / totalCurves) * height * CURVE_HEIGHT_RATIO + diagonalOffset
					: extendedHeight -
						(curveIndex / totalCurves) * height * CURVE_HEIGHT_RATIO -
						diagonalOffset;

			// Create interactive flowing waves with varying amplitude
			const wave1 = Math.sin(xProgress * Math.PI * 2 + curveIndex * 0.5) * amplitude * 0.7;
			const wave2 = Math.sin(xProgress * Math.PI * 3 + curveIndex * 0.3) * amplitude * 0.4;
			const wave3 = Math.sin(xProgress * Math.PI * 5 + curveIndex * 0.2) * amplitude * 0.2;

			let y = baseY + wave1 + wave2 + wave3;

			// Add mouse interaction if interactive
			if (interactive && cursorX > 0 && cursorY > 0) {
				const dx = x - cursorX;
				const dy = y - cursorY;
				const distance = Math.sqrt(dx * dx + dy * dy);
				const influence = Math.max(0, 1 - distance / 300);

				// Pull curves toward cursor with wave-like motion
				// Use (curveIndex + 1) to ensure first curve also moves
				const pull = influence * 90 * Math.sin(curveIndex + 1);
				y += pull;
			}

			points.push({ x, y, baseY });
		}

		return points;
	}

	function drawFilledCurve(
		points: CurvePoint[],
		prevPoints: CurvePoint[] | null,
		color: string,
		alpha: number,
		isFirst: boolean
	) {
		if (!ctx || points.length < 2) return;

		ctx.beginPath();

		if (isFirst) {
			if (direction === 'header') {
				// First curve - start from top-left corner
				ctx.moveTo(0, 0);
				ctx.lineTo(width, 0);
				ctx.lineTo(points[points.length - 1].x, points[points.length - 1].y);
			} else {
				// Footer: start from bottom-left corner (use extendedHeight for canvas bottom)
				ctx.moveTo(0, extendedHeight);
				ctx.lineTo(width, extendedHeight);
				ctx.lineTo(points[points.length - 1].x, points[points.length - 1].y);
			}
		} else if (prevPoints && prevPoints.length > 0) {
			// Start from the previous curve (going forward)
			ctx.moveTo(prevPoints[0].x, prevPoints[0].y);
			for (let i = 1; i < prevPoints.length - 1; i++) {
				const xc = (prevPoints[i].x + prevPoints[i + 1].x) / 2;
				const yc = (prevPoints[i].y + prevPoints[i + 1].y) / 2;
				ctx.quadraticCurveTo(prevPoints[i].x, prevPoints[i].y, xc, yc);
			}
			const lastPrev = prevPoints[prevPoints.length - 1];
			const secondLastPrev = prevPoints[prevPoints.length - 2];
			ctx.quadraticCurveTo(secondLastPrev.x, secondLastPrev.y, lastPrev.x, lastPrev.y);
		}

		// Draw current curve going backwards (right to left)
		for (let i = points.length - 1; i > 0; i--) {
			const xc = (points[i].x + points[i - 1].x) / 2;
			const yc = (points[i].y + points[i - 1].y) / 2;
			ctx.quadraticCurveTo(points[i].x, points[i].y, xc, yc);
		}
		ctx.lineTo(points[0].x, points[0].y);

		ctx.closePath();

		// Fill the area
		ctx.globalAlpha = alpha;
		ctx.fillStyle = color;
		ctx.fill();

		// Add a stroke on bottom edge (current curve)
		const lastPoint = points[points.length - 1];
		const secondLastPoint = points[points.length - 2];
		ctx.beginPath();
		ctx.moveTo(points[0].x, points[0].y);
		for (let i = 1; i < points.length - 1; i++) {
			const xc = (points[i].x + points[i + 1].x) / 2;
			const yc = (points[i].y + points[i + 1].y) / 2;
			ctx.quadraticCurveTo(points[i].x, points[i].y, xc, yc);
		}
		ctx.quadraticCurveTo(secondLastPoint.x, secondLastPoint.y, lastPoint.x, lastPoint.y);
		ctx.strokeStyle = color;
		ctx.lineWidth = 2;
		ctx.globalAlpha = Math.min(1, alpha + 0.1);
		ctx.stroke();
	}

	function draw() {
		if (!ctx || !width || !height) return;

		// Clear canvas - CSS overlay handles background fade
		ctx.clearRect(0, 0, width, extendedHeight);

		// Generate all curve points first
		const allCurvePoints: CurvePoint[][] = [];
		for (let i = 0; i < NUM_CURVES; i++) {
			allCurvePoints.push(generateCurvePoints(i, NUM_CURVES));
		}

		// Draw curves from top (index 0) to bottom - CSS overlay handles fade
		for (let i = 0; i < NUM_CURVES; i++) {
			const points = allCurvePoints[i];
			const prevPoints = i > 0 ? allCurvePoints[i - 1] : null;
			const color = getColor(i);
			const alpha = 0.95; // Fixed opacity

			drawFilledCurve(points, prevPoints, color, alpha, i === 0);
		}
	}

	function scheduleDrawOnce() {
		if (scheduledRaf) return;
		scheduledRaf = requestAnimationFrame(() => {
			scheduledRaf = 0;
			draw();
		});
	}

	function handlePointerMove(event: PointerEvent) {
		if (event.buttons && event.pointerType === 'mouse') return;
		if (!canvas) return;

		const rect = canvas.getBoundingClientRect();
		cursorX = event.clientX - rect.left;
		cursorY = event.clientY - rect.top;
		showCursor = true;
		scheduleDrawOnce();
	}

	onMount(() => {
		if (!browser) return;
		ctx = canvas.getContext('2d')!;

		// Initial draw after bindings settle
		initialTimer = window.setTimeout(() => {
			if (width > 0 && height > 0) {
				scheduleDrawOnce();
			}
		}, 0);
	});

	onDestroy(() => {
		if (scheduledRaf) cancelAnimationFrame(scheduledRaf);
		if (initialTimer) clearTimeout(initialTimer);
	});

	$effect(() => {
		if (width && height && canvas && ctx) {
			canvas.width = width;
			canvas.height = extendedHeight;
			scheduleDrawOnce();
		}
	});
</script>

<div
	bind:clientWidth={width}
	bind:clientHeight={height}
	onpointermove={!interactive ? undefined : handlePointerMove}
	onpointerenter={() => (showCursor = true)}
	onpointerleave={() => {
		// Hide the custom cursor when pointer leaves the banner area
		showCursor = false;
		cursorX = 0;
		cursorY = 0;
	}}
	role="banner"
	class="relative h-full {!interactive ? '' : 'cursor-none'}"
>
	<canvas
		bind:this={canvas}
		{width}
		height={extendedHeight}
		class="absolute right-0 left-0 w-full"
		style={direction === 'header' ? 'top: 0;' : 'bottom: 0;'}
	></canvas>

	<div
		class="custom-cursor"
		style="display: {showCursor ? 'block' : 'none'}; transform: translate3d({cursorX -
			CURSOR_SIZE / 2}px, {cursorY - CURSOR_SIZE / 2}px, 0)"
	>
		<MousePointer size={CURSOR_SIZE} />
	</div>
</div>

<style>
	.custom-cursor {
		position: absolute;
		top: 0;
		left: 0;
		pointer-events: none;
		will-change: transform;
	}

	:global(.cursor-icon) {
		color: #c4c4c4;
		fill: #f2f2f2;
		filter: drop-shadow(0 0 2px rgba(0, 0, 0, 0.5));
		@media (max-width: 768px) {
			display: none;
		}
	}
</style>
