<script lang="ts">
	let {alwaysShow = false} = $props();
    import { Heart, Mail } from "@lucide/svelte";
	import { setRated, shouldShowRateBanner, increaseUsageCount } from "@/utils/storage/rating";
	import { detectBrowser } from "@/utils/browser/detect";
	import { m } from '@/paraglide/messages.js';

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
	let showSupportInfo = $state(false);

	$effect(() => {
        // detect browser and set storeUrl accordingly
		const browser = detectBrowser();
		if (browser in storeLinks) {
			storeUrl = storeLinks[browser as keyof typeof storeLinks];
		} else {
			storeUrl = storeLinks.chrome;
		}
		

		void (async () => {
			await increaseUsageCount();
			const shouldShow = await shouldShowRateBanner(alwaysShow);
			showRateBanner = shouldShow;
		})();
	});



	async function handleRatingClick(stars: number) {
		showSupportInfo = false;
		if (stars >= 3) {
			// open store link
			await setRated();
			window.open(storeUrl, '_blank');
			rated = true;
		} else {
			// open support info
			showSupportInfo = true;
		}
	}
</script>
{#if showRateBanner}
{#if !rated && !showSupportInfo}
	<div class="w-full flex flex-col items-center gap-2">
		<p class="text-sm opacity-70">{m['rating.prompt']()}</p>
		<!-- svelte-ignore a11y_no_static_element_interactions -->
		<div
			class="rating flex cursor-pointer gap-1 justify-center"
			aria-label={m['rating.storeAriaLabel']()}
			title={m['rating.storeTitle']()}
			onmouseleave={() => (hoveredStar = 0)}
		>
			{#each [1, 2, 3, 4, 5] as star (star)}
				<button
					class="mask mask-star-2 h-6 w-6 transition-colors {star > hoveredStar ? 'bg-base-400' : 'bg-orange-400 opacity-100'}"
					onmouseenter={() => (hoveredStar = star)}
					aria-label={(star === 1
						? m['rating.starLabel.singular']
						: m['rating.starLabel.plural'])({ count: star })}
					onclick={() => handleRatingClick(star)}
				></button>
			{/each}
		</div>
	</div>
	{:else if showSupportInfo}
<div class="space-y-2 text-center text-sm opacity-80">
			<div class="text-sm text-center opacity-70 mt-2">
			<p class="font-semibold text-base">{m['rating.support.title']()}</p>
				<p>{m['rating.support.description']()}</p>
				<p><a href="https://scr.im/i78mozc" target="_blank" rel="noopener noreferrer" class="underline"><Mail class="inline-block w-4 h-4" /> {m['common.links.email']()}</a> {m['common.conjunctions.or']()} <a href="https://github.com/JMcrafter26/qr-code-buddy-extension/issues" target="_blank" rel="noopener noreferrer" class="underline"><svg role="img" class="inline-block w-4 h-4" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><title>{m['common.links.github']()}</title><path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/>				</svg> {m['common.links.githubIssues']()}</a></p>
				<p class="text-xs opacity-75 mt-1">
		{m['rating.support.reviewPrompt']()} <button onclick={() => handleRatingClick(3)} class="underline cursor-pointer hover:opacity-100">{m['rating.support.reviewLink']()}</button>{m['rating.support.reviewSuffix']()} <Heart class="inline-block w-3 h-3" /></p>
			</div>
		</div>
	{:else}
	<div class="text-sm text-center opacity-70">
		{m['rating.thankYou']()} <Heart class="inline-block w-4 h-4" />
	</div>
	{/if}
{/if}