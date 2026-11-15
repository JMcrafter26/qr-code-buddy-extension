<script lang="ts">
  import { onMount } from 'svelte';
  import { fly } from 'svelte/transition';
  import { cubicOut } from 'svelte/easing';
  import { settingsItem, DEFAULT_SETTINGS, normalizeSettings, type QrSettings } from '../../utils/storage/settings';
  import { PartyPopper, SwatchBook, ChevronsUp, ChevronRight, ChevronLeft } from '@lucide/svelte';
  import { i18n } from '#i18n';

  let step = $state(1);
  let direction = $state(1); // 1 = forward, -1 = backward
  const total = 3;
  const appVersion = browser.runtime.getManifest().version;

  let settings = $state<QrSettings>({ ...DEFAULT_SETTINGS });
  let isLoaded = $state(false);

  onMount(async () => {
    settings = normalizeSettings(await settingsItem.getValue());
    isLoaded = true;
  });

  async function save() {
    await settingsItem.setValue($state.snapshot(settings));
  }

  function goToStep(targetStep: number) {
    direction = targetStep > step ? 1 : -1;
    step = targetStep;
  }

  function next() {
    if (step < total) {
      direction = 1;
      step += 1;
    } else {
      openQRPage();
    }
    if (isLoaded) save();
  }

  function prev() {
    if (step > 1) {
      direction = -1;
      step -= 1;
    }
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

  function openQRPage() {
    save();
    // redirect to the QR page
    window.location.href = '/qr.html';
    // rewrite the history so that back button doesn't go back to welcome
    history.replaceState({}, '', '/qr.html');
  }

  // Auto-save + request optional host permission when shortener changes
  let permissionError = $state<string | null>(null);
  $effect(() => {
    void settings.urlShortener;
    void settings.cleanUrl;
    void settings.logoMode;
    void settings.api_key;
    if (!isLoaded) return;
    // Request host permission for network shorteners
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
            // permissionError = `Permission for ${host} denied. Shortener will fallback to original URL.`;
            permissionError = `${i18n.t('welcome.urlHandling.permissionDenied', { host })}`;
            // Optionally revert to none
          } else {
            permissionError = null;
          }
        })
        .catch(() => {
          permissionError = null; // ignore, fetch will fallback
        });
    } else {
      permissionError = null;
    }
    save();
  });
</script>

<div class="min-h-screen bg-base-200 flex items-center justify-center p-4">
  <div class="card bg-base-100 shadow-lg w-full max-w-lg overflow-hidden">
    <div class="card-body">
      <!-- Header -->
      <div class="flex items-center gap-3 mb-2">
        <img src="/icon-48.png" alt="" class="w-10 h-10 rounded" />
        <div>
          <h1 class="font-bold leading-none">{i18n.t('common.appName')}</h1>
          <!-- <p class="text-xs opacity-60">Welcome — 3 quick steps</p> -->
        </div>
        <!-- <div class="ml-auto text-xs opacity-50">Step {step}/{total}</div> -->
        <div class="ml-auto text-xs opacity-50">{i18n.t('common.navigation.step', { step, total })}</div>
      </div>

      <!-- Dots pagination -->
      <div class="flex justify-center gap-2 my-3">
        {#each Array(total) as _, i}
          <button
            class="w-2 h-2 rounded-full transition-all {i + 1 === step ? 'bg-primary w-6' : 'bg-base-300'}"
            onclick={() => goToStep(i + 1)}
            aria-label={i18n.t('common.navigation.goToStep', { step: i + 1 })}
          ></button>
        {/each}
      </div>

      <!-- Steps Container with Woosh Transition -->
      <div class="grid grid-cols-1 grid-rows-1 min-h-[290px]">
        {#key step}
          <div
            class="col-start-1 row-start-1 space-y-4"
            in:fly={{ x: direction * 150, duration: 250, delay: 100, easing: cubicOut }}
            out:fly={{ x: direction * -150, duration: 200, easing: cubicOut }}
          >
            {#if step === 1}
              <div class="space-y-4">
                <PartyPopper class="w-12 h-12 text-primary" />
                <h2 class="text-xl font-bold">{i18n.t('welcome.intro.title')}</h2>
                <p class="text-sm opacity-70">{i18n.t('welcome.intro.description')}</p>
                <ul class="list-disc list-inside text-sm space-y-1 opacity-80">
                  <li>{i18n.t('welcome.intro.benefits.instantQr')}</li>
                  <li>{i18n.t('welcome.intro.benefits.contextMenu')}</li>
                  <li>{i18n.t('welcome.intro.benefits.customization')}</li>
                </ul>
                <p class="text-xs opacity-50">
                  {i18n.t('common.links.see')}
                  <a href="https://github.com/JMcrafter26/qr-code-buddy-extension/blob/main/privacy-policy.md" target="_blank" class="link">{i18n.t('common.links.privacyPolicy')}</a>
                </p>
              </div>
            {:else if step === 2}
              <div class="space-y-4">
                <h2 class="text-xl font-bold">{i18n.t('welcome.urlHandling.title')}</h2>
                <p class="text-sm opacity-70">{i18n.t('welcome.urlHandling.description')}</p>

                <label class="flex items-center gap-3 p-3 rounded-lg border {settings.cleanUrl ? 'border-primary bg-primary/5' : 'border-base-200'} cursor-pointer">
                  <input type="checkbox" class="toggle toggle-primary toggle-sm" bind:checked={settings.cleanUrl} />
                  <div class="text-sm">
                    <div class="font-medium">{i18n.t('welcome.urlHandling.fields.tracking.label')}</div>
                    <div class="text-xs opacity-60">{i18n.t('welcome.urlHandling.fields.tracking.description')}</div>
                  </div>
                </label>

                <div class="form-control">
                  <label class="label"><span class="label-text font-medium">{i18n.t('welcome.urlHandling.fields.shortener.label')}</span></label>
                  <select class="select select-bordered select-sm" bind:value={settings.urlShortener}>
                    <option value="none">{i18n.t('welcome.urlHandling.fields.shortener.options.none.label')}</option>
                    <option value="hamr" selected>{i18n.t('welcome.urlHandling.fields.shortener.options.hamr.label')}</option>
                    <option value="tinyurl">{i18n.t('welcome.urlHandling.fields.shortener.options.tinyurl.label')}</option>
                    <option value="isgd">{i18n.t('welcome.urlHandling.fields.shortener.options.isgd.label')}</option>
                    <option value="bitly">{i18n.t('welcome.urlHandling.fields.shortener.options.bitly.label')}</option>
                  </select>
                  <p class="text-xs opacity-60 mt-1">
                    {#if settings.urlShortener === 'none'}{i18n.t('welcome.urlHandling.fields.shortener.options.none.description')}
                    {:else if settings.urlShortener === 'hamr'}{i18n.t('welcome.urlHandling.fields.shortener.options.hamr.description')}
                    {:else}{i18n.t('welcome.urlHandling.fields.shortener.externalDescription')}{/if}
                  </p>
                  {#if settings.urlShortener === 'bitly'}
                    <input type="text" placeholder="{i18n.t('welcome.urlHandling.fields.shortener.options.bitly.apiKeyPlaceholder')}" class="input input-bordered input-sm mt-2" bind:value={settings.api_key} />
                    <!-- {#if !settings.api_key}<p class="text-xs text-warning mt-1">API key required for Bitly</p>{/if} -->
                    {#if !settings.api_key}<p class="text-xs text-warning mt-1">{i18n.t('welcome.urlHandling.fields.shortener.options.bitly.apiKeyRequired')}</p>{/if}
                  {/if}
                  {#if permissionError}
                    <div class="alert alert-warning py-2 text-xs mt-2">{permissionError}</div>
                  {/if}
                </div>
                <div class="alert py-2 text-xs mt-5">
                  {i18n.t('welcome.urlHandling.autoSaveDescription')}
                </div>
              </div>
            {:else if step === 3}
              <div class="space-y-4">
                <h2 class="text-xl font-bold">{i18n.t('welcome.features.title')}</h2>
                <label class="flex cursor-pointer items-center gap-3 rounded-lg border p-3 transition {settings.logoMode === 'favicon' ? 'border-primary bg-primary/5' : 'border-base-300'}">
                  <input
                    type="checkbox"
                    class="toggle toggle-primary toggle-sm"
                    checked={settings.logoMode === 'favicon'}
                    onchange={(event) => (settings.logoMode = (event.currentTarget as HTMLInputElement).checked ? 'favicon' : 'none')}
                  />
                  <span class="text-sm">
                    <span class="block font-medium">{i18n.t('welcome.features.favicon.label')}</span>
                    <span class="block text-xs opacity-60">{i18n.t('welcome.features.favicon.description')}</span>
                  </span>
                </label>
                <div class="grid grid-cols-1 gap-3 text-sm">
                  <div class="flex gap-3 p-3 bg-base-200 rounded-lg">
                    <span class="text-lg text-primary"><SwatchBook /></span>
                    <div><b>{i18n.t('welcome.features.style.label')}:</b> {i18n.t('welcome.features.style.description')}</div>
                  </div>
                  <!-- <div class="flex gap-3 p-3 bg-base-200 rounded-lg">
                    <span class="text-lg text-primary"><Link /></span>
                    <div><b>Data types:</b> URL, text, email, phone, SMS, WiFi, geo, event</div>
                  </div> -->
                  <div class="flex gap-3 p-3 bg-base-200 rounded-lg">
                    <span class="text-lg text-primary"><ChevronsUp /></span>
                    <div><b>{i18n.t('welcome.features.performance.label')}:</b> {i18n.t('welcome.features.performance.description')}</div>
                  </div>
                </div>
                <div class="alert py-2 text-xs">
                  {i18n.t('welcome.features.completionMessage')}
                </div>
              </div>
            {/if}
          </div>
        {/key}
      </div>

      <!-- Nav -->
      <div class="flex justify-between mt-6">
        <button class="btn btn-ghost btn-sm" onclick={prev} disabled={step===1}><ChevronLeft /></button>
        <div class="flex gap-2">
          {#if step < total}
            <button class="btn btn-primary btn-sm" onclick={next}>{i18n.t('common.actions.next')} <ChevronRight /></button>
          {:else}
            <button class="btn btn-ghost btn-sm" onclick={openSettings}>{i18n.t('common.actions.settings')}</button>
            <button class="btn btn-primary btn-sm" onclick={openQRPage}>{i18n.t('common.actions.done')}</button>
          {/if}
        </div>
      </div>
    </div>
  </div>

  <!-- version footer -->
  <div class="absolute bottom-2 text-xs opacity-50">
    v{appVersion} — <a href="https://github.com/JMcrafter26/qr-code-buddy-extension/releases" target="_blank" class="link">{i18n.t('common.links.releaseNotes')}</a>
  </div>
</div>