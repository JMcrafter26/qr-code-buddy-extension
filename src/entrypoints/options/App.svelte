<script lang="ts">
  import { onMount } from 'svelte';
  import { settingsItem, DEFAULT_SETTINGS, type QrSettings, type DotType, type ImageFormat } from '../../utils/storage/settings';
  import { getContrastRatio } from '../../utils/color/contrast';
  import { removeTrackersFromUrl, ALL_TRACKERS } from '../../utils/url/tracker/cleaner';
  import type { Shortener } from '../../utils/url/shortener/types';
  import Footer from '../../components/layout/Footer.svelte';

  let settings = $state<QrSettings>({ ...DEFAULT_SETTINGS });
  let isLoaded = $state(false);

  // Debug
  let dirtyUrl = $state('');
  let importExport = $state('');

  let contrast = $derived(getContrastRatio(settings.color, settings.background));
  let isLowContrast = $derived(contrast < 1.4);

  onMount(() => {
    settingsItem.getValue().then((stored) => {
      settings = stored;
      isLoaded = true;
    });
  });

  async function save() {
    await settingsItem.setValue($state.snapshot(settings));
  }

  // Auto-save + optional host permission request
  let permissionError: string | null = $state(null);
  $effect(() => {
    if (!isLoaded) return;
    void settings.type;
    void settings.color;
    void settings.background;
    void settings.cleanUrl;
    void settings.format;
    void settings.logo;
    void settings.urlShortener;
    void settings.api_key;
    const hostMap: Record<string, string> = {
      tinyurl: 'https://tinyurl.com/*',
      isgd: 'https://is.gd/*',
      bitly: 'https://api-ssl.bitly.com/*',
    };
    const host = hostMap[settings.urlShortener];
    if (host) {
      browser.permissions
        .contains({ origins: [host] })
        .then((has) => {
          if (!has) return browser.permissions.request({ origins: [host] });
          return true;
        })
        .then((granted) => {
          if (granted === false) {
            permissionError = `Permission for ${host} denied. Shortener will fallback.`;
          } else permissionError = null;
        })
        .catch(() => (permissionError = null));
    } else permissionError = null;
    save();
  });

  async function reset() {
    await settingsItem.removeValue();
    settings = { ...DEFAULT_SETTINGS };
    location.reload();
  }

  function handleClean() {
    importExport = ''; // not needed
    dirtyUrl = removeTrackersFromUrl(dirtyUrl, ALL_TRACKERS);
  }

  async function handleExport() {
    const data = await browser.storage.local.get(null as any);
    importExport = JSON.stringify(data, null, 2);
  }

  async function handleImport() {
    if (!importExport) return;
    try {
      const parsed = JSON.parse(importExport);
      await browser.storage.local.clear();
      await browser.storage.local.set(parsed);
      const updated = await settingsItem.getValue();
      settings = updated;
      alert('Settings imported');
      location.reload();
    } catch (e) {
      alert('Invalid JSON');
    }
  }

  let year = new Date().getFullYear();
</script>

<div class="min-h-screen bg-base-200">
  <div class="max-w-3xl mx-auto p-6 space-y-6">
    <div class="flex items-center gap-3">
      <img src="/icon-48.png" alt="logo" class="w-10 h-10" />
      <h1 class="text-3xl font-bold">Settings</h1>
    </div>
    <p class="opacity-70">Change the URL to generate a QR code for. Settings are saved automatically.</p>

    <div class="divider"></div>

    <!-- URL Settings -->
    <div class="card bg-base-100 shadow">
      <div class="card-body">
        <h2 class="card-title">URL Settings</h2>

        <div class="form-control">
          <label class="label cursor-pointer justify-start gap-3">
            <input type="checkbox" class="toggle toggle-primary" bind:checked={settings.cleanUrl} />
            <span class="label-text">Clean URL</span>
          </label>
          <p class="text-sm opacity-60 ml-1">Remove tracking parameters from the URL</p>
        </div>

        <div class="form-control mt-4">
          <label class="label"><span class="label-text font-medium">Shorten URL</span></label>
          <select class="select select-bordered" bind:value={settings.urlShortener}>
            <option value="none">None</option>
            <option value="hamr">hamr (local)</option>
            <option value="tinyurl">TinyURL</option>
            <option value="isgd">is.gd</option>
            <option value="bitly">Bitly</option>
          </select>
          {#if settings.urlShortener === 'bitly'}
            <div class="alert alert-warning mt-3 py-2 text-sm">Warning: For this service to work, you need to get an API key from the service's website</div>
            <input type="text" placeholder="Enter API key" class="input input-bordered mt-2" bind:value={settings.api_key} />
          {:else if settings.urlShortener !== 'none'}
            <input type="text" placeholder="Enter API key" class="input input-bordered mt-2 hidden" disabled />
            <p class="text-sm opacity-60 mt-2">The URL will be shortened using the selected service. Disclaimer: I am not responsible for the service provided by the URL shortening service.</p>
            {#if settings.urlShortener === 'hamr'}
              <p class="text-sm opacity-60">The hamr (local) option does not require an API key and shortens the url locally. It will fallback to the original URL if the shortened URL is longer than the original.</p>
            {/if}
          {:else}
            <p class="text-sm opacity-60 mt-2">The URL will be shortened using the selected service.</p>
          {/if}
          {#if settings.urlShortener === 'bitly' && !settings.api_key}
            <div class="alert alert-warning mt-2 py-2 text-sm">Warning: For this service to work, you need to get an API key</div>
          {/if}
          {#if permissionError}
            <div class="alert alert-warning py-2 text-xs mt-2">{permissionError}</div>
          {/if}
        </div>
      </div>
    </div>

    <!-- QR Settings -->
    <div class="card bg-base-100 shadow">
      <div class="card-body">
        <h2 class="card-title">QR Code Settings</h2>

        <div class="form-control">
          <label class="label"><span class="label-text font-medium">Type</span></label>
          <select class="select select-bordered" bind:value={settings.type}>
            <option value="extra-rounded">Extra Rounded</option>
            <option value="rounded">Rounded</option>
            <option value="dots">Dots</option>
            <option value="classy">Classy</option>
            <option value="classy-rounded">Classy Rounded</option>
            <option value="square">Square</option>
          </select>
        </div>

        {#if isLowContrast}
          <div class="alert alert-warning mt-2 py-2 text-sm">Warning: Color is not very visible compared to background color</div>
        {/if}

        <div class="form-control">
          <label class="label"><span class="label-text font-medium">Color</span></label>
          <div class="flex items-center gap-3">
            <input type="color" class="w-16 h-10 p-1 rounded" bind:value={settings.color} />
            <span class="text-sm">{settings.color}</span>
          </div>
        </div>

        <div class="form-control">
          <label class="label"><span class="label-text font-medium">Background Color</span></label>
          <div class="flex items-center gap-3">
            <input type="color" class="w-16 h-10 p-1 rounded" bind:value={settings.background} />
            <span class="text-sm">{settings.background}</span>
          </div>
        </div>

        <div class="form-control">
          <label class="label"><span class="label-text font-medium">Logo</span></label>
          <input type="url" placeholder="Enter URL" class="input input-bordered w-full" bind:value={settings.logo} />
          <p class="text-sm opacity-60 mt-1">Enter URL for the logo in the middle of the QR Code (you can upload to <a href="https://imgur.com/upload" target="_blank" class="link">imgur</a> and paste the link here)</p>
        </div>

        <div class="form-control">
          <label class="label"><span class="label-text font-medium">Save format</span></label>
          <select class="select select-bordered" bind:value={settings.format}>
            <option value="png">PNG</option>
            <option value="jpg">JPG</option>
            <option value="webp">WEBP</option>
            <option value="svg">SVG</option>
          </select>
        </div>
      </div>
    </div>

    <!-- Debug -->
    <div class="collapse collapse-arrow bg-base-100">
      <input type="checkbox" />
      <div class="collapse-title text-lg font-medium">Debug</div>
      <div class="collapse-content space-y-4">
        <div>
          <h3 class="font-bold">Clean URL</h3>
          <textarea class="textarea textarea-bordered w-full" placeholder="Paste dirty URL here" rows="4" bind:value={dirtyUrl}></textarea>
          <button class="btn btn-sm mt-2" onclick={handleClean}>Clean</button>
        </div>
        <div class="divider"></div>
        <div>
          <h3 class="font-bold">Export / Import Settings</h3>
          <div class="flex gap-2 mt-2">
            <button class="btn btn-sm" onclick={handleExport}>Export</button>
            <button class="btn btn-sm btn-primary" onclick={handleImport}>Import</button>
          </div>
          <textarea class="textarea textarea-bordered w-full mt-2" placeholder="Paste settings here to import / Exported settings will be shown here" rows="6" bind:value={importExport}></textarea>
        </div>
      </div>
    </div>

    <p class="text-sm">Settings are saved automatically. <button class="link" onclick={reset}>Reset</button> to default settings.</p>

    <Footer {year} />
  </div>
</div>
