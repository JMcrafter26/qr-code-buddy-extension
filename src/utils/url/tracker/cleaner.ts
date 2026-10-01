import { ALL_TRACKERS, DOMAIN_TRACKERS } from './rules';

function matchesTracker(parameterName: string, tracker: string): boolean {
  return parameterName.toLowerCase() === tracker.toLowerCase();
}

function removeMatchingParameters(
  query: string,
  trackers: string[],
  usePatterns = false,
): string {
  return query
    .split('&')
    .filter((parameter) => {
      const equalsIndex = parameter.indexOf('=');
      const encodedName =
        equalsIndex === -1 ? parameter : parameter.slice(0, equalsIndex);
      let parameterName = encodedName;

      try {
        parameterName = decodeURIComponent(encodedName.replace(/\+/g, ' '));
      } catch {
        // Keep the raw name when a malformed escape is present.
      }

      return !trackers.some((tracker) =>
        usePatterns
          ? new RegExp(`^${tracker}$`, 'i').test(parameterName)
          : matchesTracker(parameterName, tracker),
      );
    })
    .join('&');
}

/**
 * Removes known tracking parameters from a URL.
 * Ported from old_code/src/resources/tools.js:209.
 */
export function removeTrackersFromUrl(
  url: string,
  trackers: string[] = ALL_TRACKERS,
): string {
  if (!url) return url;

  const queryStart = url.indexOf('?');
  if (queryStart === -1) return url;

  const fragmentStart = url.indexOf('#', queryStart);
  const queryEnd = fragmentStart === -1 ? url.length : fragmentStart;
  let prefix = url.slice(0, queryStart);
  const query = url.slice(queryStart + 1, queryEnd);
  const fragment = fragmentStart === -1 ? '' : url.slice(fragmentStart);

  if (!query) return url;

  let cleanedQuery = removeMatchingParameters(query, trackers);

  // Domain-specific trackers (google, tiktok, etc.)
  try {
    const host =
      new URL(url).hostname
        .replace(/^www\./, '')
        .split('.')
        .at(-2) ?? '';
    const domainTrackers = DOMAIN_TRACKERS[host];
    if (domainTrackers) {
      cleanedQuery = removeMatchingParameters(
        cleanedQuery,
        domainTrackers,
        true,
      );
    }
    if (host === 'amazon') {
      prefix = prefix.replace(/\/ref=[^/?#]+/i, '');
    }
  } catch {
    // ignore invalid URL
  }

  return cleanedQuery
    ? `${prefix}?${cleanedQuery}${fragment}`
    : `${prefix}${fragment}`;
}

export { ALL_TRACKERS };
