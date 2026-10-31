const FAVICON_LOAD_TIMEOUT = 800;
const ANALYSIS_SIZE = 32;
const MIN_CONTRAST = 3;
const MONOCHROME_SPREAD = 32;
const DEFAULT_BACKGROUND = '#efefef';
const faviconLoads = new Map<string, Promise<string | null>>();
const faviconResults = new Map<string, string | null>();

function cacheKey(url: string, background: string): string {
  return `${url}\n${background}`;
}

function hexToRgbChannels(hex: string): { r: number; g: number; b: number } | null {
  const match = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!match) return null;
  return {
    r: parseInt(match[1]!, 16),
    g: parseInt(match[2]!, 16),
    b: parseInt(match[3]!, 16),
  };
}

// WCAG relative luminance, normalized to 0..1.
function relativeLuminance({ r, g, b }: { r: number; g: number; b: number }): number {
  const channel = (value: number) => {
    const srgb = value / 255;
    return srgb <= 0.03928 ? srgb / 12.92 : ((srgb + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
}

function contrastRatio(
  first: { r: number; g: number; b: number },
  second: { r: number; g: number; b: number },
): number {
  const a = relativeLuminance(first);
  const b = relativeLuminance(second);
  return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
}

function getMonochromeColor(image: HTMLImageElement): { r: number; g: number; b: number } | null {
  const canvas = document.createElement('canvas');
  canvas.width = ANALYSIS_SIZE;
  canvas.height = ANALYSIS_SIZE;
  const context = canvas.getContext('2d', { willReadFrequently: true });
  if (!context) return null;

  context.drawImage(image, 0, 0, ANALYSIS_SIZE, ANALYSIS_SIZE);
  const pixels = context.getImageData(0, 0, ANALYSIS_SIZE, ANALYSIS_SIZE).data;
  const visible: Array<{ r: number; g: number; b: number }> = [];

  for (let index = 0; index < pixels.length; index += 4) {
    if (pixels[index + 3]! < 64) continue;
    visible.push({ r: pixels[index]!, g: pixels[index + 1]!, b: pixels[index + 2]! });
  }
  if (visible.length < 8) return null;

  const average = visible.reduce(
    (sum, pixel) => ({ r: sum.r + pixel.r, g: sum.g + pixel.g, b: sum.b + pixel.b }),
    { r: 0, g: 0, b: 0 },
  );
  average.r /= visible.length;
  average.g /= visible.length;
  average.b /= visible.length;

  const spread = Math.max(
    ...visible.map((pixel) => Math.hypot(pixel.r - average.r, pixel.g - average.g, pixel.b - average.b)),
  );
  return spread <= MONOCHROME_SPREAD ? average : null;
}

function createLogoDataUrl(image: HTMLImageElement, background: string): string | null {
  const monochrome = getMonochromeColor(image);
  const output = document.createElement('canvas');
  output.width = image.naturalWidth;
  output.height = image.naturalHeight;
  const context = output.getContext('2d');
  if (!context) return null;
  context.drawImage(image, 0, 0);

  if (monochrome) {
    const backgroundRgb = hexToRgbChannels(background);
    const contrast = backgroundRgb ? contrastRatio(monochrome, backgroundRgb) : MIN_CONTRAST;
    if (backgroundRgb && contrast < MIN_CONTRAST) {
      const black = { r: 0, g: 0, b: 0 };
      const white = { r: 255, g: 255, b: 255 };
      const target = contrastRatio(black, backgroundRgb) >= contrastRatio(white, backgroundRgb) ? black : white;
      const pixels = context.getImageData(0, 0, output.width, output.height);
      for (let index = 0; index < pixels.data.length; index += 4) {
        if (pixels.data[index + 3]! === 0) continue;
        pixels.data[index] = target.r;
        pixels.data[index + 1] = target.g;
        pixels.data[index + 2] = target.b;
      }
      context.putImageData(pixels, 0, 0);
    }
  }

  return output.toDataURL('image/png');
}

export function loadFavicon(url: string, background = DEFAULT_BACKGROUND): Promise<string | null> {
  const key = cacheKey(url, background);
  const cached = faviconLoads.get(key);
  if (cached) return cached;

  const load = new Promise<string | null>((resolve) => {
    const image = new Image();
    const timeout = setTimeout(() => {
      image.src = '';
      resolve(null);
    }, FAVICON_LOAD_TIMEOUT);

    image.crossOrigin = 'anonymous';
    image.onload = () => {
      clearTimeout(timeout);
      try {
        resolve(createLogoDataUrl(image, background));
      } catch {
        resolve(null);
      }
    };
    image.onerror = () => {
      clearTimeout(timeout);
      resolve(null);
    };
    image.src = url;
  });

  const cachedLoad = load.then((result) => {
    faviconResults.set(key, result);
    return result;
  });
  faviconLoads.set(key, cachedLoad);
  return cachedLoad;
}

export function preloadFavicon(url: string, background = DEFAULT_BACKGROUND): void {
  if (url) void loadFavicon(url, background);
}

export function getLoadedFavicon(url: string, background = DEFAULT_BACKGROUND): string | null | undefined {
  return faviconResults.get(cacheKey(url, background));
}
