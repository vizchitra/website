<script lang="ts">
	import PatternFormats from '$lib/components/patterns/PatternMountain.svelte';

	type Format = 'talks' | 'workshops' | 'dialogues' | 'exhibition';

	interface Props {
		format: Format;
		title: string;
		duration: string;
		bestFor: string;
		points: string[];
		class?: string;
	}

	let { format, title, duration, bestFor, points, class: className = '' }: Props = $props();

	// Map format to accent color classes
	const formatColors: Record<Format, { text: string; border: string; bg: string }> = {
		talks: { text: 'text-viz-blue-dark', border: 'border-viz-blue', bg: 'bg-viz-blue-light/30' },
		dialogues: {
			text: 'text-viz-teal-dark',
			border: 'border-viz-teal',
			bg: 'bg-viz-teal-light/30'
		},
		workshops: {
			text: 'text-viz-pink-dark',
			border: 'border-viz-pink',
			bg: 'bg-viz-pink-light/30'
		},
		exhibition: {
			text: 'text-viz-orange-dark',
			border: 'border-viz-orange',
			bg: 'bg-viz-orange-light/30'
		}
	};

	const colors = $derived(formatColors[format]);

	// Map format to a simple color token name used by PatternMountain
	const formatToColor: Record<Format, 'blue' | 'teal' | 'pink' | 'orange' | 'yellow'> = {
		talks: 'blue',
		dialogues: 'teal',
		workshops: 'pink',
		exhibition: 'orange'
	};

	// Generate guide URL from format
	const guideUrl = $derived(`/guides/${format}`);
</script>

<a
	href={guideUrl}
	class="format-card not-prose grid grid-rows-[4rem_4rem_1fr] gap-1 overflow-hidden rounded-lg border-2 bg-white/80 shadow-md transition-all hover:scale-102 hover:shadow-lg {colors.border} {className} max-w-100 md:max-w-100"
>
	<!-- Row 1: Title (left) + Duration (right) -->
	<div class="mb-8 grid grid-cols-2 items-baseline gap-2 px-5 pt-5">
		<h3 class="font-display text-viz-xl font-bold tracking-wide uppercase {colors.text}">
			{title}
		</h3>
		<span class="text-viz-grey text-viz-md text-right font-medium">
			{duration}
		</span>
	</div>

	<!-- Row 2: Best For (Caption) -->
	<p class="not-prose text-viz-black text-viz-md px-5 leading-snug">
		{bestFor}
	</p>

	<!-- Row 3: Bullet Points with Pattern Background -->
	<div class="relative pb-4">
		<!-- Pattern Background -->
		<div class="pointer-events-none absolute inset-0 overflow-hidden">
			<PatternFormats
				tone={formatToColor[format]}
				class="absolute inset-x-0 bottom-0 h-full opacity-60"
			/>
		</div>

		<!-- Bullet Points -->
		<ul class="text-viz-black relative z-10 list-disc space-y-1.5 px-5 text-base leading-relaxed">
			{#each points as point}
				<li class="text-viz-sm flex items-start gap-2">
					<span class="mt-3 h-1.5 w-1.5 shrink-0 rounded-full bg-current"></span>
					<span>{point}</span>
				</li>
			{/each}
		</ul>
	</div>
</a>

<style>
	.format-card {
		min-height: 150px;
	}
</style>
