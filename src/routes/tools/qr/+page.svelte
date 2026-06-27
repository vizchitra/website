<script lang="ts">
	import { Header, ToolsCard, ToolsHeader } from '$lib/components';
	import QRCode from '$lib/components/interface/QRCode.svelte';
	import { untrack } from 'svelte';
	import QRCodeLib from 'qrcode';

	interface Props {
		data: { initialUrl: string };
	}

	let { data }: Props = $props();

	// untrack: we want editable state seeded once from the URL query param, not a derived
	let inputUrl = $state(untrack(() => data.initialUrl));
	let copied = $state(false);

	const PRESETS = [
		{ label: '2026', url: 'https://vizchitra.com/2026' },
		{ label: 'Tickets', url: 'https://vizchitra.com/2026/tickets' },
		{ label: 'Workshops', url: 'https://vizchitra.com/2026/workshops' }
	];

	const isValidUrl = $derived.by(() => {
		if (!inputUrl) return false;
		try {
			new URL(inputUrl);
			return true;
		} catch {
			return false;
		}
	});

	const validationMessage = $derived(
		inputUrl && !isValidUrl ? 'Please enter a valid URL (e.g. https://vizchitra.com)' : ''
	);

	async function downloadSvg() {
		const svg = await QRCodeLib.toString(inputUrl, {
			type: 'svg',
			width: 512,
			margin: 4,
			color: { dark: '#000000', light: '#ffffff' }
		});
		const blob = new Blob([svg], { type: 'image/svg+xml' });
		triggerDownload(URL.createObjectURL(blob), 'qrcode.svg');
	}

	async function downloadPng() {
		const canvas = document.createElement('canvas');
		canvas.width = 1024;
		canvas.height = 1024;
		await QRCodeLib.toCanvas(canvas, inputUrl, {
			width: 1024,
			margin: 4,
			color: { dark: '#000000', light: '#ffffff' }
		});
		canvas.toBlob((blob) => {
			if (blob) triggerDownload(URL.createObjectURL(blob), 'qrcode.png');
		}, 'image/png');
	}

	function triggerDownload(href: string, filename: string) {
		const a = document.createElement('a');
		a.href = href;
		a.download = filename;
		a.click();
		URL.revokeObjectURL(href);
	}

	async function copyUrl() {
		await navigator.clipboard.writeText(inputUrl);
		copied = true;
		setTimeout(() => (copied = false), 2000);
	}
</script>

<Header banner="square" color="grey" />

<section class="mx-auto max-w-6xl space-y-10 px-2 py-12">
	<ToolsHeader
		trail={[
			{ href: '/tools', label: 'Tools' },
			{ href: '/tools/qr', label: 'QR Generator' }
		]}
		title="QR Code Generator"
		subtitle="Generate print-quality QR codes for any VizChitra URL. Download as SVG or PNG."
	/>

	<div class="grid grid-cols-1 gap-8 lg:grid-cols-2">
		<!-- Input panel -->
		<ToolsCard widthClass="w-full" maxWidthClass="">
			<div class="space-y-6">
				<div>
					<label for="qr-url" class="text-viz-black mb-2 block text-sm font-semibold"> URL </label>
					<input
						id="qr-url"
						type="url"
						bind:value={inputUrl}
						placeholder="https://vizchitra.com"
						autocomplete="off"
						spellcheck="false"
						aria-describedby={validationMessage ? 'qr-url-error' : undefined}
						aria-invalid={!!validationMessage}
						class="border-viz-grey-muted focus:border-viz-blue text-viz-black placeholder:text-viz-grey-muted w-full rounded-lg border-2 px-4 py-3 font-mono text-sm transition-colors outline-none focus:ring-2 focus:ring-blue-200"
					/>
					{#if validationMessage}
						<p id="qr-url-error" role="alert" class="text-viz-pink-dark mt-2 text-sm">
							{validationMessage}
						</p>
					{/if}
				</div>

				<!-- Presets -->
				<div>
					<p class="text-viz-grey-dark mb-2 text-sm font-semibold">Quick presets</p>
					<div class="flex flex-wrap gap-2">
						{#each PRESETS as preset}
							<button
								onclick={() => (inputUrl = preset.url)}
								class="border-viz-grey-muted hover:border-viz-blue hover:text-viz-blue text-viz-grey-dark rounded-md border px-3 py-1.5 text-xs font-medium transition-colors"
							>
								{preset.label}
							</button>
						{/each}
					</div>
				</div>

				<!-- Actions -->
				<div class="space-y-3">
					<p class="text-viz-grey-dark text-sm font-semibold">Download</p>
					<div class="flex flex-wrap gap-3">
						<button
							onclick={downloadSvg}
							disabled={!isValidUrl}
							aria-label="Download QR code as SVG vector file"
							class="bg-viz-teal-solid hover:bg-viz-teal-dark inline-flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold text-white transition-colors disabled:cursor-not-allowed disabled:opacity-40"
						>
							<svg
								xmlns="http://www.w3.org/2000/svg"
								width="16"
								height="16"
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
								stroke-width="2"
								stroke-linecap="round"
								stroke-linejoin="round"
								aria-hidden="true"
							>
								<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
								<polyline points="7 10 12 15 17 10" />
								<line x1="12" y1="15" x2="12" y2="3" />
							</svg>
							Download SVG
						</button>
						<button
							onclick={downloadPng}
							disabled={!isValidUrl}
							aria-label="Download QR code as PNG image at 1024×1024 pixels"
							class="bg-viz-blue-solid hover:bg-viz-blue-dark inline-flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold text-white transition-colors disabled:cursor-not-allowed disabled:opacity-40"
						>
							<svg
								xmlns="http://www.w3.org/2000/svg"
								width="16"
								height="16"
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
								stroke-width="2"
								stroke-linecap="round"
								stroke-linejoin="round"
								aria-hidden="true"
							>
								<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
								<polyline points="7 10 12 15 17 10" />
								<line x1="12" y1="15" x2="12" y2="3" />
							</svg>
							Download PNG
						</button>
					</div>

					<button
						onclick={copyUrl}
						disabled={!isValidUrl}
						aria-label="Copy URL to clipboard"
						class="border-viz-grey-muted hover:border-viz-grey-dark text-viz-grey-dark inline-flex items-center gap-2 rounded-lg border px-4 py-2.5 text-sm font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-40"
					>
						{#if copied}
							<svg
								xmlns="http://www.w3.org/2000/svg"
								width="16"
								height="16"
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
								stroke-width="2"
								stroke-linecap="round"
								stroke-linejoin="round"
								aria-hidden="true"
							>
								<polyline points="20 6 9 17 4 12" />
							</svg>
							Copied!
						{:else}
							<svg
								xmlns="http://www.w3.org/2000/svg"
								width="16"
								height="16"
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
								stroke-width="2"
								stroke-linecap="round"
								stroke-linejoin="round"
								aria-hidden="true"
							>
								<rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
								<path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
							</svg>
							Copy URL
						{/if}
					</button>
				</div>

				<!-- Preset links info -->
				<div class="border-viz-grey-light rounded-lg border p-4">
					<p class="text-viz-grey-dark mb-2 text-xs font-semibold tracking-wide uppercase">
						Preset URLs
					</p>
					<ul class="space-y-1">
						{#each PRESETS as preset}
							<li class="text-viz-grey-dark font-mono text-xs">
								<a
									href="/tools/qr/{preset.label.toLowerCase()}"
									class="text-viz-blue-dark hover:underline"
								>
									/tools/qr/{preset.label.toLowerCase()}
								</a>
								<span class="text-viz-grey-muted"> → {preset.url}</span>
							</li>
						{/each}
					</ul>
				</div>
			</div>
		</ToolsCard>

		<!-- Preview panel -->
		<ToolsCard widthClass="w-full" maxWidthClass="">
			<div class="flex min-h-72 flex-col items-center justify-center gap-4">
				{#if isValidUrl}
					<div class="p-4">
						<QRCode value={inputUrl} size={256} padding={4} />
					</div>
					<p class="text-viz-grey-dark max-w-xs text-center text-xs break-all">{inputUrl}</p>
				{:else}
					<div
						class="border-viz-grey-muted flex h-64 w-64 flex-col items-center justify-center rounded-lg border-2 border-dashed"
					>
						<svg
							xmlns="http://www.w3.org/2000/svg"
							width="48"
							height="48"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							stroke-width="1.5"
							stroke-linecap="round"
							stroke-linejoin="round"
							class="text-viz-grey-muted mb-3"
							aria-hidden="true"
						>
							<rect x="3" y="3" width="7" height="7" />
							<rect x="14" y="3" width="7" height="7" />
							<rect x="3" y="14" width="7" height="7" />
							<path d="M14 14h3v3h-3z" />
							<path d="M17 17h3v3h-3z" />
							<path d="M14 20h3" />
							<path d="M20 14v3" />
						</svg>
						<p class="text-viz-grey-muted text-sm">Enter a URL to preview</p>
					</div>
				{/if}
			</div>
		</ToolsCard>
	</div>
</section>
