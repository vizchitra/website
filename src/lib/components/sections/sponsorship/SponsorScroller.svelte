<script lang="ts">
	import StarRating from './StarRating.svelte';
	import type { Color } from '$lib/tokens';

	export interface Sponsor {
		name: string;
		logo: string;
		photos?: (string | undefined)[];
		quote: string;
		overallRating: number;
		recommendRating: number;
		color: Color;
	}

	let { sponsors }: { sponsors: Sponsor[] } = $props();

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

<div class="sp-root">
	{#if isOverflowing}
		<div class="progress-track" aria-hidden="true">
			<div class="progress-thumb" style="left: {scrollProgress * 70}%; width: 30%"></div>
		</div>
	{/if}

	<div
		class="sp-overflow"
		class:sp-draggable={isOverflowing}
		onscroll={(e) => handleScroll(e.currentTarget as HTMLElement)}
		use:initScroller
		role="region"
		aria-label="Sponsor testimonials"
	>
		<div class="sp-scroll">
			{#each sponsors as s, i (s.name)}
				<div
					class="sp-card"
					style="--accent: var(--color-viz-{s.color}); --accent-light: var(--color-viz-{s.color}-light); --accent-muted: var(--color-viz-{s.color}-muted);"
				>
					<!-- Logo row -->
					<div class="sp-logo-row">
						<img src={s.logo} alt="{s.name} logo" class="sp-logo" />
					</div>

					<!-- Quote -->
					<div class="sp-quote-row">
						<p class="sp-quote">"{s.quote}"</p>
					</div>

					<!-- Ratings -->
					<div class="sp-ratings">
						<div class="sp-rating-row">
							<StarRating rating={s.overallRating} label="Overall Experience" color={s.color} />
						</div>
						<div class="sp-rating-row">
							<StarRating rating={s.recommendRating} label="Recommend VizChitra" color={s.color} />
						</div>
					</div>
				</div>
			{/each}
		</div>
	</div>
</div>

<style>
	/* ── Root — full-bleed breakout ─────────────────── */
	.sp-root {
		width: 100vw;
		margin-left: calc(50% - 50vw);
		margin-right: calc(50% - 50vw);
	}

	@media (max-width: 64rem) {
		.sp-root {
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

	.sp-draggable {
		cursor: grab;
	}

	/* ── Overflow viewport ───────────────────────────── */
	.sp-overflow {
		overflow-x: auto;
		scrollbar-width: none;
		display: flex;
		justify-content: safe center;
		padding: 0 2rem 1rem;
	}

	.sp-overflow::-webkit-scrollbar {
		display: none;
	}

	/* ── Scroll track — subgrid for row alignment ────── */
	/*
	 * 4 row tracks: logo · photos · quote · ratings
	 * grid-auto-flow: column puts each card in its own column
	 * subgrid lets equivalent rows share height across cards
	 */
	.sp-scroll {
		display: grid;
		grid-template-rows:
			/* logo   */
			auto
			/* quote  */ 1fr
			/* ratings*/ auto;
		grid-auto-flow: column;
		grid-auto-columns: 260px;
		flex-shrink: 0;
		column-gap: 12px;
	}

	/* ── Card ────────────────────────────────────────── */
	.sp-card {
		grid-row: 1 / -1;
		display: grid;
		grid-template-rows: subgrid;

		border-radius: 10px;
		overflow: hidden;
		border: 1px solid var(--color-viz-grey-muted);
		border-top: 3px solid var(--accent);
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
		scroll-snap-align: start;
		cursor: default;
	}

	/* ── Logo row ────────────────────────────────────── */
	.sp-logo-row {
		background: var(--color-bg);
		padding: 14px 16px;
		border-bottom: 1px solid var(--color-viz-grey-light);
		display: flex;
		align-items: center;
		min-height: 60px;
	}

	.sp-logo {
		max-height: 36px;
		max-width: 140px;
		object-fit: contain;
		object-position: left center;
	}

	/* ── Quote ───────────────────────────────────────── */
	.sp-quote-row {
		background: var(--accent-light);
		padding: 12px 16px;
		border-top: 1px solid var(--accent-muted);
	}

	.sp-quote {
		font-family: var(--font-display);
		font-size: 12px;
		font-style: italic;
		line-height: 1.55;
		color: var(--color-fg);
		margin: 0;
	}

	/* ── Ratings ─────────────────────────────────────── */
	.sp-ratings {
		background: var(--accent-light);
		padding: 8px 16px 12px;
		display: flex;
		flex-direction: column;
		gap: 4px;
		border-top: 1px solid var(--accent-muted);
	}

	.sp-rating-row {
		display: flex;
		align-items: center;
	}

	/* ── Mobile ──────────────────────────────────────── */
	@media (max-width: 64rem) {
		.sp-overflow {
			justify-content: flex-start;
			padding: 0 var(--container-padding-x, var(--spacing-viz-lg)) 1rem;
		}

		.sp-scroll {
			grid-auto-columns: 220px;
		}
	}
</style>
