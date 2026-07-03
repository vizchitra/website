<script lang="ts">
	const socials = [
		{
			icon: '/images/socials/whatsapp.svg',
			alt: 'VizChitra WhatsApp link',
			link: 'https://vizchitra.com/friends/'
		},
		{
			icon: '/images/socials/instagram.svg',
			alt: 'VizChitra instagram link',
			link: 'https://www.instagram.com/vizchitra/'
		},
		{
			icon: '/images/socials/twitter.svg',
			alt: 'VizChitra twitter link',
			link: 'https://www.x.com/vizchitra/'
		},
		{
			icon: '/images/socials/linkedin.svg',
			alt: 'VizChitra linkedin link',
			link: 'https://www.linkedin.com/company/vizchitra/'
		},
		{
			icon: '/images/socials/bluesky.svg',
			alt: 'VizChitra bluesky link',
			link: 'https://bsky.app/profile/vizchitra.bsky.social'
		},
		{
			icon: '/images/socials/youtube.svg',
			alt: 'VizChitra youtube link',
			link: 'https://www.youtube.com/@vizchitra'
		},
		{
			icon: '/images/socials/github.svg',
			alt: 'VizChitra github link',
			link: 'https://github.com/vizchitra'
		}
	];
</script>

<div class="mt-8 mb-8 flex items-center justify-center gap-6">
	<!-- <span class="text-left text-lg font-semibold">Follow Us</span> -->
	<div class="flex gap-6">
		{#each socials as social}
			<span>
				<a href={social.link} target="_blank">
					<img
						width="30px"
						height="30px"
						src={social.icon}
						alt={social.alt}
						class="transition-all duration-50 hover:[filter:invert(33%)_sepia(96%)_saturate(1231%)_hue-rotate(308deg)_brightness(99%)_contrast(99%)]"
					/>
				</a>
			</span>
		{/each}
	</div>
</div>
