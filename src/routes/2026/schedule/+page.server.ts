import type { PageServerLoad } from './$types';
import { marked } from 'marked';
import { resolveScheduleDays, resolveExhibitions } from '$lib/utils/schedule';
import { resolveAllSessions, type SessionData } from '$lib/utils/sessions';

export const prerender = true;

export const load: PageServerLoad = async () => {
	const days = resolveScheduleDays();
	const { sessions } = resolveAllSessions();
	const exhibitions = resolveExhibitions(sessions);

	// Parse slot descriptions as inline markdown so labels can use **bold** / *italic* / links.
	for (const day of days) {
		for (const slot of day.slots) {
			if (slot.description) slot.description = await marked.parseInline(slot.description);
		}
	}

	// Index sessions by slug for O(1) lookup at render time.
	const sessionsBySlug: Record<string, import('$lib/utils/schedule').SessionLookup> = {};
	for (const s of sessions) {
		sessionsBySlug[s.slug] = {
			slug: s.slug,
			sessionType: s.sessionType,
			title: s.title,
			subtitle: s.subtitle,
			venue: s.venue,
			speakers: s.speakers
		};
	}

	return {
		days,
		sessionsBySlug,
		exhibitions,
		pageMeta: {
			title: 'Schedule | VizChitra 2026',
			description:
				'The full schedule for VizChitra 2026 conference day — talks, dialogues, and exhibitions across four parallel tracks.',
			ogImage: 'https://vizchitra.com/images/preview/preview-2026-schedule.jpg',
			noSuffix: true
		}
	};
};
