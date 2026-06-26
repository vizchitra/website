<script lang="ts">
	import { onMount } from 'svelte';

	interface Props {
		startDateTime?: Date;
		endDateTime?: Date;
		width?: number;
		height?: number;
		class?: string;
		ariaLabel?: string;
	}

	let {
		startDateTime = new Date('2026-07-03T09:30:00+05:30'),
		endDateTime = new Date('2026-07-04T18:30:00+05:30'),
		width = 350,
		height = 400,
		class: className = '',
		ariaLabel
	}: Props = $props();

	let now = $state(new Date());

	// ─── Tune these to adjust the visual ────────────────────────────────────────
	const cx = 200;
	const cy = 250;

	const SECS_R = 150; // Seconds ring radius
	const SECS_SW = 6; // Seconds stroke width
	const MINS_R = 140; // Minutes ring radius
	const MINS_SW = 12; // Minutes stroke width
	const HRS_R = 120; // Hours ring radius
	const HRS_SW = 18; // Hours stroke width
	const DAYS_R = 95; // Days ring radius
	const DAYS_SW = 24; // Days stroke width
	const TEXT_R = SECS_R + 14; // Radius for top curved text label (glyphs extend outward)
	const BOTTOM_TEXT_R = SECS_R + 40; // Larger offset: bottom glyphs extend inward toward ring

	const BG_R_INNER = SECS_R + SECS_SW / 2; // 153 — rings only; text labels float outside
	const BG_R_STAMP = 210; // 210 — stamp; contains all text labels inside
	const BG_R = BG_R_STAMP; // ← toggle: BG_R_INNER or BG_R_STAMP

	const MAX_DISPLAY_DAYS = 90; // Scale of the days arc (≥ days to event)

	const SECS_SPEED = 16; // seconds per full rotation
	const MINS_SPEED = 32;
	const HRS_SPEED = 64;
	const DAYS_SPEED = 128;
	// ─────────────────────────────────────────────────────────────────────────────

	// Rotation angles driven by requestAnimationFrame — each ring starts at a different offset
	let mounted = $state(false);

	let secsAngle = $state(0);
	let minsAngle = $state(90);
	let hrsAngle = $state(180);
	let daysAngle = $state(270);

	// secsFraction is updated in rAF with ms precision for smooth arc motion
	let secsFraction = $state(0);

	onMount(() => {
		const startTime = Date.now();
		const targetMs = startDateTime.getTime();
		let raf: number;

		// Smooth reset: track animation state for the minute-boundary refill
		let prevRawFraction = 0;
		let secsResetStart: number | null = null;
		let secsResetTarget = 0;
		const SECS_RESET_MS = 1000;

		const tick = () => {
			const nowMs = Date.now();
			const elapsed = (nowMs - startTime) / 1000;
			secsAngle = (0 + elapsed * (360 / SECS_SPEED)) % 360;
			minsAngle = (90 + elapsed * (360 / MINS_SPEED)) % 360;
			hrsAngle = (180 + elapsed * (360 / HRS_SPEED)) % 360;
			daysAngle = (270 + elapsed * (360 / DAYS_SPEED)) % 360;

			const diffMs = Math.max(0, targetMs - nowMs);
			const rawFraction = (diffMs % 60000) / 60000;

			// Detect minute-boundary reset: fraction jumped up by > 0.5
			if (rawFraction - prevRawFraction > 0.5) {
				secsResetStart = nowMs;
				secsResetTarget = rawFraction;
			}
			prevRawFraction = rawFraction;

			if (secsResetStart !== null) {
				// Animate from 0 → target over SECS_RESET_MS with ease-out cubic
				const t = Math.min(1, (nowMs - secsResetStart) / SECS_RESET_MS);
				const eased = 1 - (1 - t) ** 3;
				secsFraction = eased * secsResetTarget;
				if (t >= 1) secsResetStart = null;
			} else {
				secsFraction = rawFraction;
			}

			raf = requestAnimationFrame(tick);
		};
		mounted = true;
		raf = requestAnimationFrame(tick);

		const countdownInterval = setInterval(() => {
			now = new Date();
		}, 1000);

		return () => {
			cancelAnimationFrame(raf);
			clearInterval(countdownInterval);
		};
	});

	let diff = $derived(Math.max(0, startDateTime.getTime() - now.getTime()));
	let totalSeconds = $derived(Math.floor(diff / 1000));
	let days = $derived(Math.floor(totalSeconds / 86400));
	let hours = $derived(Math.floor((totalSeconds % 86400) / 3600));
	let minutes = $derived(Math.floor((totalSeconds % 3600) / 60));

	// Arc fractions — secsFraction is a $state updated at 60fps in rAF (smooth)
	// minutes/hours/days update every second via setInterval (no visible jerk at those timescales)
	let minsFraction = $derived(minutes / 60);
	let hrsFraction = $derived(hours / 24);
	let daysFraction = $derived(Math.min(1, days / MAX_DISPLAY_DAYS));

	let phase = $derived(
		now.getTime() >= endDateTime.getTime()
			? 'ended'
			: now.getTime() >= startDateTime.getTime()
				? 'happening'
				: 'countdown'
	);

	let centerDisplay = $derived(
		phase === 'countdown' ? (days > 0 ? days : hours > 0 ? hours : minutes) : null
	);
	let bottomLabel = $derived(
		phase === 'ended'
			? 'SEE YOU NEXT YEAR'
			: phase === 'happening'
				? 'HAPPENING NOW'
				: `${days} DAYS  ${hours} HRS  ${String(minutes).padStart(2, '0')} MINS  TO GO`
	);

	const secsCirc = 2 * Math.PI * SECS_R;
	const minsCirc = 2 * Math.PI * MINS_R;
	const hrsCirc = 2 * Math.PI * HRS_R;
	const daysCirc = 2 * Math.PI * DAYS_R;

	let secsDash = $derived(`${secsFraction * secsCirc} ${secsCirc - secsFraction * secsCirc + 1}`);
	let minsDash = $derived(`${minsFraction * minsCirc} ${minsCirc - minsFraction * minsCirc + 1}`);
	let hrsDash = $derived(`${hrsFraction * hrsCirc} ${hrsCirc - hrsFraction * hrsCirc + 1}`);
	let daysDash = $derived(`${daysFraction * daysCirc} ${daysCirc - daysFraction * daysCirc + 1}`);

	let viewBox = '0 0 400 500';
	let ariaHidden = $derived(!ariaLabel);
</script>

<svg
	{viewBox}
	{width}
	{height}
	xmlns="http://www.w3.org/2000/svg"
	class={className}
	aria-label={ariaLabel}
	aria-hidden={ariaHidden || undefined}
	role={ariaLabel ? 'img' : undefined}
>
	<defs>
		<!-- Top arc: clockwise left→top→right (text reads along the top curve) -->
		<path
			id="topTextArc"
			d={`M ${cx - TEXT_R},${cy} A ${TEXT_R},${TEXT_R} 0 0,1 ${cx + TEXT_R},${cy}`}
		/>
		<!-- Bottom arc: counter-clockwise left→bottom→right (text readable inside bowl) -->
		<path
			id="bottomTextArc"
			d={`M ${cx - BOTTOM_TEXT_R},${cy} A ${BOTTOM_TEXT_R},${BOTTOM_TEXT_R} 0 0,0 ${cx + BOTTOM_TEXT_R},${cy}`}
		/>
	</defs>

	<!-- Background circle -->
	<circle
		{cx}
		{cy}
		r={BG_R}
		fill="var(--color-viz-grey-subtle)"
		stroke="var(--color-viz-grey-muted)"
		stroke-width="1"
	/>

	<!-- Top label curved along top arc -->
	<text
		font-size="36"
		font-weight="700"
		font-family="var(--font-display)"
		fill="var(--color-viz-grey)"
		letter-spacing="1"
	>
		<textPath href="#topTextArc" startOffset="50%" text-anchor="middle">GET TICKETS</textPath>
	</text>

	<!-- Arc rings — hidden until mounted to prevent SSR hydration flash -->
	<g style={`opacity: ${mounted ? 1 : 0}; transition: opacity 0.3s ease`}>
		<!-- Days — innermost, teal -->
		<circle
			{cx}
			{cy}
			r={DAYS_R}
			fill="none"
			stroke="var(--color-viz-teal)"
			stroke-width={DAYS_SW}
			stroke-dasharray={daysDash}
			stroke-linecap="butt"
			transform={`rotate(${daysAngle}, ${cx}, ${cy})`}
		/>

		<!-- Center countdown number — shown only during countdown, drawn BEFORE rings so arcs layer on top -->
		{#if phase === 'countdown'}
			<text
				x={cx}
				y={cy + 14}
				text-anchor="middle"
				dominant-baseline="middle"
				font-size="200"
				font-weight="850"
				font-family="var(--font-display)"
				fill="var(--color-viz-grey)"
				letter-spacing="-0.04em"
				style="font-variation-settings: 'slnt' 0"
			>
				{centerDisplay}
			</text>
		{/if}

		<!-- Seconds — outermost, orange -->
		<circle
			{cx}
			{cy}
			r={SECS_R}
			fill="none"
			stroke="var(--color-viz-orange)"
			stroke-width={SECS_SW}
			stroke-dasharray={secsDash}
			stroke-linecap="butt"
			transform={`rotate(${secsAngle}, ${cx}, ${cy})`}
		/>

		<!-- Minutes — blue -->
		<circle
			{cx}
			{cy}
			r={MINS_R}
			fill="none"
			stroke="var(--color-viz-blue)"
			stroke-width={MINS_SW}
			stroke-dasharray={minsDash}
			stroke-linecap="butt"
			transform={`rotate(${minsAngle}, ${cx}, ${cy})`}
		/>

		<!-- Hours — pink -->
		<circle
			{cx}
			{cy}
			r={HRS_R}
			fill="none"
			stroke="var(--color-viz-pink)"
			stroke-width={HRS_SW}
			stroke-dasharray={hrsDash}
			stroke-linecap="butt"
			transform={`rotate(${hrsAngle}, ${cx}, ${cy})`}
		/>
	</g>

	<!-- Bottom label curved along bottom arc -->
	<text
		font-size="28"
		font-weight="700"
		font-family="var(--font-display)"
		fill="var(--color-viz-grey-dark)"
		letter-spacing="1"
	>
		<textPath href="#bottomTextArc" startOffset="50%" text-anchor="middle">{bottomLabel}</textPath>
	</text>
</svg>
