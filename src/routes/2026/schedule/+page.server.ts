import type { PageServerLoad } from './$types';
import { resolveSchedule } from '$lib/utils/schedule';
import { resolveAllSessions, type SessionData } from '$lib/utils/sessions';

export const prerender = true;

export const load: PageServerLoad = async () => {
	const schedule = resolveSchedule();
	const { sessions } = resolveAllSessions();

	// Index sessions by slug for O(1) lookup at render time.
	const sessionsBySlug: Record<
		string,
		Pick<
			SessionData,
			| 'slug'
			| 'sessionType'
			| 'title'
			| 'speakerName'
			| 'designation'
			| 'organisation'
			| 'subtitle'
			| 'venue'
		>
	> = {};
	for (const s of sessions) {
		sessionsBySlug[s.slug] = {
			slug: s.slug,
			sessionType: s.sessionType,
			title: s.title,
			speakerName: s.speakerName,
			designation: s.designation,
			organisation: s.organisation,
			subtitle: s.subtitle,
			venue: s.venue
		};
	}

	return {
		schedule,
		sessionsBySlug,
		pageMeta: {
			title: 'Schedule | VizChitra 2026',
			description:
				'The full schedule for VizChitra 2026 conference day — talks, dialogues, and exhibitions across four parallel tracks.',
			noSuffix: true
		}
	};
};
