<script lang="ts">
	import ImageCluster from '$lib/components/sessions/ImageCluster.svelte';
	import { buildSpeakerImageTransform } from '$lib/components/sessions/speakerConfig.js';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	const pool = $derived(data.speakers.slice(0, 12));
	let picks = $state([0, 1, 2, 3]);

	function cycle(slot: number, dir: 1 | -1) {
		picks = picks.map((p, i) => (i !== slot ? p : (p + dir + pool.length) % pool.length));
	}

	let cardWidths = $state<Record<number, number>>({});
	const baseImgSize = (count: number) => Math.min(300, (cardWidths[count] ?? 280) * 0.55);

	// Layout controls
	let gap = $state(0.75); // step between front images
	let backBaseline = $state(0.3); // back row vertical lift
	let backHShift = $state(0); // back row horizontal shift
	let backGap = $state(0.6); // step between the two back images (4-speaker)

	// Wave colour
	const overlayOptions = [
		{ label: 'Pink', fill: '#fce7f3' },
		{ label: 'Blue', fill: '#dbeafe' },
		{ label: 'Yellow', fill: '#fef9c3' },
		{ label: 'Teal', fill: '#ccfbf1' },
		{ label: 'Orange', fill: '#ffedd5' }
	];
	let overlayIdx = $state(1);
	const overlayFill = $derived(overlayOptions[overlayIdx].fill);

	const variants = [1, 2, 3, 4] as const;
	let screenWidth = $state(1024);
</script>

<svelte:window bind:innerWidth={screenWidth} />

<div class="min-h-screen bg-gray-100 px-6 py-10">
	<div class="mx-auto max-w-5xl space-y-8">
		<div>
			<h1 class="text-2xl font-bold text-gray-800">ImageCluster Review</h1>
			<p class="mt-1 text-sm text-gray-500">Tune layout against the real card wave</p>
		</div>

		<!-- Layout controls -->
		<div class="flex flex-wrap items-end gap-8 rounded-xl bg-white p-5 shadow-sm">
			<!-- Wave colour -->
			<div class="flex flex-col gap-2 text-sm font-medium text-gray-600">
				Wave colour
				<div class="flex gap-2">
					{#each overlayOptions as opt, idx}
						<button
							aria-label={opt.label}
							class="h-6 w-6 rounded-full border-2 transition-all"
							style:background={opt.fill}
							style:border-color={idx === overlayIdx ? '#6b7280' : 'transparent'}
							onclick={() => (overlayIdx = idx)}
						></button>
					{/each}
				</div>
			</div>

			<!-- Gap slider -->
			<label class="flex flex-col gap-1 text-sm font-medium text-gray-600">
				Front gap <span class="font-mono text-xs text-gray-400">{(gap * 100).toFixed(0)}%</span>
				<input type="range" min="0.30" max="0.90" step="0.01" bind:value={gap} class="w-36" />
			</label>

			<!-- Back baseline -->
			<label class="flex flex-col gap-1 text-sm font-medium text-gray-600">
				Back baseline <span class="font-mono text-xs text-gray-400"
					>{(backBaseline * 100).toFixed(0)}%</span
				>
				<input type="range" min="0" max="0.60" step="0.01" bind:value={backBaseline} class="w-36" />
			</label>

			<!-- Back H-shift -->
			<label class="flex flex-col gap-1 text-sm font-medium text-gray-600">
				Back h-shift <span class="font-mono text-xs text-gray-400"
					>{(backHShift * 100).toFixed(0)}%</span
				>
				<input
					type="range"
					min="-0.20"
					max="0.20"
					step="0.01"
					bind:value={backHShift}
					class="w-36"
				/>
			</label>

			<!-- Back gap (4-speaker only) -->
			<label class="flex flex-col gap-1 text-sm font-medium text-gray-600">
				Back gap <span class="font-mono text-xs text-gray-400">{(backGap * 100).toFixed(0)}%</span>
				<input type="range" min="0.20" max="0.90" step="0.01" bind:value={backGap} class="w-36" />
			</label>
		</div>

		<!-- Speaker pickers -->
		<div class="flex flex-wrap items-end gap-6 rounded-xl bg-white p-5 shadow-sm">
			{#each picks as pick, i}
				<div class="flex flex-col gap-1 text-xs text-gray-600">
					<span class="font-medium">Speaker {i + 1}</span>
					<div class="flex items-center gap-1">
						<button
							class="rounded bg-gray-100 px-1.5 py-0.5 hover:bg-gray-200"
							onclick={() => cycle(i, -1)}>‹</button
						>
						<span class="w-28 truncate font-mono text-[10px]">{pool[pick]?.name ?? '—'}</span>
						<button
							class="rounded bg-gray-100 px-1.5 py-0.5 hover:bg-gray-200"
							onclick={() => cycle(i, 1)}>›</button
						>
					</div>
				</div>
			{/each}
		</div>

		<!-- Four cluster variants -->
		<div class="grid grid-cols-2 gap-6 lg:grid-cols-4">
			{#each variants as count}
				{@const speakers = picks
					.slice(0, count)
					.map((p) => pool[p])
					.filter(Boolean)}
				{@const imgSz = baseImgSize(count)}
				<div class="flex flex-col gap-2">
					<span class="text-xs font-semibold tracking-wide text-gray-500 uppercase">
						{count} speaker{count > 1 ? 's' : ''}
					</span>

					<div
						class="relative w-full overflow-hidden rounded-xl bg-white shadow-md"
						style="aspect-ratio: 4/5.75"
						bind:clientWidth={cardWidths[count]}
					>
						<!-- Background -->
						<div class="absolute inset-0 bg-linear-to-br from-gray-50 to-gray-100"></div>

						<!-- Title placeholder bars -->
						<div class="absolute top-4 left-4 z-10 space-y-2">
							<div class="h-2 w-10 rounded bg-gray-400/40"></div>
							<div class="h-3.5 w-28 rounded bg-gray-500/50"></div>
							<div class="h-2.5 w-24 rounded bg-gray-400/30"></div>
							<div class="h-2 w-20 rounded bg-gray-300/30"></div>
							<div class="h-2 w-28 rounded bg-gray-300/25"></div>
							<div class="h-2 w-16 rounded bg-gray-300/25"></div>
						</div>

						<!-- Cluster -->
						<div
							class="pointer-events-none absolute right-[1%] bottom-0 z-5"
							style:transform={buildSpeakerImageTransform(speakers[0]?.name, screenWidth)}
						>
							<ImageCluster
								{speakers}
								imgSize={imgSz}
								{gap}
								{backBaseline}
								{backHShift}
								{backGap}
							/>
						</div>

						<!-- Real wave overlay -->
						<div class="pointer-events-none absolute inset-x-0 bottom-0 z-10 flex flex-col">
							<div
								class="absolute inset-x-0 -bottom-px"
								style="height:0; padding-bottom:calc(33.34% + 2px);"
							>
								<div class="absolute inset-0">
									<svg
										class="block h-full w-full"
										viewBox="0 0 1080 364"
										preserveAspectRatio="none"
										fill="none"
										aria-hidden="true"
									>
										<path
											d="M-12 364.516V0.516363C191.5 -0.982956 456 101.337 579 114.518C705 128.018 1004.5 9.01752 1092 2.01636V364.516H-12Z"
											fill={overlayFill}
										/>
										<path
											d="M-12 0.516363C191.5 -0.982956 456 101.337 579 114.518C705 128.018 1004.5 9.01752 1092 2.01636"
											fill="none"
											stroke="#fff"
											stroke-width="12"
										/>
									</svg>
								</div>
							</div>

							<!-- Speaker details (matches card layout) -->
							<div class="relative z-30 mt-auto w-full p-2.5">
								<p
									class="font-display text-[13px] leading-none font-extrabold text-[#4c4c4c] uppercase"
								>
									{#each speakers as sp, i}
										{#if i > 0}<span class="font-medium"> // </span>{/if}
										<span class="font-extrabold">{sp.name.split(' ')[0]}</span
										>{#if count === 1}<span class="font-medium">
												{sp.name.split(' ').slice(1).join(' ')}</span
											>{/if}
									{/each}
								</p>
								{#if speakers[0]}
									<span class="mt-0.5 block text-[10px] leading-tight text-[#4c4c4c]/60">
										{speakers[0].designation || 'Designation · Organisation'}
									</span>
								{/if}
							</div>
						</div>
					</div>

					<span class="font-mono text-[10px] text-gray-400">imgSize: {imgSz.toFixed(0)}px</span>
				</div>
			{/each}
		</div>
	</div>
</div>
