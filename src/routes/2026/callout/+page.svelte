<script lang="ts">
	import {
		Grid,
		FullBleed,
		Card,
		Button,
		DividerCurves,
		Text,
		Prose,
		Header,
		Container,
		Cluster,
		Stack
	} from '$lib/components';
</script>

<Header title="Call for Exhibition" banner="curve" />

<Container>
	<Stack>
		<Prose color="orange">
			<h1>Call for Exhibition</h1>
			<p>
				VizChitra 2026 invites submissions for <strong>Data, Otherwise</strong>, an exhibition of
				contemporary data visualization work focused on climate and ecological change, especially
				work connected to India and South Asia.
			</p>
			<p>
				The exhibition will be organized in a gallery setup on the conference day (4th July, 2026). <strong
				>
					We’re looking for projects that stretch what data visualization can be
				</strong>: not only charts and screens, but experiences that people can walk through, listen
				to, touch, or sit with.
			</p>
		</Prose>

		<Text type="caption">Open call closed <strong>15 Feb 2025</strong> · Eight works selected</Text>
		<Cluster justify="start">
			<Button href="/2026/submissions" color="blue">View all Submissions</Button>
			<Button href="/2026/exhibition" color="orange">Go to Data, Otherwise</Button>
		</Cluster>

		<DividerCurves />

		<Prose color="orange">
			<h2><strong>DATA, OTHERWISE</strong>: Topics for Exibhition</h2>
			<p>
				The exhibition is organized around three interconnected topics. You can use them as starting
				points, not strict categories:
			</p>
		</Prose>

		<FullBleed paddingX="xl">
			<!-- <Grid minWidth="20rem" maxColumns={3} gap={6}> -->
			<Cluster>
				<Card variant="bordered" color="orange" title="More-than-Human Data">
					<p>
						Data made with, through, or about non-human worlds like flora, fauna, rivers, soil,
						microbes, weather systems and more, where sensing and meaning extend beyond people and
						instruments.
					</p>
				</Card>

				<Card variant="bordered" color="orange" title="Living with Climate Change">
					<p>
						Climate as lived experience, for example heat as exhaustion, rain as anxiety, or smoke
						as grief, where feelings, memory, and the body become part of what data can hold and
						communicate.
					</p>
				</Card>

				<Card variant="bordered" color="orange" title="Adaptation & Resilience">
					<p>
						Everyday examples of coping and changing for people, communities, and environments as
						they adjust, resist, or rebuild. We’re interested in what gets counted as “resilience,”
						and what stays out of view.
					</p>
				</Card>
			</Cluster>
			<!-- </Grid> -->
		</FullBleed>

		<DividerCurves />

		<Prose color="orange">
			<h2>
				<strong>How to shape your exhibition proposal</strong>
			</h2>
			<p>These prompts are here to support you as you draft your submission.</p>
			<ol>
				<li>
					<strong>What’s the idea in one line?</strong> -- What are you trying to show, question, or make
					people notice?
				</li>
				<li>
					<strong>What counts as “data” in your project?</strong> -- Data can be numbers, but also photos,
					interviews, notes, drawings, archives, maps, WhatsApp responses, sound recordings, or sensor
					readings. Tell us what you’ll use, and why.
				</li>
				<li>
					<strong>Where will the data come from? (your method)</strong> -- How will you collect it (or
					how have you collected it)? For instance: field visits, conversations, workshops, observation
					diaries, scraping public sources, simple sensors.
				</li>
				<li>
					<strong>How will you turn it into an artwork / experience?</strong> -- Will it be a print, poster
					series, screen-based piece, installation, projection, sound work, interactive station, or something
					else? Reference images help, but are optional.
				</li>
				<li>
					<strong>Why does it matter here?</strong> -- How does your project connect to ecology and everyday
					life—heat, water, air, floods, food systems, urban change, or more-than-human worlds?
				</li>
				<li>
					<strong>What do you need to make it happen?</strong> -- List essentials like power, table /
					wall space, projector, speakers, internet, sensors, laptop, etc.
				</li>
				<li>
					<strong>Can you finish it in time?</strong> -- Tell us if it’s already made, in progress, or
					a new idea, and outline a simple, realistic timeline.
				</li>
			</ol>

			<div class="notice">
				<p>
					<strong>What makes a strong exhibition proposal? </strong>
				</p>
				<p>
					Strong proposals clearly connect the data, the way it’s gathered, and the form of
					visualization. They also showcase how the work helps audiences notice relationships
					between environments, infrastructures, and lived experience in a fresh way.
				</p>
			</div>
		</Prose>

		<DividerCurves />

		<Prose color="orange">
			<h3>Production &amp; Support</h3>
			<p>
				Selected projects will receive a modest exhibition production budget per project to support
				presentation, installation, and technical integration.
			</p>

			<p>
				This budget is not intended to fully fund large new works, but to help realize proposals in
				dialogue with the curatorial and technical teams. We encourage approaches that are
				adaptable, resource-aware, and responsive to the exhibition context.
			</p>
			<p>
				The curatorial team will work with selected participants to find feasible ways of presenting
				each project within available resources and timelines.
			</p>
			<h3>Fees &amp; Honorarium</h3>
			<p>
				Selected participants will receive an artist fee or honorarium for their participation in
				the exhibition, separate from the production budget.
			</p>
			<h3>Rights &amp; Responsibilities</h3>
			<p>
				Artists retain full copyright and intellectual property rights over their work. By
				participating in the exhibition, selected participants grant the organizers a non-exclusive,
				royalty-free right to document, reproduce, and share images, video, and descriptive text of
				the work for non-commercial purposes related to the conference and exhibition. This includes
				promotion, documentation, academic reporting, and archival use.
			</p>
			<p>
				Participants are responsible for ensuring that all data used in their work is obtained,
				generated, and presented in an ethical and lawful manner. This includes securing informed
				consent where personal, sensitive, or identifiable data is involved, respecting privacy and
				data protection standards, and being transparent about data sources, methods, and
				limitations. Works should avoid harm, misrepresentation, or exploitative data practices,
				particularly when engaging with living subjects, communities, or ecologically sensitive
				contexts.
			</p>
			<p>
				Selected artists are responsible for realizing their projects in line with the approved
				proposal, agreed timelines, and production arrangements, and for working collaboratively
				with the curatorial and technical teams. Any significant changes to the proposed work must
				be communicated and approved in advance.
			</p>
		</Prose>

		<DividerCurves />

		<Text type="caption">Open call closed <strong>15 Feb 2025</strong> · Eight works selected</Text>
		<Cluster justify="start">
			<Button href="/2026/submissions" color="blue">View all Submissions</Button>
			<Button href="/2026/exhibition" color="orange">Go to Data, Otherwise</Button>
		</Cluster>
	</Stack>
</Container>
