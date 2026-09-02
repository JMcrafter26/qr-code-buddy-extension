<script lang="ts">
  import { onMount } from 'svelte';
  import QrCanvas from '../../components/qr/QrCanvas.svelte';
  import { settingsItem, DEFAULT_SETTINGS, type QrSettings } from '../../utils/storage/settings';
  import { removeTrackersFromUrl } from '../../utils/url/tracker/cleaner';
  import { getShortUrl } from '../../utils/url/shortener';
  import logo from '../../assets/logo.svg';

  let url = $state('https://www.google.com');
  let settings = $state<QrSettings>(DEFAULT_SETTINGS);
  let qrData = $state('https://www.google.com');
  let qrCanvasRef: any = $state(null);
  let isLoadingSettings = $state(true);

  // Debounce handling for shortener
  let debounceTimer: ReturnType<typeof setTimeout> | null = null;

  async function processUrl(raw: string) {
    let processed = raw;
    if (settings.cleanUrl) {
      processed = removeTrackersFromUrl(processed);
    }
    if (settings.urlShortener !== 'none') {
      const beforeLen = processed.length;
      const shortened = await getShortUrl(processed, settings.urlShortener, settings.api_key);
      // Debug hamr
      if (settings.urlShortener === 'hamr') {
        console.log(`[hamr] ${beforeLen} -> ${shortened.length} ${shortened}`);
      }
      processed = shortened;
    }
    return processed;
  }

  async function updateQrData() {
    if (!url) {
      qrData = '';
      return;
    }
    try {
      qrData = await processUrl(url);
      // Check for too long after processing
      if (qrData.length > 2800) {
        console.warn(`QR data too long: ${qrData.length} chars`);
      }
    } catch (e) {
      console.error('updateQrData error', e);
      qrData = url; // fallback
    }
  }

  // Watch url + settings clean/shortener
  $effect(() => {
    void url;
    void settings.cleanUrl;
    void settings.urlShortener;
    void settings.api_key;
    if (debounceTimer) clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      updateQrData();
    }, 300);
  });

  onMount(async () => {
    try {
      const stored = await settingsItem.getValue();
      // If no stored value, fallback will be DEFAULT, but we mimic original: if empty open options
      // Check raw storage without fallback to detect first install
      const raw = await browser.storage.local.get(null as any);
      if (Object.keys(raw).length === 0) {
        browser.runtime.openOptionsPage();
      }
      settings = stored;
      // Get active tab URL
      const tabs = await browser.tabs.query({ active: true, currentWindow: true });
      const tabUrl = tabs[0]?.url ?? 'https://www.google.com';
      url = tabUrl;
      await updateQrData();
    } catch (e) {
      console.error(e);
    } finally {
      isLoadingSettings = false;
    }
  });

  function handleInput(e: Event) {
    const target = e.target as HTMLInputElement;
    url = target.value;
  }

  function handleDownload() {
    try {
      if (qrCanvasRef?.download) qrCanvasRef.download();
    } catch (e: any) {
      alert(e?.message || 'Failed to download QR - URL may be too long');
    }
  }

  function openOptions() {
    browser.runtime.openOptionsPage();
  }

  function openQrPage() {
    browser.tabs.create({ url: browser.runtime.getURL('/qr.html') });
  }
</script>

<div class="w-[320px] p-3 bg-base-100">
  <div class="flex flex-col items-center gap-3">
    <!-- Header with logo (small) -->
    <div class="flex items-center gap-2 self-start">
      <img src={logo} alt="QR Buddy" class="w-6 h-6" />
      <span class="font-bold text-sm">QR Code Buddy</span>
    </div>

    <!-- QR Preview -->
    <div class="rounded-xl overflow-hidden bg-base-200 p-2">
      {#if isLoadingSettings}
        <div class="skeleton w-[280px] h-[280px] rounded-xl"></div>
      {:else}
        <QrCanvas bind:this={qrCanvasRef} data={qrData} {settings} size={280} />
      {/if}
    </div>

    <!-- Tools -->
    <div class="join w-full">
      <input
        type="text"
        class="input input-bordered join-item flex-1 text-sm"
        placeholder="Enter URL"
        value={url}
        oninput={handleInput}
      />
      <button class="btn btn-square join-item" onclick={handleDownload} title="Download QR">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-5 h-5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
      </button>
    </div>
    {#if qrData && qrData !== url}
      <div class="text-xs opacity-70 break-all text-left w-full bg-base-200 p-2 rounded">
        <span class="font-bold">QR encodes:</span> {qrData}
        <span class="ml-2 opacity-50">({qrData.length} chars{#if settings.urlShortener === 'hamr'} via hamr{/if})</span>
      </div>
    {:else if qrData}
      <div class="text-xs opacity-50 w-full text-left flex justify-between">
        <span>QR length: {qrData.length} chars</span>
        {#if settings.urlShortener === 'hamr' && qrData === url && url.length > 50}
          <span class="text-warning">hamr didn't shorten (try TinyURL)</span>
        {/if}
      </div>
    {/if}

    <!-- Footer -->
    <div class="text-center text-xs opacity-70 space-y-1 w-full">
      <p>
        <button class="link link-hover" onclick={openQrPage}>More Options</button>
        <span class="mx-1">|</span>
        <button class="link link-hover" onclick={openOptions}>Settings</button>
      </p>
      <p>QR Code Buddy by <a href="https://github.com/JMcrafter26" target="_blank" class="link">JMcrafter26</a></p>
    </div>
  </div>
</div>

<style>
  :global(body) {
    margin: 0;
    padding: 0;
    width: 320px;
    min-height: 400px;
  }
</style>
