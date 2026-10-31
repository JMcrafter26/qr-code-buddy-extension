const FAVICON_LOAD_TIMEOUT = 400;
const faviconLoads = new Map<string, Promise<string | null>>();
const faviconResults = new Map<string, string | null>();

export function loadFavicon(url: string): Promise<string | null> {
  const cached = faviconLoads.get(url);
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
      resolve(url);
    };
    image.onerror = () => {
      clearTimeout(timeout);
      resolve(null);
    };
    image.src = url;
  });

  const cachedLoad = load.then((result) => {
    faviconResults.set(url, result);
    return result;
  });
  faviconLoads.set(url, cachedLoad);
  return cachedLoad;
}

export function preloadFavicon(url: string): void {
  if (url) void loadFavicon(url);
}

export function getLoadedFavicon(url: string): string | null | undefined {
  return faviconResults.get(url);
}
