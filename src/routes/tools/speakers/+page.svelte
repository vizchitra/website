<script lang="ts">
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	// Global defaults
	let defaultX = $state(0);
	let defaultY = $state(0);
	let defaultScale = $state(1.0);
	let circleSize = $state(140);

	type Pos = { x: number; y: number; scale: number };
	let overrides = $state<Record<string, Pos>>({});
	let expanded = $state<string | null>(null);

	function getPos(slug: string): Pos {
		return overrides[slug] ?? { x: defaultX, y: defaultY, scale: defaultScale };
	}

	function setPos(slug: string, field: 'x' | 'y' | 'scale', val: number) {
		overrides[slug] = { ...getPos(slug), [field]: val };
	}

	function isOverridden(slug: string) {
		return slug in overrides;
	}

	function resetOverride(slug: string) {
		const next = { ...overrides };
		delete next[slug];
		overrides = next;
	}

	function transform(pos: Pos) {
		return `translate(${pos.x}%, ${pos.y}%) scale(${pos.scale})`;
	}

	// Output: speakerImageTransforms entries for any image with non-default positioning
	let instructions = $derived.by(() => {
		const lines = data.speakers
			.filter((sp) => isOverridden(sp.slug))
			.map((sp) => {
				const pos = overrides[sp.slug];
				const parts = [];
				if (pos.x !== 0) parts.push(`x: ${pos.x}`);
				if (pos.y !== 0) parts.push(`y: ${pos.y}`);
				if (pos.scale !== 1) parts.push(`scale: ${pos.scale}`);
				const name = sp.name.replace(' S ', " S'").trim();
				return `  '${name}': { ${parts.join(', ')} },`;
			});
		return lines.length ? lines.join('\n') : '  // no overrides yet — adjust individual images';
	});

	let copied = $state(false);
	function copyInstructions() {
		navigator.clipboard.writeText(`// speakerImageTransforms overrides\n{\n${instructions}\n}`);
		copied = true;
		setTimeout(() => (copied = false), 1500);
	}
</script>

<div class="min-h-screen bg-gray-50 px-6 py-10">
	<div class="mx-auto max-w-7xl space-y-8">
		<div>
			<h1 class="text-2xl font-bold text-gray-800">Speaker Portrait Review</h1>
			<p class="mt-1 text-sm text-gray-500">
				{data.speakers.length} images · transform: translate(x%, y%) scale(s) · click a card to adjust
			</p>
		</div>

		<!-- Global controls -->
		<div class="flex flex-wrap items-end gap-8 rounded-xl bg-white p-5 shadow-sm">
			<label class="flex flex-col gap-1 text-sm font-medium text-gray-600">
				Circle size
				<input type="range" min="80" max="220" step="4" bind:value={circleSize} class="w-36" />
				<span class="font-mono text-xs text-gray-400">{circleSize}px</span>
			</label>
			<label class="flex flex-col gap-1 text-sm font-medium text-gray-600">
				Default X
				<input type="range" min="-50" max="50" step="1" bind:value={defaultX} class="w-36" />
				<span class="font-mono text-xs text-gray-400">{defaultX}%</span>
			</label>
			<label class="flex flex-col gap-1 text-sm font-medium text-gray-600">
				Default Y
				<input type="range" min="-50" max="50" step="1" bind:value={defaultY} class="w-36" />
				<span class="font-mono text-xs text-gray-400">{defaultY}%</span>
			</label>
			<label class="flex flex-col gap-1 text-sm font-medium text-gray-600">
				Default Scale
				<input type="range" min="0.5" max="3" step="0.05" bind:value={defaultScale} class="w-36" />
				<span class="font-mono text-xs text-gray-400">{defaultScale.toFixed(2)}×</span>
			</label>
			<div class="rounded bg-gray-100 px-3 py-2 font-mono text-xs text-gray-500">
				translate({defaultX}%, {defaultY}%) scale({defaultScale.toFixed(2)})
			</div>
		</div>

		<!-- Grid -->
		<div
			style="display:grid; grid-template-columns:repeat(auto-fill, minmax({circleSize * 2 +
				60}px, 1fr)); gap:1.5rem;"
		>
			{#each data.speakers as sp (sp.slug)}
				{@const pos = getPos(sp.slug)}
				{@const isExp = expanded === sp.slug}
				{@const hasOverride = isOverridden(sp.slug)}
				<div
					class="flex cursor-pointer flex-col items-center gap-3 rounded-xl p-3 transition-all {isExp
						? 'bg-blue-50 ring-2 ring-blue-300'
						: hasOverride
							? 'bg-amber-50 ring-1 ring-amber-300'
							: 'bg-white hover:bg-gray-100'} shadow-sm"
					role="button"
					tabindex="0"
					onclick={() => (expanded = isExp ? null : sp.slug)}
					onkeydown={(e) => e.key === 'Enter' && (expanded = isExp ? null : sp.slug)}
				>
					<!-- Circle + Square side by side -->
					<div class="flex items-center gap-3">
						<!-- Circle -->
						<div
							class="overflow-hidden rounded-full bg-gray-200"
							style="width:{circleSize}px; height:{circleSize}px; flex-shrink:0;"
						>
							<img
								src={sp.src}
								alt={sp.name}
								style="width:100%; height:100%; object-fit:cover; transform:{transform(
									pos
								)}; transform-origin:center center;"
							/>
						</div>
						<!-- Square -->
						<div
							class="overflow-hidden rounded bg-gray-200"
							style="width:{circleSize}px; height:{circleSize}px; flex-shrink:0;"
						>
							<img
								src={sp.src}
								alt={sp.name}
								style="width:100%; height:100%; object-fit:cover; transform:{transform(
									pos
								)}; transform-origin:center center;"
							/>
						</div>
					</div>

					<span class="text-center text-xs leading-tight text-gray-600">
						{sp.name}{#if hasOverride}<span class="ml-1 text-amber-500">✎</span>{/if}
					</span>

					<!-- Per-image sliders (expanded) -->
					{#if isExp}
						<div
							class="w-full space-y-2 border-t border-blue-200 pt-3"
							role="presentation"
							onclick={(e) => e.stopPropagation()}
							onkeydown={(e) => e.stopPropagation()}
						>
							<label class="flex items-center gap-2 text-xs text-gray-600">
								<span class="w-12">X: {pos.x}%</span>
								<input
									type="range"
									min="-50"
									max="50"
									step="1"
									value={pos.x}
									oninput={(e) =>
										setPos(sp.slug, 'x', Number((e.target as HTMLInputElement).value))}
									class="flex-1"
								/>
							</label>
							<label class="flex items-center gap-2 text-xs text-gray-600">
								<span class="w-12">Y: {pos.y}%</span>
								<input
									type="range"
									min="-50"
									max="50"
									step="1"
									value={pos.y}
									oninput={(e) =>
										setPos(sp.slug, 'y', Number((e.target as HTMLInputElement).value))}
									class="flex-1"
								/>
							</label>
							<label class="flex items-center gap-2 text-xs text-gray-600">
								<span class="w-12">S: {pos.scale.toFixed(2)}×</span>
								<input
									type="range"
									min="0.5"
									max="3"
									step="0.05"
									value={pos.scale}
									oninput={(e) =>
										setPos(sp.slug, 'scale', Number((e.target as HTMLInputElement).value))}
									class="flex-1"
								/>
							</label>
							<div class="font-mono text-xs text-gray-400">
								translate({pos.x}%, {pos.y}%) scale({pos.scale.toFixed(2)})
							</div>
							{#if hasOverride}
								<button
									class="text-xs text-red-400 hover:text-red-600"
									onclick={() => resetOverride(sp.slug)}
								>
									↺ reset to default
								</button>
							{/if}
						</div>
					{/if}
				</div>
			{/each}
		</div>

		<!-- Output -->
		<div class="rounded-xl bg-white p-5 shadow-sm">
			<div class="mb-3 flex items-center justify-between">
				<h2 class="text-sm font-semibold text-gray-700">
					speakerImageTransforms overrides
					<span class="ml-2 font-normal text-gray-400"
						>({Object.keys(overrides).length} adjusted)</span
					>
				</h2>
				<button
					class="rounded-lg bg-gray-800 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-gray-700"
					onclick={copyInstructions}
				>
					{copied ? '✓ Copied' : 'Copy'}
				</button>
			</div>
			<pre
				class="overflow-x-auto rounded bg-gray-50 p-4 font-mono text-xs leading-relaxed whitespace-pre-wrap text-gray-700">{`// speakerImageTransforms overrides\n{\n${instructions}\n}`}</pre>
		</div>
	</div>
</div>
