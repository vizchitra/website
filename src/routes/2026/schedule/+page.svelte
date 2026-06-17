<script lang="ts">
	import { Header, Container, Stack, Prose } from '$lib/components';
	import {
		computeGridBounds,
		computeHourMarks,
		formatTimeRange,
		resolveSlot,
		timeToRow,
		trackColumn,
		type SlotKind
	} from '$lib/utils/schedule';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	const schedule = $derived(data.schedule);
	const sessionsBySlug = $derived(data.sessionsBySlug);

	const bounds = $derived(computeGridBounds(schedule.slots));
	const hourMarks = $derived(computeHourMarks(bounds.gridStart, bounds.gridEnd));
	const resolvedSlots = $derived(schedule.slots.map((s) => resolveSlot(s, sessionsBySlug)));

	let windowStart = $state(0);
	const maxWindowStart = $derived(Math.max(0, schedule.tracks.length - 2));
	const isActive = (i: number) => i === windowStart || i === windowStart + 1;
	const activeTrackNames = $derived(schedule.tracks.filter((_, i) => isActive(i)));

	const GUTTER = 'min(8%, 2rem)';
	const INACTIVE_WIDTH = 'min(7%, 4rem)';
	const mobileCols = $derived.by(() => {
		const collapsed = schedule.tracks.length - 2; // number of collapsed tracks
		// Active tracks split whatever's left after the gutter and the slivers.
		const activeWidth = `calc((100% - ${GUTTER} - ${collapsed} * ${INACTIVE_WIDTH}) / 2)`;
		return (
			`${GUTTER} ` +
			schedule.tracks.map((_, i) => (isActive(i) ? activeWidth : INACTIVE_WIDTH)).join(' ')
		);
	});

	const kindClass: Record<SlotKind, string> = {
		session: '',
		break: 'italic opacity-80',
		address: 'italic opacity-80',
		sponsored: '',
		placeholder: 'placeholder-border opacity-80'
	};

	const linkClass = 'cursor-pointer hover:-translate-y-px hover:shadow-md';

	let screenWidth = $state(1000);

	const thumbPct = $derived((2 / schedule.tracks.length) * 100);
	const thumbLeftPct = $derived(
		maxWindowStart === 0 ? 0 : (windowStart / maxWindowStart) * (100 - thumbPct)
	);
</script>

<svelte:window bind:innerWidth={screenWidth} />

<Header banner="curve" />

<Container class="relative" width={screenWidth < 768 ? 'full' : 'wide'}>
	<Stack>
		<Prose>
			<h1>Schedule</h1>
			<p>Four parallel tracks across the conference day, {schedule.day}.</p>
		</Prose>

		<div
			class="schedule-grid relative mt-6 grid gap-0 pb-28 lg:pb-0"
			style="--total-rows: {bounds.totalRows}; --cols-mobile: {mobileCols};"
		>
			<!-- Top-left empty cell -->
			<div
				class="border-viz-grey-light bg-viz-white sticky top-0 z-5 border-b"
				style="grid-row: 1; grid-column: 1;"
			></div>
			{#each schedule.tracks as track, i}
				<div
					class="border-viz-grey-light bg-viz-white font-display text-viz-grey-dark sticky top-0 z-5 overflow-hidden border-b px-3 py-2 text-sm font-bold tracking-wide whitespace-nowrap uppercase"
					style="grid-row: 1; grid-column: {i + 2};"
				>
					{track}
				</div>
			{/each}

			<!-- Row dividers — one per 15-min row, sit behind the slot cells -->
			{#each { length: bounds.totalRows } as _, i}
				<div
					class="border-viz-grey-light pointer-events-none border-t"
					style="grid-row: {i + 2}; grid-column: 1 / -1;"
				></div>
			{/each}

			<!-- Column dividers — one per column (excluding the last), sit behind the slot cells -->
			{#each { length: schedule.tracks.length + 1 } as _, i}
				<div
					class="pointer-events-none z-10 border-r-2 border-gray-700"
					style="grid-column: {i + 1}; grid-row: 1 / -1;"
				></div>
			{/each}

			<!-- Time gutter labels (one per hour) -->
			{#each hourMarks as mark}
				<div
					class="border-viz-grey-light text-viz-grey translate-y-[-0.45rem] self-start border-t border-dashed px-2 text-xs"
					style="grid-row: {mark.row + 1}; grid-column: 1;"
				>
					{mark.time}
				</div>
			{/each}

			<!-- Slot cells -->
			{#each resolvedSlots as r}
				<svelte:element
					this={r.href ? 'a' : 'div'}
					href={r.href}
					class="slot-color-{r.color} {kindClass[r.kind]} {r.href
						? linkClass
						: ''} flex min-h-0 flex-col gap-0.5 overflow-hidden px-3 py-2.5 text-[0.8rem] leading-tight text-inherit no-underline transition duration-150"
					style="grid-row: {timeToRow(r.slot.start, bounds.gridStart) +
						1} / span {r.rowSpan}; grid-column: {trackColumn(schedule.tracks, r.slot.track)};"
				>
					<!-- <div class="text-[0.65rem] font-semibold opacity-70">{formatTimeRange(r.slot)}</div> -->
					<!-- {#if r.slot.type}
						<div class="text-[0.6rem] font-bold tracking-wider uppercase opacity-60">
							{r.slot.type}
						</div>
					{/if} -->
					<span
						class="font-display mb-0.5 block overflow-hidden text-sm leading-tight font-bold uppercase lg:text-[16px]"
						style="display: -webkit-box; -webkit-box-orient: vertical; -webkit-line-clamp: {Math.max(
							1,
							r.rowSpan + 1
						)};"
					>
						{r.title}
					</span>
					{#if r.speaker}
						<span class="text-[14px]"><span class="font-bold">{r.speaker}</span>, Indpendent</span>
					{/if}
				</svelte:element>
			{/each}
		</div>

		<!-- Track window slider — only shown below 1024px (see CSS). Lets the
		     viewer slide the pair of visible tracks across the four. -->
		<div
			class="track-slider border-viz-grey-light bg-viz-white fixed inset-x-0 bottom-0 z-20 flex-col items-center gap-2 border-t px-4 py-3"
		>
			<div class="flex items-baseline justify-between">
				<span class="font-display text-viz-grey-dark text-sm font-bold tracking-wide uppercase">
					Showing: {activeTrackNames.join(' · ')}
				</span>
			</div>

			<!-- Custom slider: the real <input> sits on top, transparent, and drives
			     the value (drag / click / keyboard). The track + pill below are the
			     visible UI; the pill spans the two active tracks. -->
			<div class="track-range relative h-6 w-full max-w-75">
				<div class="track-range__rail"></div>
				<!-- One mark per track, centred in its 1/N slice of the rail. The pill
				     is opaque and drawn after these, so it hides the marks of the two
				     active tracks — only the other tracks' marks stay visible. -->
				{#each schedule.tracks as _, i}
					<div
						class="track-range__mark"
						style="left: {((i + 0.5) / schedule.tracks.length) * 100}%;"
					></div>
				{/each}
				<div class="track-range__pill" style="width: {thumbPct}%; left: {thumbLeftPct}%;"></div>
				<input
					class="track-range__input"
					type="range"
					min="0"
					max={maxWindowStart}
					step="1"
					bind:value={windowStart}
					aria-label="Slide visible tracks"
				/>
			</div>
		</div>
	</Stack>
</Container>

<style>
	.schedule-grid {
		display: grid;
		gap: 0;
		grid-template-columns: 3rem repeat(4, minmax(0, 1fr));
		grid-template-rows: auto repeat(var(--total-rows), 5rem);
		transition: grid-template-columns 0.2s ease;
	}

	/* The track-window slider is desktop-hidden; the grid only collapses tracks
	   below the 1024px breakpoint where space is tight. */
	.track-slider {
		display: none;
	}

	/* Thin rail running the full width, vertically centred. */
	.track-range__rail {
		position: absolute;
		top: 50%;
		left: 0;
		right: 0;
		height: 4px;
		transform: translateY(-50%);
		border-radius: 9999px;
		background: var(--color-viz-grey-light);
	}

	/* Per-track dot on the rail. Sits under the pill, so only the marks of the
	   non-active tracks remain visible. */
	.track-range__mark {
		position: absolute;
		top: 50%;
		width: 6px;
		height: 6px;
		transform: translate(-50%, -50%);
		border-radius: 9999px;
		background: var(--color-viz-grey);
		pointer-events: none;
	}

	/* Wide pill thumb spanning the two visible tracks. pointer-events stay off so
	   the transparent <input> above handles all interaction. Transition matches
	   the grid's column animation so they move together. */
	.track-range__pill {
		position: absolute;
		top: 50%;
		height: 1.25rem;
		transform: translateY(-50%);
		border-radius: 9999px;
		background: var(--color-viz-grey-dark);
		pointer-events: none;
		transition:
			left 0.2s ease,
			width 0.2s ease;
	}

	/* Real range input: full-size, invisible, sits above the visuals. */
	.track-range__input {
		position: absolute;
		inset: 0;
		width: 100%;
		height: 100%;
		margin: 0;
		opacity: 0;
		cursor: pointer;
	}

	@media (max-width: 1024px) {
		.schedule-grid {
			grid-template-columns: var(--cols-mobile);
			grid-template-rows: auto repeat(var(--total-rows), 6.5rem);
		}

		.track-slider {
			display: flex;
		}
	}

	@media (max-width: 600px) {
		.schedule-grid {
			grid-template-rows: auto repeat(var(--total-rows), 8rem);
		}

		.track-slider {
			display: flex;
		}
	}

	.slot-color-blue {
		background: var(--color-viz-blue-light);
		border-top: 1px solid var(--color-viz-blue);
		border-bottom: 1px solid var(--color-viz-blue);
		color: var(--color-viz-blue-dark);
	}
	.slot-color-teal {
		background: var(--color-viz-teal-light);
		border-top: 1px solid var(--color-viz-teal);
		border-bottom: 1px solid var(--color-viz-teal);
		color: var(--color-viz-teal-dark);
	}
	.slot-color-pink {
		background: var(--color-viz-pink-light);
		border-top: 1px solid var(--color-viz-pink);
		border-bottom: 1px solid var(--color-viz-pink);
		color: var(--color-viz-pink-dark);
	}
	.slot-color-orange {
		background: var(--color-viz-orange-light);
		border-top: 1px solid var(--color-viz-orange);
		border-bottom: 1px solid var(--color-viz-orange);
		color: var(--color-viz-orange-dark);
	}
	.slot-color-grey {
		background: #fff;
		border-top: 1px solid #555;
		border-bottom: 1px solid #555;
		color: #222;
	}

	/* Dashed left-border for placeholder slots. Can't be done via Tailwind's
	   border-dashed without also flipping the other (zero-width) sides. */
	.placeholder-border {
		border-style: dashed;
	}
</style>
