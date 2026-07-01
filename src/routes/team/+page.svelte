<script lang="ts">
	import type { PageData } from './$types';
	import { Prose } from '$lib/components/typography';
	import { TeamSection } from '$lib/components/sections';
	import { Header } from '$lib/components/structure';
	import { Container, Stack, FullBleed } from '$lib/components/layout';
	import teamData from '$lib/data/vizchitra_team.json';
	import { seededShuffle } from '$lib/utils/shuffle';
	import { onMount } from 'svelte';

	let { data }: { data: PageData } = $props();
	const banner = $derived(data.document.banner);
	const color = $derived(data.document.color);

	// Re-seed on mount so the order is randomised on every page load (the site is
	// prerendered, so the build-time seed alone would freeze it until next deploy).
	let liveSeed = $state(data.seed);
	onMount(() => {
		liveSeed = Math.floor(Math.random() * 2 ** 31);
	});

	// Alumni: shown at the bottom as a bullet-separated list instead of polygons,
	// in randomised order (offset seed so it doesn't mirror the polygon order).
	// Link preference: LinkedIn -> Instagram -> Twitter (else name is unlinked).
	const alumni = $derived(
		seededShuffle(
			(teamData as Array<Record<string, any>>).filter((m) => m.alumni),
			liveSeed + 0x1337
		)
	);
	const alumniLink = (m: Record<string, any>): string | null =>
		m.linkedin || m.instagram || m.twitter || null;
</script>

<Header {banner} {color} />

<Container>
	<Stack>
		<Prose color="orange">
			<h1>Our Team</h1>
			<p>
				Meet the individuals working tirelessly behind the scenes to make India's data visualization
				community a reality.
			</p>
		</Prose>
		<FullBleed>
			<TeamSection seed={data.seed} />
		</FullBleed>

		{#if alumni.length}
			<section class="alumni not-prose">
				<h2 class="alumni-heading font-display">Alumni</h2>
				<p class="alumni-list font-display">
					{#key liveSeed}{#each alumni as m, i (m.name)}<span class="entry"
								>{#if alumniLink(m)}<a
										href={alumniLink(m)}
										target="_blank"
										rel="noopener noreferrer">{m.name}</a
									>{:else}<span class="name">{m.name}</span>{/if}{#if i < alumni.length - 1}<span
										class="sep">&bull;</span
									>{/if}</span
							>{' '}{/each}{/key}
				</p>
			</section>
		{/if}
	</Stack>
</Container>

<style>
	.alumni-heading {
		font-size: 1.75rem;
		font-weight: 800;
		text-transform: uppercase;
		text-align: center;
		color: #4c4c4c;
		border-bottom: 3px solid #4c4c4c;
		padding-bottom: 0.4rem;
		margin-bottom: 1rem;
	}
	.alumni-list {
		font-size: 1.05rem;
		line-height: 2;
		text-align: center;
		color: #4c4c4c;
	}
	.alumni-list .entry {
		/* keep a name and its trailing bullet together so names never split across lines */
		white-space: nowrap;
	}
	.alumni-list a,
	.alumni-list span:not(.sep) {
		color: #4c4c4c;
		font-weight: 600;
	}
	.alumni-list a {
		text-decoration: none;
		transition: color 0.15s ease;
	}
	.alumni-list a:hover {
		color: #e08db2;
		text-decoration: underline;
	}
	.alumni-list .sep {
		margin: 0 0.55rem;
		color: #ffab40;
		font-weight: 700;
	}
</style>
