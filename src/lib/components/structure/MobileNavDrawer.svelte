<script lang="ts">
	import { slideInDrawer } from '$lib/utils/actions';
	import { getColorHex, colors } from '$lib/tokens';

	/**
	 * @typedef {Object} Props
	 * @property {any} [navSections]
	 */

	/** @type {Props} */
	let { navSections = null } = $props();

	const brandColors = colors.filter((c) => c !== 'grey');
	let width = $state(null);
	let height = 16;

	let expanded = $state(false);

	function handleClick() {
		setTimeout(() => {
			expanded = false;
		}, 100);
	}
</script>

<button
	class="trigger h-full w-full cursor-pointer"
	class:expanded
	onclick={() => (expanded = !expanded)}
	aria-label="Toggle navigation"
>
	<span class=""></span>
	<span class=""></span>
	<span class=""></span>
</button>

{#if expanded}
	<div
		class="drawer font-display absolute -right-4 flex max-h-[90dvh] flex-col gap-2 overflow-auto rounded-lg border border-neutral-300 bg-white p-4 shadow-lg sm:-right-6 lg:-right-8"
		use:slideInDrawer
	>
		{#each navSections as section, index}
			{@const pointX = (0.3 + Math.random() * 0.7) * 100}
			{@const pointY = height / 2}
			{@const pointY2 = height / 2}
			{@const lineColor1 = getColorHex(brandColors[Math.floor(Math.random() * brandColors.length)])}
			{@const lineColor2 = getColorHex(brandColors[Math.floor(Math.random() * brandColors.length)])}

			<!-- `pointX` but only for the starting polygon divider  -->
			{@const pointStartingX = (0.3 + Math.random() * 0.7) * 100}

			<div class="nav-section">
				<!-- adds additional polygon divider only before the first dropdown option -->
				{#if index === 0}
					<div class="polygon-divider mb-2 w-full" bind:clientWidth={width}>
						<svg
							{width}
							{height}
							viewBox={`0 0 ${width ?? 0} ${height ?? 0}`}
							preserveAspectRatio="xMidYMid meet"
						>
							<line
								x1={0}
								y1={height / 2}
								x2={`${pointStartingX}%`}
								y2={height / 2}
								stroke={getColorHex(brandColors[Math.floor(Math.random() * brandColors.length)])}
								stroke-width={8}
							></line>
							<line
								x1={`${pointStartingX}%`}
								y1={height / 2}
								x2={width}
								y2={height / 2}
								stroke={getColorHex(
									brandColors[
										(Math.floor(Math.random() * brandColors.length) + 2) % brandColors.length
									]
								)}
								stroke-width={8}
							></line>

							<circle cx={`${pointStartingX}%`} cy="50%" r={5 + 4} fill={'white'}></circle>
							<circle cx={`${pointStartingX}%`} cy="50%" r={5} fill={getColorHex('grey')}></circle>
						</svg>
					</div>
				{/if}

				<div class="links mb-1">
					{#if section?.subsections}
						<span class="w-full text-left">
							<span class="font-base text-2xl whitespace-nowrap text-[#4C4C4C]">{section.name}</span
							>
						</span>
						<!-- svelte-ignore a11y_no_static_element_interactions -->
						{#if section.layout === 'mega'}
							<div
								class="sub-section-list relative flex flex-col gap-1 rounded-md bg-white px-3 py-3"
								style:--accent-color={section.accentColor}
							>
								{#each section.subsections.filter((s) => s.group === 'featured') as featured}
									<a
										href={featured.href}
										target={featured.target || '_self'}
										class="featured-cta-m mb-1 flex items-center justify-between rounded-lg px-4 py-3 text-white"
										onclick={handleClick}
									>
										<span class="flex items-center gap-2 text-xl font-bold">
											<span aria-hidden="true">{featured.emoji}</span>{featured.name}
										</span>
										<span class="text-sm whitespace-nowrap">{featured.subtitle} &rarr;</span>
									</a>
								{/each}

								{#each section.subsections.filter((s) => s.group === 'primary') as subsection}
									<a
										href={subsection.href}
										class="subsection flex w-full cursor-pointer items-center gap-2.5 py-2"
										onclick={handleClick}
									>
										<span class="text-xl leading-none" aria-hidden="true">{subsection.emoji}</span>
										<span class="font-base text-xl whitespace-nowrap text-[#4C4C4C]"
											>{subsection.name}</span
										>
									</a>
								{/each}

								<hr class="my-1 border-t border-neutral-300" />
								<div class="flex flex-wrap items-center gap-x-2 gap-y-1 pt-1">
									{#each section.subsections.filter((s) => s.group === 'secondary') as subsection, i}
										{#if i > 0}
											<span class="text-neutral-300" aria-hidden="true">&middot;</span>
										{/if}
										<a href={subsection.href} class="text-sm text-neutral-500" onclick={handleClick}
											>{subsection.name}</a
										>
									{/each}
								</div>
							</div>
						{:else}
							<div
								class="sub-section-list relative flex flex-col rounded-md bg-white px-3 py-3"
								style:--accent-color={section.accentColor}
							>
								{#each section.subsections as subsection}
									{#if subsection.divider}
										<hr class="my-2 border-t border-neutral-300" />
									{:else}
										<a
											href={subsection.href}
											class="subsection w-full cursor-pointer py-2"
											onclick={handleClick}
										>
											<span class="font-base text-xl whitespace-nowrap text-[#4C4C4C]"
												>{subsection.name}
												{#if subsection.isBadge}
													<span
														class="ml-1 rounded-full border border-blue-500 bg-linear-to-r from-blue-400 to-blue-600 px-2.5 py-0.5 text-xs font-semibold text-white shadow-sm transition-transform duration-200 hover:scale-105"
													>
														{subsection.badgeText}
													</span>
												{/if}</span
											>
										</a>
									{/if}
								{/each}
							</div>
						{/if}
					{:else}
						<a
							href={section.href}
							class="cursor-pointer rounded-md"
							target={(section as any)?.target || '_self'}
						>
							<span class="font-base text-2xl whitespace-nowrap text-[#4C4C4C]">{section.name}</span
							>
						</a>
					{/if}
				</div>

				<div class="polygon-divider mb-2 w-full" bind:clientWidth={width}>
					<svg
						{width}
						{height}
						viewBox={`0 0 ${width ?? 0} ${height ?? 0}`}
						preserveAspectRatio="xMidYMid meet"
					>
						<line
							x1={0}
							y1={height / 2}
							x2={`${pointX}%`}
							y2={height / 2}
							stroke={lineColor1}
							stroke-width={8}
						></line>
						<line
							x1={`${pointX}%`}
							y1={height / 2}
							x2={width}
							y2={height / 2}
							stroke={lineColor2}
							stroke-width={8}
						></line>

						<circle cx={`${pointX}%`} cy="50%" r={5 + 4} fill={'white'}></circle>
						<circle cx={`${pointX}%`} cy="50%" r={5} fill={'#4c4c4c'}></circle>
					</svg>
				</div>
			</div>
		{/each}
	</div>
{/if}

<style>
	.featured-cta-m {
		background-color: var(--color-viz-pink-solid);
	}

	.drawer {
		top: calc(100% + 2px);
		transform: translateX(100%);
		transition: transform 0.3s ease-in-out;
	}

	:global(.drawer.slide-in) {
		transform: translateX(0);
	}

	button.trigger {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: space-between;

		height: 14px;
	}

	button.trigger span {
		--translate-amount: 6px;

		display: block;
		width: 18px;
		height: 2px;
		background-color: #4c4c4c;
		transition: transform 0.3s ease-in-out;
	}

	button.trigger.expanded span:nth-of-type(1) {
		transform: translateY(var(--translate-amount)) rotateZ(45deg);
	}
	button.trigger.expanded span:nth-of-type(2) {
		transform: rotateY(90deg);
	}
	button.trigger.expanded span:nth-of-type(3) {
		transform: translateY(calc(-1 * var(--translate-amount))) rotate(-45deg);
	}
</style>
