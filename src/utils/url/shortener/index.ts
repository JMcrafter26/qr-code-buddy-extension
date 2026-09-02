import type { Shortener } from './types';
import { shortenWithHamr } from './providers/hamr';
import { shortenWithTinyUrl } from './providers/tinyurl';
import { shortenWithIsGd } from './providers/isgd';
import { shortenWithBitly } from './providers/bitly';

export type { Shortener };

export async function getShortUrl(url: string, service: Shortener, apiKey = ''): Promise<string> {
  if (!url) return url;
  switch (service) {
    case 'hamr':
      return shortenWithHamr(url);
    case 'tinyurl':
      return shortenWithTinyUrl(url);
    case 'isgd':
      return shortenWithIsGd(url);
    case 'bitly':
      return shortenWithBitly(url, apiKey);
    case 'none':
    default:
      return url;
  }
}
