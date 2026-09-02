import { storage } from '#imports';
import type { Shortener } from '../url/shortener/types';

export type DotType = 'extra-rounded' | 'rounded' | 'dots' | 'classy' | 'classy-rounded' | 'square';
export type ImageFormat = 'png' | 'jpg' | 'webp' | 'svg';

export interface QrSettings {
  type: DotType;
  color: string;
  background: string;
  cleanUrl: boolean;
  format: ImageFormat;
  logo: string;
  urlShortener: Shortener;
  api_key: string;
}

const DEFAULT_SETTINGS: QrSettings = {
  type: 'extra-rounded',
  color: '#161f27',
  background: '#efefef',
  cleanUrl: true,
  format: 'png',
  logo: '',
  urlShortener: 'hamr',
  api_key: '',
};

export const settingsItem = storage.defineItem<QrSettings>('local:settings', {
  fallback: DEFAULT_SETTINGS,
  version: 1,
});

// Helpers
export async function getSettings(): Promise<QrSettings> {
  return (await settingsItem.getValue()) ?? DEFAULT_SETTINGS;
}

export async function updateSetting<K extends keyof QrSettings>(key: K, value: QrSettings[K]): Promise<void> {
  const current = await getSettings();
  await settingsItem.setValue({ ...current, [key]: value });
}

export async function saveSettings(settings: QrSettings): Promise<void> {
  await settingsItem.setValue(settings);
}

export async function resetSettings(): Promise<void> {
  await settingsItem.removeValue();
}

export { DEFAULT_SETTINGS };
