<script lang="ts">
	import PatternWaves from '../patterns/PatternWaves.svelte';
	import PatternRiver from '../patterns/PatternRiver.svelte';
	import PatternCircle from '../patterns/PatternCircle.svelte';
	import PatternStream from '../patterns/PatternStream.svelte';

	interface Props {
		sessionType: string;
		color: 'blue' | 'teal' | 'orange' | 'pink' | 'yellow';
		variation: number;
		seed: number;
		width: number;
		height: number;
		class?: string;
	}

	let {
		sessionType,
		color,
		variation,
		seed,
		width,
		height,
		class: className = ''
	}: Props = $props();

	// const wavesLayerConfig = [
	// 	{ yFactor: 0.3, ampFactor: 1.5, frequency: 1.8, fillKey: 'light' as const, hatched: true },
	// 	{ yFactor: 0.5, ampFactor: 1.2, frequency: 1.5, fill: '#778ECE' }
	// ];

	const patternTransforms: Record<string, string> = {
		Workshops: 'translate(25%, 25%) scale(1.25)',
		Talks: 'translate(0%, 15%) scale(1.0)',
		Dialogues: 'translate(10%, 0%)',
		Exhibition: 'translate(0%, 0%) scale(1.1)'
	};
	const patternTransform = $derived(patternTransforms[sessionType] ?? patternTransforms.Talks);
</script>

<div class="session-card-background relative overflow-visible {className}">
	<!-- pattern-layer: transform applied to div, not the SVG, to avoid disrupting SVG coordinate system -->
	<div class="pattern-layer absolute inset-0 overflow-visible" style:transform={patternTransform}>
		{#if sessionType === 'Talks'}
			<PatternWaves
				tone={color}
				{variation}
				{width}
				height={height * 0.8}
				// layerConfig={wavesLayerConfig}
				class="absolute inset-0 h-full w-full overflow-visible"
			/>
		{:else if sessionType === 'Dialogues'}
			<PatternRiver
				tone={color}
				{variation}
				{seed}
				{width}
				{height}
				class="absolute inset-0 h-full w-full"
			/>
		{:else if sessionType === 'Workshops'}
			<PatternCircle
				tone={color}
				{variation}
				{width}
				height={height * 0.8}
				showHatch={false}
				class="absolute inset-0 h-full w-full overflow-visible"
			/>
		{:else if sessionType === 'Exhibition'}
			<PatternStream
				tone={color}
				{variation}
				{width}
				height={height * 0.8}
				class="absolute inset-0 h-full w-full overflow-visible"
			/>
		{:else}
			<PatternWaves
				tone={color}
				{variation}
				{width}
				height={height * 0.8}
				class="absolute inset-0 h-full w-full overflow-visible"
			/>
		{/if}
	</div>
</div>
