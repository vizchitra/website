<script lang="ts">
	import { Header, Container, Prose, Heading, DividerCurves } from '$lib/components';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	function catalogId(n: number): string {
		return `DO/2026/${String(n).padStart(2, '0')}`;
	}

	const PLACEHOLDER = '/images/speakers/2026/speaker-placeholder.avif';

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
			<p>Eight works at the intersection of climate, ecology, and data</p>
			<p>
				<em>Data, Otherwise</em> is an exhibition of eight works that move data off the screen and into
				the room. Each piece draws on non-human worlds: rivers, soil, birds, insects, heat, rain, where
				sensing and meaning extend beyond people and instruments.
			</p>
			<p>
				The works share a common intuition: that climate is not only a measurement problem but a
				lived one. Heat as exhaustion. Rain as anxiety. Smoke as grief. These artists ask what data
				can hold when the body becomes part of what needs to be communicated.
			</p>
			<p>
				Together, the eight works explore how people, communities, and environments cope, adjust,
				and rebuild, and what stays out of view when resilience gets counted. These are not
				definitive answers. They are eight ways of looking.
			</p>
		</Prose>

		<!-- Tickets -->
		<div class="mt-8 flex flex-wrap gap-3">
			<a
				href="https://tickets.vizchitra.com/?ticket=exhibition"
				target="_blank"
				rel="noopener noreferrer"
				class="font-display bg-viz-orange-dark hover:bg-viz-orange inline-flex items-center gap-2 rounded-full px-5 py-2 text-sm font-bold text-white uppercase transition-colors"
			>
				Exhibition Ticket · 03 July
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
		{@const isDual = !!exhibit.speaker2Name}

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

						{#if exhibit.artworkDetail1Image || exhibit.artworkDetail2Image}
							<div class="artwork-details">
								{#if exhibit.artworkDetail1Image}
									<img
										src={exhibit.artworkDetail1Image}
										alt="{exhibit.title} — detail 1"
										class="artwork-img artwork-img--detail"
									/>
								{:else}
									<div class="artwork-placeholder artwork-placeholder--detail"></div>
								{/if}
								{#if exhibit.artworkDetail2Image}
									<img
										src={exhibit.artworkDetail2Image}
										alt="{exhibit.title} — detail 2"
										class="artwork-img artwork-img--detail"
									/>
								{:else}
									<div class="artwork-placeholder artwork-placeholder--detail"></div>
								{/if}
							</div>
						{/if}

						<!-- About the artist(s) — below artwork on desktop -->
						<section class="artist-section">
							<Heading tag="h2" align="left" class="pb-4">
								About the artist{isDual ? 's' : ''}
							</Heading>
							<div class="artist-blocks" class:artist-blocks--dual={isDual}>
								<!-- Artist 1 -->
								<div class="artist-block">
									<p class="artist-name">
										{exhibit.speakerName?.split('//')[0]?.trim() ?? exhibit.speakerName}
									</p>
									{#if exhibit.designation || exhibit.organisation}
										<p class="artist-designation">
											{[exhibit.designation, exhibit.organisation].filter(Boolean).join(' · ')}
										</p>
									{/if}
									{#if exhibit.speakerAboutHtml}
										<div class="artist-bio" class:expanded={expandedBios.has(`${exhibit.slug}-1`)}>
											<div class="artist-photo-wrap">
												<img
													class="artist-photo"
													src={exhibit.speakerImage || PLACEHOLDER}
													alt={exhibit.speakerName?.split('//')[0]?.trim() ?? ''}
												/>
											</div>
											<Prose>
												{@html exhibit.speakerAboutHtml}
											</Prose>
										</div>
										<button class="read-more-btn" onclick={() => toggleBio(`${exhibit.slug}-1`)}>
											{expandedBios.has(`${exhibit.slug}-1`) ? 'Read less ↑' : 'Read more ↓'}
										</button>
									{/if}
									{#if exhibit.speakerSocial}
										<a
											href={exhibit.speakerSocial}
											class="artist-social"
											target="_blank"
											rel="noopener noreferrer"
										>
											<svg
												width="14"
												height="14"
												viewBox="0 0 24 24"
												fill="none"
												stroke="currentColor"
												stroke-width="2"
												stroke-linecap="round"
												stroke-linejoin="round"
												aria-hidden="true"
											>
												<path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
												<polyline points="15 3 21 3 21 9" />
												<line x1="10" y1="14" x2="21" y2="3" />
											</svg>
											<span>Website</span>
										</a>
									{/if}
								</div>

								<!-- Artist 2 (dual only) -->
								{#if isDual}
									<div class="artist-block">
										<p class="artist-name">{exhibit.speaker2Name}</p>
										{#if exhibit.speaker2Designation || exhibit.speaker2Organisation}
											<p class="artist-designation">
												{[exhibit.speaker2Designation, exhibit.speaker2Organisation]
													.filter(Boolean)
													.join(' · ')}
											</p>
										{/if}
										{#if exhibit.speaker2AboutHtml}
											<div
												class="artist-bio"
												class:expanded={expandedBios.has(`${exhibit.slug}-2`)}
											>
												<div class="artist-photo-wrap">
													<img
														class="artist-photo"
														src={exhibit.speaker2Image || PLACEHOLDER}
														alt={exhibit.speaker2Name ?? ''}
													/>
												</div>
												<Prose>
													{@html exhibit.speaker2AboutHtml}
												</Prose>
											</div>
											<button class="read-more-btn" onclick={() => toggleBio(`${exhibit.slug}-2`)}>
												{expandedBios.has(`${exhibit.slug}-2`) ? 'Read less ↑' : 'Read more ↓'}
											</button>
										{/if}
										{#if exhibit.speaker2Social}
											<a
												href={exhibit.speaker2Social}
												class="artist-social"
												target="_blank"
												rel="noopener noreferrer"
											>
												<svg
													width="14"
													height="14"
													viewBox="0 0 24 24"
													fill="none"
													stroke="currentColor"
													stroke-width="2"
													stroke-linecap="round"
													stroke-linejoin="round"
													aria-hidden="true"
												>
													<path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
													<polyline points="15 3 21 3 21 9" />
													<line x1="10" y1="14" x2="21" y2="3" />
												</svg>
												<span>Website</span>
											</a>
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

	.artist-social {
		display: inline-flex;
		align-items: center;
		gap: 0.375rem;
		margin-top: 0.5rem;
		font-family: var(--font-mono);
		font-size: 0.7rem;
		letter-spacing: 0.06em;
		text-transform: uppercase;
		color: var(--color-viz-orange-solid);
		text-decoration: none;
		transition: color 0.15s;
	}

	.artist-social:hover {
		color: var(--color-viz-orange);
	}

	/* ── Artwork column ── */
	.exhibit-artwork {
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
	}

	.artwork-hero {
		width: 100%;
		aspect-ratio: 4 / 3;
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

	.artwork-img--detail {
		aspect-ratio: 1;
	}

	.artwork-details {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 0.75rem;
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
		aspect-ratio: 4 / 3;
	}

	.artwork-placeholder--detail {
		aspect-ratio: 1;
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
