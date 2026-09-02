<script lang="ts">
  import QRCodeStyling from 'qr-code-styling';
  import { buildQrOptions } from '../../utils/qr/qrOptions';
  import type { QrSettings } from '../../utils/storage/settings';

  let { data, settings, size = 280 }: { data: string; settings: QrSettings; size?: number } = $props();

  let container: HTMLDivElement | undefined = $state(undefined);
  let qrInstance: InstanceType<typeof QRCodeStyling> | null = null;
  let error = $state<string | null>(null);
  let isRendering = $state(true);

  // QR code capacity: ~2953 bytes max for version 40 with EC L, but with styling we use lower
  // We'll consider > 2000 chars as warning, but actual overflow is caught via exception
  const MAX_QR_LENGTH = 2000;

  function render() {
    if (!container) return;
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
      const options = buildQrOptions(data, settings, size);
      qrInstance = new QRCodeStyling(options as any);
      qrInstance.append(container);
      if (!container.innerHTML || container.innerHTML.trim() === '') {
        error = null;
      }
    } catch (e: any) {
      console.error('QR render error', e);
      const msg = String(e?.message || e);
      if (msg.includes('code length overflow') || msg.includes('overflow') || data.length > MAX_QR_LENGTH) {
        error = `URL too long for QR code (${data.length} chars). Max ~${MAX_QR_LENGTH}. Try shortening via Settings (hamr local, TinyURL, is.gd) or use a shorter URL.`;
      } else {
        error = `Failed to generate QR: ${msg}`;
      }
    } finally {
      isRendering = false;
    }
  }

  $effect(() => {
    void container;
    void data;
    void settings.color;
    void settings.background;
    void settings.type;
    void settings.logo;
    void size;
    queueMicrotask(() => render());
  });

  export function download(filename: string = 'qr-code') {
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
      const downloadOptions = buildQrOptions(data, settings, 500);
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
      qr.download({ name, extension } as any);
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
    bind:this={container}
    class="qr-canvas flex items-center justify-center overflow-hidden rounded-xl bg-base-200 relative"
    class:placeholder={!data && !error}
    style:width="{size}px"
    style:height="{size}px"
  >
    {#if isRendering}
      <span class="loading loading-spinner loading-lg opacity-60 absolute"></span>
    {:else if !data && !error}
      <span class="loading loading-spinner loading-lg opacity-30"></span>
    {:else if error}
      <div class="p-4 text-center text-sm text-error max-w-[280px] break-words">
        <span class="font-bold">Error:</span> {error}
      </div>
    {/if}
  </div>
  {#if error}
    <div class="alert alert-error py-2 px-3 text-xs max-w-[280px] break-words">
      <svg xmlns="http://www.w3.org/2000/svg" class="stroke-current shrink-0 h-4 w-4" fill="none" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
      <span>{error}</span>
    </div>
  {:else if data && data.length > 1800 && !isRendering}
    <div class="alert alert-warning py-1 px-2 text-xs max-w-[280px]">
      <svg xmlns="http://www.w3.org/2000/svg" class="stroke-current shrink-0 h-4 w-4" fill="none" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.5-.678 2.5-1.759V7.759c0-1.081-.96-1.759-2.5-1.759H5.378c-1.54 0-2.5.678-2.5 1.759v8.48c0 1.081.96 1.759 2.5 1.759z" /></svg>
      Warning: URL is long ({data.length} chars) — may be hard to scan. Try hamr.
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
