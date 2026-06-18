<script lang="ts">
	import {
		Flex,
		FullBleed,
		CallCard,
		Button,
		Heading,
		SubHeading,
		Text,
		Slanted,
		LogoType,
		ColorSpan,
		DividerCurves,
		Hero,
		Header,
		Container,
		Stack,
		Cluster,
		CursorHint
	} from '$lib/components';
	import SessionCardExpanded from '$lib/components/sessions/SessionCardExpanded.svelte';
	import PhotoStrip from '$lib/components/sections/PhotoStrip.svelte';
	import SponsorStrip from '$lib/components/sections/SponsorStrip.svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	const typeOrder = ['Workshops', 'Talks', 'Dialogues', 'Exhibition'];

	const sessionGroups = $derived(
		typeOrder
			.map((type) => ({
				type,
				sessions: data.selectedSessions.filter((s) => s.sessionType === type)
			}))
			.filter((g) => g.sessions.length > 0)
	);

	type Pattern = 'circle' | 'waves' | 'river' | 'stream';
	type Tone = 'blue' | 'teal' | 'orange' | 'pink' | 'yellow';

	const typeConfig: Record<
		string,
		{
			pattern: Pattern;
			tone: Tone;
			titlePosition: string;
			href: string;
			subtitle: string;
			description: string;
			descriptionPosition: string;
			descriptionWidth: string;
		}
	> = {
		Workshops: {
			pattern: 'circle',
			tone: 'pink',
			titlePosition: 'pt-28 md:pt-40 text-center',
			href: '/2026/workshops',
			subtitle: 'The Learning Journey',
			description:
				'Half-day, hands-on sessions with expert facilitators. Skill-building & learning through doing.',
			descriptionPosition: 'bottom-5 left-1/2 -translate-x-1/2 text-center',
			descriptionWidth: '30ch'
		},
		Talks: {
			pattern: 'waves',
			tone: 'blue',
			titlePosition: 'pt-2 text-left',
			href: '/2026/talks',
			subtitle: 'The Narrative Journey',
			description:
				'Deep dives into projects & lived experiences. Stories that reshape how we see our viz work.',
			descriptionPosition: 'bottom-5 left-5 md:left-8 text-left',
			descriptionWidth: '30ch'
		},
		Dialogues: {
			pattern: 'river',
			tone: 'teal',
			titlePosition: 'pt-12 text-left',
			href: '/2026/dialogues',
			subtitle: 'The Shared Journey',
			description:
				'Participant-driven, unconference-style sessions. Meaning that emerges through conversation.',
			descriptionPosition: 'top-38 md:top-48 left-5 md:left-8 text-left',
			descriptionWidth: '20ch'
		},
		Exhibition: {
			pattern: 'stream',
			tone: 'orange',
			titlePosition: 'pt-4 text-center',
			href: '/2026/exhibition',
			subtitle: 'The Immersive Journey',
			description:
				'Data, Otherwise: a curated gallery on climate & ecology viz. Works that slow you down & feel.',
			descriptionPosition: 'bottom-2 left-1/2 -translate-x-1/2 text-center',
			descriptionWidth: '20ch'
		}
	};

	// Scroll tracking — track which cards are visible
	let visibleCards: Record<string, Set<number>> = $state({
		Workshops: new Set([0]),
		Talks: new Set([0]),
		Dialogues: new Set([0])
	});

	function handleScroll(type: string, el: HTMLElement) {
		const cards = el.querySelectorAll<HTMLElement>('.session-card-wrap');
		if (!cards.length) return;

		const scrollLeft = el.scrollLeft;
		const containerWidth = el.clientWidth;
		const visible = new Set<number>();

		cards.forEach((card, i) => {
			const cardLeft = card.offsetLeft - el.offsetLeft;
			const cardRight = cardLeft + card.offsetWidth;
			const visibleLeft = Math.max(cardLeft, scrollLeft);
			const visibleRight = Math.min(cardRight, scrollLeft + containerWidth);
			const visibility = visibleRight - visibleLeft;
			// Card is visible if more than 30% is showing
			if (visibility > card.offsetWidth * 0.3) {
				visible.add(i);
			}
		});

		visibleCards[type] = visible;
	}

	// Drag-to-scroll (Svelte action)
	function scrollAction(node: HTMLElement, type: string) {
		let isDown = false;
		let startX = 0;
		let scrollLeft = 0;
		let hasDragged = false;

		function onMouseDown(e: MouseEvent) {
			isDown = true;
			hasDragged = false;
			node.classList.add('is-dragging');
			startX = e.pageX;
			scrollLeft = node.scrollLeft;
			e.preventDefault(); // Prevent link drag behavior
		}

		function onMouseLeave() {
			isDown = false;
			node.classList.remove('is-dragging');
		}

		function onMouseUp() {
			isDown = false;
			node.classList.remove('is-dragging');
		}

		function onMouseMove(e: MouseEvent) {
			if (!isDown) return;
			e.preventDefault();
			const walk = (e.pageX - startX) * 1.5;
			if (Math.abs(walk) > 5) hasDragged = true;
			node.scrollLeft = scrollLeft - walk;
		}

		// Prevent click on links if we were dragging
		function onClick(e: MouseEvent) {
			if (hasDragged) {
				e.preventDefault();
				e.stopPropagation();
				hasDragged = false;
			}
		}

		function onScroll() {
			handleScroll(type, node);
		}

		node.addEventListener('mousedown', onMouseDown);
		node.addEventListener('mouseleave', onMouseLeave);
		node.addEventListener('mouseup', onMouseUp);
		node.addEventListener('mousemove', onMouseMove);
		node.addEventListener('click', onClick, true); // capture phase
		node.addEventListener('scroll', onScroll);

		return {
			destroy() {
				node.removeEventListener('mousedown', onMouseDown);
				node.removeEventListener('mouseleave', onMouseLeave);
				node.removeEventListener('mouseup', onMouseUp);
				node.removeEventListener('mousemove', onMouseMove);
				node.removeEventListener('click', onClick, true);
				node.removeEventListener('scroll', onScroll);
			}
		};
	}
	// Rotating quotes
	import { onMount, onDestroy } from 'svelte';

	const eventPhotos: string[] = [
		'/images/photos/tote-bag.jpg',
		'/images/photos/aditi-performance-4.jpg',
		'/images/photos/group-photo.jpg',
		'/images/photos/packed-auditorium.jpg',
		'/images/photos/hug.jpg',
		'/images/photos/crowd-registration.jpg',
		'/images/photos/smiling-audience.jpg',
		'/images/photos/aditi-performance-1.jpg',
		'/images/photos/hall-talk.jpg',
		'/images/photos/collaborating.jpg',
		'/images/photos/audience-clapping.jpg',
		'/images/photos/workshop-hands.jpg',
		'/images/photos/stage-presentation.jpg',
		'/images/photos/crowd-listening.jpg',
		'/images/photos/workshop-pair.jpg',
		'/images/photos/workshop-screen.jpg',
		'/images/photos/audience-clapping-2.jpg',
		'/images/photos/stage-group.jpg',
		'/images/photos/networking.jpg'
	];

	const quotes = [
		{
			text: "Attending this conference was truly eye-opening—I discovered so many new ideas and perspectives that I hadn't encountered before. Unlike other events, this one stood out for its unique approach and inclusive atmosphere."
		},
		{
			text: 'What I appreciate most about Vizchitra is its commitment to community growth. By encouraging everyone to speak up and share their thoughts, the event creates a platform where every voice matters.'
		},
		{
			text: 'Please continue with this wonderful approach. Giving everyone a chance to shine not only empowers individuals, but also helps us all learn from the very best. Looking forward to more such opportunities in the future!'
		},
		{
			text: 'As someone from a tech background, it was great to exchange ideas with journalists, writers, designers and product managers—and see how each perspective brings data to life. The focus on Why & What sparking fresh questions about purpose and impact.'
		},
		{
			text: 'Apart from the conference hall itself, the spaces outside (the participatory viz exhibits and booths) felt like a very inviting and conducive space for talking and picking each others brains across so many different kinds of designers, researchers, journalists. That was incredible!'
		},
		{
			text: 'The conference was incredibly insightful and inspiring. I especially appreciated how the sessions explored data not just as numbers, but as stories with meaning and emotion. It made me reflect on how I approach information design with more empathy, context, and clarity. The diversity of speakers and the openness in sharing process and challenges made the experience very valuable.'
		},
		{
			text: 'Engaging speakers with substance and actionable information and insights, cool merch with viz integrated in them, participatory data viz installations, great branding, great venue.'
		},
		{
			text: 'I also loved the idea of booth spaces where people could mingle, play games and even have cookies. Loved the overall vibe and positive learning environment and eager to see how the next event unfolds. Kudos to the organisers, volunteers and everyone involved.'
		},
		{ text: 'Loved the logo, branding and the entire vibe of the conference!' },
		{ text: 'Being part of a community of people who are both intelligent and creative.' },
		{
			text: 'I got the chance to speak to S Rukmini, Srinivasan Ramani and some other superb people. I never expected that.'
		},
		{
			text: 'High authenticity was evident across majority of talks. Less AI fluff, More human depth across the program. When AI came up it was done well.'
		}
	];

	let quoteIndex = $state(0);
	let videoOpen = $state(false);
	const videoId = 'LfJLCueKkb0';
	let currentQuote = $derived(quotes[quoteIndex]);
	let quoteTimer: ReturnType<typeof setInterval>;

	onMount(() => {
		quoteTimer = setInterval(() => {
			quoteIndex = (quoteIndex + 1) % quotes.length;
		}, 6000);
	});

	onDestroy(() => {
		if (quoteTimer) clearInterval(quoteTimer);
	});
</script>

{#snippet sessionRow(type: string)}
	{@const group = sessionGroups.find((g) => g.type === type)}
	{#if group}
		{@const cfg = typeConfig[type]}
		<FullBleed paddingX="md">
			<!-- Dots row: thin strip above, offset to align with session cards -->
			{@const totalCards = group.sessions.length}
			{@const visible = visibleCards[type] ?? new Set([0])}
			{@const minVisible = Math.min(...visible)}
			{@const maxVisible = Math.max(...visible)}
			<div class="progress-track">
				<div
					class="progress-thumb"
					style="left: {(minVisible / totalCards) * 100}%; width: {((maxVisible - minVisible + 1) /
						totalCards) *
						100}%"
				></div>
			</div>
			<div class="type-row" onscroll={(e) => handleScroll(type, e.currentTarget as HTMLElement)}>
				<!-- Fixed left CallCard (sticky on desktop, scrolls on mobile) -->
				<div class="type-label">
					<CallCard
						title={group.type}
						subtitle={cfg.subtitle}
						description={cfg.description}
						pattern={cfg.pattern}
						tone={cfg.tone}
						titlePosition={cfg.titlePosition}
						descriptionPosition={cfg.descriptionPosition}
						descriptionWidth={cfg.descriptionWidth}
						href={cfg.href}
						variation={0.5}
					/>
				</div>
				<div class="sessions-scroll" use:scrollAction={type}>
					{#each group.sessions as session (session.slug)}
						<div class="session-card-wrap">
							<SessionCardExpanded
								title={session.title}
								speakerName={session.speakerName}
								designation={session.designation}
								organisation={session.organisation}
								sessionType={session.sessionType}
								subtitle={session.subtitle}
								date={session.date}
								time={session.time}
								slot={session.slot}
								venue={session.venue}
								slug={session.slug}
								speakerImage={session.speakerImage}
								tbd={session.tbd}
								soldOut={session.soldOut}
								isExpanded={true}
								descriptionHtml={session.descriptionHtml}
							/>
						</div>
					{/each}
				</div>
			</div>
		</FullBleed>
	{/if}
{/snippet}

<Hero banner="spinner" />

<Container>
	<Stack>
		<Heading tag="h1" class="py-4" align="center">
			<LogoType year={2026} />
		</Heading>

		<Text type="lead" align="center">
			Join us for talks, workshops, dialogues, and an exhibition.<br />
			Two days of data visualization, curated by India's data viz community —<br />
			in person in Bengaluru, or online from anywhere.
		</Text>

		<div class="hero-info">
			<div class="hero-info-item">
				<span class="hero-info-icon">📍</span>
				<a
					href="https://share.google/zWq1ZMJHTc5vJxtqX"
					target="_blank"
					rel="noopener"
					class="underline decoration-1 underline-offset-2 transition-all hover:decoration-2"
					><strong>Bangalore International Centre</strong></a
				>
			</div>
			<div class="hero-info-item">
				<span class="hero-info-icon">📅</span>
				<span><strong>3rd & 4th July, 2026</strong></span>
			</div>
			<div class="hero-info-item">
				<span class="hero-info-icon">💻</span>
				<span><strong>In person or online</strong></span>
			</div>
		</div>

		<div class="hero-actions">
			<a
				href="https://tickets.vizchitra.com"
				target="_blank"
				rel="noopener"
				class="hero-btn hero-btn-pink"
			>
				<span class="hero-btn-icon">🎟️</span>
				<span class="hero-btn-text">Get Tickets →</span>
			</a>
			<a href="/2026/sessions" class="hero-btn hero-btn-blue">
				<span class="hero-btn-icon">🎤</span>
				<span class="hero-btn-text">See all Sessions →</span>
			</a>
		</div>

		<Text type="body" align="center">
			Not attending but want to back VizChitra?
			<a
				href="https://tickets.vizchitra.com/contribute"
				target="_blank"
				rel="noopener"
				class="text-viz-pink-dark font-bold underline decoration-2 underline-offset-2"
				>Contribute any amount →</a
			>
		</Text>
	</Stack>
</Container>

<div class="feedback-strip">
	{#if eventPhotos.length > 0}
		<div>
			<PhotoStrip
				photos={eventPhotos}
				height="320px"
				autoplayInterval={6000}
				ariaLabel="VizChitra 2025 moments"
			/>
		</div>
	{/if}

	<div class="feedback-inner">
		<h2 class="feedback-heading">What attendees told us after VizChitra 2025</h2>

		<p class="feedback-context">How was your overall experience?</p>
		<div class="stacked-bar">
			<div
				class="bar-segment"
				style="width: 25%; background: oklch(96% 0.03 354);"
				title="Far exceeded expectations (25%)"
			></div>
			<div
				class="bar-segment"
				style="width: 32%; background: oklch(84% 0.12 354);"
				title="Better than expected (32%)"
			></div>
			<div
				class="bar-segment"
				style="width: 25%; background: oklch(66% 0.18 354);"
				title="Met expectations (25%)"
			></div>
			<div
				class="bar-segment"
				style="width: 17%; background: oklch(46% 0.17 354);"
				title="Met some expectations (17%)"
			></div>
			<div
				class="bar-segment"
				style="width: 1%; background: oklch(36% 0.15 354);"
				title="Did not meet (1%)"
			></div>
		</div>
		<div class="bar-legend">
			<span class="legend-item"
				><span class="legend-dot" style="background: oklch(96% 0.03 354);"></span> Far exceeded (25%)</span
			>
			<span class="legend-item"
				><span class="legend-dot" style="background: oklch(84% 0.12 354);"></span> Better than expected
				(32%)</span
			>
			<span class="legend-item"
				><span class="legend-dot" style="background: oklch(66% 0.18 354);"></span> Met expectations (25%)</span
			>
			<span class="legend-item"
				><span class="legend-dot" style="background: oklch(46% 0.17 354);"></span> Met some (17%)</span
			>
		</div>

		<h3 class="feedback-subheading">What they liked most</h3>

		<div class="quote-rotator">
			{#key quoteIndex}
				<div class="quote-anim">
					<p class="quote-rotating">{'\u201C'}{currentQuote.text}{'\u201D'}</p>
				</div>
			{/key}
		</div>

		<button
			class="video-thumbnail"
			onclick={() => (videoOpen = true)}
			aria-label="Watch VizChitra 2025 recap video"
		>
			<img
				src="/images/events/recap-2025-thumbnail.webp"
				alt="VizChitra 2025 Recap"
				class="video-thumbnail-img"
			/>
			<div class="video-play-overlay">
				<svg viewBox="0 0 80 80" width="80" height="80">
					<circle cx="40" cy="40" r="38" fill="white" opacity="0.9" />
					<polygon
						points="32,24 32,56 58,40"
						fill="var(--color-viz-pink-solid, oklch(46% 0.17 354))"
					/>
				</svg>
				<p class="video-play-text">Watch our 2025 Film</p>
			</div>
		</button>
	</div>
</div>

{#if videoOpen}
	<div
		class="video-lightbox"
		onclick={() => (videoOpen = false)}
		onkeydown={(e) => e.key === 'Escape' && (videoOpen = false)}
		role="dialog"
		tabindex="-1"
	>
		<div class="video-lightbox-inner" onclick={(e) => e.stopPropagation()}>
			<button
				class="video-lightbox-close"
				onclick={() => (videoOpen = false)}
				aria-label="Close video">✕</button
			>
			<div class="video-lightbox-iframe">
				<iframe
					src="https://www.youtube.com/embed/{videoId}?autoplay=1"
					title="VizChitra 2025 Recap"
					allow="autoplay; encrypted-media; picture-in-picture"
					allowfullscreen
				></iframe>
			</div>
		</div>
	</div>
{/if}

<Container>
	<Stack>
		<!-- ── What's On ─────────────────────────────────────────────────── -->

		<!-- <Heading tag="h2" class="font-normal">
			<Slanted color="pink" textContent="WHAT'S ON" />
		</Heading> -->

		<!-- Workshop Day -->
		<Stack>
			<Heading tag="h2" class="font-normal">
				<Slanted color="pink" textContent="WORKSHOP DAY" />
				<span> on Friday, 03 July 2026</span>
			</Heading>
			<Text>
				<!-- <ColorSpan color="black">Workshop Day on July 3<sup>rd</sup>, 2026 (Friday)</ColorSpan>: -->
				Three hours, hands-on
				<ColorSpan color="pink">Workshop</ColorSpan> facilitated by leading practitioners at Bangalore
				International Centre (BIC) & Underline Center.
			</Text>
			{@render sessionRow('Workshops')}
		</Stack>

		<DividerCurves />

		<!-- Conference Day -->
		<Stack>
			<Heading tag="h2" class="font-normal">
				<Slanted color="pink" textContent="CONFERENCE DAY" />
				<span> on Saturday, 04 July 2026</span>
			</Heading>
			<Text type="body">
				<!-- <ColorSpan color="black">Conference Day on July 4<sup>th</sup>, 2026 (Saturday)</ColorSpan>: -->
				Full day of sessions including
				<ColorSpan color="blue">Talks</ColorSpan>,
				<ColorSpan color="teal">Dialogues</ColorSpan>, and the
				<ColorSpan color="orange">Exhibition</ColorSpan> at Bangalore International Centre (BIC), Bengaluru.
				Can't make it to Bengaluru? A virtual pass streams the day live.
			</Text>
			{@render sessionRow('Talks')}
			{@render sessionRow('Dialogues')}
			{@render sessionRow('Exhibition')}
		</Stack>
	</Stack>
</Container>

<Container>
	<Stack>
		<!-- ── How to Attend ─────────────────────────────────────────────── -->
		<Heading tag="h2" class="font-normal" align="center">
			<Slanted color="orange" textContent="HOW TO ATTEND" />
		</Heading>
		<Text type="body" align="center">
			Be there in person in Bengaluru, or join online from anywhere in the world.
		</Text>

		<div class="attend-grid">
			<div class="attend-card attend-pink">
				<h3 class="attend-title">In person · Bengaluru</h3>
				<ul class="attend-list">
					<li>Conference Day, 4 July, at the BIC</li>
					<li>Talks, Dialogues and the Exhibition</li>
					<li>Add a hands-on Workshop separately</li>
				</ul>
				<a class="attend-btn" href="https://tickets.vizchitra.com" target="_blank" rel="noopener"
					>🎟️ Get in-person tickets →</a
				>
			</div>
			<div class="attend-card attend-teal">
				<h3 class="attend-title">Online · From anywhere</h3>
				<ul class="attend-list">
					<li>Stream the conference live</li>
					<li>Join from any city or country</li>
					<li>Virtual pass at ₹1,299</li>
				</ul>
				<a class="attend-btn" href="https://tickets.vizchitra.com" target="_blank" rel="noopener"
					>💻 Get a virtual pass →</a
				>
			</div>
		</div>

		<Text type="body" align="center">
			Not attending but want to back VizChitra?
			<a
				href="https://tickets.vizchitra.com/contribute"
				target="_blank"
				rel="noopener"
				class="text-viz-pink-dark font-bold underline decoration-2 underline-offset-2"
				>Contribute any amount →</a
			>
		</Text>
	</Stack>
</Container>

<SponsorStrip />

<div class="sponsor-banner">
	<div class="sponsor-banner-inner">
		<h2 class="sponsor-banner-heading">Sponsor VizChitra 2026</h2>
		<p class="sponsor-banner-text">
			Put your organisation in the room where India's data visualization community comes together.
			Sponsorship starts at ₹50,000.
		</p>
		<a href="/2026/sponsorship" class="sponsor-banner-btn">View Sponsorship Packages →</a>
	</div>
</div>

<Container>
	<Stack>
		<!-- ── Browse Submissions ─────────────────────────────────────────── -->

		<Heading tag="h2" class="font-normal">
			<Slanted color="blue" textContent="BROWSE SUBMISSIONS" />
		</Heading>

		<Text type="body">
			We received over 150 submissions across four formats—<ColorSpan color="blue">Talks</ColorSpan
			>,
			<ColorSpan color="teal">Dialogues</ColorSpan>,
			<ColorSpan color="pink">Workshops</ColorSpan>, and
			<ColorSpan color="orange">Exhibition</ColorSpan>. Browse all submitted proposals below.
		</Text>

		<Cluster justify="start">
			<Button href="/2026/submissions" color="blue" size="lg">📋 View all Submissions →</Button>
		</Cluster>
	</Stack>
</Container>

<style>
	/* ── Desktop layout ─────────────────────────────────────────────── */

	.type-row {
		display: flex;
		align-items: flex-start;
		gap: 0;
	}

	.type-label {
		flex: none;
		width: 360px;
		position: sticky;
		left: 0;
		z-index: 10;
	}

	.progress-track {
		position: relative;
		height: 8px;
		background: #e0e0e0;
		border-radius: 999px;
		margin: 4px 0 8px;
		margin-left: 376px;
		max-width: 200px;
	}

	.progress-thumb {
		position: absolute;
		top: 0;
		height: 100%;
		background: #444;
		border-radius: 999px;
		transition:
			left 300ms ease,
			width 300ms ease;
	}

	.sessions-scroll {
		display: flex;
		overflow-x: auto;
		padding-bottom: 0.75rem;
		padding-left: 16px;
		padding-right: 2rem;
		scroll-snap-type: x mandatory;
		scroll-padding-left: 16px;
		scrollbar-width: none;
		cursor:
			url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='28' height='28' viewBox='0 0 24 24' fill='none' stroke='%23666' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M5 9l-3 3 3 3'/%3E%3Cpath d='M9 5l3-3 3 3'/%3E%3Cpath d='M15 19l-3 3-3-3'/%3E%3Cpath d='M19 9l3 3-3 3'/%3E%3Cline x1='2' y1='12' x2='22' y2='12'/%3E%3Cline x1='12' y1='2' x2='12' y2='22'/%3E%3C/svg%3E")
				14 14,
			grab;
	}

	.sessions-scroll:global(.is-dragging) {
		cursor: grabbing;
		scroll-snap-type: none;
		user-select: none;
	}

	.sessions-scroll::-webkit-scrollbar {
		display: none;
	}

	.session-card-wrap {
		flex: none;
		width: 360px;
		margin-left: -48px;
		scroll-snap-align: start;
		transition: margin 500ms cubic-bezier(0.4, 0, 0.2, 1);
	}

	.session-card-wrap:first-child {
		margin-left: 0;
	}

	.sessions-scroll:hover .session-card-wrap:not(:first-child),
	.sessions-scroll:focus-within .session-card-wrap:not(:first-child) {
		margin-left: 8px;
	}

	/* ── Hero info & actions ───────────────────────────────────────── */

	.hero-info {
		display: flex;
		justify-content: center;
		gap: 2rem;
		flex-wrap: wrap;
	}

	.hero-info-item {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		font-size: 1.2rem;
	}

	.hero-info-icon {
		font-size: 1.4rem;
	}

	.hero-actions {
		display: flex;
		gap: 1rem;
		padding-top: 0.5rem;
	}

	.hero-btn {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 0.75rem;
		width: 50%;
		padding: 1.25rem 2rem;
		border-radius: 4px;
		text-decoration: none;
		color: white;
		transition:
			transform 0.3s ease,
			box-shadow 0.3s ease;
	}

	.hero-btn:hover {
		transform: translateY(-2px);
		box-shadow: 0 12px 30px rgba(0, 0, 0, 0.15);
	}

	.hero-btn-pink {
		background: var(--color-viz-pink-solid);
	}

	.hero-btn-blue {
		background: var(--color-viz-blue-solid);
	}

	.hero-btn-icon {
		font-size: 1.5rem;
	}

	.hero-btn-text {
		font-family: var(--font-display);
		font-size: 1.3rem;
		font-weight: 800;
		letter-spacing: 0.02em;
	}

	@media (max-width: 768px) {
		.hero-actions {
			flex-direction: column;
		}

		.hero-btn {
			width: 100%;
		}
	}

	/* ── Feedback strip ────────────────────────────────────────────── */

	.feedback-strip {
		background: oklch(26% 0.13 354);
		color: white;
		padding: 0 0 1.5rem;
		margin: 0;
		width: 100vw;
		position: relative;
		left: 50%;
		right: 50%;
		margin-left: -50vw;
		margin-right: -50vw;
	}

	.feedback-inner {
		max-width: 1200px;
		margin: 0 auto;
		padding: 0 2rem;
	}

	.feedback-heading {
		font-family: var(--font-display);
		font-size: 1.8rem;
		font-weight: 800;
		margin: 2rem 0 2rem;
		text-align: center;
	}

	.feedback-subheading {
		font-family: var(--font-display);
		font-size: 1.3rem;
		font-weight: 700;
		margin: 2.5rem 0 1rem;
		opacity: 0.7;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		text-align: center;
	}

	.feedback-context {
		font-size: 1rem;
		opacity: 0.6;
		margin: 0 0 0.5rem;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		text-align: center;
		font-weight: 600;
	}

	.stacked-bar {
		display: flex;
		height: 28px;
		border-radius: 4px;
		overflow: hidden;
		gap: 2px;
		max-width: 800px;
		margin: 0 auto;
	}

	.bar-segment {
		transition: width 0.6s ease;
	}

	.bar-legend {
		display: flex;
		gap: 1.5rem;
		flex-wrap: wrap;
		margin-top: 0.75rem;
		justify-content: center;
	}

	.legend-item {
		display: flex;
		align-items: center;
		gap: 0.4rem;
		font-size: 0.8rem;
		opacity: 0.7;
	}

	.legend-dot {
		width: 10px;
		height: 10px;
		border-radius: 2px;
		flex-shrink: 0;
	}

	/* ── Rotating quote ────────────────────────────────────────────── */

	.quote-rotator {
		min-height: 130px;
		max-width: 700px;
		margin: 0 auto;
		position: relative;
		overflow: hidden;
		text-align: center;
	}

	.quote-anim {
		animation: quoteFadeUp 6s ease both;
	}

	@keyframes quoteFadeUp {
		0% {
			opacity: 0;
			transform: translateY(12px);
		}
		5% {
			opacity: 1;
			transform: translateY(0);
		}
		90% {
			opacity: 1;
			transform: translateY(0);
		}
		100% {
			opacity: 0;
			transform: translateY(-8px);
		}
	}

	.quote-rotating {
		font-family: var(--font-display);
		font-size: 1.4rem;
		font-weight: 500;
		line-height: 1.5;
		font-style: italic;
		color: #eee;
		margin: 0 0 0.5rem;
	}

	.quote-rotating-attr {
		font-family: var(--font-display);
		font-size: 0.85rem;
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.08em;
		opacity: 0.45;
		margin: 0;
		color: #ccc;
		text-align: right;
	}

	.video-thumbnail {
		position: relative;
		display: block;
		width: 100%;
		max-width: 700px;
		margin: 2rem auto 0;
		cursor: pointer;
		border: none;
		background: none;
		padding: 0;
		border-radius: 8px;
		overflow: hidden;
	}

	.video-thumbnail-img {
		width: 100%;
		display: block;
		border-radius: 8px;
		transition: transform 0.3s ease;
		max-height: 350px;
		object-fit: cover;
	}

	.video-thumbnail:hover .video-thumbnail-img {
		transform: scale(1.02);
	}

	.video-play-overlay {
		position: absolute;
		inset: 0;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: 0.75rem;
	}

	.video-play-text {
		font-family: var(--font-display);
		font-size: 1.3rem;
		font-weight: 800;
		color: white;
		margin: 0;
		text-shadow: 0 2px 8px rgba(0, 0, 0, 0.5);
	}

	.video-lightbox {
		position: fixed;
		inset: 0;
		z-index: 100;
		background: rgba(0, 0, 0, 0.85);
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 2rem;
	}

	.video-lightbox-inner {
		position: relative;
		width: 100%;
		max-width: 1100px;
	}

	.video-lightbox-close {
		position: absolute;
		top: -2.5rem;
		right: 0;
		background: none;
		border: none;
		color: white;
		font-size: 1.5rem;
		cursor: pointer;
		padding: 0.5rem;
	}

	.video-lightbox-iframe {
		position: relative;
		width: 100%;
		padding-bottom: 56.25%;
	}

	.video-lightbox-iframe iframe {
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		border: none;
		border-radius: 8px;
	}

	/* ── How to Attend cards ───────────────────────────────────────── */

	.attend-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(min(100%, 280px), 1fr));
		gap: 1.5rem;
		align-items: stretch;
	}

	.attend-card {
		display: flex;
		flex-direction: column;
		border: 2px solid var(--card-border);
		border-radius: 0.75rem;
		background: rgba(255, 255, 255, 0.8);
		padding: 1.5rem 1.75rem;
	}

	.attend-pink {
		--card-border: var(--color-viz-pink-dark);
		--card-accent: var(--color-viz-pink-solid);
	}

	.attend-teal {
		--card-border: var(--color-viz-teal-dark);
		--card-accent: var(--color-viz-teal-dark);
	}

	.attend-title {
		font-family: var(--font-display);
		font-weight: 800;
		font-size: 1.25rem;
		color: var(--card-border);
		margin: 0 0 0.5rem;
	}

	.attend-list {
		list-style: disc;
		margin: 0 0 1.5rem;
		padding-left: 1.15rem;
		display: flex;
		flex-direction: column;
		gap: 0.4rem;
		flex: 1 1 auto;
		color: var(--color-viz-grey-dark);
	}

	.attend-list li {
		line-height: 1.4;
	}

	.attend-btn {
		align-self: flex-start;
		margin-top: auto;
		display: inline-flex;
		align-items: center;
		gap: 0.4rem;
		background: var(--card-accent);
		color: #fff;
		font-weight: 600;
		font-size: 1rem;
		padding: 0.7rem 1.3rem;
		border-radius: 8px;
		text-decoration: none;
		transition:
			transform 0.2s ease,
			box-shadow 0.2s ease;
	}

	.attend-btn:hover {
		transform: translateY(-2px);
		box-shadow: 0 6px 18px rgba(0, 0, 0, 0.15);
	}

	/* ── Sponsorship banner ────────────────────────────────────────── */

	.sponsor-banner {
		background:
			linear-gradient(to right, oklch(36% 0.15 354 / 0.85), oklch(46% 0.17 354 / 0.8)),
			url('/images/photos/packed-auditorium.jpg') center / cover no-repeat;
		padding: 3.5rem 0;
		width: 100vw;
		position: relative;
		left: 50%;
		right: 50%;
		margin-left: -50vw;
		margin-right: -50vw;
		text-align: center;
	}

	.sponsor-banner-inner {
		max-width: 700px;
		margin: 0 auto;
		padding: 0 2rem;
	}

	.sponsor-banner-heading {
		font-family: var(--font-display);
		font-size: 2rem;
		font-weight: 800;
		color: white;
		margin: 0 0 0.75rem;
	}

	.sponsor-banner-text {
		font-size: 1.1rem;
		line-height: 1.5;
		color: rgba(255, 255, 255, 0.9);
		margin: 0 0 1.5rem;
	}

	.sponsor-banner-btn {
		display: inline-block;
		background: white;
		color: oklch(36% 0.15 354);
		font-family: var(--font-display);
		font-size: 1.2rem;
		font-weight: 800;
		padding: 1rem 2.5rem;
		border-radius: 4px;
		text-decoration: none;
		transition:
			transform 0.3s ease,
			box-shadow 0.3s ease;
	}

	.sponsor-banner-btn:hover {
		transform: translateY(-2px);
		box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
	}

	/* ── Mobile layout ──────────────────────────────────────────────── */

	@media (max-width: 768px) {
		/* The whole row scrolls — CallCard becomes the first scrollable card */
		.type-row {
			overflow-x: auto;
			scroll-snap-type: x mandatory;
			scrollbar-width: none;
		}

		.type-row::-webkit-scrollbar {
			display: none;
		}

		.type-label {
			position: static;
			width: 280px;
			z-index: auto;
			scroll-snap-align: start;
			flex-shrink: 0;
		}

		.progress-track {
			margin-left: 0;
		}

		.sessions-scroll {
			display: contents;
		}

		.session-card-wrap {
			width: 280px;
			margin-left: 8px;
		}

		.session-card-wrap:first-child {
			margin-left: 8px;
		}
	}
</style>
