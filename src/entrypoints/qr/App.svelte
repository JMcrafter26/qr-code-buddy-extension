<script lang="ts">
  import { onMount } from 'svelte';
  import QrCanvas from '../../components/qr/QrCanvas.svelte';
  import DataTypeSelector from '../../components/data-types/DataTypeSelector.svelte';
  import Footer from '../../components/layout/Footer.svelte';
  import { settingsItem, DEFAULT_SETTINGS, normalizeSettings, type QrSettings } from '../../utils/storage/settings';
  import { removeTrackersFromUrl } from '../../utils/url/tracker/cleaner';
  import { preloadFavicon } from '../../utils/qr/favicon';
  import { getShortUrl } from '../../utils/url/shortener';
  import type { QrDataType } from '../../utils/url/data-payload/types';
  import { Download } from '@lucide/svelte';
  import RateBanner from '@/components/qr/RateBanner.svelte';
  import { i18n } from '#i18n';

  let input = $state('');
  let displayQrData = $state('');
  let settings = $state<QrSettings>({ ...DEFAULT_SETTINGS });
  let dataType = $state<QrDataType>('url');
  let qrCanvasRef: any = $state(null);
  let isLoaded = $state(false);
  let faviconUrl = $state('');
  let initialInput = '';
  let updateSequence = 0;
  let isInitialized = $state(false);
  let isFirstUpdate = true;
  let isProcessingUrl = $state(false);

  async function processUrl(raw: string): Promise<string> {
    let processed = raw;
    if (dataType === 'url' && settings.cleanUrl) {
      processed = removeTrackersFromUrl(processed);
    }
    if (dataType === 'url' && settings.urlShortener !== 'none') {
      const before = processed.length;
      processed = await getShortUrl(processed, settings.urlShortener, settings.apiKey);
      if (settings.urlShortener === 'hamr') {
        // console.log(`[hamr] ${before} -> ${processed.length} ${processed.slice(0,60)}`);
      }
    }
    return processed;
  }

  async function updateQr(requestId = ++updateSequence) {
    const currentInput = input;
    if (!currentInput) {
      displayQrData = '';
      if (requestId === updateSequence) isProcessingUrl = false;
      return;
    }

    isProcessingUrl = true;

    // if input is too long, add a warning, but still process it
    if (currentInput.length > 2800) {
      // console.warn(`Input too long: ${currentInput.length} chars`);
      alert(`Warning: Input is very long (${currentInput.length} chars). QR code may not be scannable.`);
    }

    // if input is not a url, we don't process it, just display as is
    if (dataType !== 'url' || (dataType === 'url' && !currentInput.startsWith('http'))) {
      displayQrData = currentInput;
      if (requestId === updateSequence) isProcessingUrl = false;
      return;
    }

    try {
      const cleanedUrl = settings.cleanUrl
        ? removeTrackersFromUrl(currentInput)
        : currentInput;
      if (cleanedUrl !== currentInput) {
        input = cleanedUrl;
      }
      const processedUrl = await processUrl(cleanedUrl);
      if (requestId !== updateSequence) return;
      displayQrData = processedUrl;
    } catch (e) {
      if (requestId !== updateSequence) return;
      console.error('updateQr error', e);
      displayQrData = currentInput;
    } finally {
      if (requestId === updateSequence) isProcessingUrl = false;
    }
  }

  let debounceTimer: ReturnType<typeof setTimeout> | null = null;
  $effect(() => {
    void input;
    void settings.cleanUrl;
    void settings.urlShortener;
    void settings.apiKey;
    void dataType;
    if (!isInitialized) return;
    const requestId = ++updateSequence;
    if (debounceTimer) clearTimeout(debounceTimer);
    const delay = isFirstUpdate ? 0 : 300;
    isFirstUpdate = false;
    debounceTimer = setTimeout(() => updateQr(requestId), delay);
  });

  onMount(async () => {
    settings = normalizeSettings(await settingsItem.getValue());
    const params = new URLSearchParams(window.location.search);
    const paramUrl = params.get('url');
    faviconUrl = params.get('favicon') ?? '';
    if (settings.logoMode === 'favicon') preloadFavicon(faviconUrl, settings.background);
    if (paramUrl) {
      input = paramUrl;
      initialInput = paramUrl;
    } else {
      // Try to get active tab if available? On qr.html we are not popup, so not needed
      // Fallback to wikipedia
      if (!input) input = 'https://wikipedia.org';
    }
    
    // or if its about:blank
    if (input === 'about:blank') input = 'https://wikipedia.org';
    isInitialized = true;
    isLoaded = true;
  });

  function handleDataChange(data: string) {
    input = data;
  }

  function handleInput(e: Event) {
    input = (e.target as HTMLInputElement).value;
    if (input !== initialInput) faviconUrl = '';
  }

  function handleDownload() {
    try {
      let hostname = '';
      try {
        const u = new URL(input);
        hostname = u.hostname.replace(/\./g, '-');
      } catch {}
      qrCanvasRef?.download(hostname ? `qr-${hostname}` : 'qr-code');
    } catch (e: any) {
      alert(e?.message || i18n.t('qr.downloadError'));
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
    <div class="flex items-center gap-2 justify-center">
      <img src="/icon-128.png" alt="{i18n.t('common.appName')}" class="w-16 h-16" />
      <h1 class="text-2xl font-bold">{i18n.t('common.appName')}</h1>
    </div>

    <!-- QR -->
    <div class="flex justify-center">
      <div class="bg-base-100 p-4 rounded-xl shadow">
        {#if !isLoaded}
          <div class="skeleton w-70 h-70"></div>
        {:else}
          <QrCanvas
            bind:this={qrCanvasRef}
            data={displayQrData}
            {settings}
            {faviconUrl}
            isProcessing={isProcessingUrl}
            size={280}
          />
        {/if}
      </div>
    </div>

    <!-- Tools -->
    <div class="join w-full max-w-xl mx-auto flex">
      <input class="input input-bordered join-item flex-1" placeholder={dataType === 'url' ? i18n.t('qr.input.urlPlaceholder') : i18n.t('qr.input.generatedDataPlaceholder')} value={input} oninput={handleInput} />
      <button class="btn btn-soft join-item" onclick={handleDownload} title={i18n.t('common.actions.download')}>
        <Download class="w-5 h-5" />
      </button>
    </div>
    {#if displayQrData && displayQrData !== input && isLoaded&& settings.urlShortener != "none"}
      <div class="text-xs opacity-70 break-all text-left w-full bg-base-100 p-2 rounded max-w-xl mx-auto">
        <span class="font-bold">{i18n.t('qr.preview.encodedLabel')}</span> <span class="select-all">{displayQrData}</span>
        <span class="ml-2 opacity-50">{i18n.t('qr.preview.savedInfo', { count: input.length - displayQrData.length, method: settings.urlShortener })}</span>
      </div>
    {:else if displayQrData && isLoaded}
      <div class="text-xs opacity-50 w-full text-center">{i18n.t('qr.preview.length', { count: displayQrData.length })}</div>
    {/if}

    <!-- More options -->
    <div class="collapse collapse-arrow bg-base-100 shadow">
      <input type="checkbox" />
      <div class="collapse-title font-medium">{i18n.t('qr.options.title')}</div>
      <div class="collapse-content">
        <DataTypeSelector bind:type={dataType} onDataChange={handleDataChange} />
      </div>
    </div>

    <RateBanner />


    <!-- Footer -->
    <div class="text-center">
      <button class="link" onclick={openSettings}>{i18n.t('common.actions.settings')}</button>
      <Footer {year} />
    </div>
  </div>
</div>
