<script lang="ts">
  import { onMount } from 'svelte';
  import { settingsItem, DEFAULT_SETTINGS, type QrSettings } from '../../utils/storage/settings';
  import type { Shortener } from '../../utils/url/shortener/types';
  import { PartyPopper, SwatchBook, Link, ChevronsUp, ChevronRight, ChevronLeft } from '@lucide/svelte';

  let step = $state(1);
  const total = 3;

  let settings = $state<QrSettings>({ ...DEFAULT_SETTINGS });
  let isLoaded = $state(false);

  onMount(async () => {
    settings = await settingsItem.getValue();
    isLoaded = true;
  });

  async function save() {
    await settingsItem.setValue($state.snapshot(settings));
  }

  function next() {
    if (step < total) {
      step += 1;
    } else {
      closeWelcome();
    }
    if (isLoaded) save();
  }
  function prev() {
    if (step > 1) step -= 1;
  }
  function openSettings() {
    try { browser.runtime.openOptionsPage(); } catch { (globalThis as any).chrome?.runtime?.openOptionsPage?.(); }
  }
  function closeWelcome() {
    save();
    window.close();
    setTimeout(() => {
      try { browser.tabs.getCurrent().then((t) => { if (t?.id) browser.tabs.remove(t.id); }); } catch {}
    }, 100);
  }

  // Auto-save when shortener changes
  $effect(() => {
    void settings.urlShortener;
    void settings.cleanUrl;
    void settings.api_key;
    if (isLoaded) save();
  });
</script>

<div class="min-h-screen bg-base-200 flex items-center justify-center p-4">
  <div class="card bg-base-100 shadow-lg w-full max-w-lg">
    <div class="card-body">
      <!-- Header -->
      <div class="flex items-center gap-3 mb-2">
        <img src="/icon-48.png" alt="" class="w-10 h-10 rounded" />
        <div>
          <h1 class="font-bold leading-none">QR Code Buddy</h1>
          <p class="text-xs opacity-60">Welcome — 3 quick steps</p>
        </div>
        <div class="ml-auto text-xs opacity-50">Step {step}/{total}</div>
      </div>

      <!-- Dots pagination -->
      <div class="flex justify-center gap-2 my-3">
        {#each Array(total) as _, i}
          <button
            class="w-2 h-2 rounded-full transition-all {i + 1 === step ? 'bg-primary w-6' : 'bg-base-300'}"
            onclick={() => step = i + 1}
            aria-label="Go to step {i+1}"
          ></button>
        {/each}
      </div>

      <!-- Steps -->
      {#if step === 1}
        <div class="space-y-4 animate-in">
        <PartyPopper class="w-12 h-12 text-primary" />
          <h2 class="text-xl font-bold">Thanks for installing</h2>
          <p class="text-sm opacity-70">Generate QR codes offline — no tracking, no analytics. Everything stays on your device unless you opt in.</p>
          <ul class="list-disc list-inside text-sm space-y-1 opacity-80">
            <li>Click the toolbar icon for instant QR of current tab</li>
            <li>Right-click any link/selection → Generate QR</li>
            <li>Customize colors, logo, and dot style</li>
          </ul>
          <p class="text-xs opacity-50">See <a href="https://github.com/JMcrafter26/qr-code-buddy-extension/blob/main/privacy-policy.md" target="_blank" class="link">Privacy Policy</a></p>
        </div>
      {:else if step === 2}
        <div class="space-y-4">
          <h2 class="text-xl font-bold">URL handling</h2>
          <p class="text-sm opacity-70">Choose how URLs are prepared before QR encoding.</p>

          <label class="flex items-center gap-3 p-3 rounded-lg border {settings.cleanUrl ? 'border-primary bg-primary/5' : 'border-base-200'} cursor-pointer">
            <input type="checkbox" class="toggle toggle-primary toggle-sm" bind:checked={settings.cleanUrl} />
            <div class="text-sm">
              <div class="font-medium">Clean tracking params</div>
              <div class="text-xs opacity-60">Remove utm_, fbclid, gclid, etc.</div>
            </div>
          </label>

          <div class="form-control">
            <label class="label"><span class="label-text font-medium">URL shortener</span></label>
            <select class="select select-bordered select-sm" bind:value={settings.urlShortener}>
              <option value="none">None (recommended)</option>
              <option value="hamr" selected>hamr - local, no network</option>
              <option value="tinyurl">TinyURL</option>
              <option value="isgd">is.gd</option>
              <option value="bitly">Bitly (needs API key)</option>
            </select>
            <p class="text-xs opacity-60 mt-1">
              {#if settings.urlShortener === 'none'}No request leaves your browser.
              {:else if settings.urlShortener === 'hamr'}Local compression — falls back to original if longer.
              {:else}External service will see the URL. Only enabled if you choose it.{/if}
            </p>
            {#if settings.urlShortener === 'bitly'}
              <input type="text" placeholder="Bitly API key" class="input input-bordered input-sm mt-2" bind:value={settings.api_key} />
              {#if !settings.api_key}<p class="text-xs text-warning mt-1">API key required for Bitly</p>{/if}
            {/if}
          </div>
        </div>
      {:else if step === 3}
        <div class="space-y-4">
          <h2 class="text-xl font-bold">Features</h2>
          <div class="grid grid-cols-1 gap-3 text-sm">
            <div class="flex gap-3 p-3 bg-base-200 rounded-lg">
              <span class="text-lg text-primary"><SwatchBook /></span>
              <div><b>Style:</b> 6 dot types, colors, logo, SVG/PNG/WebP/JPG</div>
            </div>
            <div class="flex gap-3 p-3 bg-base-200 rounded-lg">
              <span class="text-lg text-primary"><Link /></span>
              <div><b>Data types:</b> URL, text, email, phone, SMS, WiFi, geo, event</div>
            </div>
            <div class="flex gap-3 p-3 bg-base-200 rounded-lg">
              <span class="text-lg text-primary"><ChevronsUp /></span>
              <div><b>Fast &amp; offline:</b> Instant popup, context menu, no server.</div>
            </div>
          </div>
          <div class="alert py-2 text-xs">
            Settings are saved automatically. You can change them anytime in <b>Settings</b>.
          </div>
        </div>
      {/if}

      <!-- Nav -->
      <div class="flex justify-between mt-6">
        <button class="btn btn-ghost btn-sm" onclick={prev} disabled={step===1}><ChevronLeft /></button>
        <div class="flex gap-2">
          {#if step < total}
            <button class="btn btn-primary btn-sm" onclick={next}>Next <ChevronRight /></button>
          {:else}
            <button class="btn btn-ghost btn-sm" onclick={openSettings}>Settings</button>
            <button class="btn btn-primary btn-sm" onclick={closeWelcome}>Done</button>
          {/if}
        </div>
      </div>
    </div>
  </div>
</div>
