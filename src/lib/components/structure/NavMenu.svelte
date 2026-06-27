<script lang="ts">
	import { stopPropagation, createBubbler } from 'svelte/legacy';
	import { colorTokens } from '$lib/tokens';

	const bubble = createBubbler();
	import VizChitraLogoType from '$lib/components/typography/LogoType.svelte';
	import MobileNavDrawer from './MobileNavDrawer.svelte';
	import { clickOutside } from '$lib/utils/actions';
	import { page } from '$app/stores';

	const currentPath = $derived($page.url.pathname);

	let navSections = $state([
		{
			name: '2026',
			href: '/2026/',
			accentColor: 'var(--color-viz-orange)',
			layout: 'mega',
			subsections: [
				{
					name: 'Get Tickets',
					href: 'https://tickets.vizchitra.com',
					target: '_blank',
					group: 'featured',
					subtitle: 'July 3–4 · BIC',
					emoji: '🎟️'
				},
				{ name: 'Home', href: '/2026/', group: 'primary', emoji: '🏠' },
				{ name: 'Schedule', href: '/2026/schedule', group: 'primary', emoji: '🗓️' },
				{ name: 'Sessions', href: '/2026/sessions', group: 'primary', emoji: '🎤' },
				{ name: 'Exhibition', href: '/2026/exhibition', group: 'primary', emoji: '🖼️' },
				{ name: 'Attendee Guide', href: '/2026/attendee-guide', group: 'primary', emoji: '🗺️' },
				{ name: 'Sponsorship', href: '/2026/sponsorship', group: 'secondary' },
				{ name: 'Scholarships', href: '/2026/scholarships', group: 'secondary' },
				{ name: 'Submissions', href: '/2026/submissions', group: 'secondary' }
			],
			expanded: false
		},
		{
			name: '2025',
			href: '/2025/',
			accentColor: 'var(--color-viz-blue)',
			subsections: [
				{ name: 'Event', href: '/2025/' },
				{ name: 'Videos', href: '/2025/videos' },
				{ name: 'Schedule', href: '/2025/schedule' },
				{ name: 'Sponsorship', href: '/2025/sponsorship' }
			],
			expanded: false
		},
		{
			name: 'Guides',
			href: '/guides/',
			accentColor: 'var(--color-viz-grey)',
			subsections: [
				{ name: 'Overview', href: '/guides/' },
				{ name: 'Talks', href: '/guides/talks' },
				{ name: 'Workshops', href: '/guides/workshops' },
				{ name: 'Dialogues', href: '/guides/dialogues' },
				{ name: 'Exhibition', href: '/guides/exhibition' },
				{ name: 'Panels', href: '/guides/panels' }
			],
			expanded: false
		},
		{
			name: 'About',
			href: '/about',
			accentColor: 'var(--color-viz-pink)',
			subsections: [
				{ name: 'Our Ethos', href: '/ethos' },
				{ name: 'The Community', href: '/community' },
				{ name: 'Code of Conduct', href: '/conduct' },
				{ name: 'Meet the Team', href: '/team' },
				{ name: 'Tools & Patterns', href: '/tools' }
			],
			expanded: false
		}
	]);

	function toggleDropdown(section) {
		Object.keys(navSections).forEach((key) => {
			if (navSections[key].name === section) {
				navSections[key].expanded = !navSections[key].expanded;
			} else {
				navSections[key].expanded = false;
			}
		});
	}

	// close all dropdowns when clicking outside
	function handleClickOutside(event) {
		Object.keys(navSections).forEach((key) => {
			navSections[key].expanded = false;
		});
	}
</script>

<nav
	class="bg-viz-white/80 border-viz-black/10 opacity fixed top-0 left-0 z-50 border-b backdrop-blur-md"
	style="top: var(--announcement-bar-height, 32px); right: var(--studio-panel-width, 0); transition: right 150ms ease;"
>
	<div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
		<div class="flex h-16 justify-between">
			<div class="flex">
				<a href="/2026/" class="flex items-center text-3xl">
					<VizChitraLogoType year={null} />
				</a>
			</div>

			<div class="mobile-drawer-container relative flex h-full items-center justify-center">
				<!-- <a
					href="https://hasgeek.com/VizChitra/2025/schedule"
					target="_blank"
					class="bg-viz-pink hover:bg-viz-pink/90 mr-3 inline-flex w-full items-center justify-center gap-3 rounded-lg border border-neutral-500 px-3 py-1 text-base font-medium text-nowrap whitespace-nowrap text-white transition-all duration-200 hover:text-white sm:text-lg"
					>View Schedule</a
				> -->
				<MobileNavDrawer {navSections}></MobileNavDrawer>
			</div>

			<div class="desktop-drawer-container font-display ml-6 flex items-center gap-2">
				{#each navSections as section}
					{#if section?.subsections}
						<!-- svelte-ignore a11y_no_static_element_interactions -->
						<div
							class="dropdown-button-container relative"
							style:--accent-color={section.accentColor}
						>
							<button
								class="flex cursor-pointer items-center gap-2 rounded-md px-3 py-2 {currentPath.startsWith(
									section.href.replace(/\/$/, '')
								)
									? 'nav-section-active'
									: ''}"
								onclick={stopPropagation(() => toggleDropdown(section.name))}
								aria-haspopup="true"
								aria-expanded={section.expanded}
							>
								<span class="font-base text-xl whitespace-nowrap text-[#4C4C4C]"
									>{section.name}</span
								>
								<span
									style="transform-origin: 75% 25%;"
									class:rotate-315={section.expanded}
									class:scale-120={section.expanded}
									class:expanded={section.expanded}
									class="chevron h-2 w-2 translate-y-[25%] rotate-135 rounded-none border-4 border-t-neutral-700 border-r-neutral-700 border-b-transparent border-l-transparent transition-transform"
								></span>
							</button>
							{#if section.expanded && section.layout === 'mega'}
								<!-- svelte-ignore a11y_click_events_have_key_events -->
								<div
									class="dropdown-mega bg-viz-white absolute top-full right-0 z-10 flex w-max flex-col gap-4 rounded-md p-6 shadow-lg"
									use:clickOutside={handleClickOutside}
									onclick={stopPropagation(bubble('click'))}
								>
									<div class="flex gap-8">
										{#each section.subsections.filter((s) => (s as any).group === 'featured') as featured}
											<a
												href={featured.href}
												target={(featured as any)?.target || '_self'}
												class="featured-cta flex w-48 shrink-0 flex-col justify-between rounded-lg p-4 text-white"
											>
												<span
													class="font-display flex items-center gap-2 text-2xl leading-tight font-bold"
													><span aria-hidden="true">{(featured as any).emoji}</span>
													<span>{featured.name}</span></span
												>
												<span class="mt-6 flex items-center justify-between text-sm font-medium">
													<span>{(featured as any).subtitle}</span>
													<span aria-hidden="true">&rarr;</span>
												</span>
											</a>
										{/each}

										<div class="grid flex-1 grid-cols-2 gap-x-6 gap-y-2 self-center">
											{#each section.subsections.filter((s) => (s as any).group === 'primary') as item}
												<a
													href={item.href}
													class="mega-item flex w-fit items-center gap-2.5 py-1 {currentPath.replace(
														/\/$/,
														''
													) === item.href.replace(/\/$/, '')
														? 'nav-active'
														: ''}"
												>
													<span class="text-xl leading-none" aria-hidden="true"
														>{(item as any).emoji}</span
													>
													<span class="text-xl font-medium whitespace-nowrap text-neutral-700"
														>{item.name}</span
													>
												</a>
											{/each}
										</div>
									</div>

									<hr class="border-viz-black/15 border-t" />

									<div class="flex flex-wrap items-center gap-x-2 gap-y-1">
										{#each section.subsections.filter((s) => (s as any).group === 'secondary') as item, i}
											{#if i > 0}
												<span class="text-neutral-300" aria-hidden="true">&middot;</span>
											{/if}
											<a
												href={item.href}
												class="text-sm text-neutral-500 transition-colors hover:text-neutral-800"
												>{item.name}</a
											>
										{/each}
									</div>
								</div>
							{:else if section.expanded}
								<!-- svelte-ignore a11y_click_events_have_key_events -->
								<div
									class="dropdown display-none bg-viz-white absolute top-full right-0 z-10 min-w-37.5 flex-col rounded-md px-3 py-3 shadow-lg transition-all duration-200 ease-in-out {section.expanded
										? 'flex'
										: 'hidden'}"
									use:clickOutside={handleClickOutside}
									onclick={stopPropagation(bubble('click'))}
								>
									{#each section.subsections as subsection}
										{#if (subsection as any).divider}
											<hr class="border-viz-black/30 my-2 border-t" />
										{:else}
											<a
												href={subsection.href}
												class="w-full cursor-pointer px-1 py-2 {currentPath.replace(/\/$/, '') ===
												subsection.href.replace(/\/$/, '')
													? 'nav-active'
													: ''}"
												target={(subsection as any)?.target || '_self'}
											>
												<span
													class="flex items-center gap-2 text-xl font-medium whitespace-nowrap text-neutral-700"
												>
													{subsection.name}
													{#if (subsection as any).isBadge}
														<span
															class="ml-1 rounded-full border border-blue-500 bg-linear-to-r from-blue-400 to-blue-600 px-2.5 py-0.5 text-xs font-semibold text-white shadow-sm transition-transform duration-200 hover:scale-105"
														>
															{(subsection as any).badgeText}
														</span>
													{/if}
												</span>
											</a>
										{/if}
									{/each}
								</div>
							{/if}
						</div>
					{:else}
						<a
							href={section.href}
							class="cursor-pointer rounded-md px-3 py-2"
							target={(section as any)?.target || '_self'}
						>
							<span class="font-base text-xl whitespace-nowrap text-neutral-700"
								>{section.name}</span
							>
						</a>
					{/if}
				{/each}

				<!-- <a
					href="https://hasgeek.com/VizChitra/2025/schedule"
					target="_blank"
					class="bg-viz-pink hover:bg-viz-pink/90 ml-3 inline-flex w-full items-center justify-center gap-3 rounded-lg border border-neutral-500 px-5 py-2 text-lg font-semibold text-nowrap whitespace-nowrap text-white transition-all duration-200 hover:text-white"
					>View Schedule</a
				> -->
			</div>
		</div>
	</div>
</nav>

<style>
	.dropdown a {
		border-bottom: 3px solid transparent;
	}

	.dropdown a:hover {
		border-bottom: 3px solid var(--accent-color);
	}

	.featured-cta {
		background-color: var(--color-viz-pink-solid);
		transition: filter 150ms ease;
	}

	.featured-cta:hover {
		filter: brightness(1.08);
	}

	.mega-item {
		border-bottom: 3px solid transparent;
	}

	.mega-item:hover {
		border-bottom: 3px solid var(--accent-color);
	}

	:global(.nav-active) {
		border-bottom: 3px solid var(--accent-color) !important;
		font-weight: 700 !important;
	}

	:global(.nav-section-active) span:first-child {
		border-bottom: 2px solid var(--accent-color);
		padding-bottom: 2px;
	}

	.chevron.expanded {
		border-top-color: var(--accent-color);
		border-right-color: var(--accent-color);
	}

	.mobile-drawer-container {
		display: none;
	}

	.desktop-drawer-container {
		display: flex;
	}

	@media (max-width: 750px) {
		.mobile-drawer-container {
			display: flex;
		}

		.desktop-drawer-container {
			display: none;
		}
	}
</style>
