import { ALL_TRACKERS, DOMAIN_TRACKERS } from './rules';

const TRACKER_REGEXES_BY_TRACKER = new Map<string, RegExp>(
  ALL_TRACKERS.map((tracker) => [
    tracker,
    new RegExp(`((^|&)${tracker}=[^&#]*)`, 'ig'),
  ]),
);

/**
 * Removes known tracking parameters from a URL.
 * Ported from old_code/src/resources/tools.js:209.
 */
export function removeTrackersFromUrl(
  url: string,
  trackers: string[] = ALL_TRACKERS,
): string {
  if (!url) return url;

  const urlPieces = url.split('?');
  if (urlPieces.length === 1) return url;

  // Ensure query part exists even if hash present: preserve fragment handling via URL parsing after
  // We keep original split logic but handle Trackers list separately
  let query = urlPieces[1] ?? '';

  // For custom tracker lists, use dynamic regex; for default use precompiled
  const usePrecompiled = trackers === ALL_TRACKERS;
  for (const tracker of trackers) {
    const regex = usePrecompiled
      ? TRACKER_REGEXES_BY_TRACKER.get(tracker)!
      : new RegExp(`((^|&)${tracker}=[^&#]*)`, 'ig');
    query = query.replace(regex, '');
  }

  // Domain-specific trackers (google, tiktok, etc.)
  try {
    let host = new URL(url).hostname.replace(/^www\./, '');
    host = host.split('.').slice(0, -1).join('.');
    if (host.includes('.')) {
      host = host.split('.').slice(1).join('.');
    }
    const domainTrackers = DOMAIN_TRACKERS[host];
    if (domainTrackers) {
      for (const tracker of domainTrackers) {
        query = query.replace(new RegExp(`((^|&)${tracker}=[^&#]*)`, 'ig'), '');
      }
    }
  } catch {
    // ignore invalid URL
  }

  while (query.startsWith('&')) query = query.slice(1);
  // Clean up double && leftovers and dangling ? or &
  query = query.replace(/&&+/g, '&').replace(/^&|&$/g, '');

  return query ? `${urlPieces[0]!}?${query}` : urlPieces[0]!;
}

export { ALL_TRACKERS };
