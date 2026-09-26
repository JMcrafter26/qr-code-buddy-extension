<script lang="ts">
    import { Heart } from "@lucide/svelte";
	import { setRated, shouldShowRateBanner, increaseUsageCount } from "@/utils/storage/rating";

	const storeLinks = {
		chrome: 'https://chromewebstore.google.com/detail/qr-code-buddy/ekmddmgodfefpfpgglaiphhelggfpife/reviews',
		edge: 'https://microsoftedge.microsoft.com/addons/detail/qr-code-buddy/likcomgjkmhmefbhmjkimgnhlenaegcf/',
		firefox: 'https://addons.mozilla.org/en-US/firefox/addon/qr-code-buddy/reviews/',
		opera: 'https://addons.opera.com/en/extensions/details/qr-code-buddy/',
	} as const;

	let storeUrl = $state<string>(storeLinks.chrome);
	let hoveredStar = $state(0);
	let showRateBanner = $state(false);
    let rated = $state(false);

	$effect(() => {
		increaseUsageCount();

        // detect browser and set storeUrl accordingly
		const ua = navigator.userAgent;
		if (ua.includes('Firefox')) storeUrl = storeLinks.firefox;
		else if (ua.includes('Edg/')) storeUrl = storeLinks.edge;
		else if (ua.includes('OPR/')) storeUrl = storeLinks.opera;
	});

	$effect(() => {
		void shouldShowRateBanner().then((shouldShow) => {
			showRateBanner = shouldShow;
		});
	});
</script>
{#if showRateBanner}

	{#if !rated}
	<div class="justify-center text-center">
		<p class="text-sm text-center opacity-70">How would you rate this extension?</p>
	<a
		href={storeUrl}
		target="_blank"
		rel="noopener noreferrer"
		class="rating inline-flex cursor-pointer gap-1"
		aria-label="Rate us on the browser store"
		title="Rate us on the store"
		onmouseleave={() => (hoveredStar = 0)}
		onclick={() => {
			rated = true;
			void setRated();
		}}
	>
		{#each [1, 2, 3, 4, 5] as star (star)}
			<!-- svelte-ignore a11y_no_static_element_interactions -->
			<span
				class="mask mask-star-2 h-6 w-6 transition-colors {star > hoveredStar ? 'bg-base-400' : 'bg-orange-400 opacity-100'}"
				onmouseenter={() => (hoveredStar = star)}
				aria-label={`Rate ${star} star${star > 1 ? 's' : ''}`}
			></span>
		{/each}
	</a>
	</div>

	{:else}
	<div class="text-sm text-center opacity-70">
		Thank you for rating this extension! <Heart class="inline-block w-4 h-4" />
	</div>
	{/if}
{/if}