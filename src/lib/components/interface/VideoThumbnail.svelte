<script lang="ts">
	interface Props {
		src: string;
		alt: string;
		caption: string;
		ariaLabel: string;
		onclick: () => void;
		orientation?: 'horizontal' | 'vertical';
	}

	let { src, alt, caption, ariaLabel, onclick, orientation = 'horizontal' }: Props = $props();
</script>

<button
	class="video-thumbnail"
	class:video-thumbnail-vertical={orientation === 'vertical'}
	{onclick}
	aria-label={ariaLabel}
>
	<img {src} {alt} class="video-thumbnail-img" />
	<div class="video-play-overlay">
		<svg viewBox="0 0 80 80" width="80" height="80">
			<circle cx="40" cy="40" r="38" fill="white" opacity="0.9" />
			<polygon points="32,24 32,56 58,40" fill="var(--color-viz-pink-solid, oklch(46% 0.17 354))" />
		</svg>
		<p class="video-play-text">{caption}</p>
	</div>
</button>

<style>
	.video-thumbnail {
		position: relative;
		display: block;
		flex: 1 1 400px;
		cursor: pointer;
		border: none;
		background: none;
		padding: 0;
		border-radius: 8px;
		overflow: hidden;
	}

	.video-thumbnail-vertical {
		flex: 0 1 200px;
		aspect-ratio: 9 / 16;
	}

	.video-thumbnail-img {
		width: 100%;
		height: 100%;
		display: block;
		border-radius: 8px;
		transition: transform 0.3s ease;
		max-height: 350px;
		object-fit: cover;
	}

	.video-thumbnail:hover .video-thumbnail-img {
		transform: scale(1.02);
	}

	.video-play-overlay {
		position: absolute;
		inset: 0;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: 0.75rem;
		padding: 0 1.5rem;
	}

	.video-play-text {
		font-family: var(--font-display);
		font-size: 1.3rem;
		font-weight: 800;
		color: white;
		margin: 0;
		text-align: center;
		text-wrap: balance;
		text-shadow: 0 2px 8px rgba(0, 0, 0, 0.5);
	}
</style>
