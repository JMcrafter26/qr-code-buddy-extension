<script lang="ts">
  import { onMount } from 'svelte';
  import QrCanvas from '../../components/qr/QrCanvas.svelte';
  import { settingsItem, DEFAULT_SETTINGS, type QrSettings } from '../../utils/storage/settings';
  import { removeTrackersFromUrl } from '../../utils/url/tracker/cleaner';
  import { getShortUrl } from '../../utils/url/shortener';
  import logo from '../../assets/logo.svg';
  import { ExternalLink, Settings2 } from '@lucide/svelte';
  

  let url = $state('https://duckduckgo.com');
  let settings = $state<QrSettings>(DEFAULT_SETTINGS);
  let qrData = $state('https://duckduckgo.com');
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
      const [stored, tabs] = await Promise.all([
        settingsItem.getValue(),
        browser.tabs.query({ active: true, currentWindow: true }).catch(() => [] as any),
      ]);
      settings = stored;
      const tabUrl = (tabs as any)[0]?.url ?? 'https://duckduckgo.com';
      url = tabUrl;
      updateQrData();
    } catch (e) {
      console.error(e);
    } finally {
      isLoadingSettings = false;
    }
    setTimeout(async () => {
      try {
        const raw = await browser.storage.local.get(null as any);
        if (Object.keys(raw).length === 0) {
          await settingsItem.setValue($state.snapshot(DEFAULT_SETTINGS) as any);
          await browser.tabs.create({ url: browser.runtime.getURL('/welcome.html') });
        }
      } catch {}
    }, 500);
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
    browser.tabs.create({ url: browser.runtime.getURL('/qr.html') + `?url=${encodeURIComponent(url)}` });
  }
</script>

<div class="w-[320px] p-3 bg-base-100">
  <div class="flex flex-col items-center gap-3">
    <!-- Header with logo (small), title and icon on the left, settings on the right -->
    <div class="flex items-center justify-between w-full">
      <div class="flex items-center gap-2">
        <img src={logo} alt="" class="w-8 h-8 rounded" />
        <h1 class="font-bold text-lg leading-none">QR Code Buddy</h1>
      </div>
      <div class="flex items-center gap-2">
        <button class="btn btn-ghost btn-circle btn-sm" onclick={openQrPage} title="Open QR page">
          <ExternalLink class="w-5 h-5" />
        </button>
      <button class="btn btn-ghost btn-circle btn-sm" onclick={openOptions} title="Settings">
        <Settings2 class="w-5 h-5" />
      </button>
      </div>
    </div>

    <!-- QR Preview -->
    <div class="rounded-xl overflow-hidden bg-base-200 p-2">
      <QrCanvas bind:this={qrCanvasRef} data={qrData} {settings} size={280} />
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
