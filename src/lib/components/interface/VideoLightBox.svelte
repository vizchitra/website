<script lang="ts">
	interface Props {
		videoId: string;
		show: boolean;
		onClose: () => void;
		orientation?: 'horizontal' | 'vertical';
		title?: string;
	}

	let {
		videoId,
		show,
		onClose,
		orientation = 'horizontal',
		title = 'YouTube video player'
	}: Props = $props();

	function handleOverlayClick(event: MouseEvent) {
		if (event.target === event.currentTarget) {
			onClose();
		}
	}

	function handleKey(event: KeyboardEvent) {
		if (show && event.key === 'Escape') {
			onClose();
		}
	}
</script>

<svelte:window onkeydown={handleKey} />

{#if show && videoId}
	<div
		class="video-lightbox"
		onclick={handleOverlayClick}
		onkeydown={handleKey}
		role="dialog"
		aria-modal="true"
		aria-label={title}
		tabindex="-1"
	>
		<div class="video-lightbox-inner" class:vertical={orientation === 'vertical'}>
			<button class="video-lightbox-close" onclick={onClose} aria-label="Close video">✕</button>
			<div class="video-lightbox-iframe">
				<iframe
					src="https://www.youtube.com/embed/{videoId}?autoplay=1"
					{title}
					allow="autoplay; encrypted-media; picture-in-picture"
					allowfullscreen
				></iframe>
			</div>
		</div>
	</div>
{/if}

<style>
	.video-lightbox {
		position: fixed;
		inset: 0;
		z-index: 100;
		background: rgba(0, 0, 0, 0.85);
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 2rem;
	}

	.video-lightbox-inner {
		position: relative;
		width: 100%;
		max-width: 1100px;
	}

	.video-lightbox-inner.vertical {
		max-width: min(90vw, 420px);
	}

	.video-lightbox-close {
		position: absolute;
		top: -2.5rem;
		right: 0;
		background: none;
		border: none;
		color: white;
		font-size: 1.5rem;
		cursor: pointer;
		padding: 0.5rem;
	}

	.video-lightbox-iframe {
		position: relative;
		width: 100%;
		padding-bottom: 56.25%; /* 16:9 */
	}

	.video-lightbox-inner.vertical .video-lightbox-iframe {
		padding-bottom: 177.78%; /* 9:16 */
	}

	.video-lightbox-iframe iframe {
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		border: none;
		border-radius: 8px;
	}
</style>
