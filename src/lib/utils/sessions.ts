import { parse as parseToml } from 'smol-toml';
import sessionsRaw from '../../../content/2026/data/sessions.toml?raw';
import scheduleRaw from '../../../content/2026/data/schedule.toml?raw';

/** Color mapping for session types, used across all session components */
export const sessionColorMap: Record<string, 'blue' | 'teal' | 'pink' | 'orange' | 'yellow'> = {
	Talks: 'blue',
	Dialogues: 'teal',
	Workshops: 'pink',
	Exhibition: 'orange',
	Activities: 'yellow'
};

export interface Speaker {
	name: string;
	designation: string;
	organisation: string;
	about: string;
	image: string;
	social: Record<string, string>;
	moderator?: boolean;
}

export interface SessionData {
	slug: string;
	sessionType: string;
	date: string;
	time: string;
	slot: string;
	venue: string;
	title: string;
	subtitle: string;
	shortDescription: string;
	longDescription: string;
	speakers: Speaker[];
	display: boolean;
	tbd: boolean;
	soldOut?: boolean;
	sponsored?: boolean;
	inviteOnly?: boolean;
	order?: number;
	pageReady?: boolean;
	ticketCode?: string;
	exhibitNumber?: number;
	artworkHeroImage?: string;
}

export function getSessionOrder(s: Pick<SessionData, 'order'>): number {
	return s.order ?? Number.POSITIVE_INFINITY;
}

interface SlotTiming {
	date: string;
	time: string;
	slot: string;
}

/** Build a slug → timing index from the combined schedule file. */
function buildTimingIndex(): Record<string, SlotTiming> {
	const index: Record<string, SlotTiming> = {};
	const parsed = parseToml(scheduleRaw) as {
		day: Array<{ day: string; slot: Array<{ session?: string; start: string; end: string }> }>;
	};
	for (const dayEntry of parsed.day) {
		for (const s of dayEntry.slot) {
			if (!s.session) continue;
			const startHour = parseInt(s.start.split(':')[0], 10);
			index[s.session] = {
				date: dayEntry.day,
				time: `${s.start} - ${s.end}`,
				slot: startHour < 13 ? 'morning' : 'afternoon'
			};
		}
	}
	return index;
}

/** Derive tbd from stored fields (not persisted in JSON to keep data clean) */
function withTbd(s: Omit<SessionData, 'tbd'>): SessionData {
	return { ...s, tbd: (!s.title && !s.speakers?.[0]?.name) || !s.display };
}

const SESSIONS_FILE_PATH = 'content/2026/data/sessions.toml';

function parseSessions(): Omit<SessionData, 'tbd'>[] {
	return (parseToml(sessionsRaw) as unknown as { session: Omit<SessionData, 'tbd'>[] }).session;
}

function applyDevOverrides(raw: Omit<SessionData, 'tbd'>[]): Omit<SessionData, 'tbd'>[] {
	const g = globalThis as Record<string, unknown>;
	const fileOverrides = (
		g.__studioDataOverrides as Record<string, Record<string, Record<string, unknown>>> | undefined
	)?.[SESSIONS_FILE_PATH];
	if (!fileOverrides) return raw;
	return raw.map((item) => {
		const patch = fileOverrides[item.slug];
		return patch ? ({ ...item, ...patch } as Omit<SessionData, 'tbd'>) : item;
	});
}

/** Get all sessions (confirmed + TBD placeholders) and available formats */
export function resolveAllSessions(): { sessions: SessionData[]; formats: string[] } {
	const timing = buildTimingIndex();
	const raw = applyDevOverrides(parseSessions()).map((s) => ({
		date: '',
		time: '',
		slot: '',
		...timing[s.slug],
		...s
	}));
	const sessions = raw.map(withTbd);
	const formats = [...new Set(sessions.map((s) => s.sessionType))];
	return { sessions, formats };
}

/** Get only confirmed sessions (no TBD) */
export function resolveConfirmedSessions(): SessionData[] {
	const timing = buildTimingIndex();
	return applyDevOverrides(parseSessions())
		.map((s) => ({ date: '', time: '', slot: '', ...timing[s.slug], ...s }))
		.map(withTbd)
		.filter((s) => !s.tbd);
}
