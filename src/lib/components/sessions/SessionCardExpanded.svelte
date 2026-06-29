<script lang="ts">
	import LogoType from '../typography/LogoType.svelte';
	import ProposalBadge from '../proposals/ProposalBadge.svelte';
	import SessionCardBackground from './SessionCardBackground.svelte';
	import PatternComingSoon from './PatternComingSoon.svelte';
	import PatternMountain from '../patterns/PatternMountain.svelte';
	import { sessionColorMap } from '$lib/utils/sessions';
	import { themeTokens, colorTokens } from '$lib/tokens';
	import { buildSpeakerImageTransform } from './speakerConfig.js';
	import ImageCluster from './ImageCluster.svelte';
	import type { Speaker } from '$lib/utils/sessions';

	interface Props {
		title: string;
		speakers?: Speaker[];
		sessionType: string;
		subtitle?: string;
		date?: string;
		time?: string;
		slot?: string;
		venue?: string;
		slug?: string;
		tbd?: boolean;
		soldOut?: boolean;
		sponsored?: boolean;
		isExpanded?: boolean;
		descriptionHtml?: string;
		from?: string;
		pageReady?: boolean;
	}

	let {
		title,
		speakers = [],
		sessionType,
		subtitle,
		date,
		time,
		slot,
		venue,
		slug,
		tbd = false,
		soldOut = false,
		sponsored = false,
		isExpanded = true,
		descriptionHtml = '',
		from = '',
		pageReady = false
	}: Props = $props();

	const effectiveSpeakerName = $derived(
		speakers
			.map((sp) => sp.name)
			.filter(Boolean)
			.join(' // ')
	);
	const speakerCount = $derived(speakers.length);
	const designation = $derived(speakers[0]?.designation ?? '');
	const organisation = $derived(speakers[0]?.organisation ?? '');
	const speakerSubline = $derived(
		speakerCount > 1
			? speakers
					.map((sp) => sp.organisation)
					.filter(Boolean)
					.join(' // ')
			: designation && organisation
				? `${designation}, ${organisation}`
				: designation || organisation
	);

	const textLayouts: Record<
		string,
		{
			titlePaddingRatio?: number;
			titleMaxWidth?: string;
			descriptionTop?: string;
			floatWidth: string;
			floatHeight: string;
		}
	> = {
		Talks: { titleMaxWidth: '100%', descriptionTop: '28%', floatWidth: '70%', floatHeight: '12em' },
		Dialogues: {
			titlePaddingRatio: 0.1,
			titleMaxWidth: '60%',
			descriptionTop: '15%',
			floatWidth: '75%',
			floatHeight: '8em'
		},
		Workshops: {
			titleMaxWidth: '100%',
			descriptionTop: '28%',
			floatWidth: '48%',
			floatHeight: '11em'
		},
		Exhibition: {
			titleMaxWidth: '100%',
			descriptionTop: '42%',
			floatWidth: '48%',
			floatHeight: '11em'
		}
	};

	const layout = $derived.by(() => {
		const base = textLayouts[sessionType] ?? textLayouts.Talks;
		if (speakerCount >= 3)
			return {
				...base,
				titleMaxWidth:
					sessionType === 'Exhibition' || sessionType === 'Dialogues' ? base.titleMaxWidth : '45%',
				floatWidth: sessionType === 'Dialogues' ? base.floatWidth : '40%',
				floatHeight: base.floatHeight
			};
		if (speakerCount === 2) return textLayouts[`${sessionType}Dual`] ?? base;
		return base;
	});

	const detailHref = $derived(
		sessionType === 'Exhibition'
			? `/2026/exhibition#${slug}`
			: from
				? `/2026/sessions/${slug}?from=${from}`
				: `/2026/sessions/${slug}`
	);

	const colorClasses = {
		pink: 'viz-pink',
		blue: 'viz-blue',
		yellow: 'viz-yellow',
		teal: 'viz-teal',
		orange: 'viz-orange'
	};

	const color = $derived(sessionColorMap[sessionType] ?? 'blue');

	const overlayColor = $derived(themeTokens[color]?.light ?? themeTokens.blue.light);
	const shadowColor = $derived(colorTokens[color]?.hex ?? colorTokens.blue.hex);

	const textPathRadius = 58;
	const overlayStrokeWidth = 12;

	function formatDate(iso: string): string {
		const d = new Date(iso);
		const day = d.getDate();
		const suffix =
			day % 10 === 1 && day !== 11
				? 'st'
				: day % 10 === 2 && day !== 12
					? 'nd'
					: day % 10 === 3 && day !== 13
						? 'rd'
						: 'th';
		const month = d.toLocaleDateString('en-GB', { month: 'long' });
		return `${day}${suffix} ${month}`;
	}

	const formattedDate = $derived(date ? formatDate(date) : '');

	let backgroundWidth = $state(0);
	let backgroundHeight = $derived.by(() => backgroundWidth * 1.25);
	let expandedBgWidth = $derived(backgroundWidth * 0.55);
	const clusterImgSize = $derived(Math.min(300, backgroundWidth * 0.55));

	function hashStringToUnit(s: string): number {
		let h = 0;
		for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) % 1000000007;
		return (h % 1000000) / 1000000;
	}
	// const seed = $derived(hashStringToUnit((slug ?? '') + title));
	let seed = $state(0.5);
	let variation = $state(0.5);
	$effect(() => {
		seed = Math.random();
		variation = Math.random();
	});

	function handlePointerMove(e: PointerEvent) {
		const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
		const y = e.clientY - rect.top;
		variation = Math.round(Math.max(0, Math.min(1, y / rect.height)) * 20) / 20;
	}
	function handlePointerLeave() {
		variation = 0.5;
	}

	let screenWidth = $state(1024);
</script>

<svelte:window bind:innerWidth={screenWidth} />

{#if tbd}
	{@const currentColor = colorClasses[color] ?? colorClasses.blue}
	<div
		class="sessions-card border-viz-grey/40 overflow-hidden rounded border transition-transform hover:scale-101"
	>
		<div
			class="relative flex aspect-4/5.5 h-full flex-col overflow-visible"
			bind:clientWidth={backgroundWidth}
			bind:clientHeight={backgroundHeight}
		>
			<PatternComingSoon
				tone={color}
				width={backgroundWidth}
				height={backgroundHeight}
				class="absolute inset-0 h-full w-full"
			/>

			<div class="session-card-header relative z-10 p-2.5 pb-0! md:p-4">
				<div class="title mb-2.5 flex flex-row items-baseline justify-start gap-2 md:mb-3">
					<div class="logo-container text-2xl leading-none text-[#4c4c4c]">
						<LogoType classes="text-2xl!" year={null} />
					</div>
					<!-- <div class="divider my-0.5 w-0.5 self-stretch bg-[#4c4c4c]"></div> -->
					<p
						class="font-display text-shadow block text-2xl leading-none tracking-tighter uppercase"
						style="color: {themeTokens[color]?.dark ??
							themeTokens.blue.dark}; font-variation-settings: 'wght' 750;"
					>
						{sessionType}
					</p>
				</div>
			</div>

			<div
				class="relative z-10 flex flex-1 flex-col items-center justify-end pb-3 text-center md:pb-4"
			>
				<p class="font-display text-shadow text-2xl font-bold text-[#4c4c4c] uppercase md:text-3xl">
					Coming soon
				</p>
				<div
					class="mt-2 rounded-4xl border-2"
					style="border-color:var(--{colorClasses[color]}-dark)"
				>
					<ProposalBadge text={sessionType} {color} />
				</div>
			</div>
		</div>
	</div>
{:else if sessionType === 'Activities'}
	{@const currentColor = colorClasses[color] ?? colorClasses.yellow}
	<div class="sessions-card-outer group relative mx-auto w-full">
		<div class="sessions-card-wrapper @container relative w-full overflow-hidden rounded">
			<svelte:element
				this={pageReady && slug ? 'a' : 'div'}
				href={pageReady && slug ? detailHref : undefined}
				role={pageReady && slug ? undefined : 'presentation'}
				class="sessions-card bg-viz-white border-viz-grey/40 isolate block w-full transform-gpu overflow-hidden rounded border transition-[transform,box-shadow] {pageReady &&
				slug
					? 'cursor-pointer group-hover:scale-102'
					: 'cursor-default'}"
				onpointermove={handlePointerMove}
				onpointerleave={handlePointerLeave}
			>
				<div
					class="session-card-body relative flex aspect-4/5.75 max-h-[85svh] flex-col md:max-h-none"
					bind:clientWidth={backgroundWidth}
					bind:clientHeight={backgroundHeight}
				>
					<!-- PatternMountain anchored to bottom of card -->
					<div class="activities-mountain-bg pointer-events-none absolute inset-x-0 bottom-0 z-0">
						{#if backgroundWidth > 0}
							<PatternMountain
								tone={color}
								{variation}
								width={backgroundWidth}
								height={Math.round(backgroundHeight * 0.88)}
								class="block h-full w-full"
							/>
						{/if}
					</div>

					<!-- Header -->
					<div class="session-card-header relative z-10 p-2.5 pb-0! md:p-4">
						<div class="title mb-2.5 flex flex-row items-baseline justify-start gap-2 md:mb-3">
							<div class="logo-container text-xl leading-none text-[#4c4c4c] md:text-2xl">
								<LogoType classes="text-xl md:text-2xl" year={null} />
							</div>
							<p
								class="font-display text-shadow block text-xl leading-none tracking-tighter uppercase md:text-2xl"
								style="color: {themeTokens[color]?.dark ??
									themeTokens.yellow.dark}; font-variation-settings: 'wght' 600;"
							>
								{sessionType}
							</p>
						</div>
					</div>

					<!-- Title & subtitle -->
					<div class="relative z-10 flex flex-col p-3 pt-1 md:p-4 md:pt-2">
						<h3
							class="title font-display text-shadow mb-2 text-[20px] leading-tight font-extrabold text-[#4c4c4c] uppercase md:text-[20px] lg:text-[22px] 2xl:text-[28px]"
						>
							{title}
						</h3>
						{#if subtitle && isExpanded}
							<p
								class="short-description font-body text-shadow text-[14px] leading-tight font-normal text-[#4c4c4c] md:text-[16px]"
							>
								{subtitle}
							</p>
						{/if}
						{#if sponsored}
							<span
								class="sponsored-badge mt-2"
								style="color: {themeTokens[color]?.dark ?? themeTokens.blue.dark}">Sponsored</span
							>
						{/if}
					</div>

					<!-- Spacer to push wave overlay down -->
					<div class="flex-1"></div>

					<!-- Speaker image -->
					<div
						class="pointer-events-none absolute right-[1%] bottom-0 z-5 origin-bottom-right transition-transform duration-300 group-hover:scale-104 group-hover:rotate-1"
						style:transform={buildSpeakerImageTransform(speakers[0]?.name, screenWidth)}
						style:filter="drop-shadow(0px 8px 16px {shadowColor}cc)"
					>
						<ImageCluster {speakers} imgSize={clusterImgSize} />
					</div>

					<!-- Wave overlay with speaker details — same as other session types -->
					<div
						class="speaker-details-overlay pointer-events-auto absolute inset-x-0 bottom-0 z-10 flex flex-col"
					>
						<div
							class="absolute inset-x-0 -bottom-px"
							style="height: 0; padding-bottom: calc(33.34% + 2px);"
						>
							<div class="absolute inset-0">
								<svg
									class="relative z-0 block h-full w-full"
									viewBox="0 0 1080 364"
									preserveAspectRatio="none"
									fill="none"
									aria-hidden="true"
								>
									<path
										d="M-12 364.516V0.516363C191.5 -0.982956 456 101.337 579 114.518C705 128.018 1004.5 9.01752 1092 2.01636V364.516H-12Z"
										fill={overlayColor}
									/>
									<path
										d="M-12 0.516363C191.5 -0.982956 456 101.337 579 114.518C705 128.018 1004.5 9.01752 1092 2.01636"
										fill="none"
										stroke="#fff"
										stroke-width={overlayStrokeWidth}
									/>
								</svg>
							</div>
						</div>

						<div class="speaker-details-content relative z-30 mt-auto w-full p-2.5 md:p-4">
							<div class="speaker-details relative z-10">
								<h3
									class="font-display text-shadow mb-1 text-[18px] leading-none text-[#4c4c4c] uppercase md:text-[20px] lg:text-[22px] 2xl:text-[26px] 2xl:text-shadow-none!"
								>
									{#each effectiveSpeakerName.split('//').map((s) => s.trim()) as person, i}
										{#if i > 0}<span
												class="text-[18px] leading-none font-medium md:text-[20px] lg:text-[22px] 2xl:text-[28px]"
											>
												&nbsp;//
											</span>{/if}
										<span
											class="first-name text-[18px] leading-none font-extrabold md:text-[20px] lg:text-[22px] 2xl:text-[28px]"
											>{person.split(' ')[0]}</span
										>{#if speakerCount === 1}<span
												class="last-name text-[18px] leading-none font-medium md:text-[20px] lg:text-[22px] 2xl:text-[28px]"
												>{' ' + person.split(' ').slice(1).join(' ')}</span
											>{/if}
									{/each}
								</h3>
								{#if speakerSubline}
									<span
										class="font-display block text-sm leading-tight text-[#4c4c4c] md:text-[14px] lg:text-[15px] 2xl:text-lg"
									>
										{speakerSubline}
									</span>
								{/if}
							</div>
						</div>
					</div>
				</div>
			</svelte:element>
		</div>

		{#if pageReady && slug}
			<svg
				class="view-details-button pointer-events-none absolute -right-18 -bottom-6 z-40 block h-32 w-32 origin-center scale-0 transition-transform duration-400 ease-out group-hover:scale-100 md:h-40 md:w-40 lg:-right-10 lg:-bottom-10 lg:h-48 lg:w-48"
				viewBox="0 0 200 200"
				fill="none"
				aria-hidden="true"
			>
				<defs>
					<path
						id="view-details-path-{slug}"
						d="M 100,100 m -{textPathRadius},0 a {textPathRadius},{textPathRadius} 0 1,1 {textPathRadius *
							2},0 a {textPathRadius},{textPathRadius} 0 1,1 -{textPathRadius * 2},0"
						fill="none"
					/>
				</defs>
				<circle
					cx="100"
					cy="100"
					r="80"
					fill="#fff"
					stroke="var(--color-{colorClasses[color]})"
					stroke-width="7"
					fill-opacity="1"
				/>
				<circle
					cx="100"
					cy="100"
					r="52"
					fill="var(--color-{colorClasses[color]}-dark)"
					stroke-width="10"
					fill-opacity="0.75"
				/>
				<circle
					cx="100"
					cy="100"
					r="45"
					fill="var(--color-{colorClasses[color]})"
					fill-opacity="1"
				/>
				<circle cx="100" cy="100" r="35" fill="#fff" fill-opacity="1" />
				<g
					transform="translate(100 100) scale(0.325) translate(-63 -63)"
					stroke="#4c4c4c"
					stroke-width="13"
					stroke-linecap="round"
					stroke-linejoin="round"
					fill="none"
				>
					<path d="M26.25 63L99.75 63" />
					<path d="M63 26.25L99.75 63L63 99.75" />
				</g>
				<text
					class="view-details-text font-display"
					fill="#4c4c4c"
					font-size="16"
					font-weight="800"
					letter-spacing="2"
					text-anchor="middle"
				>
					<textPath href="#view-details-path-{slug}" startOffset="18%">VIEW DETAILS</textPath>
					<textPath href="#view-details-path-{slug}" startOffset="65%">VIEW DETAILS</textPath>
				</text>
			</svg>
		{/if}
	</div>
{:else}
	{@const currentColor = colorClasses[color] ?? colorClasses.blue}
	<div class="sessions-card-outer group relative mx-auto w-full">
		<div class="sessions-card-wrapper @container relative w-full overflow-hidden rounded">
			{#if soldOut}
				<div class="sold-out-ribbon" style="background: {shadowColor};">
					<span class="sold-out-ribbon-text">Sold Out</span>
				</div>
			{/if}
			<svelte:element
				this={pageReady ? 'a' : 'div'}
				href={pageReady ? detailHref : undefined}
				role={pageReady ? undefined : 'presentation'}
				class="sessions-card bg-viz-white border-viz-grey/40 isolate block w-full transform-gpu overflow-hidden rounded border transition-[transform,box-shadow] {pageReady
					? 'cursor-pointer group-hover:scale-102'
					: 'cursor-default'}"
				onpointermove={handlePointerMove}
				onpointerleave={handlePointerLeave}
			>
				{#if soldOut}
					<div class="sold-out-ribbon">
						<span class="sold-out-ribbon-text">Sold Out</span>
					</div>
				{/if}
				<div
					class="session-card-body relative flex aspect-4/5.75 max-h-[85svh] flex-col md:max-h-none {soldOut
						? 'sold-out-card'
						: ''}"
					bind:clientWidth={backgroundWidth}
					bind:clientHeight={backgroundHeight}
				>
					<!-- Pattern anchored to full card so translate % is stable regardless of flex split -->
					<div class="pattern-bg-expanded absolute inset-0 z-0 overflow-visible">
						{#if expandedBgWidth > 0}
							<SessionCardBackground
								{sessionType}
								{color}
								{variation}
								{seed}
								width={expandedBgWidth}
								height={expandedBgWidth}
								class="h-full w-full"
							/>
						{/if}
					</div>
					<div class="session-top-text-content z-20">
						<div class="session-card-header relative z-10 p-2.5 pb-0! md:p-4">
							<div class="title mb-2.5 flex flex-row items-baseline justify-start gap-2 md:mb-3">
								<div class="logo-container text-xl leading-none text-[#4c4c4c] md:text-2xl">
									<LogoType classes="text-xl md:text-2xl" year={null} />
								</div>

								<!-- <div class="divider my-0.5 w-0.5 self-stretch bg-[#4c4c4c]"></div> -->
								<p
									class="font-display text-shadow block text-xl leading-none tracking-tighter uppercase md:text-2xl"
									style="color: {themeTokens[color]?.dark ??
										themeTokens.blue.dark}; font-variation-settings: 'wght' 600;"
								>
									{sessionType}
								</p>
							</div>

							<div class="sessions-logistics hidden">
								<div class="text-base leading-none uppercase md:text-base">
									{#if time}
										<span class="font-display leading-snug! font-bold md:text-[17px]"
											>{time} ⋅
										</span>
										{#if slot}<span class="font-display leading-snug! font-bold md:text-[17px]"
												>{slot}</span
											>{/if}
									{/if}
									{#if venue}
										<p class="text-base leading-none uppercase md:text-base">
											<span class="font-display leading-none! font-light md:text-[16px]"
												>{venue}
											</span>
										</p>
									{/if}
								</div>
							</div>
						</div>

						<div
							class="title-content relative z-10 p-3 pt-1 md:p-4 md:pt-3"
							style={layout.titlePaddingRatio && backgroundWidth > 0
								? `padding-top: ${Math.round(backgroundWidth * layout.titlePaddingRatio)}px`
								: undefined}
						>
							{#if sponsored && sessionType === 'Dialogues'}
								<span
									class="sponsored-badge absolute top-3 left-3 md:top-4 md:left-4"
									style="color: {themeTokens[color]?.dark ?? themeTokens.blue.dark}">Sponsored</span
								>
							{/if}
							<h3
								class="title font-display text-shadow mb-1 text-[20px] leading-none font-extrabold text-[#4c4c4c] uppercase md:text-[20px] lg:text-[22px] 2xl:text-[28px]"
								style={layout.titleMaxWidth ? `max-width: ${layout.titleMaxWidth}` : undefined}
							>
								{title}
							</h3>
							<!-- {#if subtitle}
					<p
						class="subtitle font-display text-shadow mb-1 text-[20px] leading-none font-extrabold text-[#4c4c4c] uppercase md:text-[28px]"
					></p>
				{/if} -->
						</div>

						{#if isExpanded}
							<div class="short-description-container relative z-10 p-3 pt-0 md:p-4 md:pt-1">
								<!-- float pushes text away from the photo/pattern on the right -->
								<div
									class="text-shape-float"
									style="width: {layout.floatWidth}; height: {layout.floatHeight};"
									aria-hidden="true"
								></div>
								<!-- div (not p) so that inner <p> tags from descriptionHtml don't break float context -->
								<div
									class="short-description font-body text-shadow mb-1 text-[15px] leading-tight font-normal text-[#4c4c4c] md:text-[18px]"
								>
									{subtitle}
								</div>
							</div>
						{/if}
						{#if sponsored && sessionType !== 'Dialogues'}
							<div class="relative z-10 px-3 pb-1 md:px-4">
								<span
									class="sponsored-badge"
									style="color: {themeTokens[color]?.dark ?? themeTokens.blue.dark}">Sponsored</span
								>
							</div>
						{/if}
					</div>
					<div
						class="background-container-expanded relative z-0 flex w-full flex-1 flex-row items-center justify-end"
					>
						<div
							class="pointer-events-none absolute right-[1%] bottom-0 z-5 origin-bottom-right transition-transform duration-300 group-hover:scale-104 group-hover:rotate-1"
							style:transform={buildSpeakerImageTransform(speakers[0]?.name, screenWidth)}
							style:filter="drop-shadow(0px 8px 16px {shadowColor}cc)"
						>
							<ImageCluster {speakers} imgSize={clusterImgSize} />
						</div>
					</div>

					<div
						class="speaker-details-overlay pointer-events-auto absolute inset-x-0 bottom-0 z-10 flex flex-col"
					>
						<!-- wave height = card-width/3; padding-bottom% is relative to own width (inset-x-0) -->
						<div
							class="absolute inset-x-0 -bottom-px"
							style="height: 0; padding-bottom: calc(33.34% + 2px);"
						>
							<div class="absolute inset-0">
								<svg
									class="relative z-0 block h-full w-full"
									viewBox="0 0 1080 364"
									preserveAspectRatio="none"
									fill="none"
									aria-hidden="true"
								>
									<path
										d="M-12 364.516V0.516363C191.5 -0.982956 456 101.337 579 114.518C705 128.018 1004.5 9.01752 1092 2.01636V364.516H-12Z"
										fill={overlayColor}
									/>
									<path
										d="M-12 0.516363C191.5 -0.982956 456 101.337 579 114.518C705 128.018 1004.5 9.01752 1092 2.01636"
										fill="none"
										stroke="#fff"
										stroke-width={overlayStrokeWidth}
									/>
								</svg>
							</div>
						</div>

						<div class="speaker-details-content relative z-30 mt-auto w-full p-2.5 md:p-4">
							<div class="speaker-details relative z-10">
								<h3
									class="font-display text-shadow mb-1 text-[18px] leading-none text-[#4c4c4c] uppercase md:text-[20px] lg:text-[22px] 2xl:text-[26px] 2xl:text-shadow-none!"
								>
									{#each effectiveSpeakerName.split('//').map((s) => s.trim()) as person, i}
										{#if i > 0}<span
												class="text-[18px] leading-none font-medium md:text-[20px] lg:text-[22px] 2xl:text-[28px]"
											>
												&nbsp;//
											</span>{/if}
										<span
											class="first-name text-[18px] leading-none font-extrabold md:text-[20px] lg:text-[22px] 2xl:text-[28px]"
											>{person.split(' ')[0]}</span
										>{#if speakerCount === 1}<span
												class="last-name text-[18px] leading-none font-medium md:text-[20px] lg:text-[22px] 2xl:text-[28px]"
												>{' ' + person.split(' ').slice(1).join(' ')}</span
											>{/if}
									{/each}
								</h3>
								{#if speakerSubline}
									<span
										class="font-display block text-sm leading-tight text-[#4c4c4c] md:text-[14px] lg:text-[15px] 2xl:text-lg"
									>
										{speakerSubline}
									</span>
								{/if}
							</div>
						</div>
					</div>
				</div>
			</svelte:element>
		</div>

		{#if pageReady}
			<svg
				class="view-details-button pointer-events-none absolute -right-18 -bottom-6 z-40 block h-32 w-32 origin-center scale-0 transition-transform duration-400 ease-out group-hover:scale-100 md:h-40 md:w-40 lg:-right-10 lg:-bottom-10 lg:h-48 lg:w-48"
				viewBox="0 0 200 200"
				fill="none"
				aria-hidden="true"
			>
				<defs>
					<path
						id="view-details-path-{slug}"
						d="M 100,100 m -{textPathRadius},0 a {textPathRadius},{textPathRadius} 0 1,1 {textPathRadius *
							2},0 a {textPathRadius},{textPathRadius} 0 1,1 -{textPathRadius * 2},0"
						fill="none"
					/>
				</defs>
				<circle
					cx="100"
					cy="100"
					r="80"
					fill="#fff"
					stroke="var(--color-{colorClasses[color]})"
					stroke-width="7"
					fill-opacity="1"
				/>
				<circle
					cx="100"
					cy="100"
					r="52"
					fill="var(--color-{colorClasses[color]}-dark)"
					stroke-width="10"
					fill-opacity="0.75"
				/>
				<circle
					cx="100"
					cy="100"
					r="45"
					fill="var(--color-{colorClasses[color]})"
					fill-opacity="1"
				/>
				<circle cx="100" cy="100" r="35" fill="#fff" fill-opacity="1" />
				<g
					transform="translate(100 100) scale(0.325) translate(-63 -63)"
					stroke="#4c4c4c"
					stroke-width="13"
					stroke-linecap="round"
					stroke-linejoin="round"
					fill="none"
				>
					<path d="M26.25 63L99.75 63" />
					<path d="M63 26.25L99.75 63L63 99.75" />
				</g>
				<text
					class="view-details-text font-display"
					fill="#4c4c4c"
					font-size="16"
					font-weight="800"
					letter-spacing="2"
					text-anchor="middle"
				>
					<textPath href="#view-details-path-{slug}" startOffset="18%">VIEW DETAILS</textPath>
					<textPath href="#view-details-path-{slug}" startOffset="65%">VIEW DETAILS</textPath>
				</text>
			</svg>
		{/if}
	</div>
{/if}

<style>
	.sold-out-ribbon {
		position: absolute;
		top: 38px;
		right: -70px;
		z-index: 30;
		width: 320px;
		transform: rotate(35deg);
		text-align: center;
		padding: 10px 0;
		pointer-events: none;
		box-shadow: 0 3px 10px rgba(0, 0, 0, 0.2);
	}

	.sold-out-card {
		opacity: 0.7;
		filter: grayscale(40%);
	}

	.sold-out-card:hover {
		opacity: 0.85;
		filter: grayscale(20%);
	}

	.sold-out-ribbon-text {
		font-family: var(--font-display);
		font-size: 1.05rem;
		font-weight: 800;
		color: white;
		letter-spacing: 0.15em;
		text-transform: uppercase;
	}

	.sessions-card-outer {
		/* Scope the sold-out ribbon's z-index to this card so it can't paint over
		   neighbouring cards in the overlapping fan layout on the home page. */
		isolation: isolate;
		box-shadow:
			rgba(50, 50, 93, 0.25) 0px 6px 12px -2px,
			rgba(0, 0, 0, 0.3) 0px 3px 7px -3px;
	}

	.sessions-card-outer:hover {
		box-shadow:
			rgba(50, 50, 93, 0.2) 0px 10px 15px -2px,
			rgba(0, 0, 0, 0.2) 0px 6px 8px -3px;
	}

	.sessions-card {
		display: flex;
		flex-direction: column;
		gap: 0rem;
	}

	/* .session-top-text-content: max-h set inline (52%) caps text area so background-container always gets space */

	@media (min-width: 550px) {
		.session-top-text-content::after {
			height: 60px;
			bottom: -60px;
		}
	}

	.sponsored-badge {
		display: inline-block;
		font-family: var(--font-display);
		font-size: var(--text-viz-sm);
		font-weight: 400;
		letter-spacing: 0.08em;
		text-transform: uppercase;
		line-height: 1.4;
		white-space: nowrap;
	}

	.activities-mountain-bg {
		height: 88%;
	}

	.text-shape-float {
		float: right;
		shape-outside: polygon(70% 0%, 100% 0%, 100% 80%, 0% 80%);
		/* TODO: remove debug visuals once shape tuning is done */
		/* background: rgba(255, 0, 80, 0.35);
		clip-path: polygon(70% 0%, 100% 0%, 100% 80%, 0% 80%);
		outline: 1px dashed rgba(255, 0, 80, 0.9); */
	}

	.text-shadow {
		text-shadow:
			-1.5px -1.5px 0 white,
			1.5px -1.5px 0 white,
			-1.5px 1.5px 0 white,
			1.5px 1.5px 0 white;
	}

	.view-details-text {
		transform-box: view-box;
		transform-origin: 100px 100px;
		animation: view-details-spin 14s linear infinite;
	}

	@keyframes view-details-spin {
		from {
			transform: rotate(0deg);
		}
		to {
			transform: rotate(360deg);
		}
	}
</style>
