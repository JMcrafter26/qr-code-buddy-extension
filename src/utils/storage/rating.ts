// persistant count of how many times the user has used the extension, and if they have rated it yet
import { storage } from '#imports';

const rateRequirements = {
  count: 30, // number of times the user has used the extension before showing the rate banner
  days: 365, // number of days since the last time the user rated the extension before showing the rate banner again
};

const DEFAULTS = {
  count: 0,
  rated: false,
  lastRated: 0,
};

const ratingItem = storage.defineItem<Record<string, unknown>>('local:rate', {
  fallback: DEFAULTS,
  version: 1,
});

export async function increaseUsageCount(): Promise<void> {
  const current = (await ratingItem.getValue()) ?? DEFAULTS;
  const newCount = (current.count as number) + 1;
  await ratingItem.setValue({ ...current, count: newCount });
}

export async function setRated(): Promise<void> {
  const current = (await ratingItem.getValue()) ?? DEFAULTS;
  await ratingItem.setValue({ ...current, rated: true, lastRated: Date.now() });
}

export async function resetRating(): Promise<void> {
  await ratingItem.removeValue();
}

export async function shouldShowRateBanner(): Promise<boolean> {
  const current = (await ratingItem.getValue()) ?? DEFAULTS;
  const { count, rated, lastRated } = current as {
    count: number;
    rated: boolean;
    lastRated: number;
  };

  if (rated) {
    return (
      lastRated > 0 &&
      (Date.now() - lastRated) / (1000 * 60 * 60 * 24) >= rateRequirements.days
    );
  }

  return count >= rateRequirements.count;
}
