<script lang="ts">
	import {
		Container,
		Stack,
		Prose,
		Heading,
		Text,
		Header,
		DividerCurves,
		Button
	} from '$lib/components';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	function formatINR(amount: number): string {
		return new Intl.NumberFormat('en-IN', {
			style: 'currency',
			currency: 'INR',
			minimumFractionDigits: 0
		}).format(amount);
	}

	function getChannel(channelGuids: string[]) {
		return channelGuids
			.map((guid) => data.fundingData.funding.channels.find((c) => c.guid === guid))
			.find((c) => c);
	}

	const brandColors = ['pink', 'orange', 'teal', 'blue', 'yellow'];

	function getCardColor(index: number): string {
		const color = brandColors[index % brandColors.length];
		return `bg-${color}-100`;
	}

	function getButtonColor(index: number): 'yellow' | 'teal' | 'blue' | 'orange' | 'pink' {
		return brandColors[index % brandColors.length] as
			| 'yellow'
			| 'teal'
			| 'blue'
			| 'orange'
			| 'pink';
	}

	function getDarkColorVar(index: number): string {
		const color = brandColors[index % brandColors.length];
		return `--color-viz-${color}-dark`;
	}
</script>

<Header title="Support VizChitra" banner="curve" />

<Container>
	<!-- Intro -->
	<Stack class="py-20">
		<Prose>
			<Heading tag="h1">Funding our Mission</Heading>
		</Prose>
		<Text>
			{data.fundingData.entity.description}
		</Text>

		<!-- Entity metadata definition list -->
		<Prose>
			<dl>
				<dt>Organization</dt>
				<dd>{data.fundingData.entity.name}</dd>

				<dt>Type</dt>
				<dd>{data.fundingData.entity.type}</dd>

				<dt>Role</dt>
				<dd>{data.fundingData.entity.role}</dd>

				<dt>Email</dt>
				<dd>
					<a href="mailto:{data.fundingData.entity.email}">
						{data.fundingData.entity.email}
					</a>
				</dd>

				{#if data.fundingData.entity.webpageUrl}
					<dt>Website</dt>
					<dd>
						<a
							href={data.fundingData.entity.webpageUrl.url}
							target="_blank"
							rel="noopener noreferrer"
						>
							{data.fundingData.entity.webpageUrl.url}
						</a>
					</dd>
				{/if}

				<dt>Manifest</dt>
				<dd>
					<a href="/funding.json">funding.json</a>
				</dd>
			</dl>
		</Prose>

		<Heading tag="h2">Funding Plans</Heading>
		<div class="grid gap-8 md:grid-cols-2">
			{#each data.fundingData.funding.plans.filter((p) => p.status === 'active') as plan, index (plan.guid)}
				{@const channel = getChannel(plan.channels)}
				{@const cardColor = getCardColor(index)}
				{@const buttonColor = getButtonColor(index)}
				<div class="{cardColor} flex flex-col rounded-lg p-8">
					<h3 class="mb-2 text-lg font-semibold">{plan.name}</h3>
					<p class="mb-4 text-2xl font-bold" style="color: var({getDarkColorVar(index)})">
						{plan.amount === 0 ? 'Any amount' : formatINR(plan.amount)}
					</p>
					<p class="mb-6 grow text-black">
						{@html plan.description.replace(
							/https?:\/\/[^\s]+/g,
							(url) =>
								`<a href="${url}" target="_blank" rel="noopener noreferrer" class="plan-link">${url}</a>`
						)}
					</p>

					{#if channel}
						<div class="flex justify-end">
							{#if channel.type === 'payment-provider'}
								<Button href={channel.address} external color={buttonColor} size="sm">
									Contribute
								</Button>
							{:else if channel.type === 'bank'}
								<Button href="mailto:{data.fundingData.entity.email}" color={buttonColor} size="sm">
									Contact for Details
								</Button>
							{/if}
						</div>
					{/if}
				</div>
			{/each}
		</div>

		<Prose class="mt-12">
			<h2>Funding Channels</h2>
			<ul>
				{#each data.fundingData.funding.channels as channel}
					<li>
						<strong
							>{channel.type === 'payment-provider' ? 'Online Payment' : 'Bank Transfer'}</strong
						>
						— {channel.description}
						{#if channel.type === 'payment-provider'}
							(<a href={channel.address} target="_blank" rel="noopener noreferrer">
								payment link
							</a>)
						{:else}
							(<a href="mailto:{data.fundingData.entity.email}">
								{data.fundingData.entity.email}
							</a>)
						{/if}
					</li>
				{/each}
			</ul>
			<p>
				View the <a
					href="https://vizchitra.com/funding.json"
					target="_blank"
					rel="noopener noreferrer"
				>
					machine readable version
				</a>
			</p>
		</Prose>
	</Stack>
</Container>

<style>
	:global(a) {
		color: inherit;
	}

	:global(.plan-link) {
		color: var(--color-viz-blue-dark);
		text-decoration: underline;
		text-decoration-color: var(--color-viz-grey-muted);
		text-decoration-thickness: 2px;
		text-underline-offset: 0.35em;
		text-decoration-skip-ink: auto;
		transition: all 200ms ease-in-out;
	}

	:global(.plan-link:hover) {
		text-decoration-color: var(--color-viz-blue-dark);
		background-color: var(--color-viz-blue-subtle);
		padding: 0.35em;
	}
</style>
