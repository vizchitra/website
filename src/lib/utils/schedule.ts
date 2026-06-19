import { parse as parseToml } from 'smol-toml';
import scheduleRaw from '../../../content/2026/data/schedule.toml?raw';
import { sessionColorMap, type SessionData } from './sessions';

export interface ScheduleSlot {
	track: string;
	start: string; // "HH:MM"
	end: string; // "HH:MM"
	type?: string;
	session?: string; // slug into sessions.toml
	label?: string;
	speakerLabel?: string;
}

export interface ScheduleDay {
	day: string; // "YYYY-MM-DD"
	tracks: string[];
	slots: ScheduleSlot[];
}

/** Minimal session fields the schedule needs to render a slot. */
export type SessionLookup = Pick<
	SessionData,
	| 'slug'
	| 'sessionType'
	| 'title'
	| 'speakerName'
	| 'designation'
	| 'organisation'
	| 'subtitle'
	| 'venue'
>;

export type SlotKind = 'session' | 'break' | 'address' | 'sponsored' | 'placeholder';

/** A slot enriched with everything the renderer needs — no lookups left to do. */
export interface ResolvedSlot {
	slot: ScheduleSlot;
	kind: SlotKind;
	color: 'blue' | 'teal' | 'pink' | 'orange' | 'grey';
	title: string;
	speaker?: string;
	role?: string;
	href?: string;
	rowSpan: number;
}

export function resolveSchedule(): ScheduleDay {
	const parsed = parseToml(scheduleRaw) as unknown as {
		day: string;
		tracks: string[];
		slot: ScheduleSlot[];
	};
	return {
		day: parsed.day,
		tracks: parsed.tracks,
		slots: parsed.slot
	};
}

/** Convert "HH:MM" to minutes since midnight. */
export function timeToMinutes(t: string): number {
	const [h, m] = t.split(':').map(Number);
	return h * 60 + m;
}

/** Row index (1-based) for any time aligned to 15-min steps from gridStart. */
export function timeToRow(time: string, gridStart: string): number {
	return Math.floor((timeToMinutes(time) - timeToMinutes(gridStart)) / 15) + 1;
}

/** How many 15-min rows a slot covers. */
export function rowSpan(slot: ScheduleSlot): number {
	const minutes = timeToMinutes(slot.end) - timeToMinutes(slot.start);
	return Math.max(1, Math.round(minutes / 15));
}

/** Grid column for a track (1 = time gutter, 2+ = tracks). */
export function trackColumn(tracks: string[], track: string): number {
	return tracks.indexOf(track) + 2;
}

/** Display-formatted time range. */
export function formatTimeRange(slot: ScheduleSlot): string {
	return `${slot.start}–${slot.end}`;
}

/** Earliest start + latest end across all slots, plus the total 15-min row count. */
export function computeGridBounds(slots: ScheduleSlot[]): {
	gridStart: string;
	gridEnd: string;
	totalRows: number;
} {
	if (slots.length === 0) {
		return { gridStart: '08:00', gridEnd: '19:00', totalRows: 44 };
	}
	const gridStart = slots.reduce((min, s) => (s.start < min ? s.start : min), slots[0].start);
	const gridEnd = slots.reduce((max, s) => (s.end > max ? s.end : max), slots[0].end);
	const totalRows = Math.ceil((timeToMinutes(gridEnd) - timeToMinutes(gridStart)) / 15);
	return { gridStart, gridEnd, totalRows };
}

/** Hour-tick rows for the time gutter (e.g. "10:00", "11:00", …). */
export function computeHourMarks(
	gridStart: string,
	gridEnd: string
): { time: string; row: number }[] {
	const marks: { time: string; row: number }[] = [];
	const startMin = timeToMinutes(gridStart);
	const endMin = timeToMinutes(gridEnd);
	const firstHour = Math.ceil(startMin / 60) * 60;
	for (let m = firstHour; m <= endMin; m += 60) {
		const h = Math.floor(m / 60);
		const time = `${String(h).padStart(2, '0')}:00`;
		marks.push({ time, row: timeToRow(time, gridStart) });
	}
	return marks;
}

/** Resolve a slot to a fully-realised view model — collapses 5+ lookups into one pass. */
export function resolveSlot(
	slot: ScheduleSlot,
	sessionsBySlug: Record<string, SessionLookup>
): ResolvedSlot {
	const session = slot.session ? sessionsBySlug[slot.session] : undefined;
	const t = (slot.type ?? '').toUpperCase();

	let kind: SlotKind;
	let color: ResolvedSlot['color'];

	if (session) {
		kind = 'session';
		color = sessionColorMap[session.sessionType] ?? 'blue';
	} else if (t === 'BREAK' || t === 'ENTRY' || t === 'EXIT') {
		kind = 'break';
		color = 'grey';
	} else if (t === 'STREAM' || t === 'ADDRESS') {
		kind = 'address';
		color = 'grey';
	} else if (t === 'SPONSORED') {
		kind = 'sponsored';
		color = 'orange';
	} else if (t === 'DIALOGUE') {
		kind = 'placeholder';
		color = 'teal';
	} else {
		kind = 'placeholder';
		color = 'grey';
	}

	// Compose the speaker's role from the cfp/cfe fields; drop empty parts so we
	// never render a stray comma when only one (or neither) is present.
	const role = session
		? [session.designation, session.organisation].filter(Boolean).join(', ')
		: undefined;

	return {
		slot,
		kind,
		color,
		title: session?.title ?? slot.label ?? 'TBD',
		speaker: session?.speakerName ?? slot.speakerLabel,
		role: role || undefined,
		href: session ? `/2026/sessions/${session.slug}` : undefined,
		rowSpan: rowSpan(slot)
	};
}
