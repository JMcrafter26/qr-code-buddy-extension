<script lang="ts">
  import { onMount } from 'svelte';
  import QrCanvas from '../../components/qr/QrCanvas.svelte';
  import DataTypeSelector from '../../components/data-types/DataTypeSelector.svelte';
  import Footer from '../../components/layout/Footer.svelte';
  import { settingsItem, DEFAULT_SETTINGS, type QrSettings } from '../../utils/storage/settings';
  import { removeTrackersFromUrl } from '../../utils/url/tracker/cleaner';
  import { getShortUrl } from '../../utils/url/shortener';
  import type { QrDataType } from '../../utils/url/data-payload/types';

  let url = $state('');
  let displayQrData = $state('');
  let settings = $state<QrSettings>({ ...DEFAULT_SETTINGS });
  let dataType = $state<QrDataType>('url');
  let qrCanvasRef: any = $state(null);
  let isLoaded = $state(false);

  async function processUrl(raw: string): Promise<string> {
    let processed = raw;
    if (dataType === 'url' && settings.cleanUrl) {
      processed = removeTrackersFromUrl(processed);
    }
    if (dataType === 'url' && settings.urlShortener !== 'none') {
      const before = processed.length;
      processed = await getShortUrl(processed, settings.urlShortener, settings.api_key);
      if (settings.urlShortener === 'hamr') {
        console.log(`[hamr] ${before} -> ${processed.length} ${processed.slice(0,60)}`);
      }
    }
    return processed;
  }

  async function updateQr() {
    if (!url) {
      displayQrData = '';
      return;
    }
    try {
      displayQrData = await processUrl(url);
    } catch (e) {
      console.error('updateQr error', e);
      displayQrData = url;
    }
  }

  let debounceTimer: ReturnType<typeof setTimeout> | null = null;
  $effect(() => {
    void url;
    void settings.cleanUrl;
    void settings.urlShortener;
    void settings.api_key;
    void dataType;
    if (debounceTimer) clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => updateQr(), 300);
  });

  onMount(async () => {
    settings = await settingsItem.getValue();
    const params = new URLSearchParams(window.location.search);
    const paramUrl = params.get('url');
    if (paramUrl) {
      url = paramUrl;
    } else {
      // Try to get active tab if available? On qr.html we are not popup, so not needed
      // Fallback to google
      if (!url) url = 'https://www.google.com';
    }
    await updateQr();
    isLoaded = true;
  });

  function handleDataChange(data: string) {
    url = data;
  }

  function handleInput(e: Event) {
    url = (e.target as HTMLInputElement).value;
  }

  function handleDownload() {
    try {
      qrCanvasRef?.download();
    } catch (e: any) {
      alert(e?.message || 'Failed to download - URL may be too long');
    }
  }

  function openSettings() {
    browser.runtime.openOptionsPage();
  }

  let year = new Date().getFullYear();
</script>

<div class="min-h-screen bg-base-200 flex flex-col items-center p-6">
  <div class="w-full max-w-xl space-y-6">
    <!-- Logo -->
    <div class="flex flex-col items-center gap-2">
      <img src="/icon-128.png" alt="QR Code Buddy" class="w-16 h-16" />
      <h1 class="text-2xl font-bold">QR Code Buddy</h1>
    </div>

    <!-- QR -->
    <div class="flex justify-center">
      <div class="bg-base-100 p-4 rounded-xl shadow">
        {#if !isLoaded}
          <div class="skeleton w-[280px] h-[280px]"></div>
        {:else}
          <QrCanvas bind:this={qrCanvasRef} data={displayQrData} {settings} size={280} />
        {/if}
      </div>
    </div>

    <!-- Tools -->
    <div class="join w-full max-w-xl mx-auto flex">
      <input class="input input-bordered join-item flex-1" placeholder={dataType === 'url' ? 'Enter URL' : 'Generated Data will appear here'} value={url} oninput={handleInput} />
      <button class="btn join-item" onclick={handleDownload} title="Download">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="w-5 h-5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
      </button>
    </div>
    {#if displayQrData && displayQrData !== url}
      <div class="text-xs opacity-70 break-all text-left w-full bg-base-100 p-2 rounded max-w-xl mx-auto">
        <span class="font-bold">QR encodes:</span> {displayQrData}
        <span class="ml-2 opacity-50">({displayQrData.length} chars{#if settings.urlShortener === 'hamr'} via hamr{/if})</span>
      </div>
    {:else if displayQrData}
      <div class="text-xs opacity-50 w-full text-center">QR length: {displayQrData.length} chars</div>
    {/if}

    <!-- More options -->
    <div class="collapse collapse-arrow bg-base-100 shadow">
      <input type="checkbox" />
      <div class="collapse-title font-medium">More Options</div>
      <div class="collapse-content">
        <DataTypeSelector bind:type={dataType} onDataChange={handleDataChange} />
      </div>
    </div>

    <!-- Footer -->
    <div class="text-center">
      <button class="link" onclick={openSettings}>Settings</button>
      <Footer {year} />
    </div>
  </div>
</div>
