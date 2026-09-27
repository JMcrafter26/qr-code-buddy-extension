import { storage } from '#imports';

// Release whose welcome flow should be shown to users once.
export const WELCOME_VERSION = '2.0.0';

export interface MetaInfo {
  lastVersion: string;
  lastWelcomeVersion: string;
}

export const metaItem = storage.defineItem<MetaInfo>('local:meta', {
  fallback: { lastVersion: '', lastWelcomeVersion: '' },
  version: 1,
});
