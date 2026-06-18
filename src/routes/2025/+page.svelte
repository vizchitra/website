<script lang="ts">
	import {
		LogoType,
		Slanted,
		BannerPolygon,
		Pentagons,
		CallToAction,
		HomepageSection,
		KeyNote,
		Speakers2025,
		Workshop2025,
		SponsorCard,
		VenueCard,
		FAQ,
		Header,
		Hero,
		Grid
	} from '$lib/components';
	import Map from '$lib/components/sections/map/Map.svelte';
	import sponsors from '$lib/data/sponsors2025.json';
	import VizchitraLogo from '$lib/assets/images/logos/viz-logo-animate.svg?raw';

	const whyAttend = [
		{
			title: 'Explore & Play',
			description: 'On practices of data exploration, interface & dashboard design for dataviz.',
			backgroundColor: 'var(--color-viz-pink)'
		},
		{
			title: 'Explain & Learn',
			description: 'Centered on fundamentals of process, design & communication for dataviz.',
			backgroundColor: 'var(--color-viz-yellow)'
		},
		{
			title: 'Imagine & Innovate',
			description:
				'Use of new mediums, approaches, AI & tech to shape how we do dataviz in future.',
			backgroundColor: 'var(--color-viz-blue)'
		}
	];

	// Consolidated venue data
	const conferenceVenue = {
		name: 'Bangalore International Centre',
		address: '7, 4th Main Rd, Stage 2, Domlur, Bengaluru, Karnataka 560071',
		googleMapsURL: 'https://maps.app.goo.gl/duqbbwf2Hi3Q8dcSA',
		transportation: [
			{
				method: 'Metro',
				details: 'Indiranagar Metro Station (Purple Line) - 20 min walk'
			},
			{
				method: 'Bus',
				details: 'Buses 335-E, 333-E, 201-G, Domlur Bridge stop'
			},
			{
				method: 'Auto/Cab',
				details: 'Ask for Bangalore International Centre'
			}
		]
	};

	const workshopVenues = [
		{
			name: 'Samagata Foundation',
			address:
				'46/1, Cobalt, 4th, Church St, Haridevpur, Shanthala Nagar, Ashok Nagar, Bengaluru, Karnataka 560001',
			googleMapsURL: 'https://maps.app.goo.gl/4vnThEKY916vymQn6',
			transportation: [
				{
					method: 'Metro',
					details: 'MG Road Metro Station (Purple Line) - 5 min walk'
				},
				{
					method: 'Bus',
					details: 'Buses 210-G, 13, Chinnaswamy Stadium/MG Statue stop'
				},
				{
					method: 'Cab',
					details: 'Ask for Empire Restaurant on Church Street'
				}
			]
		},
		{
			name: 'Underline Center',
			address:
				'3rd Floor, above Blue Tokai, #24 3rd A Cross, 1st Main Rd, Bengaluru, Karnataka 560071',
			googleMapsURL: 'https://maps.app.goo.gl/NmHhknNLt5y2xCE89',
			transportation: [
				{
					method: 'Metro',
					details: 'Indiranagar Metro Station (Purple Line) - 20 min walk'
				},
				{
					method: 'Bus',
					details: 'Buses 335-E, 333-E, 201-G, Domlur Bridge stop'
				},
				{
					method: 'Cab',
					details: 'Ask for Bangalore International Centre'
				}
			]
		}
	];
</script>

<Hero banner="polygon" variant="large" />

<CallToAction />

<div class="mt-20 flex flex-col items-center gap-10">
	<!-- OPENING SECTION -->
	<HomepageSection>
		<div slot="content">
			<h1 id="intro">
				<LogoType />
			</h1>

			<p class="mb-8 font-[Cairo] text-2xl">
				This first India conference brings <span class="text-viz-pink-dark font-bold"
					>data visualization practitioners</span
				>
				from across India, representing
				<span class="text-viz-orange font-bold">different industries and disciplines,</span>
				together to facilitate
				<span class="text-viz-orange font-bold">learning and connections</span>
				around a common interest in the power of
				<span class="text-viz-pink-dark font-bold">visual data storytelling.</span>
			</p>

			<p class="mx-auto mb-6">
				<Slanted
					class="text-[18px] md:text-[24px]"
					textContent="A SPACE TO CONNECT AND CREATE WITH DATA"
				/>
			</p>

			<p class="content-text mb-1">
				Our goal is to build a community of diverse, interdisciplinary individuals working across
				the visualization spectrum, and facilitate learning and connections between people from
				different industries and disciplines who share a common interest in the power of data and
				storytelling.
			</p>

			<!-- <PolygonDivider></PolygonDivider> -->
		</div>
	</HomepageSection>

	<HomepageSection>
		<div slot="content">
			<h2 id="speakers" class="content-heading text-[2rem]!">KEYNOTES</h2>
		</div>
	</HomepageSection>
	<div class="mx-4">
		<KeyNote></KeyNote>
	</div>

	<HomepageSection>
		<div slot="content">
			<h2 class="content-heading text-[2rem]!">Speakers</h2>

			<p class="content-text mb-1">
				These are the voices you won't want to miss at <strong
					>Bangalore International Centre, Bengaluru</strong
				>
				on <strong>27<sup>th</sup> June</strong>
			</p>
		</div>
	</HomepageSection>

	<div class="w-full max-w-screen px-2">
		<Speakers2025></Speakers2025>
	</div>
	<HomepageSection>
		<div slot="content">
			<h2 id="workshops" class="content-heading text-[2rem]!">WORKSHOPS</h2>
			<p class="content-text mb-1">
				So much fun to look forward to! Bear in mind, workshops are located at <b
					>two different locations</b
				>. Do check ahead of time.
			</p>
		</div>
	</HomepageSection>
	<div class="w-full max-w-screen px-2">
		<Workshop2025></Workshop2025>
	</div>
	<!-- VENUES SECTION -->
	<HomepageSection>
		<div slot="content">
			<h2 class="content-heading mb-6 text-center text-[2rem]!">EVENT LOCATIONS</h2>
			<p class="content-text mb-8 text-center">
				The conference will be held at Bangalore International Centre, while workshops are at two
				different locations in the city.
			</p>
		</div>
	</HomepageSection>

	<!-- Conference Venue -->
	<div class="w-full">
		<h3 class="mb-6 text-center text-2xl font-bold text-gray-800">Conference Venue</h3>
		<div class="mx-auto grid w-full grid-cols-1 gap-8 lg:grid-cols-3">
			<div class="lg:col-span-2">
				<div class="h-[380px] w-full overflow-hidden rounded-2xl">
					<Map type="conference" />
				</div>
			</div>
			<div class="lg:col-span-1">
				<VenueCard venue={conferenceVenue} />
			</div>
		</div>
	</div>

	<!-- Workshop Venues -->
	<div class="mb-10 w-full">
		<h3 class="mb-6 text-center text-2xl font-bold text-gray-800">Workshop Locations</h3>
		<div class="mx-auto grid w-full grid-cols-1 gap-8 xl:grid-cols-8">
			{#each workshopVenues as venue, index}
				<div class="order-2 lg:col-span-1 xl:order-0 xl:col-span-2">
					<VenueCard {venue} {index} />
				</div>
			{/each}
			<div class="order-1 lg:col-span-1 xl:order-0 xl:col-span-4">
				<div class="h-full w-full overflow-hidden rounded-2xl">
					<Map type="workshop" />
				</div>
			</div>
		</div>
	</div>

	<div class="mx-auto flex max-w-4xl flex-wrap gap-4">
		{#each whyAttend as item, i}
			<Pentagons
				title={item.title}
				description={item.description}
				backgroundColor={item.backgroundColor}
				seed={Math.floor(Math.random() * 10)}
			/>
		{/each}
	</div>
	<h2 class="content-heading text-center text-[2rem]!">
		Our <span class="font-bold italic">valued partners</span>
	</h2>

	<div class="mx-auto">
		<Grid columns={2} gap={4} class="ml-0 pb-4 md:-ml-12 md:pb-0 lg:max-w-4xl">
			{#each sponsors as sponsor}
				<SponsorCard
					heading={sponsor.heading}
					logo={sponsor.logo}
					logoType="image"
					variant={sponsor.variant as
						| 'pink'
						| 'white'
						| 'black'
						| 'yellow'
						| 'orange'
						| 'blue'
						| 'green'}
					seed={sponsor.seed}
				/>
			{/each}
		</Grid>
	</div>

	<!-- FAQs SECTION -->
	<HomepageSection>
		<div slot="content">
			<h2 class="content-heading mt-16 mb-8 text-center text-[2rem]!">
				FREQUENTLY ASKED QUESTIONS
			</h2>
			<p class="content-text mb-8 text-center">
				Got questions? We've got answers! Here are some common questions about VizChitra.
			</p>
		</div>
	</HomepageSection>
</div>
<div class=" w-full">
	<FAQ />
</div>
