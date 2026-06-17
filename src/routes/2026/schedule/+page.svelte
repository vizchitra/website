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

	const kindClass: Record<SlotKind, string> = {
		session: '',
		break: 'italic opacity-80',
		address: 'italic opacity-80',
		sponsored: '',
		placeholder: 'placeholder-border opacity-80'
	};

	const linkClass = 'cursor-pointer hover:-translate-y-px hover:shadow-md';
</script>

<Header banner="curve" />

<Container width="wide">
	<Stack>
		<Prose>
			<h1>Schedule</h1>
			<p>Four parallel tracks across the conference day, {schedule.day}.</p>
		</Prose>

		<div class="schedule-grid relative mt-6 grid gap-0" style="--total-rows: {bounds.totalRows};">
			<!-- Top-left empty cell -->
			<div
				class="border-viz-grey-light bg-viz-white sticky top-0 z-5 border-b"
				style="grid-row: 1; grid-column: 1;"
			></div>
			{#each schedule.tracks as track, i}
				<div
					class="border-viz-grey-light bg-viz-white font-display text-viz-grey-dark sticky top-0 z-5 border-b px-3 py-2 text-sm font-bold tracking-wide uppercase"
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
						class="font-display mb-0.5 block overflow-hidden text-[16px] leading-tight font-bold uppercase"
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
	</Stack>
</Container>

<style>
	.schedule-grid {
		display: grid;
		gap: 0;
		grid-template-columns: 3rem repeat(4, minmax(0, 1fr));
		grid-template-rows: auto repeat(var(--total-rows), 5rem);
	}

	@media (max-width: 1024px) {
		.schedule-grid {
			grid-template-rows: auto repeat(var(--total-rows), 6.5rem);
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
