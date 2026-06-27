<script lang="ts">
	import {
		Grid,
		Cluster,
		Card,
		Button,
		DividerCurves,
		Header,
		Container,
		Stack,
		Prose,
		SpeakerDeck
	} from '$lib/components';
	import PackageScroller from '$lib/components/sections/sponsorship/PackageScroller.svelte';
	import type { Package } from '$lib/components/sections/sponsorship/PackageScroller.svelte';
	import SponsorScroller from '$lib/components/sections/sponsorship/SponsorScroller.svelte';
	import type { Sponsor } from '$lib/components/sections/sponsorship/SponsorScroller.svelte';
	import SponsorStrip from '$lib/components/sections/SponsorStrip.svelte';
	import EditorialScroller from '$lib/components/sections/sponsorship/EditorialScroller.svelte';
	import type { EditorialCard } from '$lib/components/sections/sponsorship/EditorialScroller.svelte';
	import PhotoStrip from '$lib/components/sections/PhotoStrip.svelte';

	const sponsorPhotos: string[] = [
		'/images/photos/sponsor-lilly-booth.jpg',
		'/images/photos/sponsor-nutanix-group.jpg',
		'/images/photos/sponsor-lightningchart-demo.jpg',
		'/images/photos/sponsor-panel-closeup.jpg',
		'/images/photos/sponsor-straive-lc-booths.jpg',
		'/images/photos/sponsor-lilly-team.jpg',
		'/images/photos/sponsor-nutanix.jpg',
		'/images/photos/sponsor-rvl-attendees.jpg'
	];

	const mainPackages: Package[] = [
		{
			tier: 'Platinum',
			price: '₹7,00,000 + GST',
			slots: '1 slot',
			color: 'yellow',
			purpose: 'Help lead the conference vision and anchor the overall experience.',
			what: 'Partner at the highest level with prominent branding, keynote association, and booth presence.',
			bestFor: 'Large Orgs · Global platforms · Ecosystem leaders · Policy & Industry institutes',
			value:
				"Viz leadership positioning, strong brand recall, deep alignment with the conference's mission.",
			benefits: [
				{
					label: '10 Conference Tickets',
					details: ['Attending the conference day only']
				},
				{
					label: 'Branding Print | Venue | Web',
					details: [
						'In social media & event website',
						'On main banner & podium',
						'On lanyard & printed schedule'
					]
				},
				{
					label: 'Booth Space',
					details: ['8ft × 8ft, includes table & chair', 'Setup & production by sponsor']
				},
				{
					label: 'One Sponsored Panelist',
					details: ['1 panelist, 30 mins slot', 'In an editorial moderated panel']
				},
				{
					label: 'One Sponsored Talk',
					details: ['1 talk, 20 mins slot + 5 mins Q&A', 'Review with editorial team needed']
				}
			]
		},
		{
			tier: 'Gold',
			price: '₹4,00,000 + GST',
			slots: '2 slots',
			color: 'orange',
			purpose: 'Champion key conference moments and high-visibility experiences.',
			what: 'Support panel sessions and booth presences to provide strong balanced visibility.',
			bestFor:
				'Established Orgs · Scaling startups · Consulting firms · Data & design platforms · Foundations',
			value:
				'High-impact visibility with meaningful audience engagement and association with thought leadership.',
			benefits: [
				{
					label: '7 Conference Tickets',
					details: ['Attending the conference day only']
				},
				{
					label: 'Branding Print | Venue | Web',
					details: [
						'In social media & event website',
						'On main banner & podium',
						'On printed schedule'
					]
				},
				{
					label: 'Booth Space',
					details: ['8ft × 8ft, includes table & chair', 'Setup & production by sponsor']
				},
				{
					label: 'One Sponsored Panelist',
					details: ['1 panelist, 30 mins slot', 'In an editorial moderated panel']
				}
			]
		},
		{
			tier: 'Silver',
			price: '₹2,50,000 + GST',
			slots: '3 slots',
			slotsLeft: 0,
			color: 'blue',
			purpose: 'Strengthen the core program and community experience.',
			what: 'Significant presence with booth and branding across the conference print, venue and communication.',
			bestFor:
				'Growing startups · Specialist consultancies · Specialist firms · Emerging tools · Medium NGOs',
			value:
				'Credible presence within data viz ecosystem and steady exposure to a relevant audience.',
			benefits: [
				{
					label: '5 Conference Tickets',
					details: ['Attending the conference day only']
				},
				{
					label: 'Branding Print | Venue | Web',
					details: [
						'In social media & event website',
						'On main banner & podium',
						'On printed schedule'
					]
				},
				{
					label: 'Booth Space',
					details: ['6ft × 6ft, includes table & chair', 'Setup & production by sponsor']
				}
			]
		},
		{
			tier: 'Bronze',
			price: '₹1,00,000 + GST',
			slots: '5 slots',
			slotsLeft: 1,
			color: 'pink',
			purpose: 'Participate and support the conference ecosystem.',
			what: 'Entry-level partnership with stall, logo and inclusion across conference communications.',
			bestFor:
				'Early-stage startups · Local organisations · Small NGOs · Small Studios · First-time sponsors',
			value: "Cost-effective exposure and authentic association with India's data viz community.",
			benefits: [
				{
					label: '3 Conference Tickets',
					details: ['Attending the conference day only']
				},
				{
					label: 'Branding Banner | Web',
					details: ['In social media & event website', 'On main banner & podium']
				},
				{
					label: 'Stall Space',
					details: ['3ft × 2ft, includes table & chair', 'Setup & production by sponsor']
				}
			]
		},
		{
			tier: 'Community',
			price: '₹50,000 + GST',
			slots: '10 slots',
			slotsLeft: 9,
			color: 'teal',
			purpose: 'Strengthen and sustain the data viz community.',
			what: 'Contribute as a values-aligned partner with light branding and meaningful participation.',
			bestFor:
				'Collectives · OSS projects · Independent studios · Community-led initiatives · Individuals',
			value:
				'Peer recognition, authentic goodwill, and presence within the practitioner viz community.',
			benefits: [
				{
					label: '2 Conference Tickets',
					details: ['Attending the conference day only']
				},
				{
					label: 'Branding Banner | Web',
					details: ['In social media & event website', 'Only main banner']
				}
			]
		}
	];

	const additionalPackages: Package[] = [
		{
			tier: 'Exhibition',
			price: '₹3,00,000 + GST',
			slots: '1 slot',
			color: 'orange',
			purpose: 'Foster data-driven discourse on climate, ecologies and sustainability.',
			what: 'Sponsor an exclusive Gallery exhibition on climate & ecology called Data, Otherwise on the conference day.',
			bestFor:
				'Climate tech startups · ESG consultancies · NGOs & think tanks · CSR teams · Mobility, Agri Orgs',
			value:
				'High-intent visibility and direct dialogue with an audience that values data-driven climate action.',
			benefits: [
				{
					label: '3 Conference Tickets',
					details: ['Attending the conference day only']
				},
				{
					label: 'Branding Print | Venue | Web',
					details: ['In social media & event website', 'On main banner', 'On printed schedule']
				},
				{
					label: 'Booth Space',
					details: ['6ft × 6ft, includes table & chair', 'Setup & production by sponsor']
				},
				{
					label: 'Banner @ Exhibition',
					details: ['Exclusive banners in the Gallery on the conference day']
				}
			]
		},
		{
			tier: 'Networking',
			price: '₹1,50,000 + GST',
			slots: '2 slots',
			color: 'teal',
			purpose: 'Enable meaningful connections between peers & experts to build community.',
			what: 'Sponsor the main networking hour that brings together all attendees in an informal, high-energy setting.',
			bestFor: 'Hiring Orgs · Data & design platforms · Consulting firms · Community-first brands',
			value:
				'Strong brand recall through organic interactions and positioning as a connector within the data viz ecosystem.',
			benefits: [
				{
					label: '3 Conference Tickets',
					details: ['Attending the conference day only']
				},
				{
					label: 'Branding Print | Venue | Web',
					details: ['In social media & event website', 'On main banner', 'On printed schedule']
				},
				{
					label: 'Lounge Space',
					details: ['4ft × 4ft, includes table & chair', 'Setup & production by sponsor']
				},
				{
					label: 'Banner @ Networking Hour',
					details: ['Exclusive banners on the Terrace on the conference day']
				}
			]
		},
		{
			tier: 'Speaker Dinner',
			price: '₹1,50,000 + GST',
			slots: '1 slot',
			color: 'pink',
			purpose: 'Help conversations with speakers for thoughtful, off-stage discussions.',
			what: 'Host an intimate dinner with speakers on evening prior to the conference day.',
			bestFor:
				'Senior-focused organisations · Research institutions · Large orgs · Strategic partners',
			value:
				'Relationship-building with influential practitioners and premium association with thought leadership.',
			benefits: [
				{
					label: '3 Conference Tickets',
					details: ['Attending the conference day only']
				},
				{
					label: 'Branding Print | Venue | Web',
					details: ['In social media & event website', 'On main banner', 'On printed schedule']
				},
				{
					label: 'Lounge Space',
					details: ['4ft × 4ft, includes table & chair', 'Setup & production by sponsor']
				},
				{
					label: 'Banner @ Speaker Dinner',
					details: ['Exclusive banners at the Dinner', 'One day before the conference']
				}
			]
		},
		{
			tier: 'Workshop',
			price: '₹1,00,000 + GST',
			slots: '2 slots',
			color: 'blue',
			purpose: 'Support learning & skill building for the data viz community.',
			what: 'Enable hands-on datavis learning by supporting the space where skills are built, not just discussed.',
			bestFor:
				'Tools and platform companies · Education and upskilling orgs · Developer- or analyst-focused brands',
			value:
				'Direct association with learning, plus deep engagement with a focused audience on real-world usage.',
			benefits: [
				{
					label: '2 Conference Tickets',
					details: ['Attending the conference day only']
				},
				{
					label: 'Branding Banner | Web',
					details: ['In social media & event website', 'On main banner']
				},
				{
					label: 'Stall Space on Conf Day',
					details: ['3ft × 2ft, includes table & chair', 'Setup & production by sponsor']
				},
				{
					label: '1 Workshop Ticket',
					details: ['Attending the workshop day only']
				}
			]
		},
		{
			tier: 'Scholarship',
			price: '₹50,000 + GST',
			slots: '2 slots',
			color: 'yellow',
			purpose: 'Broaden inclusive representation by supporting diverse candidates.',
			what: 'Fund 3 financial aid conference scholarship for diverse voices in the data visualisation community.',
			bestFor:
				'DEI focussed organisations · CSR & ESG teams · Foundations and NGOs · Teams for Diversity',
			value:
				'Credible social impact, long-term goodwill, and alignment with inclusive values for the viz community.',
			benefits: [
				{
					label: '5 Virtual Tickets',
					details: ['For the conference day only']
				},
				{
					label: 'Branding Banner | Web',
					details: ['In social media & event website', 'On main banner']
				}
			]
		}
	];

	const sponsors: Sponsor[] = [
		{
			name: 'Nutanix',
			logo: '/images/logos/nutanix-logo.avif',
			photos: [undefined, undefined],
			quote:
				'...for all your efforts with a very well-organized event. In depth conversation about our product…',
			overallRating: 4,
			recommendRating: 4,
			color: 'blue'
		},
		{
			name: 'Lilly',
			logo: '/images/logos/lilly-logo-word.avif',
			photos: [undefined, undefined],
			quote:
				'Got great interaction with the audience… follow up connects… Increased brand awareness and future collaborations…',
			overallRating: 5,
			recommendRating: 5,
			color: 'teal'
		},
		{
			name: 'Revisual Labs',
			logo: '/images/logos/revisual-logo.avif',
			photos: [undefined, undefined],
			quote:
				'Really amazing experience and had lot of interaction with people from multiple backgrounds.',
			overallRating: 4,
			recommendRating: 4,
			color: 'pink'
		},
		{
			name: 'LightningChart',
			logo: '/images/logos/lightning-chart-logo.avif',
			photos: [undefined, undefined],
			quote:
				'The support shared by the Vizchitra team on talk, panel prep was very detailed and helpful for us.',
			overallRating: 4,
			recommendRating: 5,
			color: 'yellow'
		},
		{
			name: 'Straive',
			logo: '/images/logos/straive-logo.avif',
			photos: [undefined, undefined],
			quote:
				'...expecting increased awareness about our brand and product, led to conversations about our work…',
			overallRating: 5,
			recommendRating: 4,
			color: 'orange'
		}
	];

	const uniqueCards: EditorialCard[] = [
		{
			heading: 'Cross-disciplinary across functions, domains & practice',
			body: 'Journalists, researchers, designers, data scientists and developers, all in the same space. The program is built to bring them together.',
			color: 'teal'
		},
		{
			heading: 'Dedicated to craft when it matters most',
			body: 'We are dedicated to the human craft of making data understood. AI expands what is possible now. We focus on what it means',
			color: 'blue'
		},
		{
			heading: 'Practitioner-led by structure and by process',
			body: 'Talks, dialogues, workshops, exhibits all come from an open community process. The people on stage are the same people in the audience.',
			color: 'pink'
		},
		{
			heading: 'Curatorial by standard and Editorial by intent',
			body: 'Every session, exhibition, and dialogue goes through a rigorous editorial process. We ask hard questions about what belongs, why it matters, and who it serves.',
			color: 'yellow'
		},
		{
			heading: 'Inclusive by framework and representative by design',
			body: 'Our scholarship program and SOLID thinking ensures representation is structural, not symbolic. We curate for voices the ecosystem would otherwise miss.',
			color: 'orange'
		},
		{
			heading: 'Experiential by intention and memorable by craft',
			body: 'The exhibition, the venue, the format. BIC is considered choice. Data, Otherwise is centerpience. Every element of VizChitra is crafter to be felt, not just attended.',
			color: 'grey'
		}
	];

	const whyCards: EditorialCard[] = [
		{
			heading: 'Enter a space that chooses to be here',
			body: 'Every person in the room has opted in. The intent in the audience is unusually high and it shows in every conversation.',
			color: 'orange'
		},
		{
			heading: 'Reach the dataviz practitioners others miss',
			body: 'Senior individual contributors, independent practitioners, cross-domain thinkers. They seek out spaces like this specifically.',
			color: 'teal'
		},
		{
			heading: 'Stand out in a space that notices',
			body: 'Small enough that your presence is felt and remembered. Sponsors are partners in the experience, visible across every touchpoint.',
			color: 'blue'
		},
		{
			heading: 'Align with a community that has earned its credibility',
			body: 'Built, organized and run by working practitioners, folks doing real dataviz work every day. Being here puts your organisation in that company.',
			color: 'pink'
		},
		{
			heading: 'Connect with a community with global reach',
			body: 'India-rooted but internationally connected. The data visualization community here is part of a global conversation, contributing to it and shaping it.',
			color: 'yellow'
		},
		{
			heading: 'Stay visible beyond the two days',
			body: 'Session recordings, social content, community memory. VizChitra lives in the practitioner ecosystem long after July.',
			color: 'grey'
		}
	];
</script>

<Header title="Sponsorship 2026" banner="curve" />

<Container>
	<Stack>
		<!-- Intro -->
		<Prose color="pink">
			<h1>Sponsorship</h1>
			<p>
				<strong>VizChitra 2026</strong> returns to Bengaluru on 3rd &amp; 4th July. India's only community-led
				conference dedicated to data visualization as craft: cross-disciplinary, practitioner-led, and
				intentional about every experience it creates. If that sounds like a space your organisation belongs
				in, we'd love to have you as a sponsor.
			</p>
		</Prose>

		<Cluster justify="start">
			<Button href="mailto:hello@vizchitra.com" color="pink" size="lg"
				>✉️ Contact Us for Sponsorship →</Button
			>
		</Cluster>

		<Grid minWidth="28ch" maxColumns={2} gap={6}>
			<Card variant="bordered" color="pink" title="Conference Day // 4th July 2026">
				<ul>
					<li>Bangalore International Centre (BIC), Domlur</li>
					<li>400+ In-Person Attendees</li>
					<li>200+ Live Stream Attendees</li>
					<li>Talks, Dialogues &amp; Exhibition</li>
				</ul>
			</Card>
			<Card variant="bordered" color="orange" title="Workshop Day // 3rd July 2026">
				<ul>
					<li>BIC and Underline Center, Domlur</li>
					<li>120+ Participants</li>
					<li>Seven hands-on Workshop sessions</li>
					<li>Led by practitioners & experts</li>
				</ul>
			</Card>
		</Grid>
	</Stack>
</Container>

<SponsorStrip />

<PhotoStrip
	photos={sponsorPhotos}
	height="360px"
	autoplayInterval={6000}
	ariaLabel="Sponsor experience at VizChitra 2025"
/>

<Container>
	<Stack>
		<!-- What makes VizChitra unique -->
		<Prose>
			<h2>What Makes VizChitra Unique</h2>
			<p>
				VizChitra is the most deliberately crafted data event in India. Every choice: who speaks,
				what is shown, how people encounter it, is made with care for the craft and the community it
				serves.
			</p>
		</Prose>

		<EditorialScroller cards={uniqueCards} ariaLabel="What makes VizChitra unique" />

		<DividerCurves />

		<!-- Why sponsor VizChitra -->
		<Prose>
			<h2>Why Sponsor VizChitra</h2>
			<p>
				Sponsoring VizChitra puts your organisation inside a conversation that practitioners in
				India's data visualization ecosystem will remember. Here is what that means for every
				sponsor.
			</p>
		</Prose>

		<EditorialScroller cards={whyCards} ariaLabel="Why sponsor VizChitra" />

		<DividerCurves />

		<!-- 2025 Edition -->
		<Prose>
			<h2>The 2025 Edition</h2>
			<p>
				Our first edition brought the Data Visualization community together — two days of Conference
				&amp; Workshop in June 2025.
			</p>
		</Prose>

		<div class="stat-grid">
			<div class="stat-item">
				<span class="stat-num">450+</span>
				<span class="stat-desc">Attendees across two days</span>
			</div>
			<div class="stat-item">
				<span class="stat-num">200+</span>
				<span class="stat-desc">Organisations &amp; Institutions</span>
			</div>
			<div class="stat-item">
				<span class="stat-num">50+</span>
				<span class="stat-desc">Cities across India &amp; Abroad</span>
			</div>
			<div class="stat-item">
				<span class="stat-num">120+</span>
				<span class="stat-desc">Live Stream Online</span>
			</div>
		</div>

		<div class="edition-photos">
			<img
				src="/images/photos/group-photo.jpg"
				alt="VizChitra 2025 attendees gathered together"
				class="edition-photo"
			/>
			<img
				src="/images/photos/packed-auditorium.jpg"
				alt="VizChitra 2025 packed auditorium"
				class="edition-photo"
			/>
		</div>

		<div class="featured-quote">
			<p class="featured-quote-text">
				{'\u201C'}VizChitra 2025 was unlike any other data event I've been part of. Thoughtful,
				warm, and grounded in both rigour and imagination. It brought together people who care
				deeply about data, and want to do something real with it. This is the kind of space that
				nudges you to stretch your thinking and feel part of a larger, generous community.{'\u201D'}
			</p>
			<p class="featured-quote-attr">Yashna Jhamb, Ooloi Labs</p>
		</div>

		<!-- Sponsor Experience -->
		<DividerCurves />
		<Prose>
			<h2>Sponsor Experience @ 2025</h2>
			<p>
				Grounded in a strong first edition success and learnings with proven engagement across
				sessions, booths, and community.
			</p>
		</Prose>

		<SponsorScroller {sponsors} />

		<DividerCurves />

		<!-- Main Sponsorship Packages -->

		<Stack>
			<Prose>
				<h2>Main Sponsorship Packages</h2>
				<p>
					Core partnership tiers with broad presence — become part of the full canvas of the
					conference experience.
				</p>
			</Prose>

			<PackageScroller packages={mainPackages} />
		</Stack>
		<DividerCurves />

		<!-- Additional Sponsorship Packages -->
		<Stack>
			<Prose>
				<h2>Additional Sponsorship Packages</h2>
				<p>
					Five focused partnership moments — engage at the key intersections where ideas connect.
				</p>
			</Prose>

			<PackageScroller packages={additionalPackages} />
		</Stack>

		<Cluster justify="start">
			<Button href="mailto:hello@vizchitra.com" color="pink" size="lg"
				>✉️ Contact Us for Sponsorship →</Button
			>
		</Cluster>

		<DividerCurves />

		<!-- FAQs & Contact -->
		<Prose>
			<h2>FAQs &amp; Contact</h2>
			<p>Clear answers to common questions designed to help you decide with confidence.</p>
		</Prose>

		<Prose>
			<p>
				<strong>How is sponsorship confirmed?</strong><br />
				Sponsorship is secured only upon full payment in advance.
			</p>
			<p>
				<strong>Can we have category exclusivity?</strong><br />
				Exclusive positioning within a specific industry category is available via differential pricing.
			</p>
			<p>
				<strong>Can packages be combined?</strong><br />
				Yes, any main and additional packages can be combined to fit your specific goals.
			</p>
			<p>
				<strong>Who handles booth setup?</strong><br />
				Booth &amp; stall setup is the responsibility of the sponsor. We can offer production support
				for an additional fee.
			</p>
			<p>
				<strong>Are there editorial guidelines for talks and panels?</strong><br />
				Yes, sponsors must adhere to community editorial guidelines. Refer to
				<a href="https://vizchitra.com/guides">vizchitra.com/guides</a> for details.
			</p>
		</Prose>

		<DividerCurves />

		<Prose>
			<h2>Get in Touch</h2>
			<p>Let us continue the conversation. Reach out to explore a partnership that fits.</p>
			<p>
				Email: <a href="mailto:hello@vizchitra.com">hello@vizchitra.com</a><br />
				Gurman Bhatia: <a href="tel:+919990044111">+91 9990 044 111</a><br />
				Amit Kapoor: <a href="tel:+919739268197">+91 9739 268 197</a>
			</p>
		</Prose>

		<DividerCurves />

		<SpeakerDeck
			id="17bfc05b62dc4240b2d7fa946f6c6900"
			title="Sponsorship 2026 | VizChitra"
			aspectRatio="1 / 1"
		/>
	</Stack>
</Container>

<style>
	.stat-grid {
		display: grid;
		grid-template-columns: repeat(4, 1fr);
		gap: 1rem;
	}

	.stat-item {
		padding: 0.5rem 0;
	}

	.stat-num {
		font-family: var(--font-display);
		font-size: 2.8rem;
		font-weight: 800;
		line-height: 1;
		display: block;
		color: var(--color-viz-black);
	}

	.stat-desc {
		font-size: 0.9rem;
		color: var(--color-viz-grey-dark);
		display: block;
		margin-top: 0.25rem;
	}

	.featured-quote {
		background: oklch(26% 0.13 354);
		border-radius: 4px;
		padding: 2.5rem;
		text-align: center;
		width: 100%;
	}

	.featured-quote-text {
		font-family: var(--font-display);
		font-size: 1.3rem;
		font-weight: 500;
		font-style: italic;
		line-height: 1.6;
		color: #eee;
		margin: 0 0 1rem;
	}

	.featured-quote-attr {
		font-family: var(--font-display);
		font-size: 0.9rem;
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.08em;
		color: oklch(84% 0.12 354);
		margin: 0;
	}

	.edition-photos {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 0.5rem;
	}

	.edition-photo {
		width: 100%;
		height: 280px;
		object-fit: cover;
		border-radius: 4px;
	}

	@media (max-width: 768px) {
		.stat-grid {
			grid-template-columns: repeat(2, 1fr);
		}

		.edition-photos {
			grid-template-columns: 1fr;
		}

		.edition-photo {
			height: 200px;
		}
	}
</style>
