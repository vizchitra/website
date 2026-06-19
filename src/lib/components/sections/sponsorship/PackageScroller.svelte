<!--
  PackageScroller.svelte
  Horizontal fan-scroller for sponsorship package cards.
  Uses CSS subgrid so Purpose / What / Best For / Value rows and each benefit row
  align horizontally across all cards. Fan/hover interaction matches /2026 session rows.
-->
<script lang="ts">
	export interface PackageBenefit {
		label: string;
		details?: string[];
	}

	export interface Package {
		tier: string;
		price: string;
		slots: string;
		/** Remaining slots; when set, `slots` is struck through and "N left" is shown. */
		slotsLeft?: number;
		color: 'yellow' | 'teal' | 'blue' | 'orange' | 'pink';
		purpose: string;
		what: string;
		bestFor: string;
		value: string;
		benefits: PackageBenefit[];
	}

	let { packages }: { packages: Package[] } = $props();

	// Maximum benefits across all cards — drives the number of benefit rows in the grid
	const MAX_BENEFITS = 5;

	let scrollProgress = $state(0);
	let isOverflowing = $state(false);

	function handleScroll(el: HTMLElement) {
		const maxScroll = el.scrollWidth - el.clientWidth;
		isOverflowing = maxScroll > 10;
		scrollProgress = maxScroll > 0 ? el.scrollLeft / maxScroll : 0;
	}

	function initScroller(node: HTMLElement) {
		let isDown = false;
		let startX = 0;
		let scrollLeft = 0;
		let hasDragged = false;

		function checkOverflow() {
			isOverflowing = node.scrollWidth > node.clientWidth + 10;
		}

		node.addEventListener('mousedown', (e) => {
			isDown = true;
			hasDragged = false;
			node.style.cursor = 'grabbing';
			startX = e.pageX;
			scrollLeft = node.scrollLeft;
			e.preventDefault();
		});
		node.addEventListener('mouseleave', () => {
			isDown = false;
			node.style.cursor = '';
		});
		node.addEventListener('mouseup', () => {
			isDown = false;
			node.style.cursor = '';
		});
		node.addEventListener('mousemove', (e) => {
			if (!isDown) return;
			e.preventDefault();
			const walk = (e.pageX - startX) * 1.5;
			if (Math.abs(walk) > 5) hasDragged = true;
			node.scrollLeft = scrollLeft - walk;
		});
		node.addEventListener(
			'click',
			(e) => {
				if (hasDragged) {
					e.preventDefault();
					e.stopPropagation();
					hasDragged = false;
				}
			},
			true
		);

		checkOverflow();
		const ro = new ResizeObserver(() => checkOverflow());
		ro.observe(node);
		return {
			destroy() {
				ro.disconnect();
			}
		};
	}
</script>

<div class="pkg-scroller-root">
	{#if isOverflowing}
		<div class="progress-track" aria-hidden="true">
			<div class="progress-thumb" style="left: {scrollProgress * 70}%; width: 30%"></div>
		</div>
	{/if}

	<div
		class="pkg-overflow"
		class:pkg-draggable={isOverflowing}
		onscroll={(e) => handleScroll(e.currentTarget as HTMLElement)}
		use:initScroller
		role="region"
		aria-label="Sponsorship packages"
	>
		<!-- Grid — subgrid rows align content across cards -->
		<div class="pkg-scroll">
			{#each packages as pkg, i (pkg.tier)}
				<div
					class="pkg-wrap"
					style="
          --pkg-base: var(--color-viz-{pkg.color});
          --pkg-light: var(--color-viz-{pkg.color}-light);
          --pkg-subtle: var(--color-viz-{pkg.color}-subtle);
          --pkg-muted: var(--color-viz-{pkg.color}-muted);
          --pkg-dark: var(--color-viz-{pkg.color}-dark);
        "
				>
					<!-- Row 1 · Header -->
					<div class="pkg-header">
						<span class="pkg-tier">{pkg.tier}</span>
						{#if pkg.slotsLeft != null}
							<span class="pkg-slots">
								<s class="pkg-slots-total">{pkg.slots}</s>
								<span class="pkg-slots-left">
									{pkg.slotsLeft === 0 ? 'Sold out' : `${pkg.slotsLeft} left`}
								</span>
							</span>
						{:else}
							<span class="pkg-slots">{pkg.slots}</span>
						{/if}
					</div>

					<!-- Row 2 · Purpose -->
					<div class="pkg-meta">
						<span class="meta-label">Purpose /</span>
						<span class="meta-value"> {pkg.purpose}</span>
					</div>

					<!-- Row 3 · What -->
					<div class="pkg-meta">
						<span class="meta-label">What /</span>
						<span class="meta-value"> {pkg.what}</span>
					</div>

					<!-- Row 4 · Best For -->
					<div class="pkg-meta">
						<span class="meta-label">Best For /</span>
						<span class="meta-value"> {pkg.bestFor}</span>
					</div>

					<!-- Row 5 · Value -->
					<div class="pkg-meta pkg-meta-last">
						<span class="meta-label">Value /</span>
						<span class="meta-value"> {pkg.value}</span>
					</div>

					<!-- Rows 6 – 6+MAX · Benefits (empty rows collapse to zero height) -->
					{#each { length: MAX_BENEFITS } as _, bi}
						{#if pkg.benefits[bi]}
							<div class="pkg-benefit">
								<p class="benefit-label">{pkg.benefits[bi].label}</p>
								{#if pkg.benefits[bi].details}
									{#each pkg.benefits[bi].details as detail}
										<p class="benefit-detail">{detail}</p>
									{/each}
								{/if}
							</div>
						{:else}
							<div class="pkg-benefit-empty" aria-hidden="true"></div>
						{/if}
					{/each}

					<!-- Last row · Price -->
					<div class="pkg-footer">{pkg.price}</div>
				</div>
			{/each}
		</div>
	</div>
</div>

<style>
	/* ── Root — full-bleed breakout ─────────────────── */
	.pkg-scroller-root {
		width: 100vw;
		margin-left: calc(50% - 50vw);
		margin-right: calc(50% - 50vw);
	}

	@media (max-width: 64rem) {
		.pkg-scroller-root {
			width: auto;
			margin-left: calc(-1 * var(--container-padding-x, var(--spacing-viz-lg)));
			margin-right: calc(-1 * var(--container-padding-x, var(--spacing-viz-lg)));
		}
	}

	/* ── Progress bar ───────────────────────────────── */
	.progress-track {
		position: relative;
		height: 8px;
		background: #e0e0e0;
		border-radius: 999px;
		margin: 0 auto 8px;
		max-width: 200px;
	}

	.progress-thumb {
		position: absolute;
		top: 0;
		height: 100%;
		background: #444;
		border-radius: 999px;
		transition: left 300ms ease;
	}

	.pkg-draggable {
		cursor: grab;
	}

	/* ── Overflow viewport — scrolls & centers ───────── */
	/*
	 * justify-content: safe center → centers the grid when it fits the viewport;
	 * falls back to flex-start (scrollable from the left) when it overflows.
	 */
	.pkg-overflow {
		overflow-x: auto;
		scrollbar-width: none;
		display: flex;
		justify-content: safe center;
		padding: 0 2rem 1rem;
	}

	.pkg-overflow::-webkit-scrollbar {
		display: none;
	}

	/* ── Grid — subgrid alignment across cards ───────── */
	/*
	 * 11 row tracks: header · purpose · what · bestFor · value · benefit×5 · price.
	 * Each pkg-wrap spans all rows and subgrids into them, so equivalent rows
	 * (e.g. all "Purpose" rows) share the same height across every card.
	 * Fan overlap uses transform so there is zero layout reflow on hover.
	 */
	.pkg-scroll {
		display: grid;
		grid-template-rows:
			/* header    */
			auto
			/* purpose   */ auto
			/* what      */ auto
			/* best-for  */ auto
			/* value     */ auto
			/* benefit 0 */ auto
			/* benefit 1 */ auto
			/* benefit 2 */ auto
			/* benefit 3 */ auto
			/* benefit 4 */ auto
			/* price     */ auto;
		grid-auto-flow: column;
		grid-auto-columns: 260px;
		flex-shrink: 0; /* don't compress inside the flex overflow container */
		column-gap: 8px;
	}

	/* ── Card — grid item + subgrid + visual shell ───── */
	.pkg-wrap {
		grid-row: 1 / -1;
		display: grid;
		grid-template-rows: subgrid;

		position: relative;
		border-radius: 8px;
		overflow: hidden;
		border: 1px solid var(--pkg-muted);
		box-shadow:
			0 2px 6px rgba(0, 0, 0, 0.07),
			0 1px 2px rgba(0, 0, 0, 0.05);
		scroll-snap-align: start;
	}

	/* ── Header row ──────────────────────────────────── */
	.pkg-header {
		background: var(--pkg-dark);
		color: white;
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 10px 14px;
	}

	.pkg-tier {
		font-family: var(--font-display);
		font-weight: 900;
		font-size: 13px;
		letter-spacing: 0.1em;
		text-transform: uppercase;
	}

	.pkg-slots {
		font-family: var(--font-body);
		font-size: 11px;
		font-weight: 600;
		letter-spacing: 0.05em;
		text-transform: uppercase;
		opacity: 0.85;
	}

	.pkg-slots-total {
		opacity: 0.6;
		margin-right: 5px;
	}

	.pkg-slots-left {
		font-weight: 800;
		opacity: 1;
		white-space: nowrap;
	}

	/* ── Meta rows (Purpose / What / Best For / Value) ─ */
	.pkg-meta {
		background: var(--pkg-light);
		padding: 7px 14px;
		font-size: 12px;
		line-height: 1.45;
		border-bottom: 1px solid var(--pkg-muted);
	}

	.pkg-meta-last {
		border-bottom: 2px solid var(--pkg-base);
	}

	.meta-label {
		font-family: var(--font-display);
		font-weight: 700;
		color: var(--color-fg);
	}

	.meta-value {
		font-family: var(--font-body);
		color: var(--color-viz-grey-dark);
	}

	/* ── Benefit rows ────────────────────────────────── */
	.pkg-benefit {
		background: var(--pkg-subtle);
		padding: 7px 14px;
		border-bottom: 1px solid var(--pkg-muted);
	}

	/* Empty slot — no padding so the row collapses to zero height */
	.pkg-benefit-empty {
		background: var(--pkg-subtle);
	}

	.benefit-label {
		font-family: var(--font-display);
		font-weight: 700;
		font-size: 12px;
		color: var(--color-fg);
		margin: 0;
		line-height: 1.35;
	}

	.benefit-detail {
		font-family: var(--font-body);
		font-size: 11px;
		color: var(--color-viz-grey-dark);
		margin: 0;
		line-height: 1.35;
	}

	/* ── Price footer ────────────────────────────────── */
	.pkg-footer {
		background: var(--pkg-light);
		border-top: 2px solid var(--pkg-base);
		padding: 8px 14px;
		font-family: var(--font-display);
		font-weight: 700;
		font-size: 11px;
		color: var(--color-viz-grey-dark);
		text-align: right;
		letter-spacing: 0.03em;
	}

	/* ── Mobile ──────────────────────────────────────── */
	@media (max-width: 64rem) {
		.pkg-overflow {
			justify-content: flex-start;
			padding: 0 var(--container-padding-x, var(--spacing-viz-lg)) 1rem;
		}

		.pkg-scroll {
			grid-auto-columns: 220px;
		}
	}
</style>
