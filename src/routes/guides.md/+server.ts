export const prerender = true;
import type { RequestHandler } from './$types';
import { allGuides } from 'content-collections';

// Guide metadata
const guideMetadata = {
	talks: {
		tagline: 'The Narrative Journey',
		description: 'Story-driven presentations rooted in lived experiences',
		order: 0
	},
	dialogues: {
		tagline: 'The Shared Journey',
		description: 'Participant-led conversation exploring shared questions',
		order: 1
	},
	workshops: {
		tagline: 'The Practice Journey',
		description: 'Hands-on session focussed on practice & skill building',
		order: 2
	},
	exhibition: {
		tagline: 'The Immersive Journey',
		description: 'Immersive, data-driven work that invite exploration',
		order: 3
	},
	panels: {
		tagline: 'The Collective Journey',
		description: 'Moderated discussions that brings multiple perspectives',
		order: 4
	}
};

const guideOrder = ['talks', 'dialogues', 'workshops', 'exhibition', 'panels'];

// Function to strip YAML frontmatter from markdown content
function stripFrontmatter(content: string): string {
	const frontmatterRegex = /^---\n[\s\S]*?\n---\n/;
	return content.replace(frontmatterRegex, '').trim();
}

// Section name mapping
const sectionNames: Record<string, string> = {
	overview: 'Overview',
	proposal: 'Proposal',
	evaluation: 'Evaluation',
	preparation: 'Preparation',
	delivery: 'Delivery',
	followup: 'Followup',
	resources: 'Resources'
};

export const GET: RequestHandler = async () => {
	// Group guides by guideId
	const guidesByType = guideOrder.map((guideId) => {
		const sections = allGuides
			.filter((g) => g.guideId === guideId)
			.sort((a, b) => a.order - b.order);
		return { guideId, sections };
	});

	// Build the text content
	let text = `# VizChitra: Our Five Guides

Guides : Talks | Dialogues | Workshops | Exhibition | Panels
Format: Combined Plain-Text Context for Augmentation.
Content: Complete guides for preparing and delivering VizChitra sessions
---

## About These Guides

These guides are designed to support both you and us as we move from first idea to final delivery for your VizChitra session.

They bring together best practices, practical tips, and curated guidelines to help you prepare, refine, and share your work with confidence across the entire journey. Think of this as a working reference you can return to at every stage.

These are living documents. We will continue to update them as questions emerge and insights evolve. If you have suggestions or improvements, please open an issue or submit a pull request on our GitHub repository at https://github.com/vizchitra/website.

## Our Five Guides

At VizChitra, each way of participating reflects a distinct approach to engaging with data. Talks center narrative and lived experience. Workshops emphasize learning and skill-building through doing. Dialogues create space for shared inquiry. The Exhibition invites immersive, sensory encounters. Panels bring multiple perspectives into thoughtful tension.

Together, these five approaches reflect how we learn and make meaning — through story, through practice, through conversation, through experience, and through perspectives.

---

`;

	// Add each guide
	for (const { guideId, sections } of guidesByType) {
		const metadata = guideMetadata[guideId as keyof typeof guideMetadata];
		const guideName = guideId.charAt(0).toUpperCase() + guideId.slice(1);

		text += `## ${guideName} - ${metadata.tagline}\n\n`;
		text += `${metadata.description}\n\n`;

		// Add each section
		for (const section of sections) {
			const sectionName = sectionNames[section.section] || section.section;
			const draftMarker = section.draft ? ' [DRAFT]' : '';
			text += `### ${sectionName}${draftMarker}\n\n`;

			if (section.draft) {
				text += `⚠️ This section is currently being written and may be incomplete.\n\n`;
			}

			// Strip frontmatter and add content
			const cleanContent = stripFrontmatter(section.content);
			text += `${cleanContent}\n\n`;
		}

		text += `---\n\n`;
	}

	return new Response(text, {
		headers: {
			'Content-Type': 'text/plain; charset=utf-8',
			'Cache-Control': 'public, max-age=3600'
		}
	});
};
