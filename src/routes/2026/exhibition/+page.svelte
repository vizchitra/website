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
				We have more climate data than ever before. Enough to track glaciers retreating and monsoons
				shifting, to tell fishermen what they already know about their changing coastline. And yet
				the reality of it often stays at a distance. Feeling it, though, takes something else.
			</p>
			<p>
				<em>Data, Otherwise</em> is a tangible data visualisation exhibition on climate and ecological
				change. It brings data out of the chart and into the room, through experiences you can walk through,
				listen to, sit with, hold. The works draw from more-than-human worlds and from climate as lived
				experience, from the ways people and places have found to keep going. Treating data as something
				felt as much as read. Because if data can be felt, it has a better chance of being understood.
			</p>

			<p>
				In this exhbition, eight works explore how people, communities, and environments cope,
				adjust, and rebuild, and what stays out of view when resilience gets counted. These are not
				definitive answers. They are eight ways of looking.
			</p>

			<p>
				The exhibition opens on <strong>Friday, 3rd July 2025, 3pm to 8pm</strong>, at Bangalore
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
		{@const isDual = (exhibit.speakers?.length ?? 0) > 1}

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
								About the artist{isDual ? 's' : ''}
							</Heading>
							<div class="artist-blocks" class:artist-blocks--dual={isDual}>
								<!-- Artist 1 -->
								<div class="artist-block">
									<p class="artist-name">{exhibit.speakers?.[0]?.name ?? ''}</p>
									{#if exhibit.speakers?.[0]?.designation || exhibit.speakers?.[0]?.organisation}
										<p class="artist-designation">
											{[exhibit.speakers?.[0]?.designation, exhibit.speakers?.[0]?.organisation]
												.filter(Boolean)
												.join(' · ')}
										</p>
									{/if}
									<!-- Social icons -->
									{#if Object.values(exhibit.speakers?.[0]?.social ?? {}).some((u) => u)}
										<div class="artist-socials">
											{#each Object.entries(exhibit.speakers?.[0]?.social ?? {}).filter(([, u]) => u) as [platform, url]}
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
									{#if exhibit.speakerAboutHtml}
										<div class="artist-bio" class:expanded={expandedBios.has(`${exhibit.slug}-1`)}>
											<div class="artist-photo-wrap">
												{#if exhibit.speakers?.[0]?.image}
													<img
														class="artist-photo"
														src={exhibit.speakers[0].image}
														alt={exhibit.speakers[0].name}
													/>
												{:else}
													<div class="artist-photo-placeholder" aria-hidden="true">
														{(exhibit.speakers?.[0]?.name ?? '')
															.split(' ')
															.map((n) => n[0] ?? '')
															.join('')
															.slice(0, 2)
															.toUpperCase()}
													</div>
												{/if}
											</div>
											<Prose>
												{@html exhibit.speakerAboutHtml}
											</Prose>
										</div>
										<button class="read-more-btn" onclick={() => toggleBio(`${exhibit.slug}-1`)}>
											{expandedBios.has(`${exhibit.slug}-1`) ? 'Read less ↑' : 'Read more ↓'}
										</button>
									{/if}
								</div>

								<!-- Artist 2 (dual only) -->
								{#if isDual}
									{@const sp1 = exhibit.speakers?.[1]}
									<div class="artist-block">
										<p class="artist-name">{sp1?.name ?? ''}</p>
										{#if sp1?.designation || sp1?.organisation}
											<p class="artist-designation">
												{[sp1?.designation, sp1?.organisation].filter(Boolean).join(' · ')}
											</p>
										{/if}
										<!-- Social icons -->
										{#if Object.values(sp1?.social ?? {}).some((u) => u)}
											<div class="artist-socials">
												{#each Object.entries(sp1?.social ?? {}).filter(([, u]) => u) as [platform, url]}
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
										{#if exhibit.speaker2AboutHtml}
											<div
												class="artist-bio"
												class:expanded={expandedBios.has(`${exhibit.slug}-2`)}
											>
												<div class="artist-photo-wrap">
													{#if sp1?.image}
														<img class="artist-photo" src={sp1.image} alt={sp1?.name ?? ''} />
													{:else}
														<div class="artist-photo-placeholder" aria-hidden="true">
															{(sp1?.name ?? '')
																.split(' ')
																.map((n) => n[0] ?? '')
																.join('')
																.slice(0, 2)
																.toUpperCase()}
														</div>
													{/if}
												</div>
												<Prose>
													{@html exhibit.speaker2AboutHtml}
												</Prose>
											</div>
											<button class="read-more-btn" onclick={() => toggleBio(`${exhibit.slug}-2`)}>
												{expandedBios.has(`${exhibit.slug}-2`) ? 'Read less ↑' : 'Read more ↓'}
											</button>
										{/if}
									</div>
								{/if}
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

	.artist-blocks--dual {
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
