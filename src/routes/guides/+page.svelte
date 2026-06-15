<script lang="ts">
	import { Header, PatternRough, Container, FullBleed, Stack, Prose } from '$lib/components';

	type CardColor = 'pink' | 'blue' | 'teal' | 'yellow' | 'orange';

	interface DeckCard {
		title: string;
		tagline: string;
		description: string;
		color: CardColor;
		href: string;
		angle: number;
	}

	const cards: DeckCard[] = [
		{
			title: 'TALKS',
			tagline: 'The Narrative Journey',
			description: 'Story-driven presentations rooted in lived experiences',
			color: 'blue',
			href: '/guides/talks',
			angle: 50
		},
		{
			title: 'DIALOGUES',
			tagline: 'The Shared Journey',
			description: 'Participant-led conversation exploring shared questions',
			color: 'teal',
			href: '/guides/dialogues',
			angle: 120
		},
		{
			title: 'WORKSHOPS',
			tagline: 'The Practice Journey',
			description: 'Hands-on session focussed on practice & skill building',
			color: 'pink',
			href: '/guides/workshops',
			angle: 146
		},
		{
			title: 'EXHIBITION',
			tagline: 'The Immersive Journey',
			description: 'Immersive, data-driven work that invite exploration',
			color: 'orange',
			href: '/guides/exhibition',
			angle: 23
		},
		{
			title: 'PANELS',
			tagline: 'The Collective Journey',
			description: 'Moderated discussions that brings multiple perspectives',
			color: 'yellow',
			href: '/guides/panels',
			angle: 132
		}
	];

	// Map color names to CSS variables
	const colorVars: Record<CardColor, string> = {
		pink: 'var(--color-viz-pink)',
		blue: 'var(--color-viz-blue)',
		teal: 'var(--color-viz-teal)',
		yellow: 'var(--color-viz-yellow)',
		orange: 'var(--color-viz-orange)'
	};

	const textColor: Record<CardColor, string> = {
		pink: 'text-pink-900',
		blue: 'text-blue-900',
		teal: 'text-teal-900',
		yellow: 'text-yellow-900',
		orange: 'text-orange-900'
	};
</script>

<Header title="Guides for VizChitra" banner="blob"></Header>

<Container>
	<Stack>
		<Prose>
			<h1>Guides</h1>
			<p>
				These guides are designed to support both you and us as we move from first idea to final
				delivery for your VizChitra session.
			</p>
			<p>
				They bring together best practices, practical tips, and curated guidelines to help you
				prepare, refine, and share your work with confidence across the entire journey. Think of
				this as a working reference you can return to at every stage.
			</p>
			<p>
				These are living documents. We will continue to update them as questions emerge and insights
				evolve. If you have suggestions or improvements, please open an issue or submit a pull
				request on <a href="https://github.com/vizchitra/website">our GitHub repository</a>.
			</p>
			<div id="list"></div>
			<h2>Our Five Guides</h2>
			<p>
				At VizChitra, each way of participating reflects a distinct approach to engaging with data.
				Talks center narrative and lived experience. Workshops emphasize learning and skill-building
				through doing. Dialogues create space for shared inquiry. The Exhibition invites immersive,
				sensory encounters. Panels bring multiple perspectives into thoughtful tension
			</p>
			<p>
				Together, these five approaches reflect how we learn and make meaning — through story,
				through practice, through conversation, through experience, and through perspectives.
			</p>
		</Prose>
		<FullBleed paddingY="md">
			<div class="deck">
				<div class="deck-inner">
					{#each cards as card}
						<a href={card.href} class="deck-card row-span-3 grid grid-rows-subgrid hover:scale-102">
							<PatternRough
								color={colorVars[card.color]}
								fillStyle="cross-hatch"
								fillWeight={0.5}
								hachureAngle={card.angle}
								opacity={0.4}
							/>
							<div class="card-content self-start py-1 text-xs font-medium {textColor[card.color]}">
								VIZCHITRA GUIDES
							</div>
							<h2
								class="font-display-sans card-content m-0 self-start text-3xl font-bold {textColor[
									card.color
								]}"
							>
								{card.title}
							</h2>
							<h3 class="text-viz-black text-xl">{card.tagline}</h3>
							<p
								class="text-md card-content text-viz-grey-dark max-w-sm self-end justify-self-end bg-white/20 text-right font-medium italic"
							>
								{card.description}
							</p>
						</a>
					{/each}
				</div>
			</div>
		</FullBleed>

		<Prose>
			All the five guides are also available in combined plain text format at <a
				href="/guides.md"
				data-sveltekit-reload>vizchitra.com/guides.md</a
			>
		</Prose>
	</Stack>
</Container>

<style>
	.deck {
		container-type: inline-size;
		width: 100%;
	}

	/* Mobile: Simple flex column */
	.deck-inner {
		display: flex;
		flex-direction: column;
		gap: 0rem;
	}

	.deck-card {
		position: relative;
		min-height: 20rem;
		padding: 2rem 1.5rem;
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.deck-card h3 {
		margin-bottom: auto;
	}

	.deck-inner p {
		text-align: right;
		max-width: 25ch;
	}

	.card-content {
		position: relative;
		z-index: 1;
	}

	/* Desktop: Grid with slanted edges */
	@container (min-width: 60rem) {
		.deck-inner {
			display: grid;
			grid-template-columns: repeat(5, 1fr);
			grid-template-rows: auto auto minmax(20rem, 1fr) auto;
			gap: 0;
		}

		.deck-card {
			min-height: auto;
			padding: 1.5rem 2rem;
			margin-left: -1rem;
			clip-path: polygon(1rem 0, 100% 0, calc(100% - 1rem) 100%, 0 100%);
		}

		.deck-card:first-child {
			margin-left: 0;
			clip-path: polygon(0 0, 100% 0, calc(100% - 1rem) 100%, 0 100%);
		}

		.deck-card:last-child {
			clip-path: polygon(1rem 0, 100% 0, 100% 100%, 0 100%);
		}
	}
</style>
