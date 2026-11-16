<script lang="ts">
  import { onMount } from 'svelte';
  import { m } from '@/paraglide/messages.js';
  import { getLocale, locales, setLocale } from '@/paraglide/runtime.js';
  import { settingsItem, DEFAULT_SETTINGS, normalizeSettings, type QrSettings } from '../../utils/storage/settings';
  import { getContrastRatio } from '../../utils/color/contrast';
  import { removeTrackersFromUrl, ALL_TRACKERS } from '../../utils/url/tracker/cleaner';
  import { detectBrowser } from '../../utils/browser/detect';
  import Footer from '../../components/layout/Footer.svelte';
  import LanguageSelector from '../../components/layout/LanguageSelector.svelte';
  import QrCanvas from '../../components/qr/QrCanvas.svelte';
    import RateBanner from '@/components/qr/RateBanner.svelte';
  import {
    Ban,
    Check,
    CircleQuestionMark,
    Download,
    Earth,
    Image,
    Link2,
    Palette,
    RotateCcw,
    Settings2,
    SlidersHorizontal,
    Upload,
  } from '@lucide/svelte';

  let settings = $state<QrSettings>({ ...DEFAULT_SETTINGS });
  let isLoaded = $state(false);
  let isFirefox = $state(detectBrowser() === 'firefox');

  // Debug
  let dirtyUrl = $state('');
  let importExport = $state('');

  let contrast = $derived(getContrastRatio(settings.color, settings.background));
  let isLowContrast = $derived(contrast < 1.4);

  onMount(() => {
    settingsItem.getValue().then((stored) => {
      settings = normalizeSettings(stored);
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
    void settings.logoMode;
    void settings.urlShortener;
    void settings.apiKey;
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
            permissionError = m['options.url.permissionDenied']({ host });
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
    importExport = JSON.stringify(
      {
        storage: data,
        locale: getLocale(),
      }
    );
  }

  async function handleImport() {
    if (!importExport) return;
    try {
      const parsed: unknown = JSON.parse(importExport);
      const imported: ExportData = hasExportEnvelope(parsed)
        ? parseExportEnvelope(parsed)
        : { storage: parseStorageData(parsed) };

      await browser.storage.local.clear();

      await browser.storage.local.set(imported.storage as Record<string, unknown>);
      const updated = await settingsItem.getValue();
      settings = updated;
      alert(m['options.imported']());
      if (imported.locale) {
        await setLocale(imported.locale);
      }
      location.reload();
    } catch (e) {
      alert(m['options.invalidJson']({ error: String(e) }));
    }
  }

  function hasExportEnvelope(value: unknown): value is Record<string, unknown> {
    return Boolean(value && typeof value === 'object' && 'storage' in value);
  }

  type ExportData = {
    storage: Record<string, unknown>;
    locale?: (typeof locales)[number];
  };

  function parseExportEnvelope(value: Record<string, unknown>): ExportData {
    const exportData = value as { storage?: unknown; locale?: unknown };
    const storage = parseStorageData(exportData.storage);
    if (
      exportData.locale !== undefined &&
      (typeof exportData.locale !== 'string' ||
        !locales.includes(exportData.locale as (typeof locales)[number]))
    ) {
      throw new Error('Invalid locale in settings export');
    }
    return {
      storage,
      locale: exportData.locale as (typeof locales)[number] | undefined,
    };
  }

  function parseStorageData(value: unknown): Record<string, unknown> {
    if (typeof value !== 'object' || value === null || Array.isArray(value)) {
      throw new Error('Invalid settings export');
    }
    return value as Record<string, unknown>;
  }

  let year = new Date().getFullYear();
</script>

  <div class="min-h-screen bg-base-200">
    <div class="mx-auto grid w-full max-w-6xl gap-6 px-4 py-6 sm:px-6 lg:grid-cols-[13rem_minmax(0,1fr)] lg:py-8">
      <aside class="hidden lg:block">
        <div class="sticky top-24 space-y-4">
          <div class="px-3">
            <p class="text-xs font-semibold uppercase tracking-[0.16em] text-base-content/50">{m['options.workspace.title']()}</p>
            <p class="mt-1 text-sm text-base-content/70">{m['options.workspace.description']()}</p>
          </div>
          {#if !isFirefox}
            <ul class="menu menu-sm w-full rounded-box border border-base-300 bg-base-100 p-2">
              <li><a href="#url-settings" class="active"><Link2 class="h-4 w-4" />{m['options.navigation.urlDelivery']()}</a></li>
              <li><a href="#qr-settings"><SlidersHorizontal class="h-4 w-4" />{m['options.navigation.qrAppearance']()}</a></li>
              <li><a href="#data-tools"><Settings2 class="h-4 w-4" />{m['options.navigation.dataTools']()}</a></li>
            </ul>
          {/if}
          <div class="alert border border-primary/20 bg-primary/5 p-3 text-xs text-base-content/70">
            <CircleQuestionMark class="h-4 w-4 shrink-0 text-primary" />
            <span>{m['options.savedChanges']()}</span>
          </div>
        </div>
      </aside>

      <main class="min-w-0 space-y-5">
        {#if !isFirefox}
          <div class="tabs tabs-boxed w-full bg-base-100 p-1 lg:hidden">
            <a href="#url-settings" class="tab tab-active flex-1 gap-1 text-xs"><Link2 class="h-3.5 w-3.5" />{m['options.navigation.url']()}</a>
            <a href="#qr-settings" class="tab flex-1 gap-1 text-xs"><SlidersHorizontal class="h-3.5 w-3.5" />{m['options.navigation.qr']()}</a>
            <a href="#data-tools" class="tab flex-1 gap-1 text-xs"><Settings2 class="h-3.5 w-3.5" />{m['options.navigation.tools']()}</a>
          </div>
        {/if}

        <section id="url-settings" class="card scroll-mt-24 border border-base-300 bg-base-100">
          <div class="card-body gap-0 p-0">
            <div class="flex items-start gap-3 border-b border-base-300 px-5 py-4 sm:px-6">
              <div class="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary"><Link2 class="h-5 w-5" /></div>
              <div>
                <h2 class="card-title text-base sm:text-lg">{m['options.url.title']()}</h2>
                <p class="mt-1 text-sm text-base-content/60">{m['options.url.description']()}</p>
              </div>
            </div>

            <div class="space-y-6 p-5 sm:p-6">
              <div class="flex items-center justify-between gap-4 rounded-xl border border-base-300 bg-base-200/50 p-4">
                <div>
                  <label for="clean-url" class="font-medium">{m['options.url.cleanTracking']()}</label>
                  <p class="mt-1 text-sm text-base-content/60">{m['options.url.cleanTrackingDescription']()}</p>
                </div>
                <input id="clean-url" type="checkbox" class="toggle toggle-primary shrink-0" bind:checked={settings.cleanUrl} />
              </div>

              <div class="grid gap-3 sm:grid-cols-[minmax(0,15rem)_1fr] sm:items-start sm:gap-6">
                <div>
                  <label for="url-shortener" class="font-medium">{m['options.url.shortener']()}</label>
                  <p class="mt-1 text-sm text-base-content/60">{m['options.url.shortenerDescription']()}</p>
                </div>
                <div>
                  <select id="url-shortener" class="select select-bordered w-full" bind:value={settings.urlShortener}>
                    <option value="none">{m['options.url.shortener.none']()}</option>
                    <option value="hamr">{m['options.url.shortener.hamr']()}</option>
                    <option value="tinyurl">{m['options.url.shortener.tinyurl']()}</option>
                    <option value="isgd">{m['options.url.shortener.isgd']()}</option>
                    <option value="bitly">{m['options.url.shortener.bitly']()}</option>
                  </select>
                  {#if settings.urlShortener !== 'hamr' && settings.urlShortener !== 'none'}
                    <p class="mt-2 text-xs text-base-content/60">{m['options.url.externalService']()}</p>

                    {#if settings.urlShortener === 'bitly'}
                      <p class="mt-2 text-xs text-base-content/60">{m['options.url.bitlyRequirement']()}</p>
                      <p class="mt-1 text-xs text-base-content/60">{m['options.url.bitlyApiLink']()} <a href="https://app.bitly.com/settings/api/" target="_blank" rel="noopener noreferrer" class="link link-primary">https://app.bitly.com/settings/api/</a></p>
                    <input type="text" placeholder="{m['options.url.bitlyApiPlaceholder']()}" class="input input-bordered mt-2 w-full" bind:value={settings.apiKey} />
                    {/if}
                  {:else if settings.urlShortener === 'hamr'}
                      <p class="mt-2 text-xs text-base-content/60">{m['options.url.hamrDescription']()}</p>
                  {:else}
                    <p class="mt-2 text-xs text-base-content/60">{m['options.url.originalDescription']()}</p>
                  {/if}
                  {#if settings.urlShortener === 'bitly' && !settings.apiKey}
                    <div class="alert alert-warning mt-2 py-2 text-xs"><CircleQuestionMark class="h-4 w-4"/>{m['options.url.apiKeyEmpty']()}</div>
                  {/if}
                  {#if permissionError}
                    <div class="alert alert-warning mt-2 py-2 text-xs">{permissionError}</div>
                  {/if}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="qr-settings" class="card scroll-mt-24 border border-base-300 bg-base-100">
          <div class="card-body gap-0 p-0">
            <div class="flex items-start gap-3 border-b border-base-300 px-5 py-4 sm:px-6">
              <div class="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-secondary/10 text-secondary"><Palette class="h-5 w-5" /></div>
              <div>
                <h2 class="card-title text-base sm:text-lg">{m['options.qr.title']()}</h2>
                <p class="mt-1 text-sm text-base-content/60">{m['options.qr.description']()}</p>
              </div>
            </div>

            <div class="space-y-6 p-5 sm:p-6">
              <div class="max-sm:sticky max-sm:top-2 max-sm:z-10 flex items-center gap-3 rounded-xl border border-base-300 bg-base-100/95 p-2.5 shadow-sm backdrop-blur">
                <div class="shrink-0 rounded-3xl bg-base-200 p-1">
                  <QrCanvas data="https://wikipedia.org" {settings} size={120} faviconUrl="https://wikipedia.org/static/favicon/wikipedia.ico" />
                </div>
                <div class="min-w-0">
                  <div class="flex items-center gap-2">
                    <h3 class="text-sm font-medium">{m['options.qr.previewTitle']()}</h3>
                  </div>
                  <p class="mt-1 text-xs text-base-content/60">{m['options.qr.previewDescription']()}</p>
                </div>
              </div>

              <div class="grid gap-4 sm:grid-cols-2">
                <div>
                  <label for="qr-type" class="mb-2 block text-sm font-medium">{m['options.qr.dotStyle']()}</label>
                  <select id="qr-type" class="select select-bordered w-full" bind:value={settings.type}>
                    <option value="extra-rounded">{m['options.qr.dotStyles.extraRounded']()}</option>
                    <option value="rounded">{m['options.qr.dotStyles.rounded']()}</option>
                    <option value="dots">{m['options.qr.dotStyles.dots']()}</option>
                    <option value="classy">{m['options.qr.dotStyles.classy']()}</option>
                    <option value="classy-rounded">{m['options.qr.dotStyles.classyRounded']()}</option>
                    <option value="square">{m['options.qr.dotStyles.square']()}</option>
                  </select>
                </div>

              </div>

              <div>
                <div class="mb-3 flex items-center justify-between gap-3">
                  <div>
                    <h3 class="font-medium">{m['options.qr.palette']()}</h3>
                    <p class="mt-1 text-sm text-base-content/60">{m['options.qr.paletteDescription']()}</p>
                  </div>
                  {#if isLowContrast}<span class="badge badge-warning gap-1 h-auto"><CircleQuestionMark class="h-3.5 w-3.5" />{m['options.qr.lowContrast']()}</span>{/if}
                </div>
                <div class="grid gap-3 sm:grid-cols-2">
                  <label class="flex items-center gap-3 rounded-xl border border-base-300 p-3" for="qr-color">
                    <input id="qr-color" type="color" class="h-10 w-12 cursor-pointer rounded-lg border-0 p-1" bind:value={settings.color} />
                    <span><span class="block text-sm font-medium">{m['options.qr.dots']()}</span><span class="text-xs uppercase text-base-content/50">{settings.color}</span></span>
                  </label>
                  <label class="flex items-center gap-3 rounded-xl border border-base-300 p-3" for="qr-background">
                    <input id="qr-background" type="color" class="h-10 w-12 cursor-pointer rounded-lg border-0 p-1" bind:value={settings.background} />
                    <span><span class="block text-sm font-medium">{m['options.qr.background']()}</span><span class="text-xs uppercase text-base-content/50">{settings.background}</span></span>
                  </label>
                </div>
              </div>

              <div class="rounded-xl border border-base-300 p-4 sm:p-5">
                <div class="mb-4 flex items-start justify-between gap-4">
                  <div>
                    <h3 class="font-medium">{m['options.qr.logo']()}</h3>
                    <p class="mt-1 text-sm text-base-content/60">{m['options.qr.logoDescription']()}</p>
                  </div>
                  <span class="badge badge-ghost badge-sm shrink-0">{m['options.qr.optional']()}</span>
                </div>

                <div class="flex w-full gap-1 rounded-lg border border-base-300 bg-base-200 p-1">
                  <label
                    class="flex min-w-0 flex-1 items-center justify-center gap-2 rounded-md border border-transparent px-2.5 py-2.5 text-center text-sm text-base-content/70 ring-2 ring-transparent transition hover:text-base-content focus-within:outline focus-within:outline-primary/45 focus-within:outline-offset-1 max-[420px]:flex-col max-[420px]:gap-1 max-[420px]:px-1 max-[420px]:text-xs"
                    class:border-primary={settings.logoMode === 'none'}
                    class:bg-base-100={settings.logoMode === 'none'}
                    class:text-primary={settings.logoMode === 'none'}
                    class:ring-primary={settings.logoMode === 'none'}
                  >
                    <input type="radio" class="sr-only" name="logo-mode" value="none" bind:group={settings.logoMode} />
                    <Ban class="h-4 w-4 shrink-0" /><span>{m['options.qr.logoNone']()}</span>
                  </label>

                  <label
                    class="flex min-w-0 flex-1 items-center justify-center gap-2 rounded-md border border-transparent px-2.5 py-2.5 text-center text-sm text-base-content/70 ring-2 ring-transparent transition hover:text-base-content focus-within:outline focus-within:outline-primary/45 focus-within:outline-offset-1 max-[420px]:flex-col max-[420px]:gap-1 max-[420px]:px-1 max-[420px]:text-xs"
                    class:border-primary={settings.logoMode === 'custom'}
                    class:bg-base-100={settings.logoMode === 'custom'}
                    class:text-primary={settings.logoMode === 'custom'}
                    class:ring-primary={settings.logoMode === 'custom'}
                  >
                    <input type="radio" class="sr-only" name="logo-mode" value="custom" bind:group={settings.logoMode} />
                    <Image class="h-4 w-4 shrink-0" /><span>{m['options.qr.logoCustom']()}</span>
                  </label>

                  <label
                    class="flex min-w-0 flex-1 items-center justify-center gap-2 rounded-md border border-transparent px-2.5 py-2.5 text-center text-sm text-base-content/70 ring-2 ring-transparent transition hover:text-base-content focus-within:outline focus-within:outline-primary/45 focus-within:outline-offset-1 max-[420px]:flex-col max-[420px]:gap-1 max-[420px]:px-1 max-[420px]:text-xs"
                    class:border-primary={settings.logoMode === 'favicon'}
                    class:bg-base-100={settings.logoMode === 'favicon'}
                    class:text-primary={settings.logoMode === 'favicon'}
                    class:ring-primary={settings.logoMode === 'favicon'}
                  >
                    <input type="radio" class="sr-only" name="logo-mode" value="favicon" bind:group={settings.logoMode} />
                    <Earth class="h-4 w-4 shrink-0" /><span>{m['options.qr.logoTabIcon']()}</span>
                  </label>
                </div>

                {#if settings.logoMode === 'custom'}
                  <div class="mt-3 rounded-lg border border-base-300 bg-base-200/60 p-3">
                    <label class="label p-0 pb-2" for="custom-logo-url"><span class="label-text text-sm font-medium">{m['options.qr.imageUrl']()}</span></label>
                    <input id="custom-logo-url" type="url" placeholder="https://example.com/logo.png" class="input input-bordered w-full bg-base-100" bind:value={settings.logo} />
                    <p class="mt-2 text-xs text-base-content/60">{m['options.qr.imageCors']()}</p>
                  </div>
                {:else if settings.logoMode === 'favicon'}
                  <div class="mt-3 flex items-center gap-2 px-1 text-xs text-base-content/60"><Earth class="h-3.5 w-3.5 shrink-0 text-primary" /><span>{m['options.qr.faviconDescription']()}</span></div>
                {/if}
              </div>

              <div>
                <label for="save-format" class="mb-2 block text-sm font-medium">{m['options.qr.saveFormat']()}</label>
                <select id="save-format" class="select select-bordered w-full" bind:value={settings.format}>
                  <option value="png">PNG</option>
                  <option value="jpg">JPG</option>
                  <option value="webp">WEBP</option>
                  <option value="svg">SVG</option>
                </select>
              </div>
            </div>
          </div>
        </section>

        <section id="data-tools" class="collapse collapse-arrow scroll-mt-24 border border-base-300 bg-base-100">
          <input type="checkbox" />
          <div class="collapse-title flex items-start gap-3 px-5 py-4 pr-12 sm:px-6">
            <div class="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-accent/10 text-accent"><Settings2 class="h-5 w-5" /></div>
            <div>
              <h2 class="card-title text-base sm:text-lg">{m['options.tools.title']()}</h2>
              <p class="mt-1 text-sm text-base-content/60">{m['options.tools.description']()}</p>
            </div>
          </div>
          <div class="collapse-content px-5 pb-5 sm:px-6">
            <div class="space-y-6 border-t border-base-300 pt-5">
              <div>
                <label for="dirty-url" class="mb-2 block text-sm font-medium">{m['options.tools.cleaner']()}</label>
                <textarea id="dirty-url" class="textarea textarea-bordered min-h-24 w-full" placeholder="{m['options.tools.cleanerPlaceholder']()}" rows="3" bind:value={dirtyUrl}></textarea>
                <button class="btn btn-sm btn-outline mt-2 gap-2" onclick={handleClean}><SlidersHorizontal class="h-4 w-4" />{m['options.tools.clean']()}</button>
              </div>
              <div class="divider my-0"></div>
              <div>
                <div class="mb-2 flex items-center justify-between gap-3">
                  <div><h3 class="font-medium">{m['options.tools.backup']()}</h3><p class="mt-1 text-sm text-base-content/60">{m['options.tools.backupDescription']()}</p></div>
                  <div class="flex gap-2"><button class="btn btn-sm btn-ghost gap-1" onclick={handleExport}><Download class="h-4 w-4" />{m['options.tools.export']()}</button><button class="btn btn-sm btn-primary gap-1" onclick={handleImport}><Upload class="h-4 w-4" />{m['options.tools.import']()}</button></div>
                </div>
                <textarea class="textarea textarea-bordered w-full font-mono text-xs" placeholder="{m['options.tools.importPlaceholder']()}" rows="5" bind:value={importExport}></textarea>
              </div>
            </div>
          </div>
        </section>

        <div class="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-base-300 bg-base-100 p-4 text-xs text-base-content/60">
          <span class="flex items-center gap-1">
            <Check class="h-3.5 w-3.5 shrink-0 text-success" />
            {m['options.allSaved']()}
          </span>
          <button class="btn btn-ghost btn-sm h-auto min-h-8 gap-2 py-1.5 text-left whitespace-normal text-error" onclick={reset}>
            <RotateCcw class="h-4 w-4 shrink-0" />
            <span>{m['options.reset']()}</span>
          </button>
        </div>

        <div class="flex flex-col items-center gap-4 m-auto max-w-2xl">
          <RateBanner alwaysShow={true} />
          <LanguageSelector />
          <Footer {year} />
        </div>
      </main>
    </div>
  </div>

<style>
/* smooth scrolling */
:root {
  scroll-behavior: smooth;
}
</style>