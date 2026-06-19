<script lang="ts">
	import { Header, Container, Stack, Prose } from '$lib/components';
	import {
		computeGridBounds,
		computeHourMarks,
		computeSpanningBreakKeys,
		dedupeSpanningBreaks,
		isSpanningBreak,
		addMinutes,
		resolveSlot,
		timeToRow,
		trackColumn,
		exhibitionTrack,
		exhibitionStart,
		exhibitionEnd
	} from '$lib/utils/schedule';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	const schedule = $derived(data.schedule);
	const sessionsBySlug = $derived(data.sessionsBySlug);
	const exhibitions = $derived(data.exhibitions);

	const bounds = $derived(computeGridBounds(schedule.slots));
	const hourMarks = $derived(computeHourMarks(bounds.gridStart, bounds.gridEnd));
	const resolvedSlots = $derived(schedule.slots.map((s) => resolveSlot(s, sessionsBySlug)));

	const sessionTracks = $derived(schedule.tracks.filter((t) => t !== exhibitionTrack));
	const galleryCol = $derived(trackColumn(schedule.tracks, exhibitionTrack));
	const galleryRowStart = $derived(timeToRow(exhibitionStart, bounds.gridStart) + 1);
	const galleryRowSpan = $derived(
		timeToRow(exhibitionEnd, bounds.gridStart) - timeToRow(exhibitionStart, bounds.gridStart)
	);

	let windowStart = $state(0);
	const maxWindowStart = $derived(Math.max(0, schedule.tracks.length - 2));
	const isActive = (i: number) => i === windowStart || i === windowStart + 1;
	const activeTrackNames = $derived(schedule.tracks.filter((_, i) => isActive(i)));

	const isCollapsed = (track: string) => !isActive(schedule.tracks.indexOf(track));

	const spanningKeys = $derived(computeSpanningBreakKeys(resolvedSlots, sessionTracks.length));
	const renderSlots = $derived(dedupeSpanningBreaks(resolvedSlots, spanningKeys));

	// Gutter + one equal column per track on desktop; mobile collapses below.
	const desktopCols = $derived('3rem ' + schedule.tracks.map(() => 'minmax(0, 1fr)').join(' '));

	const GUTTER = 'min(8%, 2rem)';
	const INACTIVE_WIDTH = 'min(5%, 2rem)';
	const mobileCols = $derived.by(() => {
		const collapsed = schedule.tracks.length - 2; // number of collapsed tracks
		// Active tracks split whatever's left after the gutter and the slivers.
		const activeWidth = `calc((100% - ${GUTTER} - ${collapsed} * ${INACTIVE_WIDTH}) / 2)`;
		return (
			`${GUTTER} ` +
			schedule.tracks.map((_, i) => (isActive(i) ? activeWidth : INACTIVE_WIDTH)).join(' ')
		);
	});

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
			style="--total-rows: {bounds.totalRows}; --cols-desktop: {desktopCols}; --cols-mobile: {mobileCols};"
		>
			{#each schedule.tracks as track, i}
				<div
					class="track-header border-viz-grey-light bg-viz-white font-display text-viz-grey-dark sticky top-[calc(4rem+var(--announcement-bar-height,32px))] z-20 overflow-hidden border-b px-3 py-2 text-sm font-bold tracking-wide whitespace-nowrap uppercase shadow-lg"
					style="grid-row: 1; grid-column: {i + 2};"
					class:inactive={isCollapsed(track)}
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
					class="border-viz-grey-light pointer-events-none z-0 border-r"
					style="grid-column: {i + 1}; grid-row: 1 / -1;"
				></div>
			{/each}

			<!-- Time gutter labels (one per hour) -->
			{#each hourMarks as mark}
				<span
					class="hour-mark text-viz-grey block -translate-x-2 -translate-y-1.5 pr-1 text-right text-xs font-medium lg:-translate-y-2.5 lg:text-[16px]"
					style="grid-row: {mark.row + 1}; grid-column: 1;"
				>
					{mark.time}
				</span>
				<span
					class="hour-mark text-viz-grey block -translate-x-2 -translate-y-1.5 pr-1 text-right text-xs font-medium opacity-80 lg:-translate-y-2.5 lg:text-[16px]"
					style="grid-row: {mark.row + 3}; grid-column: 1;"
				>
					{addMinutes(mark.time, 30)}
				</span>
			{/each}

			<!-- Slot cells -->
			{#each renderSlots as r}
				<svelte:element
					this={r.href ? 'a' : 'div'}
					href={r.href}
					class="event-slot slot-color-{r.color} {r.href
						? 'cursor-pointer hover:-translate-y-px hover:shadow-md'
						: ''} z-10 flex min-h-0 flex-col gap-0.5 overflow-hidden px-3 py-2.5 text-[0.8rem] leading-tight no-underline transition duration-150"
					style="grid-row: {timeToRow(r.slot.start, bounds.gridStart) +
						1} / span {r.rowSpan}; grid-column: {isSpanningBreak(r, spanningKeys)
						? `2 / ${galleryCol}`
						: trackColumn(schedule.tracks, r.slot.track)};"
					class:inactive={!isSpanningBreak(r, spanningKeys) && isCollapsed(r.slot.track)}
					class:break-row={isSpanningBreak(r, spanningKeys)}
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
					{#if r.description}
						<span
							class="block max-w-[80vw] text-[13px] leading-snug font-normal normal-case opacity-80 lg:text-[15px]"
						>
							{r.description}
						</span>
					{/if}
					{#if r.speaker}
						<span class="text-[14px]"
							><span class="font-bold">{r.speaker}</span>{#if r.role}, {r.role}{/if}</span
						>
					{/if}
				</svelte:element>
			{/each}

			<!-- Gallery: the all-day exhibition column is one cell listing every
				 exhibition, since they all run simultaneously for the whole day. -->
			{#if exhibitions.length}
				<div
					class="event-slot slot-color-orange z-10 flex min-h-0 flex-col gap-3 overflow-hidden px-3 py-2.5 leading-tight"
					style="grid-row: {galleryRowStart} / span {galleryRowSpan}; grid-column: {galleryCol};"
					class:inactive={isCollapsed(exhibitionTrack)}
				>
					<span class="font-display block self-center text-sm font-bold uppercase lg:text-[18px]">
						Exhibition
					</span>
					<div class="flex flex-1 flex-col justify-evenly gap-3">
						{#each exhibitions as ex}
							<a
								href={ex.href}
								class="border-viz-orange/30 block pt-3 no-underline transition first:pt-0 hover:opacity-70"
							>
								<span class="font-display block text-sm font-bold uppercase lg:text-[16px]">
									{ex.title}
								</span>
								{#if ex.speaker}
									<span class="text-[14px]"
										><span class="font-bold">{ex.speaker}</span>{#if ex.role}, {ex.role}{/if}</span
									>
								{/if}
							</a>
						{/each}
					</div>
				</div>
			{/if}
		</div>

		<!-- Track window slider — desktop-hidden; grid only collapses tracks below 1024px. -->
		<div
			class="border-viz-grey-light bg-viz-white fixed inset-x-0 bottom-0 z-20 hidden flex-col items-center gap-2 border-t px-4 py-3 max-lg:flex"
		>
			<div class="flex items-baseline justify-between">
				<span class="font-display text-viz-grey-dark text-sm font-bold tracking-wide uppercase">
					Showing: {activeTrackNames.join(' · ')}
				</span>
			</div>

			<div class="relative h-6 w-full max-w-75">
				<!-- Rail: thin full-width line, vertically centred. -->
				<div
					class="bg-viz-grey-light absolute inset-x-0 top-1/2 h-1 -translate-y-1/2 rounded-full"
				></div>
				<!-- Per-track dots, under the pill so only inactive tracks' marks show. -->
				{#each schedule.tracks as _, i}
					<div
						class="bg-viz-grey pointer-events-none absolute top-1/2 h-1.5 w-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full"
						style="left: {((i + 0.5) / schedule.tracks.length) * 100}%;"
					></div>
				{/each}
				<!-- Pill thumb over the two visible tracks; pointer-events off so the input handles interaction. Transition matches the grid's column animation. -->
				<div
					class="bg-viz-grey-dark pointer-events-none absolute top-1/2 h-5 -translate-y-1/2 rounded-full transition-[left,width] duration-200"
					style="width: {thumbPct}%; left: {thumbLeftPct}%;"
				></div>
				<!-- Real range input: full-size, invisible, above the visuals. -->
				<input
					class="absolute inset-0 m-0 h-full w-full cursor-pointer opacity-0"
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
		grid-template-columns: var(--cols-desktop);
		grid-template-rows: auto repeat(var(--total-rows), 5rem);
		transition: grid-template-columns 0.2s ease;
	}

	.event-slot.break-row {
		position: relative;
		align-items: center;
		justify-content: center;
		text-align: center;
		border-color: #ccc;
		box-shadow:
			rgb(204, 219, 232) 3px 3px 6px 0px inset,
			rgba(255, 255, 255, 0.5) -3px -3px 6px 1px inset;
	}

	@media (max-width: 1024px) {
		.schedule-grid {
			grid-template-columns: var(--cols-mobile);
			grid-template-rows: auto repeat(var(--total-rows), 6.5rem);
		}

		.event-slot.inactive {
			padding: 0;
		}

		.event-slot.inactive span {
			color: transparent;
			border-radius: 16px;
		}

		.track-header.inactive {
			color: transparent;
			background: #ddd;
			border: 2px solid var(--color-viz-white);
			border-radius: 4px;
			padding: 0;
		}
	}

	@media (max-width: 600px) {
		.schedule-grid {
			grid-template-rows: auto repeat(var(--total-rows), 8rem);
		}
	}

	.slot-color-blue {
		background: var(--color-viz-blue-light);
		border: 2px solid var(--color-viz-blue);
		color: var(--color-viz-blue-dark);
	}
	.slot-color-teal {
		background: var(--color-viz-teal-light);
		border: 2px solid var(--color-viz-teal);
		color: var(--color-viz-teal-dark);
	}
	.slot-color-pink {
		background: var(--color-viz-pink-light);
		border: 2px solid var(--color-viz-pink);
		color: var(--color-viz-pink-dark);
	}
	.slot-color-orange {
		background: var(--color-viz-orange-light);
		border: 2px solid var(--color-viz-orange);
		color: var(--color-viz-orange-dark);
	}
	.slot-color-grey {
		background: #fff;
		border: 1px solid #555;
		color: #222;
	}

	/* Dashed left-border for placeholder slots. Can't be done via Tailwind's
	   border-dashed without also flipping the other (zero-width) sides. */
	.placeholder-border {
		border-style: dashed;
	}
</style>
