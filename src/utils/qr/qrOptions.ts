import type { QrSettings } from '../storage/settings';

export interface QrStylingOptions {
  width: number;
  height: number;
  type: 'canvas' | 'svg';
  data: string;
  dotsOptions: {
    color: string;
    type: DotType;
  };
  backgroundOptions: {
    color: string;
  };
  imageOptions: {
    crossOrigin: string;
    margin: number;
  };
  image?: string;
}

// Re-export type for convenience
type DotType = QrSettings['type'];

export function buildQrOptions(
  url: string,
  settings: QrSettings,
  size = 280,
  type: 'canvas' | 'svg' = 'canvas',
): QrStylingOptions {
  const opts: QrStylingOptions = {
    width: size,
    height: size,
    type,
    data: url,
    dotsOptions: {
      color: settings.color || '#161f27',
      type: settings.type || 'extra-rounded',
    },
    backgroundOptions: {
      color: settings.background || '#efefef',
    },
    imageOptions: {
      crossOrigin: 'anonymous',
      margin: 5,
    },
  };

  if (settings.logo) opts.image = settings.logo;

  return opts;
}
