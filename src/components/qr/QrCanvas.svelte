<script lang="ts">
  import { fade } from 'svelte/transition';
  import QRCodeStyling from 'qr-code-styling';
  import { buildQrOptions } from '../../utils/qr/qrOptions';
  import { getLoadedFavicon, loadFavicon } from '../../utils/qr/favicon';
  import type { QrSettings } from '../../utils/storage/settings';
  import { CircleX, TriangleAlert } from '@lucide/svelte';

  let { data, settings, faviconUrl = '', size = 280, isProcessing = false }: { data: string; settings: QrSettings; faviconUrl?: string; size?: number; isProcessing?: boolean } = $props();

  let container: HTMLDivElement | undefined = $state(undefined);
  let qrInstance: InstanceType<typeof QRCodeStyling> | null = null;
  let error = $state<string | null>(null);
  let isRendering = $state(true);
  let showSpinner = $state(false);
  let showSlowQrMessage = $state(false);
  let showSlowShortenerMessage = $state(false);
  let spinnerTimer: ReturnType<typeof setTimeout> | null = null;
  let slowQrTimer: ReturnType<typeof setTimeout> | null = null;
  let slowShortenerTimer: ReturnType<typeof setTimeout> | null = null;

  // QR code capacity: ~2953 bytes max for version 40 with EC L, but with styling we use lower
  // We'll consider > 2000 chars as warning, but actual overflow is caught via exception
  const MAX_QR_LENGTH = 2000;

  let renderSequence = 0;

  $effect(() => {
    void isRendering;
    if (spinnerTimer) clearTimeout(spinnerTimer);
    showSpinner = false;
    if (isRendering) spinnerTimer = setTimeout(() => (showSpinner = true), 1000);
    return () => {
      if (spinnerTimer) clearTimeout(spinnerTimer);
    };
  });

  $effect(() => {
    void isRendering;
    if (slowQrTimer) clearTimeout(slowQrTimer);
    showSlowQrMessage = false;
    if (isRendering) slowQrTimer = setTimeout(() => (showSlowQrMessage = true), 3000);
    return () => {
      if (slowQrTimer) clearTimeout(slowQrTimer);
    };
  });

  $effect(() => {
    void isProcessing;
    if (slowShortenerTimer) clearTimeout(slowShortenerTimer);
    showSlowShortenerMessage = false;
    if (isProcessing) slowShortenerTimer = setTimeout(() => (showSlowShortenerMessage = true), 3000);
    return () => {
      if (slowShortenerTimer) clearTimeout(slowShortenerTimer);
    };
  });

  function waitForPaint(): Promise<void> {
    return new Promise((resolve) => requestAnimationFrame(() => resolve()));
  }

  async function resolveLogo(): Promise<string | undefined> {
    if (settings.logoMode === 'custom') return settings.logo || undefined;
    if (settings.logoMode !== 'favicon' || !faviconUrl) return undefined;
    return (await loadFavicon(faviconUrl, settings.background)) ?? undefined;
  }

  async function render() {
    if (!container) return;
    const sequence = ++renderSequence;
    isRendering = true;
    container.innerHTML = '';
    error = null;
    if (!data) {
      isRendering = false;
      return;
    }
    // Early check for too long
    if (data.length > 3000) {
      error = `URL too long for QR code (${data.length} chars). Max ~2953. Try shortening (hamr, TinyURL, is.gd) or a shorter URL.`;
      isRendering = false;
      return;
    }
    try {
      await waitForPaint();
      if (sequence !== renderSequence) return;
      const options = buildQrOptions(data, settings, size, 'canvas');
      const instance = new QRCodeStyling(options as any);
      qrInstance = instance;
      instance.append(container);
      if (!container.innerHTML || container.innerHTML.trim() === '') {
        error = null;
      }
      if (sequence === renderSequence) isRendering = false;

      if (settings.logoMode === 'favicon' && faviconUrl) {
        const logo = await resolveLogo();
        if (sequence !== renderSequence || !logo || qrInstance !== instance) return;
        try {
          instance.update(buildQrOptions(data, settings, size, 'canvas', logo) as any);
        } catch (logoError) {
          console.warn('Favicon QR enhancement failed; keeping plain QR', logoError);
        }
      }
    } catch (e: any) {
      console.error('QR render error', e);
      const msg = String(e?.message || e);
      if (msg.includes('code length overflow') || msg.includes('overflow') || data.length > MAX_QR_LENGTH) {
        error = `URL too long for QR code (${data.length} chars). Max ~${MAX_QR_LENGTH}. Try shortening via Settings (hamr local, TinyURL, is.gd) or use a shorter URL.`;
      } else {
        if (settings.logoMode === 'favicon') {
          try {
            container.innerHTML = '';
            const options = buildQrOptions(data, settings, size, 'canvas', '');
            qrInstance = new QRCodeStyling(options as any);
            qrInstance.append(container);
            error = null;
          } catch (fallbackError) {
            console.error('QR render fallback error', fallbackError);
            error = `Failed to generate QR: ${msg}`;
          }
        } else {
          error = `Failed to generate QR: ${msg}`;
        }
      }
    } finally {
      if (sequence === renderSequence) isRendering = false;
    }
  }

  $effect(() => {
    void container;
    void data;
    void settings.color;
    void settings.background;
    void settings.type;
    void settings.logo;
    void settings.logoMode;
    void faviconUrl;
    void size;
    queueMicrotask(() => render());
  });

  export async function download(filename: string = 'qr-code') {
    if (!data) return;
    if (error) {
      alert(error);
      throw new Error(error);
    }
    if (data.length > 3000) {
      const msg = `URL too long for QR code (${data.length} chars). Cannot download.`;
      alert(msg);
      throw new Error(msg);
    }
    try {
      const logo = settings.logoMode === 'favicon' && faviconUrl
        ? getLoadedFavicon(faviconUrl, settings.background) ?? undefined
        : settings.logoMode === 'custom'
          ? settings.logo || undefined
          : undefined;
      const downloadOptions = buildQrOptions(data, settings, 500, 'canvas', logo);
      const qr = new QRCodeStyling(downloadOptions as any);
      let name = 'qr-code';
      let extension: string = settings.format || 'png';
      try {
        if (data.includes('http')) {
          const u = new URL(data);
          name = 'qr-' + u.hostname + u.pathname.replace(/\//g, '-');
        } else {
          name = filename;
        }
      } catch {
        name = filename;
      }
      try {
        await qr.download({ name, extension } as any);
      } catch (downloadError) {
        if (settings.logoMode !== 'favicon') throw downloadError;
        const fallback = new QRCodeStyling(buildQrOptions(data, settings, 500, 'canvas', '') as any);
        await fallback.download({ name, extension } as any);
      }
    } catch (e: any) {
      const msg = String(e?.message || e);
      if (msg.includes('overflow')) {
        const err = `URL too long for QR code (${data.length} chars).`;
        alert(err);
        throw new Error(err);
      }
      throw e;
    }
  }

  export function getError(): string | null {
    return error;
  }
</script>

<div class="flex flex-col items-center gap-2">
  <div
    class="relative isolate flex shrink-0 items-center justify-center overflow-hidden rounded-xl bg-base-200"
    class:placeholder={!data && !error}
    style:width="{size}px"
    style:height="{size}px"
  >
    <div bind:this={container} class="qr-canvas absolute inset-0 h-full w-full"></div>
    {#if showSpinner}
      <div in:fade={{ duration: 350 }} class="absolute inset-0 z-10 flex items-center justify-center bg-base-200/80">
        <span class="loading loading-spinner loading-lg opacity-70"></span>
      </div>
    {:else if error}
      <div class="absolute inset-0 z-10 flex flex-col items-center justify-center p-4 text-center text-sm text-error max-w-[280px] break-words">
        <span class="font-bold">Error:</span> {error}
      </div>
    {/if}
  </div>
  {#if error}
    <div class="alert alert-error py-2 px-3 text-xs max-w-[280px] break-words">
      <CircleX class="w-4 h-4" />
      <span>{error}</span>
    </div>
  {:else if data && data.length > 1800 && !isRendering}
    <div class="alert alert-warning py-1 px-2 text-xs max-w-[280px]">
      <TriangleAlert class="w-4 h-4" />
      Warning: URL is long ({data.length} chars) — may be hard to scan. Try hamr.
    </div>
  {/if}
  {#if showSlowQrMessage && !error}
    <div in:fade={{ duration: 500 }} class="flex items-center justify-center text-center text-xs text-base-content/60">
      QR generation is taking longer than usual.
    </div>
  {/if}
  {#if showSlowShortenerMessage && !error}
    <div in:fade={{ duration: 500 }} class="flex items-center justify-center text-center text-xs text-base-content/60">
      Waiting for the URL shortening service. This may be an external service delay.
    </div>
  {/if}
</div>

<style>
  .qr-canvas :global(canvas),
  .qr-canvas :global(svg) {
    border-radius: 12px;
    display: block;
  }
  .placeholder {
    background-color: hsl(var(--b2));
  }
</style>
