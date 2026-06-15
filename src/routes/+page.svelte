<script lang="ts">
	import {
		Button,
		RecapVideo,
		Mission,
		DividerCurves,
		Hero,
		Slanted,
		Heading,
		LogoType,
		Text,
		ColorSpan,
		Container,
		Stack,
		Cluster,
		FullBleed
	} from '$lib/components';
</script>

<Hero banner="spinner" variant="large" />

<Container>
	<Stack>
		<Heading tag="h1" align="center">
			<LogoType year={2026} />
		</Heading>

		<Text type="lead" align="center">
			Join us for the second edition of India's community-run<br />
			<strong>data visualization conference</strong>
		</Text>

		<div class="event-details">
			<div class="event-detail">
				<span class="event-icon">📅</span>
				<span class="event-text"><strong>3rd & 4th July, 2026</strong></span>
			</div>
			<span class="event-separator">·</span>
			<div class="event-detail">
				<span class="event-icon">📍</span>
				<span class="event-text"><strong>Bangalore International Centre</strong></span>
			</div>
		</div>

		<Cluster>
			<a href="/2026" class="hero-cta">
				<span class="hero-cta-main">Explore VizChitra 2026 →</span>
				<span class="hero-cta-sub">Sessions · Tickets · Sponsorship</span>
			</a>
		</Cluster>

		<!-- <Cluster>
			<Text type="caption">Accepting Submissions till <strong>15 Feb 2025, 23:59 IST</strong></Text>
		</Cluster> -->

		<DividerCurves />

		<Heading align="center">
			<LogoType year={2025} />
		</Heading>

		<Text type="lead" align="center">Missed the event last year. See the highlights below.</Text>

		<FullBleed>
			<RecapVideo />
		</FullBleed>

		<DividerCurves />

		<Heading tag="h2" align="center">
			Our Ethos @ <LogoType year={null} />
		</Heading>

		<Text type="lead">
			Our goal is to build a community of diverse, interdisciplinary individuals working across the
			visualization spectrum, and facilitate learning and connections between people from different
			industries and disciplines who share a common interest in the power of data and storytelling.
		</Text>

		<Heading tag="h3" align="center" class="font-normal">
			<Slanted textContent="A SPACE TO CONNECT AND CREATE WITH DATA" />
		</Heading>

		<DividerCurves />

		<Heading align="center">
			Our Mission @ <LogoType year={null} />
		</Heading>

		<Text type="lead" align="center">
			To foster a vibrant <strong>community of data storytellers in India</strong>
			bridging technical analysis and design expertise to shape perspectives and drive change
		</Text>

		<Heading tag="h3" align="center" class="font-normal">
			<Slanted color="black" textContent="BUILD AN INDIAN DATA VISUALIZATION COMMUNITY" />
		</Heading>

		<Mission></Mission>

		<DividerCurves />
	</Stack>
</Container>

<style>
	.event-details {
		display: flex;
		justify-content: center;
		align-items: center;
		gap: 1rem;
		flex-wrap: wrap;
	}

	.event-detail {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		font-size: 1.35rem;
	}

	.event-icon {
		font-size: 1.6rem;
	}

	.event-separator {
		font-size: 1.5rem;
		color: #999;
	}

	.hero-cta {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.4rem;
		background: var(--color-viz-pink-solid);
		color: white;
		text-decoration: none;
		padding: 1.25rem 3rem;
		border-radius: 4px;
		transition:
			transform 0.3s ease,
			box-shadow 0.3s ease;
	}

	.hero-cta:hover {
		transform: translateY(-2px) scale(1.02);
		box-shadow:
			0 12px 30px rgba(0, 0, 0, 0.14),
			0 0 22px rgba(255, 255, 255, 0.06);
	}

	.hero-cta-main {
		font-family: var(--font-display);
		font-size: 1.5rem;
		font-weight: 800;
		letter-spacing: 0.02em;
	}

	.hero-cta-sub {
		font-size: 0.85rem;
		font-weight: 500;
		opacity: 0.85;
		letter-spacing: 0.08em;
		text-transform: uppercase;
	}
</style>
