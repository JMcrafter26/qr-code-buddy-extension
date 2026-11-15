import { storage } from '#imports';
import type { Shortener } from '../url/shortener/types';

export type DotType =
  'extra-rounded' | 'rounded' | 'dots' | 'classy' | 'classy-rounded' | 'square';
export type ImageFormat = 'png' | 'jpg' | 'webp' | 'svg';
export type LogoMode = 'none' | 'custom' | 'favicon';

export interface QrSettings {
  type: DotType;
  color: string;
  background: string;
  cleanUrl: boolean;
  format: ImageFormat;
  logo: string;
  logoMode: LogoMode;
  urlShortener: Shortener;
  apiKey: string;
}

const DEFAULT_SETTINGS: QrSettings = {
  type: 'extra-rounded',
  color: '#161f27',
  background: '#efefef',
  cleanUrl: true,
  format: 'png',
  logo: '',
  logoMode: 'favicon',
  urlShortener: 'hamr',
  apiKey: '',
};

export const settingsItem = storage.defineItem<QrSettings>('local:settings', {
  fallback: DEFAULT_SETTINGS,
  version: 2,
  migrations: {
    // eslint-disable-next-line @typescript-eslint/naming-convention
    2: migrateSettings,
  },
});

// Helpers
export async function getSettings(): Promise<QrSettings> {
  return normalizeSettings(await settingsItem.getValue());
}

export function normalizeSettings(
  settings: Partial<QrSettings> | null | undefined,
): QrSettings {
  const merged = { ...DEFAULT_SETTINGS, ...(settings ?? {}) };
  if (!settings?.logoMode && settings?.logo) merged.logoMode = 'custom';
  return merged;
}

export async function updateSetting<K extends keyof QrSettings>(
  key: K,
  value: QrSettings[K],
): Promise<void> {
  const current = await getSettings();
  await settingsItem.setValue({ ...current, [key]: value });
}

export async function saveSettings(settings: QrSettings): Promise<void> {
  await settingsItem.setValue(settings);
}

export async function resetSettings(): Promise<void> {
  await settingsItem.removeValue();
}

function migrateSettings(settings: QrSettings): QrSettings {
  // @ts-expect-error legacy property migration
  if (settings.api_key) {
    // @ts-expect-error legacy property migration
    settings.apiKey = settings.api_key;
    // @ts-expect-error legacy property migration
    delete settings.api_key;
  }
  return settings;
}

export { DEFAULT_SETTINGS };
