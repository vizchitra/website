<script>
	import teamData from '$lib/data/vizchitra_team.json' with { type: 'json' };
	import MemberPentagon from './MemberPentagon.svelte';
	import { seededShuffle } from '$lib/utils/shuffle';
	import { onMount } from 'svelte';

	let { seed = 0 } = $props();

	// Initial render uses the (build-time) seed so it matches the prerendered HTML;
	// after mount we re-seed with a fresh random value so the order is randomised
	// on every page load in the browser (the site is prerendered, so a build-time
	// seed alone would freeze the order until the next deploy).
	let liveSeed = $state(seed);
	onMount(() => {
		liveSeed = Math.floor(Math.random() * 2 ** 31);
	});

	// active team (alumni are listed separately on the page), in randomised order
	const members = $derived(
		seededShuffle(
			teamData.filter((m) => !m.alumni),
			liveSeed
		)
	);

	const socials = [
		{
			name: 'instagram',
			icon: '/images/socials/instagram.svg',
			alt: 'instagram link'
		},
		{
			name: 'twitter',
			icon: '/images/socials/twitter.svg',
			alt: 'twitter link'
		},
		{
			name: 'bluesky',
			icon: '/images/socials/bluesky.svg',
			alt: 'bluesky link'
		},
		{
			name: 'linkedin',
			icon: '/images/socials/linkedin.svg',
			alt: 'linkedin link'
		}
	];
</script>

{#if teamData}
	<div class="team-section not-prose flex flex-wrap justify-center gap-5 md:min-w-[420px]">
		<!-- {#key} fully rebuilds the list when the seed changes on mount, so the
		     reshuffle can't leave hydrated <img>/<a> attributes out of sync -->
		{#key liveSeed}
			{#each members as teamMember (teamMember.name)}
				<div class="team-member mb-4 flex flex-col items-center gap-2">
					<MemberPentagon memberData={teamMember} />

					<div class="socials-row mt-auto flex flex-row gap-3">
						{#each socials as social}
							{#if teamMember[social.name]}
								<a href={teamMember[social.name]} target="_blank">
									<img
										src={social.icon}
										alt={social.alt}
										class="h-5 w-5 opacity-70 transition-all duration-50 hover:[filter:invert(33%)_sepia(96%)_saturate(1231%)_hue-rotate(308deg)_brightness(99%)_contrast(99%)] md:h-6 md:w-6"
									/>
								</a>
							{/if}
						{/each}
					</div>
				</div>
			{/each}
		{/key}
	</div>
{/if}
