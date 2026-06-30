<script lang="ts">
	import { Header, Container, Prose, Heading, DividerCurves } from '$lib/components';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	function catalogId(n: number): string {
		return `DO/2026/${String(n).padStart(2, '0')}`;
	}

	let expandedBios = $state(new Set<string>());

	function toggleBio(key: string) {
		const next = new Set(expandedBios);
		if (next.has(key)) next.delete(key);
		else next.add(key);
		expandedBios = next;
	}
</script>

<Header title="Exhibition" banner="curve" color="orange" />

<!-- Curatorial section -->
<Container paddingY="2xl">
	<article class="max-w-3xl">
		<p class="catalog-label mb-3">Exhibition</p>
		<Prose color="orange">
			<h1>Data, Otherwise</h1>
			<p>An exhibition on climate, through data you can experience</p>
			<p>
				We have more climate data than ever before. Enough to track glaciers retreating, oceans
				warming and monsoons shifting. Our narratives often arrive at realizations that are already
				felt viscerally by the communities most exposed. Facts and numbers of this reality rarely
				move us. But can art step in where charts fail to communicate?
			</p>
			<p>
				Data, Otherwise is an exhibition on climate and ecological change that brings data out of
				graphs and into the room, through experiences you walk through, listen to, sit with, hold
				and smell. In this exhibition, eight works explore how people, communities, and environments
				cope with, adjust to, and rebuild in the midst of an exasperating crisis. There are no
				definitive answers, rather, they offer us ways to cope with truth without burying it in
				numbers.
			</p>

			<p>
				The exhibition opens on <strong>Friday, 3rd July 2026, 3pm to 8pm</strong>, at Bangalore
				International Centre, Bengaluru.
			</p>

			<h2 style="margin-top: 30px !important;">You are warmly invited.</h2>
		</Prose>

		<!-- Tickets -->
		<div class="mt-12 flex flex-col items-start gap-3">
			<a
				href="https://tickets.vizchitra.com/?ticket=exhibition"
				target="_blank"
				rel="noopener noreferrer"
				class="font-display bg-viz-orange-dark hover:bg-viz-orange inline-flex items-center gap-2 rounded-full px-5 py-2 text-sm font-bold text-white uppercase transition-colors"
			>
				Exhibition Only Ticket · 03 July
				<svg
					class="h-4 w-4"
					fill="none"
					stroke="currentColor"
					viewBox="0 0 24 24"
					aria-hidden="true"
				>
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M14 5l7 7m0 0l-7 7m7-7H3"
					/>
				</svg>
			</a>
			<a
				href="https://tickets.vizchitra.com/?ticket=conference_practitioner"
				target="_blank"
				rel="noopener noreferrer"
				class="font-display bg-viz-orange-dark hover:bg-viz-orange inline-flex items-center gap-2 rounded-full px-5 py-2 text-sm font-bold text-white uppercase transition-colors"
			>
				Conference Ticket · 04 July
				<svg
					class="h-4 w-4"
					fill="none"
					stroke="currentColor"
					viewBox="0 0 24 24"
					aria-hidden="true"
				>
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M14 5l7 7m0 0l-7 7m7-7H3"
					/>
				</svg>
			</a>
		</div>
	</article>
</Container>

<!-- Exhibit rows -->
<div class="w-full">
	{#each data.exhibitions as exhibit, i}
		{@const isEven = i % 2 === 0}

		<section class="exhibit-section" id={exhibit.slug}>
			<Container paddingY="2xl">
				<div class="exhibit-row" class:exhibit-row--reversed={!isEven}>
					<!-- Text column -->
					<div class="exhibit-text">
						<p class="catalog-label mb-4">{catalogId(exhibit.exhibitNumber!)}</p>

						<h2 class="exhibit-title mb-2">{exhibit.title}</h2>
						{#if exhibit.subtitle}
							<p class="exhibit-subtitle mb-6">{exhibit.subtitle}</p>
						{/if}

						{#if exhibit.longDescriptionHtml}
							<Prose color="orange">
								{@html exhibit.longDescriptionHtml}
							</Prose>
						{:else}
							<p class="text-viz-grey/50 text-sm italic">Concept note coming soon.</p>
						{/if}
					</div>

					<!-- Artwork column -->
					<div class="exhibit-artwork">
						<div class="artwork-hero">
							{#if exhibit.artworkHeroImage}
								<img
									src={exhibit.artworkHeroImage}
									alt="{exhibit.title} — artwork"
									class="artwork-img"
								/>
							{:else}
								<div class="artwork-placeholder artwork-placeholder--hero">
									<span class="artwork-placeholder-label">Artwork image coming soon</span>
								</div>
							{/if}
						</div>

						<!-- About the artist(s) — below artwork on desktop -->
						<section class="artist-section">
							<Heading tag="h2" align="left" class="pb-4">
								About the artist{(exhibit.speakers?.length ?? 0) > 1 ? 's' : ''}
							</Heading>
							<div
								class="artist-blocks"
								class:artist-blocks--multi={(exhibit.speakers?.length ?? 0) > 1}
							>
								{#each exhibit.speakers ?? [] as sp, si}
									{@const bioKey = `${exhibit.slug}-${si + 1}`}
									{@const bioHtml = exhibit.speakersAboutHtml?.[si] ?? ''}
									<div class="artist-block">
										<p class="artist-name">{sp.name ?? ''}</p>
										{#if sp.designation || sp.organisation}
											<p class="artist-designation">
												{[sp.designation, sp.organisation].filter(Boolean).join(' · ')}
											</p>
										{/if}
										<!-- Social icons -->
										{#if Object.values(sp.social ?? {}).some((u) => u)}
											<div class="artist-socials">
												{#each Object.entries(sp.social ?? {}).filter(([, u]) => u) as [platform, url]}
													{@const icon = `/images/socials/${['twitter', 'instagram', 'linkedin', 'bluesky', 'github', 'youtube'].includes(platform) ? platform : 'website'}.svg`}
													<a
														href={url}
														target="_blank"
														rel="noopener noreferrer"
														aria-label="{platform} profile"
														class="social-icon social-icon--orange"
													>
														<img src={icon} alt={platform} width="18" height="18" />
													</a>
												{/each}
											</div>
										{/if}
										{#if bioHtml}
											<div class="artist-bio" class:expanded={expandedBios.has(bioKey)}>
												<div class="artist-photo-wrap">
													{#if sp.image}
														<img class="artist-photo" src={sp.image} alt={sp.name ?? ''} />
													{:else}
														<div class="artist-photo-placeholder" aria-hidden="true">
															{(sp.name ?? '')
																.split(' ')
																.map((n) => n[0] ?? '')
																.join('')
																.slice(0, 2)
																.toUpperCase()}
														</div>
													{/if}
												</div>
												<Prose>
													{@html bioHtml}
												</Prose>
											</div>
											<button class="read-more-btn" onclick={() => toggleBio(bioKey)}>
												{expandedBios.has(bioKey) ? 'Read less ↑' : 'Read more ↓'}
											</button>
										{/if}
									</div>
								{/each}
							</div>
						</section>
					</div>
				</div>
			</Container>
		</section>

		{#if i < data.exhibitions.length - 1}
			<DividerCurves tone="orange" />
		{/if}
	{/each}
</div>

<style>
	.catalog-label {
		font-family: var(--font-mono);
		font-size: var(--text-flow--1);
		letter-spacing: 0.1em;
		text-transform: uppercase;
		color: var(--color-viz-orange-solid);
	}

	/* ── Exhibit row layout ── */
	.exhibit-row {
		display: grid;
		grid-template-columns: 1fr;
		gap: 3rem;
	}

	@media (min-width: 768px) {
		.exhibit-row {
			grid-template-columns: 1fr 1fr;
			gap: 4rem;
			align-items: start;
		}

		.exhibit-row--reversed .exhibit-text {
			order: 2;
		}

		.exhibit-row--reversed .exhibit-artwork {
			order: 1;
		}
	}

	.exhibit-title {
		font-family: var(--font-display);
		font-size: clamp(1.75rem, 3.5vw, 2.75rem);
		font-weight: 300;
		line-height: 1.15;
		letter-spacing: -0.015em;
		color: var(--color-viz-black);
	}

	.exhibit-subtitle {
		font-family: var(--font-plex);
		font-size: var(--text-flow-1);
		line-height: 1.45;
		color: var(--color-viz-grey-dark);
	}

	/* ── Artist section ── */
	.artist-section {
		border-top: 1px solid var(--color-viz-grey-light);
		padding-top: 1.5rem;
		margin-top: 0.5rem;
	}

	.artist-blocks {
		display: flex;
		flex-direction: column;
		gap: 2rem;
	}

	.artist-blocks--multi {
		gap: 2.5rem;
	}

	.artist-block {
		display: block;
	}

	.artist-name {
		font-family: var(--font-display);
		font-size: var(--text-flow-0);
		font-weight: 600;
		color: var(--color-viz-orange-dark);
		line-height: 1.3;
		margin-bottom: 0.25rem;
	}

	.artist-designation {
		font-size: var(--text-flow-0);
		color: var(--color-viz-black);
		opacity: 0.7;
		margin-bottom: 0.75rem;
	}

	.artist-bio {
		/* Override text-flow-0 to one step smaller inside bio */
		--text-flow-0: var(--text-flow--1);
		overflow: hidden;
		max-height: 132px; /* just over the 124px photo so photo is always visible */
	}

	.artist-bio.expanded {
		max-height: none;
	}

	.artist-photo-wrap {
		float: right;
		margin-left: 1.25rem;
		margin-bottom: 0.75rem;
		width: 124px;
		height: 124px;
		border-radius: 50%;
		overflow: hidden;
		border: 2px solid var(--color-viz-orange-light);
	}

	.read-more-btn {
		display: inline-block;
		margin-top: 0.375rem;
		font-family: var(--font-mono);
		font-size: 0.7rem;
		letter-spacing: 0.06em;
		text-transform: uppercase;
		color: var(--color-viz-orange-solid);
		background: none;
		border: none;
		padding: 0;
		cursor: pointer;
	}

	.read-more-btn:hover {
		color: var(--color-viz-orange);
	}

	.artist-photo {
		width: 100%;
		height: 100%;
		object-fit: cover;
		object-position: top center;
	}

	.artist-photo-placeholder {
		width: 100%;
		height: 100%;
		display: flex;
		align-items: center;
		justify-content: center;
		background: var(--color-viz-orange-light);
		color: var(--color-viz-orange-dark);
		font-family: var(--font-display);
		font-size: 2.5rem;
		font-weight: 800;
		letter-spacing: -0.02em;
	}

	.artist-socials {
		display: flex;
		flex-wrap: wrap;
		gap: 0.625rem;
		margin-bottom: 0.75rem;
	}

	.social-icon {
		display: inline-flex;
		opacity: 0.55;
		transition:
			opacity 0.15s,
			filter 0.15s;
	}

	.social-icon:hover {
		opacity: 1;
	}

	.social-icon--orange:hover {
		filter: invert(55%) sepia(75%) saturate(570%) hue-rotate(346deg);
	}

	/* ── Artwork column ── */
	.exhibit-artwork {
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
	}

	.artwork-hero {
		width: 100%;
		aspect-ratio: 1 / 1;
		overflow: hidden;
		border-radius: 0.5rem;
	}

	.artwork-img {
		width: 100%;
		height: 100%;
		object-fit: cover;
		border-radius: 0.5rem;
		display: block;
	}

	.artwork-placeholder {
		width: 100%;
		background: var(--color-viz-orange-subtle);
		border-radius: 0.5rem;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.artwork-placeholder--hero {
		aspect-ratio: 1 / 1;
	}

	.artwork-placeholder-label {
		font-family: var(--font-mono);
		font-size: 0.6875rem;
		letter-spacing: 0.08em;
		text-transform: uppercase;
		color: var(--color-viz-orange-muted);
		text-align: center;
		padding: 1rem;
	}
</style>
