<script lang="ts">
	import {
		PatternWaves,
		PatternRiver,
		PatternCircle,
		PatternStream,
		PatternArc,
		ToolsCard,
		ToolsHeader,
		Header
	} from '$lib/components';

	const variants = ['waves', 'river', 'circle', 'stream'] as const;
	const tones = ['blue', 'teal', 'pink', 'orange', 'yellow'] as const;
	const defaultTones: Record<
		(typeof variants)[number],
		'blue' | 'teal' | 'orange' | 'pink' | 'yellow'
	> = {
		waves: 'blue',
		river: 'teal',
		circle: 'pink',
		stream: 'orange'
	};

	// Reference images mapping
	const referenceImages: Record<(typeof variants)[number], string> = {
		waves: '/images/patterns/patterns-waves-hatched.png',
		river: '/images/patterns/patterns-river-hatched.png',
		circle: '/images/patterns/patterns-circle-hatched.png',
		stream: '/images/patterns/patterns-stream-hatched.png'
	};

	let waveVariation = $state(0.5);
	let riverVariation = $state(0.5);
	let circleVariation = $state(0.5);
	let streamVariation = $state(0.5);

	let waveTone = $state<'blue' | 'teal' | 'orange' | 'pink' | 'yellow'>('blue');
	let riverTone = $state<'blue' | 'teal' | 'orange' | 'pink' | 'yellow'>('teal');
	let circleTone = $state<'blue' | 'teal' | 'orange' | 'pink' | 'yellow'>('pink');
	let streamTone = $state<'blue' | 'teal' | 'orange' | 'pink' | 'yellow'>('orange');

	// Arc countdown target date — picker value is treated as IST (UTC+05:30)
	let arcTargetDateStr = $state('2026-07-03T09:00');
	let arcTargetDate = $derived(new Date(arcTargetDateStr + ':00+05:30'));
</script>

<Header banner="square" color="grey"></Header>

<section class="mx-auto max-w-7xl space-y-10 px-2 py-12">
	<ToolsHeader
		trail={[
			{ href: '/tools', label: 'Tools' },
			{ href: '/tools/pattern', label: 'Patterns' }
		]}
		title="Pattern Gallery"
		subtitle="Four hatched SVG motifs (waves, river, circle, stream) rendered with VizChitra token colors. Compare the generated patterns with their reference designs."
	/>

	<!-- Pattern Grid with Reference Comparison -->
	{#each variants as variant}
		<ToolsCard widthClass="w-full" maxWidthClass="max-w-6xl">
			<div class="mb-4 space-y-3">
				<div>
					<h2 class="text-viz-black text-2xl font-bold capitalize">{variant}</h2>
					<p class="text-viz-grey text-sm">
						Adjust tone and variation • Compare reference vs generated
					</p>
				</div>
				<div class="flex flex-wrap items-center gap-4">
					{#if variant === 'waves'}
						<div class="flex items-center gap-3">
							<label for="waveTone" class="text-viz-grey-dark text-sm font-medium">Tone</label>
							<select
								id="waveTone"
								bind:value={waveTone}
								class="text-viz-black border-viz-grey-light rounded-md border bg-white px-3 py-1 text-sm"
							>
								{#each tones as tone}
									<option value={tone}>{tone}</option>
								{/each}
							</select>
						</div>
						<div class="flex items-center gap-3">
							<label for="waveVariation" class="text-viz-grey-dark text-sm font-medium"
								>Variation</label
							>
							<input
								id="waveVariation"
								type="range"
								min="0"
								max="1"
								step="0.01"
								bind:value={waveVariation}
								class="h-2 w-32 cursor-pointer appearance-none rounded-lg bg-gray-200 accent-blue-600"
							/>
							<span class="text-viz-black w-8 text-sm font-semibold"
								>{Number(waveVariation).toFixed(2)}</span
							>
						</div>
					{:else if variant === 'river'}
						<div class="flex items-center gap-3">
							<label for="riverTone" class="text-viz-grey-dark text-sm font-medium">Tone</label>
							<select
								id="riverTone"
								bind:value={riverTone}
								class="text-viz-black border-viz-grey-light rounded-md border bg-white px-3 py-1 text-sm"
							>
								{#each tones as tone}
									<option value={tone}>{tone}</option>
								{/each}
							</select>
						</div>
						<div class="flex items-center gap-3">
							<label for="riverVariation" class="text-viz-grey-dark text-sm font-medium"
								>Variation</label
							>
							<input
								id="riverVariation"
								type="range"
								min="0"
								max="1"
								step="0.01"
								bind:value={riverVariation}
								class="h-2 w-32 cursor-pointer appearance-none rounded-lg bg-gray-200 accent-teal-600"
							/>
							<span class="text-viz-black w-8 text-sm font-semibold"
								>{Number(riverVariation).toFixed(2)}</span
							>
						</div>
					{:else if variant === 'circle'}
						<div class="flex items-center gap-3">
							<label for="circleTone" class="text-viz-grey-dark text-sm font-medium">Tone</label>
							<select
								id="circleTone"
								bind:value={circleTone}
								class="text-viz-black border-viz-grey-light rounded-md border bg-white px-3 py-1 text-sm"
							>
								{#each tones as tone}
									<option value={tone}>{tone}</option>
								{/each}
							</select>
						</div>
						<div class="flex items-center gap-3">
							<label for="circleVariation" class="text-viz-grey-dark text-sm font-medium"
								>Variation</label
							>
							<input
								id="circleVariation"
								type="range"
								min="0"
								max="1"
								step="0.01"
								bind:value={circleVariation}
								class="h-2 w-32 cursor-pointer appearance-none rounded-lg bg-gray-200 accent-pink-600"
							/>
							<span class="text-viz-black w-8 text-sm font-semibold"
								>{Number(circleVariation).toFixed(2)}</span
							>
						</div>
					{:else if variant === 'stream'}
						<div class="flex items-center gap-3">
							<label for="streamTone" class="text-viz-grey-dark text-sm font-medium">Tone</label>
							<select
								id="streamTone"
								bind:value={streamTone}
								class="text-viz-black border-viz-grey-light rounded-md border bg-white px-3 py-1 text-sm"
							>
								{#each tones as tone}
									<option value={tone}>{tone}</option>
								{/each}
							</select>
						</div>
						<div class="flex items-center gap-3">
							<label for="streamVariation" class="text-viz-grey-dark text-sm font-medium"
								>Variation</label
							>
							<input
								id="streamVariation"
								type="range"
								min="0"
								max="1"
								step="0.01"
								bind:value={streamVariation}
								class="h-2 w-32 cursor-pointer appearance-none rounded-lg bg-gray-200 accent-orange-600"
							/>
							<span class="text-viz-black w-8 text-sm font-semibold"
								>{Number(streamVariation).toFixed(2)}</span
							>
						</div>
					{/if}
				</div>
			</div>

			<div class="grid gap-6 md:grid-cols-2">
				<!-- Generated Pattern -->
				<div class="space-y-2">
					<p class="text-viz-grey text-xs font-medium tracking-wide uppercase">Generated Pattern</p>
					<div class="border-viz-grey-light overflow-hidden rounded-xl border bg-white">
						{#if variant === 'waves'}
							<PatternWaves
								tone={waveTone}
								variation={waveVariation}
								width={400}
								height={500}
								class="block h-auto w-full"
								ariaLabel={`${variant} pattern in ${waveTone}`}
							/>
						{:else if variant === 'river'}
							<PatternRiver
								tone={riverTone}
								variation={riverVariation}
								width={400}
								height={500}
								class="block h-auto w-full"
								ariaLabel={`${variant} pattern in ${riverTone}`}
							/>
						{:else if variant === 'circle'}
							<PatternCircle
								tone={circleTone}
								variation={circleVariation}
								width={400}
								height={500}
								class="block h-auto w-full"
								ariaLabel={`${variant} pattern in ${circleTone}`}
							/>
						{:else if variant === 'stream'}
							<PatternStream
								tone={streamTone}
								variation={streamVariation}
								width={400}
								height={500}
								class="block h-auto w-full"
								ariaLabel={`${variant} pattern in ${streamTone}`}
							/>
						{/if}
					</div>
				</div>

				<!-- Reference Image -->
				<div class="space-y-2">
					<p class="text-viz-grey text-xs font-medium tracking-wide uppercase">Reference Design</p>
					<div class="border-viz-grey-light overflow-hidden rounded-xl border bg-gray-50">
						<img
							src={referenceImages[variant]}
							alt={`Reference ${variant} pattern`}
							class="block h-auto w-full"
						/>
					</div>
				</div>
			</div>
		</ToolsCard>
	{/each}

	<!-- Arc countdown card -->
	<ToolsCard widthClass="w-full" maxWidthClass="max-w-6xl">
		<div class="mb-4 space-y-3">
			<div>
				<h2 class="text-viz-black text-2xl font-bold">Arc</h2>
				<p class="text-viz-grey text-sm">
					Countdown clock with four concentric arcs: outermost (orange) for seconds, then (blue) for
					minutes, (pink) for hours, inner (teal) for days
				</p>
			</div>
			<div class="flex flex-wrap items-center gap-6">
				<div class="flex items-center gap-3">
					<label for="arcTargetDate" class="text-viz-grey-dark text-sm font-medium"
						>Target date</label
					>
					<input
						id="arcTargetDate"
						type="datetime-local"
						bind:value={arcTargetDateStr}
						class="text-viz-black border-viz-grey-light rounded-md border bg-white px-3 py-1 text-sm"
					/>
				</div>
			</div>
		</div>

		<div class="grid gap-6 md:grid-cols-2">
			<!-- Generated Pattern -->
			<div class="space-y-2">
				<p class="text-viz-grey text-xs font-medium tracking-wide uppercase">Generated Pattern</p>
				<div class="border-viz-grey-light overflow-hidden rounded-xl border bg-white">
					<PatternArc
						startDateTime={arcTargetDate}
						width={500}
						height={500}
						class="block h-auto w-full"
						ariaLabel="Arc countdown pattern"
					/>
				</div>
			</div>

			<!-- Reference Image -->
			<div class="space-y-2">
				<p class="text-viz-grey text-xs font-medium tracking-wide uppercase">Reference Design</p>
				<div class="border-viz-grey-light overflow-hidden rounded-xl border bg-gray-50">
					<img
						src="/images/patterns/patterns-arcs-spinner.png"
						alt="Reference arc countdown pattern"
						class="block h-auto w-full"
					/>
				</div>
			</div>
		</div>
	</ToolsCard>
</section>
