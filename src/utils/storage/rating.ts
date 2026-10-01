// persistant count of how many times the user has used the extension, and if they have rated it yet
import { storage } from '#imports';

const rateRequirements = {
  milestones: [30, 150],
};

const DEFAULTS = {
  count: 0,
  rated: false,
  lastRated: 0,
  lastResetMilestone: 0,
};

const ratingItem = storage.defineItem<Record<string, unknown>>('local:rate', {
  fallback: DEFAULTS,
  version: 1,
});

export async function increaseUsageCount(): Promise<number> {
  const current = (await ratingItem.getValue()) ?? DEFAULTS;
  const newCount = (current.count as number) + 1;
  const milestone = rateRequirements.milestones.find((value) => value === newCount);
  const lastResetMilestone = (current.lastResetMilestone as number | undefined) ?? 0;
  const shouldResetRating = milestone !== undefined && milestone > lastResetMilestone;

  await ratingItem.setValue({
    ...current,
    count: newCount,
    rated: shouldResetRating ? false : current.rated,
    lastResetMilestone: shouldResetRating ? milestone : lastResetMilestone,
  });

  return newCount;
}

export async function setRated(): Promise<void> {
  const current = (await ratingItem.getValue()) ?? DEFAULTS;
  await ratingItem.setValue({ ...current, rated: true, lastRated: Date.now() });
}

export async function resetRating(): Promise<void> {
  await ratingItem.removeValue();
}

function getReachedMilestone(count: number): number {
  return [...rateRequirements.milestones].reverse().find((milestone) => count >= milestone) ?? 0;
}

export async function shouldShowRateBanner(alwaysShow = false): Promise<boolean> {
  const current = (await ratingItem.getValue()) ?? DEFAULTS;
  const { count, rated } = current as {
    count: number;
    rated: boolean;
  };

  if (rated) {
    return false;
  }

  return alwaysShow || getReachedMilestone(count) > 0;
}
