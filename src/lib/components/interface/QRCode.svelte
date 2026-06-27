<script lang="ts">
	import QRCodeLib from 'qrcode';
	import { browser } from '$app/environment';

	interface Props {
		value: string;
		size?: number;
		padding?: number;
		class?: string;
	}

	let { value, size = 256, padding = 4, class: className = '' }: Props = $props();

	let svgContent = $state('');

	$effect(() => {
		if (!browser || !value) {
			svgContent = '';
			return;
		}

		QRCodeLib.toString(value, {
			type: 'svg',
			width: size,
			margin: padding,
			color: { dark: '#000000', light: '#ffffff' }
		})
			.then((svg) => {
				// Replace hard-coded colors with adaptive CSS values
				svgContent = svg
					.replace(/fill="#ffffff"/gi, 'fill="transparent"')
					.replace(/fill="#000000"/gi, 'fill="currentColor"')
					.replace('<svg ', `<svg width="${size}" height="${size}" `);
			})
			.catch(() => {
				svgContent = '';
			});
	});
</script>

{#if svgContent}
	<div
		class={className}
		role="img"
		aria-label="QR code for {value}"
		style="width: {size}px; height: {size}px; display: inline-block;"
	>
		{@html svgContent}
	</div>
{/if}
