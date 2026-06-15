<script lang="ts">
	import { Container, Stack, Prose, Heading, Text, Header, DividerCurves } from '$lib/components';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	function formatINR(amount: number): string {
		return new Intl.NumberFormat('en-IN', {
			style: 'currency',
			currency: 'INR',
			minimumFractionDigits: 0
		}).format(amount);
	}

	function getPaymentChannel(channelGuids: string[]) {
		return channelGuids
			.map((guid) => data.fundingData.funding.channels.find((c) => c.guid === guid))
			.find((c) => c?.type === 'payment-provider');
	}

	const brandColors = ['yellow', 'teal', 'blue', 'orange', 'pink'];

	function getCardColor(index: number): string {
		const color = brandColors[index % brandColors.length];
		return `bg-${color}-100`;
	}
</script>

<svelte:head>
	<title>Support VizChitra — Funding</title>
	<meta
		name="description"
		content="Support VizChitra's community programs and annual data visualization conference."
	/>
</svelte:head>

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
	</Stack>

	<!-- Plan Cards -->
	<div class="grid gap-8 py-12 md:grid-cols-2">
		{#each data.fundingData.funding.plans as plan, index (plan.guid)}
			{#if plan.status === 'active'}
				{@const paymentChannel = getPaymentChannel(plan.channels)}
				<div class="{getCardColor(index)} flex flex-col rounded-lg p-8">
					<h3 class="mb-2 text-lg font-semibold">{plan.name}</h3>
					<p class="mb-4 text-2xl font-bold text-teal-600">
						{plan.amount === 0 ? 'Any amount' : formatINR(plan.amount)}
					</p>
					<p class="text-grey-700 mb-6 grow">{plan.description}</p>

					{#if paymentChannel}
						<div class="flex justify-end">
							<a
								href={paymentChannel.address}
								target="_blank"
								rel="noopener noreferrer"
								class="rounded bg-teal-600 px-4 py-2 font-medium text-white hover:bg-teal-700"
							>
								Contribute
							</a>
						</div>
					{/if}
				</div>
			{/if}
		{/each}
	</div>
</Container>

<!-- Divider -->
<div class="py-12">
	<DividerCurves />
</div>

<!-- Channels Section -->
<Container>
	<Stack class="py-20">
		<Heading tag="h2" align="center">Ways to Contribute</Heading>
		<div class="mx-auto grid max-w-2xl gap-8 py-12 md:grid-cols-2">
			{#each data.fundingData.funding.channels as channel, index}
				<div class="{getCardColor(index)} rounded-lg p-8">
					<h3 class="mb-3 text-lg font-semibold">
						{channel.type === 'payment-provider' ? 'Online Payment' : 'Bank Transfer'}
					</h3>
					<p class="text-grey-700">{channel.description}</p>
					{#if channel.type === 'payment-provider'}
						<a
							href={channel.address}
							target="_blank"
							rel="noopener noreferrer"
							class="mt-4 inline-block rounded bg-teal-600 px-4 py-2 font-medium text-white hover:bg-teal-700"
						>
							Go to Payment Link
						</a>
					{/if}
				</div>
			{/each}
		</div>

		<div class="mt-12 rounded-lg bg-blue-100 p-6 text-center">
			<Text>
				For more details, reach out to <a
					href="mailto:{data.fundingData.entity.email}"
					class="underline">{data.fundingData.entity.email}</a
				>
			</Text>
		</div>
	</Stack>
</Container>

<!-- Footer -->
<Container>
	<Stack class="border-t py-12 text-center">
		<Text class="text-grey-600 text-sm">
			<a href="/funding.json" class="underline">View our funding manifest</a>
		</Text>
	</Stack>
</Container>

<style>
	:global(a) {
		color: inherit;
	}
</style>
