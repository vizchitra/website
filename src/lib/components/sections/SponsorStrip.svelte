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
				name: 'Visualization for Transparency Foundation',
				logo: '/images/logos/vit-logo.png',
				url: 'https://www.fundaciovit.org',
				tier: 'Silver Sponsor',
				height: 62
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
				name: 'Thurro',
				logo: '/images/logos/thurro-logo.png',
				url: 'https://thurro.com',
				tier: 'Bronze Sponsor',
				height: 40
			},
			{
				name: 'CityFinance',
				logo: '/images/logos/cityfinance-logo.png',
				url: 'https://www.cityfinance.in',
				tier: 'Bronze Sponsor',
				height: 30
			},
			{
				name: 'The Pudding',
				logo: '/images/logos/pudding-logo.svg',
				url: 'https://pudding.cool',
				tier: 'Community Sponsor',
				height: 40
			},
			{
				name: 'TREND @ Youth Ki Awaaz',
				logo: '/images/logos/trend-yka-logo.png',
				url: 'https://trend.youthkiawaaz.com/',
				tier: 'Community Sponsor',
				height: 50
			}
		]
	}: { heading?: string; sponsors?: Sponsor[] } = $props();

	// Display order for tier groups; tiers not listed fall to the end.
	const TIER_ORDER = [
		'Platinum Sponsor',
		'Gold Sponsor',
		'Silver Sponsor',
		'Bronze Sponsor',
		'Community Sponsor'
	];
	const tierRank = (tier: string) => {
		const i = TIER_ORDER.indexOf(tier);
		return i === -1 ? TIER_ORDER.length : i;
	};

	// Group sponsors by tier so each tier label shows once, not under every logo.
	const tierGroups = $derived.by(() => {
		const groups = new Map<string, Sponsor[]>();
		for (const s of sponsors) {
			const tier = s.tier ?? '';
			if (!groups.has(tier)) groups.set(tier, []);
			groups.get(tier)!.push(s);
		}
		return [...groups.entries()]
			.map(([tier, items]) => ({
				tier,
				// Pluralise the heading when a tier has more than one sponsor.
				label: tier && items.length > 1 ? `${tier}s` : tier,
				items
			}))
			.sort((a, b) => tierRank(a.tier) - tierRank(b.tier));
	});
</script>

<Container paddingY="sm">
	<div class="strip">
		<Heading tag="h2" align="center">
			<Slanted color="pink" textContent={heading} />
		</Heading>

		{#each tierGroups as group (group.tier)}
			<div class="tier-group">
				{#if group.label}
					<span class="strip-tier">{group.label}</span>
				{/if}
				<ul class="strip-logos">
					{#each group.items as s (s.name)}
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
						</li>
					{/each}
				</ul>
			</div>
		{/each}
	</div>
</Container>

<style>
	.strip {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 2.5rem;
		padding: 0;
	}

	.tier-group {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 1.1rem;
	}

	.strip-logos {
		/* Global multiplier on every logo's height — tweak to scale all logos at once */
		--logo-scale: 1.05;
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
		height: calc(var(--logo-h, 40px) * var(--logo-scale, 1));
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
			height: calc(var(--logo-h, 40px) * 0.78 * var(--logo-scale, 1));
			/* keep very wide logos from overflowing narrow screens */
			max-width: var(--logo-mw, 240px);
		}
	}
</style>
