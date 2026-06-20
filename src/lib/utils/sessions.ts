import { parse as parseToml } from 'smol-toml';
import sessionsRaw from '../../../content/2026/data/sessions.toml?raw';

/** Color mapping for session types, used across all session components */
export const sessionColorMap: Record<string, 'blue' | 'teal' | 'pink' | 'orange'> = {
	Talks: 'blue',
	Dialogues: 'teal',
	Workshops: 'pink',
	Exhibition: 'orange'
};

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
	speakerName: string;
	designation: string;
	organisation: string;
	speakerAbout: string;
	speakerImage: string;
	display: boolean;
	tbd: boolean;
	soldOut?: boolean;
	order?: number;
	pageReady?: boolean;
	ticketCode?: string;
	exhibitNumber?: number;
	speakerSocial?: string;
	speaker2Name?: string;
	speaker2Designation?: string;
	speaker2Organisation?: string;
	speaker2About?: string;
	speaker2Image?: string;
	speaker2Social?: string;
	artworkHeroImage?: string;
	artworkDetail1Image?: string;
	artworkDetail2Image?: string;
}

export function getSessionOrder(s: Pick<SessionData, 'order'>): number {
	return s.order ?? Number.POSITIVE_INFINITY;
}

/** Derive tbd from stored fields (not persisted in JSON to keep data clean) */
function withTbd(s: Omit<SessionData, 'tbd'>): SessionData {
	return { ...s, tbd: (!s.title && !s.speakerName) || !s.display };
}

const SESSIONS_FILE_PATH = 'content/2026/data/sessions.toml';

function parseSessions(): Omit<SessionData, 'tbd'>[] {
	return (parseToml(sessionsRaw) as { session: Omit<SessionData, 'tbd'>[] }).session;
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
	const raw = applyDevOverrides(parseSessions());
	const sessions = raw.map(withTbd);
	const formats = [...new Set(sessions.map((s) => s.sessionType))];
	return { sessions, formats };
}

/** Get only confirmed sessions (no TBD) */
export function resolveConfirmedSessions(): SessionData[] {
	return applyDevOverrides(parseSessions())
		.map(withTbd)
		.filter((s) => !s.tbd);
}
