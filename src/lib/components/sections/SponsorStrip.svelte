<script lang="ts">
	import { Container, Heading, Slanted } from '$lib/components';

	interface Sponsor {
		name: string;
		logo: string;
		url?: string;
		tier?: string;
		/** Fixed display height in px (width flows from the logo's aspect ratio) */
		height?: number;
		/** Optional safety cap on width in px (omit to let width be fully dynamic) */
		maxWidth?: number;
	}

	let {
		heading = 'OUR SPONSORS',
		sponsors = [
			{
				name: 'Open Visualization Academy',
				logo: '/images/logos/ova-um-logo.svg',
				url: 'https://openvisualizationacademy.org/',
				tier: 'Silver Sponsor',
				height: 44
			},
			{
				name: 'Revisual Labs',
				logo: '/images/logos/revisual-labs-logo.png',
				url: 'https://revisual.co',
				tier: 'Silver Sponsor',
				height: 46
			},
			{
				name: 'TypeTogether',
				logo: '/images/logos/typetogether-logo.png',
				url: 'https://www.type-together.com',
				tier: 'Bronze Sponsor',
				height: 30
			},
			{
				name: 'People + AI',
				logo: '/images/logos/people-ai-logo.png',
				url: 'https://peopleplus.ai',
				tier: 'Bronze Sponsor',
				height: 52
			},
			{
				name: 'The Pudding',
				logo: '/images/logos/pudding-logo.svg',
				url: 'https://pudding.cool',
				tier: 'Community Sponsor',
				height: 40
			}
		]
	}: { heading?: string; sponsors?: Sponsor[] } = $props();
</script>

<Container paddingY="sm">
	<div class="strip">
		<Heading tag="h2" align="center">
			<Slanted color="pink" textContent={heading} />
		</Heading>

		<ul class="strip-logos">
			{#each sponsors as s (s.name)}
				{@const style = `--logo-h: ${s.height ?? 40}px${s.maxWidth ? `; --logo-mw: ${s.maxWidth}px` : ''}`}
				<li class="strip-item">
					{#if s.url}
						<a
							class="strip-logo-link"
							href={s.url}
							target="_blank"
							rel="noopener noreferrer"
							aria-label={s.name}
							{style}
						>
							<img src={s.logo} alt="{s.name} logo" loading="lazy" />
						</a>
					{:else}
						<span class="strip-logo-link" aria-label={s.name} {style}>
							<img src={s.logo} alt="{s.name} logo" loading="lazy" />
						</span>
					{/if}
					{#if s.tier}
						<span class="strip-tier">{s.tier}</span>
					{/if}
				</li>
			{/each}
		</ul>
	</div>
</Container>

<style>
	.strip {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 1.75rem;
		padding: 0;
	}

	.strip-logos {
		list-style: none;
		margin: 0;
		padding: 0;
		display: flex;
		flex-wrap: wrap;
		align-items: flex-start;
		justify-content: center;
		gap: 2.5rem 4rem;
	}

	.strip-item {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.9rem;
	}

	.strip-logo-link {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		height: 48px;
		transition: transform 0.25s ease;
	}

	a.strip-logo-link:hover {
		transform: scale(1.08);
	}

	/* Height is fixed; width flows from the logo's aspect ratio (max-width only if a cap is set) */
	.strip-logo-link img {
		height: var(--logo-h, 40px);
		max-width: var(--logo-mw, none);
		width: auto;
		object-fit: contain;
		display: block;
	}

	.strip-tier {
		font-family: var(--font-display);
		font-weight: 700;
		font-size: 0.8rem;
		letter-spacing: 0.08em;
		text-transform: uppercase;
		color: var(--color-viz-pink-dark);
	}

	@media (max-width: 40rem) {
		.strip-logos {
			gap: 2rem 2.75rem;
		}

		.strip-logo-link {
			height: 38px;
		}

		.strip-logo-link img {
			height: calc(var(--logo-h, 40px) * 0.78);
			/* keep very wide logos from overflowing narrow screens */
			max-width: var(--logo-mw, 240px);
		}
	}
</style>
