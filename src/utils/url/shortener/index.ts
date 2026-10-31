import type { Shortener } from './types';
import { shortenWithHamr } from './providers/hamr';
import { shortenWithTinyUrl } from './providers/tinyurl';
import { shortenWithIsGd } from './providers/isgd';
import { shortenWithBitly } from './providers/bitly';

export type { Shortener };

const SHORTENER_TIMEOUT_MS = 8000;

export async function getShortUrl(
  url: string,
  service: Shortener,
  apiKey = '',
): Promise<string> {
  if (!url || service === 'none') return url;
  const shortening = (() => {
    switch (service) {
    case 'hamr':
      return shortenWithHamr(url);
    case 'tinyurl':
      return shortenWithTinyUrl(url);
    case 'isgd':
      return shortenWithIsGd(url);
    case 'bitly':
      return shortenWithBitly(url, apiKey);
    default:
        return Promise.resolve(url);
    }
  })();

  let timeoutId: ReturnType<typeof setTimeout>;
  const timeout = new Promise<string>((resolve) => {
    timeoutId = setTimeout(() => resolve(url), SHORTENER_TIMEOUT_MS);
  });

  try {
    return await Promise.race([shortening, timeout]);
  } catch {
    return url;
  } finally {
    clearTimeout(timeoutId!);
  }
}
