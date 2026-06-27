import { parse as parseToml } from 'smol-toml';
import scheduleRaw from '../../../content/2026/data/schedule.toml?raw';
import scheduleWorkshopsRaw from '../../../content/2026/data/schedule-workshops.toml?raw';
import { sessionColorMap, getSessionOrder, type SessionData } from './sessions';

export interface ScheduleSlot {
	track: string;
	start: string; // "HH:MM"
	end: string; // "HH:MM"
	type?: string;
	session?: string; // slug into sessions.toml
	label?: string;
	speakerLabel?: string;
	description?: string; // optional sub-text (inline markdown → HTML server-side)
}

export interface ScheduleDay {
	day: string; // "YYYY-MM-DD"
	name: string; // short label for the day toggle, e.g. "Conference"
	tracks: string[];
	slots: ScheduleSlot[];
	galleryStart?: string; // all-day Gallery window for this day (falls back to exhibitionStart/End)
	galleryEnd?: string;
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
	| 'speakers'
	| 'speaker2Name'
	| 'speaker2Designation'
	| 'speaker2Organisation'
>;

export type SlotKind = 'session' | 'break' | 'address' | 'sponsored' | 'placeholder';

/** The all-day exhibition column and the time window it occupies. */
export const exhibitionTrack = 'Gallery';
export const exhibitionStart = '10:00';
export const exhibitionEnd = '17:00';

/** One exhibition listed inside the all-day Gallery cell. */
export interface ExhibitionEntry {
	slug: string;
	title: string;
	speaker?: string;
	role?: string;
	href: string;
}

/** Exhibition sessions, ordered, shaped for the Gallery cell. */
export function resolveExhibitions(sessions: SessionData[]): ExhibitionEntry[] {
	return sessions
		.filter((s) => s.sessionType === 'Exhibition' && !s.tbd)
		.sort((a, b) => getSessionOrder(a) - getSessionOrder(b))
		.map((s) => ({
			slug: s.slug,
			title: s.title,
			speaker: s.speakerName || undefined,
			// Same role composition as resolveSlot — drop empty parts to avoid a stray comma.
			role: [s.designation, s.organisation].filter(Boolean).join(', ') || undefined,
			href: `/2026/sessions/${s.slug}`
		}));
}

/** A slot enriched with everything the renderer needs — no lookups left to do. */
export interface ResolvedSlot {
	slot: ScheduleSlot;
	kind: SlotKind;
	color: 'blue' | 'teal' | 'pink' | 'orange' | 'yellow' | 'grey';
	title: string;
	speaker?: string;
	role?: string;
	speakers?: { name: string; role?: string; moderator?: boolean }[];
	description?: string;
	href?: string;
	rowSpan: number;
}

function parseScheduleDay(raw: string): ScheduleDay {
	const parsed = parseToml(raw) as unknown as {
		day: string;
		name: string;
		tracks: string[];
		slot: ScheduleSlot[];
		galleryStart?: string;
		galleryEnd?: string;
	};
	return {
		day: parsed.day,
		name: parsed.name,
		tracks: parsed.tracks,
		slots: parsed.slot,
		galleryStart: parsed.galleryStart,
		galleryEnd: parsed.galleryEnd
	};
}

/** All schedule days (conference + workshops), ordered chronologically. */
export function resolveScheduleDays(): ScheduleDay[] {
	return [parseScheduleDay(scheduleRaw), parseScheduleDay(scheduleWorkshopsRaw)].sort((a, b) =>
		a.day < b.day ? -1 : a.day > b.day ? 1 : 0
	);
}

/** Convert "HH:MM" to minutes since midnight. */
export function timeToMinutes(t: string): number {
	const [h, m] = t.split(':').map(Number);
	return h * 60 + m;
}

/** "HH:MM" advanced by `mins` minutes, wrapping at 24h and zero-padded. */
export function addMinutes(time: string, mins: number): string {
	const total = timeToMinutes(time) + mins;
	const h = Math.floor(total / 60) % 24;
	const m = total % 60;
	return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
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

/**
 * Earliest start + latest end across all slots, plus the total 15-min row count.
 * `extraRanges` (e.g. the all-day Gallery window) are folded in so the grid grows
 * to cover them even when they start before / end after every timed slot.
 */
export function computeGridBounds(
	slots: ScheduleSlot[],
	extraRanges: { start: string; end: string }[] = []
): {
	gridStart: string;
	gridEnd: string;
	totalRows: number;
} {
	const ranges = [...slots, ...extraRanges];
	if (ranges.length === 0) {
		return { gridStart: '08:00', gridEnd: '19:00', totalRows: 44 };
	}
	const gridStart = ranges.reduce((min, r) => (r.start < min ? r.start : min), ranges[0].start);
	const gridEnd = ranges.reduce((max, r) => (r.end > max ? r.end : max), ranges[0].end);
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
	} else if (t === 'ADDRESS') {
		kind = 'address';
		color = 'blue';
	} else if (t === 'STREAM') {
		kind = 'address';
		color = 'grey';
	} else if (t === 'SPONSORED') {
		kind = 'sponsored';
		color = 'yellow';
	} else if (t === 'ACTIVITIES') {
		kind = 'placeholder';
		color = 'yellow';
	} else if (t === 'DIALOGUE' || t === 'PANEL') {
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

	// Multi-speaker display, shared with the session views: panels use an explicit
	// `speakers[]`; two-speaker sessions derive a list from the speaker2 fields.
	const speakers =
		session?.speakers ??
		(session?.speaker2Name
			? [
					{ name: session.speakerName, role: role || undefined },
					{
						name: session.speaker2Name,
						role:
							[session.speaker2Designation, session.speaker2Organisation]
								.filter(Boolean)
								.join(', ') || undefined
					}
				]
			: undefined);

	return {
		slot,
		kind,
		color,
		title: session?.title ?? slot.label ?? 'TBD',
		// Panels (session.speakers) render the structured list below; suppress the single line.
		speaker: speakers ? undefined : (session?.speakerName ?? slot.speakerLabel),
		role: speakers ? undefined : role || undefined,
		speakers,
		description: slot.description,
		href: session ? `/2026/sessions/${session.slug}` : undefined,
		// Gallery-list entries may omit start/end — they never render as timed cells.
		rowSpan: slot.start && slot.end ? rowSpan(slot) : 1
	};
}

/** Identity for a break row — breaks sharing this key across tracks are the same row. */
export function breakKey(r: ResolvedSlot): string {
	return `${r.slot.start}-${r.slot.end}-${r.title}`;
}

/** Keys of breaks present in every track; these render as one full-width row. */
export function computeSpanningBreakKeys(slots: ResolvedSlot[], trackCount: number): Set<string> {
	const count = new Map<string, number>();
	for (const r of slots) {
		if (r.kind !== 'break') continue;
		count.set(breakKey(r), (count.get(breakKey(r)) ?? 0) + 1);
	}
	const keys = new Set<string>();
	for (const [k, c] of count) if (c >= trackCount) keys.add(k);
	return keys;
}

/** Whether a slot is a break common to all tracks (drawn as one full-width row). */
export function isSpanningBreak(r: ResolvedSlot, spanningKeys: Set<string>): boolean {
	return r.kind === 'break' && spanningKeys.has(breakKey(r));
}

/** Drop the per-track duplicates of each spanning break so it renders once. */
export function dedupeSpanningBreaks(
	slots: ResolvedSlot[],
	spanningKeys: Set<string>
): ResolvedSlot[] {
	const seen = new Set<string>();
	return slots.filter((r) => {
		if (!isSpanningBreak(r, spanningKeys)) return true;
		const key = breakKey(r);
		if (seen.has(key)) return false;
		seen.add(key);
		return true;
	});
}

const DAY_MONTHS = [
	'Jan',
	'Feb',
	'Mar',
	'Apr',
	'May',
	'Jun',
	'Jul',
	'Aug',
	'Sep',
	'Oct',
	'Nov',
	'Dec'
];

/** "4 Jul · Conference" label for the day toggle. */
export function formatDayLabel(day: string, name: string): string {
	const [, m, date] = day.split('-').map(Number);
	return `${date} ${DAY_MONTHS[m - 1]} · ${name}`;
}

export interface LegendEntry {
	label: string;
	color: string;
}

/** Session-type → swatch colour, plus a grey catch-all; sourced from the slot colour map. */
export const scheduleLegend: LegendEntry[] = [
	...Object.entries(sessionColorMap).map(([label, color]) => ({
		label,
		color
	})),
	{ label: 'Other', color: 'grey' }
];

/** Legend filtered to the colours actually present among the given slots. */
export function visibleLegend(slots: ResolvedSlot[], hasExhibitions: boolean): LegendEntry[] {
	const used = new Set<string>(slots.map((r) => r.color));
	if (hasExhibitions) used.add('orange');
	return scheduleLegend.filter((item) => used.has(item.color));
}

/** Whether the time range [start, end) overlaps the window [winStart, winEnd). */
export function overlapsWindow(
	start: string,
	end: string,
	winStart: string,
	winEnd: string
): boolean {
	return (
		timeToMinutes(start) < timeToMinutes(winEnd) && timeToMinutes(end) > timeToMinutes(winStart)
	);
}

/** Per-15-min row heights (base / ≤1024 / ≤600). Workshops are sparser → shorter rows. */
export function rowHeightsFor(name: string): { base: string; md: string; sm: string } {
	return name === 'Workshops'
		? { base: '3rem', md: '4rem', sm: '5.25rem' }
		: { base: '7rem', md: '7.5rem', sm: '8rem' };
}
