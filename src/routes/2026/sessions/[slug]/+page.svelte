<script lang="ts">
	import { onMount, untrack } from 'svelte';
	import Header from '$lib/components/structure/Header.svelte';
	import { Heading, Prose } from '$lib/components/typography';
	import { Container } from '$lib/components/layout';
	import { ProposalBadge } from '$lib/components/proposals';
	import { sessionColorMap } from '$lib/utils/sessions';
	import SessionPanel from '$lib/studio/editor/SessionPanel.svelte';
	import ProseMirrorEditor from '$lib/studio/editor/ProseMirrorEditor.svelte';
	import { page } from '$app/state';
	import { browser } from '$app/environment';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	const session = $derived(data.session);
	const color = $derived(sessionColorMap[session.sessionType] ?? 'blue');

	const ticketBtnClass: Record<string, string> = {
		blue: 'bg-viz-blue-dark hover:bg-viz-blue',
		teal: 'bg-viz-teal-dark hover:bg-viz-teal',
		pink: 'bg-viz-pink-dark hover:bg-viz-pink',
		orange: 'bg-viz-orange-dark hover:bg-viz-orange'
	};
	const soldOutBtnClass: Record<string, string> = {
		blue: 'bg-viz-blue',
		teal: 'bg-viz-teal',
		pink: 'bg-viz-pink',
		orange: 'bg-viz-orange'
	};

	const backLink = $derived.by(() => {
		if (!browser) return { href: '/2026/sessions', label: 'Back to All Sessions' };
		const from = page.url.searchParams.get('from');
		if (from === 'workshops') return { href: '/2026/workshops', label: 'Back to Workshops' };
		return { href: '/2026/sessions', label: 'Back to All Sessions' };
	});

	// Room label for display: workshop tracks are "Venue - Room" (e.g. "Underline - FLR 3"),
	// which repeats the venue shown below — so strip the venue prefix and tidy "FLR" → "Floor".
	const roomLabel = $derived.by(() => {
		if (!session.room) return '';
		const r = session.room.includes(' - ')
			? session.room.split(' - ').slice(1).join(' - ')
			: session.room;
		return r.replace(/\bFLR\b/i, 'Floor');
	});

	// ── Studio panel state ────────────────────────────────────────────────────
	let isStudioUser = $state(false);
	let isEditing = $state(false);

	// Live-editable fields — untrack() marks intentional one-time init from props
	let liveType = $state(untrack(() => session.sessionType));
	let liveTime = $state(untrack(() => session.time));
	let liveVenue = $state(untrack(() => session.venue));
	let liveSpeaker = $state(untrack(() => session.speakerName));
	let liveDesignation = $state(untrack(() => session.designation));
	let liveOrganisation = $state(untrack(() => session.organisation));
	let liveShortDescription = $state(untrack(() => session.shortDescription ?? ''));
	let liveDescription = $state(untrack(() => session.longDescription ?? ''));
	let liveSpeakerAbout = $state(untrack(() => session.speakerAbout ?? ''));
	let liveDescriptionHtml = $state(untrack(() => data.descriptionHtml));
	let liveSpeakerAboutHtml = $state(untrack(() => data.speakerAboutHtml));

	// Snapshots for cancel revert
	let savedFields: Record<string, string> = {};

	onMount(async () => {
		try {
			const res = await fetch('/api/studio/me');
			if (res.ok) isStudioUser = true;
		} catch {
			// Not authenticated
		}
	});

	function startEdit() {
		savedFields = {
			sessionType: liveType,
			time: liveTime,
			venue: liveVenue,
			speakerName: liveSpeaker,
			designation: liveDesignation,
			organisation: liveOrganisation,
			shortDescription: liveShortDescription,
			longDescription: liveDescription,
			speakerAbout: liveSpeakerAbout
		};
		isEditing = true;
	}

	function stopEdit() {
		isEditing = false;
	}

	function cancelEdit() {
		liveType = savedFields.sessionType ?? session.sessionType;
		liveTime = savedFields.time ?? session.time;
		liveVenue = savedFields.venue ?? session.venue;
		liveSpeaker = savedFields.speakerName ?? session.speakerName;
		liveDesignation = savedFields.designation ?? session.designation;
		liveOrganisation = savedFields.organisation ?? session.organisation;
		liveShortDescription = savedFields.shortDescription ?? session.shortDescription ?? '';
		liveDescription = savedFields.longDescription ?? session.longDescription ?? '';
		liveSpeakerAbout = savedFields.speakerAbout ?? session.speakerAbout ?? '';
		isEditing = false;
	}

	function handleFieldChange(field: string, value: string) {
		if (field === 'sessionType') liveType = value;
		else if (field === 'time') liveTime = value;
		else if (field === 'venue') liveVenue = value;
		else if (field === 'speakerName') liveSpeaker = value;
		else if (field === 'designation') liveDesignation = value;
		else if (field === 'organisation') liveOrganisation = value;
	}
</script>

<!-- SessionPanel: fixed sidebar, studio users only -->
{#if isStudioUser}
	<SessionPanel
		slug={session.slug}
		sessionType={liveType}
		date={session.date}
		time={liveTime}
		slot={session.slot}
		venue={liveVenue}
		order={session.order}
		display={session.display}
		soldOut={session.soldOut}
		title={session.title}
		subtitle={session.subtitle}
		speakerName={liveSpeaker}
		designation={liveDesignation}
		organisation={liveOrganisation}
		shortDescription={liveShortDescription}
		longDescription={liveDescription}
		speakerAbout={liveSpeakerAbout}
		socialImage={data.pageMeta?.ogImage}
		{isEditing}
		onStartEdit={startEdit}
		onStopEdit={stopEdit}
		onCancel={cancelEdit}
		onFieldChange={handleFieldChange}
	/>
{/if}

<Header banner="curve" />

<Container>
	<article class="max-w-3xl pt-14 pb-6 md:pt-16">
		<!-- Breadcrumb + session type -->
		<p class="font-display text-viz-black mb-6 text-base uppercase">
			<a
				href={backLink.href}
				class="underline decoration-current/30 decoration-2 underline-offset-[0.35em] transition-colors hover:decoration-current"
			>
				Sessions</a
			>
			<span class="mx-2">|</span>
			<span class="text-viz-{color}-dark font-semibold">{session.sessionType}</span>
		</p>

		<!-- Time + venue -->
		<div class="text-viz-black font-display mb-8 space-y-1 text-base tracking-wide uppercase">
			{#if session.time}
				<p>
					<span class="font-semibold">{session.time}</span>{#if roomLabel}
						⋅ {roomLabel}{/if}
				</p>
			{/if}
			{#if session.venue}
				<p>{session.venue}</p>
			{/if}
		</div>

		<!-- Title -->
		<Prose>
			<h1 class="mb-3">
				{session.title}
			</h1>
		</Prose>

		<!-- Short description -->
		{#if liveShortDescription || (isStudioUser && isEditing)}
			<div class="mt-4 mb-8">
				<Prose {color}>
					{#if isStudioUser && isEditing}
						<blockquote>
							<textarea
								bind:value={liveShortDescription}
								placeholder="Short description (shown on session cards)"
								class="w-full resize-none bg-transparent leading-relaxed italic outline-none placeholder:opacity-40"
								style="field-sizing: content;"
							></textarea>
						</blockquote>
					{:else}
						<blockquote>{liveShortDescription}</blockquote>
					{/if}
				</Prose>
			</div>
		{/if}

		<!-- Speaker -->
		<div class="border-viz-grey/10 mt-6 space-y-1 border-t pt-6">
			<p class="font-display-sans text-viz-{color}-dark text-lg font-semibold">
				{session.speakerName}
			</p>
			<p class="text-viz-grey-dark/70 text-base">
				{session.designation}{#if session.organisation}<span class="mx-1.5 opacity-40">·</span
					>{session.organisation}{/if}
			</p>
		</div>

		<!-- Tickets -->
		<div class="mt-8 flex flex-wrap gap-3">
			{#if session.sessionType === 'Workshops' && session.ticketCode}
				{#if session.soldOut}
					<span
						class="font-display inline-flex cursor-not-allowed items-center rounded-full px-5 py-2 text-sm font-extrabold tracking-[0.15em] text-white uppercase {soldOutBtnClass[
							color
						]}"
						style="box-shadow: 0 3px 10px rgba(0,0,0,0.2)"
					>
						Workshop Sold Out
					</span>
				{:else}
					<a
						href="https://tickets.vizchitra.com/?ticket={session.ticketCode}"
						target="_blank"
						rel="noopener noreferrer"
						class="font-display inline-flex items-center gap-2 rounded-full px-5 py-2 text-sm font-bold text-white uppercase transition-colors {ticketBtnClass[
							color
						]}"
					>
						Get Workshop Ticket
						<svg
							class="h-4 w-4"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
							aria-hidden="true"
						>
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M14 5l7 7m0 0l-7 7m7-7H3"
							/>
						</svg>
					</a>
				{/if}
			{/if}
			{#if session.inviteOnly}
				<span
					class="border-viz-grey/30 text-viz-grey font-display inline-flex items-center rounded-full border-2 px-5 py-2 text-sm font-bold tracking-[0.1em] uppercase"
				>
					Closed-door · Invite-only session
				</span>
			{:else}
				<a
					href="https://tickets.vizchitra.com/?ticket=conference_practitioner"
					target="_blank"
					rel="noopener noreferrer"
					class="font-display inline-flex items-center gap-2 rounded-full px-5 py-2 text-sm font-bold text-white uppercase transition-colors {ticketBtnClass[
						color
					]}"
				>
					Get Conference Ticket
					<svg
						class="h-4 w-4"
						fill="none"
						stroke="currentColor"
						viewBox="0 0 24 24"
						aria-hidden="true"
					>
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M14 5l7 7m0 0l-7 7m7-7H3"
						/>
					</svg>
				</a>
			{/if}
		</div>
	</article>

	<div class="border-viz-grey/10 max-w-3xl border-t">
		<!-- About this session -->
		<section class="py-10">
			<Heading tag="h2" align="left" class="pb-4">About this session</Heading>
			{#if isStudioUser && isEditing}
				<ProseMirrorEditor
					markdown={liveDescription}
					filePath="content/2026/data/sessions.toml"
					onChange={(md) => (liveDescription = md)}
				/>
			{:else}
				<div class="prose text-viz-grey/90 md:prose-lg markdown-content max-w-none">
					<Prose>
						{@html liveDescriptionHtml}
					</Prose>
				</div>
			{/if}
		</section>

		<!-- About the speaker -->
		{#if liveSpeakerAbout || (isStudioUser && isEditing)}
			<section class="border-viz-grey/10 border-t py-10">
				<Heading tag="h2" align="left" class="pb-4">About the speaker</Heading>
				{#if isStudioUser && isEditing}
					<ProseMirrorEditor
						markdown={liveSpeakerAbout}
						filePath="content/2026/data/sessions.toml"
						onChange={(md) => (liveSpeakerAbout = md)}
					/>
				{:else}
					<div class="prose text-viz-grey/90 md:prose-lg markdown-content max-w-none">
						<Prose>
							{@html liveSpeakerAboutHtml}
						</Prose>
					</div>
				{/if}
			</section>
		{/if}

		<!-- Related sessions -->
		<!-- 
		{#if data.relatedSessions.length > 0}
			<section class="border-viz-grey/10 mt-16 border-t pt-8">
				<Heading tag="h4" align="left" class="pb-4">Other Sessions</Heading>
				<div class="space-y-3">
					{#each data.relatedSessions as related}
						{@const relatedColor = sessionColorMap[related.sessionType] ?? 'blue'}
						<a
							href="/2026/sessions/{related.slug}"
							class="group flex items-center gap-3 transition-colors"
						>
							<ProposalBadge text={related.sessionType} color={relatedColor} />
							<span
								class="text-viz-grey text-sm font-medium transition-colors group-hover:text-viz-{relatedColor}-dark md:text-base"
							>
								{related.title}
								<span class="text-viz-grey/50 font-normal">— {related.speakerName}</span>
							</span>
						</a>
					{/each}
				</div>
			</section>
		{/if} 
		-->

		<!-- Back link -->
		<div class="border-viz-grey/10 mt-16 border-t pt-8 text-center">
			<a
				href={backLink.href}
				class="group font-text-sans text-viz-grey inline-flex items-center gap-2 transition-colors hover:text-viz-{color}-dark"
			>
				<svg
					class="h-5 w-5 transition-transform group-hover:-translate-x-1"
					fill="none"
					stroke="currentColor"
					viewBox="0 0 24 24"
				>
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M11 17l-5-5m0 0l5-5m-5 5h12"
					/>
				</svg>
				<span>{backLink.label}</span>
			</a>
		</div>
	</div>
</Container>
