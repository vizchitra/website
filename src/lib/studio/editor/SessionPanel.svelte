<script lang="ts">
	/**
	 * SessionPanel — Studio side-panel for session detail pages.
	 *
	 * Uses PanelShell for collapse/expand, edit state, save/publish flow.
	 * Fields: sessionType, date, time, venue, title, subtitle, speakerName,
	 *         designation, organisation.
	 * Long-form fields (descriptions, speakerAbout) are edited inline on the page
	 * via EditableField components, not in this panel.
	 */
	import { dev } from '$app/environment';
	import { invalidateAll } from '$app/navigation';
	import { onMount, untrack } from 'svelte';
	import PanelShell from './PanelShell.svelte';
	import { sessionColorMap } from '$lib/utils/sessions';

	const SESSION_TYPES = ['Talks', 'Dialogues', 'Workshops', 'Exhibition'] as const;

	interface Props {
		/** Slug identifies which session in the JSON array to update */
		slug: string;
		sessionType: string;
		date: string;
		time: string;
		slot: string;
		venue: string;
		order?: number;
		display: boolean;
		soldOut?: boolean;
		title: string;
		subtitle: string;
		speakerName: string;
		designation: string;
		organisation: string;
		/** Short description (shown below title on detail page and on session cards) */
		shortDescription: string;
		/** Long-form markdown fields edited inline on the page */
		longDescription: string;
		speakerAbout: string;
		/** og:image URL for social preview */
		socialImage?: string;
		isEditing: boolean;
		onStartEdit: () => void;
		onStopEdit: () => void;
		onCancel: () => void;
		/** Callbacks so parent can mirror field changes for WYSIWYG */
		onFieldChange: (field: string, value: string) => void;
	}

	let {
		slug,
		sessionType,
		date,
		time,
		slot,
		venue,
		order,
		display,
		soldOut,
		title,
		subtitle,
		speakerName,
		designation,
		organisation,
		shortDescription,
		longDescription,
		speakerAbout,
		socialImage,
		isEditing,
		onStartEdit,
		onStopEdit,
		onCancel,
		onFieldChange
	}: Props = $props();

	// ── Local mutable copies for the form ────────────────────────────────────
	// untrack() marks these as intentionally non-reactive initial values;
	// the $effect below re-syncs from props whenever editing starts.
	let localType = $state(untrack(() => sessionType));
	let localDate = $state(untrack(() => date?.slice(0, 10) ?? ''));
	let localTime = $state(untrack(() => time));
	let localSlot = $state(untrack(() => slot));
	let localVenue = $state(untrack(() => venue));
	let localOrder = $state(untrack(() => order ?? 0));
	let localDisplay = $state(untrack(() => display));
	let localSoldOut = $state(untrack(() => soldOut ?? false));
	let localTitle = $state(untrack(() => title));
	let localSubtitle = $state(untrack(() => subtitle));
	let localSpeaker = $state(untrack(() => speakerName));
	let localDesignation = $state(untrack(() => designation));
	let localOrganisation = $state(untrack(() => organisation));

	// Reset local copies whenever we enter a new editing session
	$effect(() => {
		if (isEditing) {
			localType = sessionType;
			localDate = date?.slice(0, 10) ?? '';
			localTime = time;
			localSlot = slot;
			localVenue = venue;
			localOrder = order ?? 0;
			localDisplay = display;
			localSoldOut = soldOut ?? false;
			localTitle = title;
			localSubtitle = subtitle;
			localSpeaker = speakerName;
			localDesignation = designation;
			localOrganisation = organisation;
		}
	});

	function update(field: string, value: string) {
		onFieldChange(field, value);
	}

	// ── Save / stage ─────────────────────────────────────────────────────────
	let saving = $state(false);
	let saveStatus = $state<'idle' | 'saved' | 'staged' | 'error'>('idle');
	let errorMessage = $state<string | null>(null);
	let stagedCount = $state(0);

	onMount(() => {
		if (!dev) {
			fetch('/api/studio/staged')
				.then((r) => r.json())
				.then((d: { files?: string[] }) => {
					stagedCount = d.files?.length ?? 0;
				})
				.catch(() => {});
		}
	});

	function startEdit() {
		onStartEdit();
		saveStatus = 'idle';
	}

	async function save() {
		saving = true;
		saveStatus = 'idle';
		errorMessage = null;
		try {
			const res = await fetch('/api/studio/data', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					filePath: 'content/2026/data/sessions.toml',
					key: slug,
					data: {
						sessionType: localType,
						date: localDate,
						time: localTime,
						slot: localSlot,
						venue: localVenue,
						order: localOrder,
						display: localDisplay,
						soldOut: localSoldOut,
						title: localTitle,
						subtitle: localSubtitle,
						speakerName: localSpeaker,
						designation: localDesignation,
						organisation: localOrganisation,
						shortDescription,
						longDescription,
						speakerAbout
					}
				})
			});
			if (!res.ok) {
				const errBody = await res.json().catch(() => ({}));
				throw new Error((errBody as { error?: string }).error ?? 'Save failed');
			}
			const result = (await res.json()) as { stagedCount?: number };
			if (dev) {
				saveStatus = 'saved';
				await invalidateAll();
			} else {
				stagedCount = result.stagedCount ?? stagedCount + 1;
				saveStatus = 'staged';
			}
			onStopEdit();
		} catch {
			saveStatus = 'error';
			errorMessage = 'Save failed — try again';
		} finally {
			saving = false;
		}
	}

	function cancel() {
		onCancel();
		saveStatus = 'idle';
		errorMessage = null;
	}

	// ── Preview helpers ───────────────────────────────────────────────────────
	const colorKey = $derived(sessionColorMap[localType] ?? 'blue');
	const colorMap: Record<string, string> = {
		blue: 'bg-viz-blue-subtle text-viz-blue-dark',
		teal: 'bg-viz-teal-subtle text-viz-teal-dark',
		pink: 'bg-viz-pink-subtle text-viz-pink-dark',
		orange: 'bg-viz-orange-subtle text-viz-orange-dark'
	};
	const typeBadgeStyle = $derived(colorMap[colorKey] ?? colorMap['blue']);
</script>

<PanelShell
	breadcrumb="content/2026/"
	fileName="sessions.toml"
	editLabel="Edit session"
	{isEditing}
	{saving}
	{saveStatus}
	{errorMessage}
	{stagedCount}
	onStartEdit={startEdit}
	onSave={save}
	onCancel={cancel}
	{socialImage}
>
	{#snippet preview()}
		<!-- Session card mini-preview -->
		<div class="border-grey-800 mt-1 space-y-1.5 rounded border px-3 py-2.5">
			<span class="inline-block rounded px-2 py-0.5 text-[10px] font-semibold {typeBadgeStyle}">
				{localType}
			</span>
			<p class="text-viz-grey-light line-clamp-2 text-xs leading-snug font-medium">
				{localTitle || '(untitled)'}
			</p>
			{#if localSpeaker}
				<p class="text-viz-grey-muted text-[10px]">
					{localSpeaker}{#if localOrganisation}
						· {localOrganisation}{/if}
				</p>
			{/if}
			{#if localTime}
				<p class="text-viz-grey-muted font-mono text-[10px]">{localTime}</p>
			{/if}
		</div>
	{/snippet}

	{#snippet children()}
		<div class="border-grey-800 border-b px-4 py-4">
			<h3 class="text-viz-grey-muted mb-3 text-[10px] tracking-widest uppercase">Session</h3>

			<!-- slug (always read-only) -->
			<div class="mb-3 opacity-50">
				<span class="text-viz-grey-muted mb-1 block text-xs font-medium">slug</span>
				<p
					class="border-grey-700 bg-grey-800 text-viz-grey-muted w-full rounded border px-2.5 py-1.5 font-mono text-xs"
				>
					{slug}
				</p>
			</div>

			<!-- Session type -->
			<div class="mb-3">
				<label class="text-viz-grey-muted mb-1 block text-xs font-medium" for="session-type">
					type
				</label>
				{#if isEditing}
					<select
						id="session-type"
						bind:value={localType}
						onchange={() => update('sessionType', localType)}
						class="border-grey-700 bg-grey-800 text-viz-grey-light focus:border-viz-yellow w-full rounded border px-2.5 py-1.5 text-xs focus:outline-none"
					>
						{#each SESSION_TYPES as t}
							<option value={t}>{t}</option>
						{/each}
					</select>
				{:else}
					<p
						class="border-grey-700 bg-grey-800 text-viz-grey-muted w-full rounded border px-2.5 py-1.5 text-xs"
					>
						{sessionType}
					</p>
				{/if}
			</div>

			<!-- Date -->
			<div class="mb-3">
				<label class="text-viz-grey-muted mb-1 block text-xs font-medium" for="session-date">
					date
				</label>
				<input
					id="session-date"
					type="date"
					bind:value={localDate}
					disabled={!isEditing}
					oninput={() => update('date', localDate)}
					class="border-grey-700 bg-grey-800 text-viz-grey-light focus:border-viz-yellow w-full rounded border px-2.5 py-1.5 text-xs focus:outline-none disabled:opacity-50"
				/>
			</div>

			<!-- Time -->
			<div class="mb-3">
				<label class="text-viz-grey-muted mb-1 block text-xs font-medium" for="session-time">
					time
				</label>
				<input
					id="session-time"
					type="text"
					bind:value={localTime}
					disabled={!isEditing}
					oninput={() => update('time', localTime)}
					placeholder="15:45 - 16:00"
					class="border-grey-700 bg-grey-800 text-viz-grey-light focus:border-viz-yellow w-full rounded border px-2.5 py-1.5 text-xs focus:outline-none disabled:opacity-50"
				/>
			</div>

			<!-- Venue -->
			<div class="mb-3">
				<label class="text-viz-grey-muted mb-1 block text-xs font-medium" for="session-venue">
					venue
				</label>
				<input
					id="session-venue"
					type="text"
					bind:value={localVenue}
					disabled={!isEditing}
					oninput={() => update('venue', localVenue)}
					class="border-grey-700 bg-grey-800 text-viz-grey-light focus:border-viz-yellow w-full rounded border px-2.5 py-1.5 text-xs focus:outline-none disabled:opacity-50"
				/>
			</div>

			<!-- Slot -->
			<div class="mb-3">
				<label class="text-viz-grey-muted mb-1 block text-xs font-medium" for="session-slot">
					slot
				</label>
				{#if isEditing}
					<select
						id="session-slot"
						bind:value={localSlot}
						class="border-grey-700 bg-grey-800 text-viz-grey-light focus:border-viz-yellow w-full rounded border px-2.5 py-1.5 text-xs focus:outline-none"
					>
						<option value="morning">morning</option>
						<option value="afternoon">afternoon</option>
					</select>
				{:else}
					<p
						class="border-grey-700 bg-grey-800 text-viz-grey-muted w-full rounded border px-2.5 py-1.5 text-xs"
					>
						{slot}
					</p>
				{/if}
			</div>

			<!-- Order -->
			<div class="mb-3">
				<label class="text-viz-grey-muted mb-1 block text-xs font-medium" for="session-order">
					order
				</label>
				<input
					id="session-order"
					type="number"
					bind:value={localOrder}
					disabled={!isEditing}
					class="border-grey-700 bg-grey-800 text-viz-grey-light focus:border-viz-yellow w-full rounded border px-2.5 py-1.5 text-xs focus:outline-none disabled:opacity-50"
				/>
			</div>

			<!-- Display -->
			<div class="mb-3 flex items-center gap-2">
				<input
					id="session-display"
					type="checkbox"
					bind:checked={localDisplay}
					disabled={!isEditing}
					class="accent-viz-yellow disabled:opacity-50"
				/>
				<label class="text-viz-grey-muted text-xs font-medium" for="session-display">
					display
				</label>
			</div>

			<!-- Sold out -->
			<div class="flex items-center gap-2">
				<input
					id="session-sold-out"
					type="checkbox"
					bind:checked={localSoldOut}
					disabled={!isEditing}
					class="accent-viz-yellow disabled:opacity-50"
				/>
				<label class="text-viz-grey-muted text-xs font-medium" for="session-sold-out">
					sold out
				</label>
			</div>
		</div>

		<div class="px-4 py-4">
			<h3 class="text-viz-grey-muted mb-3 text-[10px] tracking-widest uppercase">Speaker</h3>

			<!-- Speaker name -->
			<div class="mb-3">
				<label class="text-viz-grey-muted mb-1 block text-xs font-medium" for="session-speaker">
					name
				</label>
				<input
					id="session-speaker"
					type="text"
					bind:value={localSpeaker}
					disabled={!isEditing}
					oninput={() => update('speakerName', localSpeaker)}
					class="border-grey-700 bg-grey-800 text-viz-grey-light focus:border-viz-yellow w-full rounded border px-2.5 py-1.5 text-xs focus:outline-none disabled:opacity-50"
				/>
			</div>

			<!-- Designation -->
			<div class="mb-3">
				<label class="text-viz-grey-muted mb-1 block text-xs font-medium" for="session-designation">
					designation
				</label>
				<input
					id="session-designation"
					type="text"
					bind:value={localDesignation}
					disabled={!isEditing}
					oninput={() => update('designation', localDesignation)}
					class="border-grey-700 bg-grey-800 text-viz-grey-light focus:border-viz-yellow w-full rounded border px-2.5 py-1.5 text-xs focus:outline-none disabled:opacity-50"
				/>
			</div>

			<!-- Organisation -->
			<div class="mb-3">
				<label
					class="text-viz-grey-muted mb-1 block text-xs font-medium"
					for="session-organisation"
				>
					organisation
				</label>
				<input
					id="session-organisation"
					type="text"
					bind:value={localOrganisation}
					disabled={!isEditing}
					oninput={() => update('organisation', localOrganisation)}
					class="border-grey-700 bg-grey-800 text-viz-grey-light focus:border-viz-yellow w-full rounded border px-2.5 py-1.5 text-xs focus:outline-none disabled:opacity-50"
				/>
			</div>

			{#if isEditing}
				<p class="text-viz-grey-muted text-[10px]">
					Edit title, description and speaker bio directly on the page below.
				</p>
			{/if}
		</div>
	{/snippet}
</PanelShell>
