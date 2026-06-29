<script lang="ts">
	import { Header, Container, Stack, Grid, Prose, FullBleed } from '$lib/components';
	import SessionCardExpanded from '$lib/components/sessions/SessionCardExpanded.svelte';
	import { sessionColorMap } from '$lib/utils/sessions';
	import { replaceState } from '$app/navigation';
	import { browser } from '$app/environment';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	let selectedFormat = $state(
		browser ? (new URLSearchParams(location.search).get('type') ?? 'all') : 'all'
	);
	let selectedDay = $state(
		browser ? (new URLSearchParams(location.search).get('day') ?? 'all') : 'all'
	);

	const days = [
		{ label: 'All Days', value: 'all' },
		{ label: 'Workshop Day — 03 Jul', value: 'workshop' },
		{ label: 'Conference Day — 04 Jul', value: 'conference' }
	];

	const dayDateMap: Record<string, string> = {
		workshop: '2026-07-03',
		conference: '2026-07-04'
	};

	let filteredSessions = $derived(
		data.sessions.filter((s) => {
			const datePrefix = dayDateMap[selectedDay] ?? selectedDay;
			const matchesDay = selectedDay === 'all' || s.date.startsWith(datePrefix);
			const matchesFormat = selectedFormat === 'all' || s.sessionType === selectedFormat;
			return matchesDay && matchesFormat;
		})
	);

	function setDay(value: string) {
		selectedDay = value;
		updateUrl();
	}

	function setFormat(value: string) {
		selectedFormat = value;
		updateUrl();
	}

	function updateUrl() {
		const params = new URLSearchParams();
		if (selectedDay !== 'all') params.set('day', selectedDay);
		if (selectedFormat !== 'all') params.set('type', selectedFormat);
		const search = params.toString();
		replaceState(`/2026/sessions${search ? `?${search}` : ''}`, {});
	}
</script>

<Header banner="curve" />

<Container>
	<Stack>
		<Prose>
			<h1>Sessions</h1>
			<p>
				Explore the sessions lined up for VizChitra 2026: Talks, Dialogues, Workshops, Exhibitions,
				and Activities.
			</p>
		</Prose>

		<a
			href="/2026/schedule"
			style="background-color: var(--color-viz-pink-solid);"
			class="font-display inline-flex items-center gap-2 self-start rounded-full px-5 py-2.5 text-sm font-bold text-white transition-[filter] hover:brightness-110"
		>
			<span aria-hidden="true">🗓️</span> Explore the minute-by-minute schedule &rarr;
		</a>

		<!-- Day filter -->
		<div class="flex flex-wrap items-center gap-2">
			{#each days as day}
				<button
					class="rounded-full border px-4 py-1.5 text-sm font-medium transition-colors {selectedDay ===
					day.value
						? 'bg-viz-grey border-viz-grey text-white'
						: 'border-viz-grey/20 text-viz-grey hover:border-viz-grey/40'}"
					onclick={() => setDay(day.value)}
				>
					{day.label}
				</button>
			{/each}
		</div>

		<!-- Format filter -->
		<div class="flex flex-wrap items-center gap-2">
			<button
				class="rounded-full border px-4 py-1.5 text-sm font-medium transition-colors {selectedFormat ===
				'all'
					? 'bg-viz-grey border-viz-grey text-white'
					: 'border-viz-grey/20 text-viz-grey hover:border-viz-grey/40'}"
				onclick={() => setFormat('all')}
			>
				All
			</button>
			{#each data.formats as format}
				{@const color = sessionColorMap[format] ?? 'blue'}
				<button
					class="rounded-full border px-4 py-1.5 text-sm font-medium transition-colors {selectedFormat ===
					format
						? `bg-viz-grey border-viz-grey text-white`
						: `border-viz-grey/20 text-viz-grey hover:border-viz-${color}-solid/40`}"
					onclick={() => setFormat(format)}
				>
					{format}
				</button>
			{/each}
		</div>

		<!-- Session cards grid -->
		<FullBleed paddingX="xl">
			<Grid maxColumns={4} minWidth="300px" maxItemWidth="300px" gap={6}>
				{#each filteredSessions as session, i (session.slug ? session.slug : `tbd-${session.sessionType}-${i}`)}
					<SessionCardExpanded
						title={session.title}
						speakers={session.speakers}
						sessionType={session.sessionType}
						subtitle={session.subtitle}
						date={session.date}
						time={session.time}
						slot={session.slot}
						venue={session.venue}
						slug={session.slug}
						descriptionHtml={session.descriptionHtml}
						tbd={session.tbd}
						soldOut={session.soldOut}
						sponsored={session.sponsored}
						isExpanded={true}
						pageReady={session.pageReady}
					/>
				{/each}
			</Grid>
		</FullBleed>

		{#if filteredSessions.length === 0}
			<div class="py-16 text-center">
				<p class="text-viz-grey text-lg">No sessions found for this filter.</p>
			</div>
		{/if}
	</Stack>
</Container>
