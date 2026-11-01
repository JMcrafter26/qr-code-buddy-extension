const ua = navigator.userAgent;

// detect browser and return type
export function detectBrowser():
  'chrome' | 'firefox' | 'edge' | 'opera' | 'safari' | 'unknown' {
  if (ua.includes('Firefox')) return 'firefox';
  if (ua.includes('Edg/')) return 'edge';
  if (ua.includes('OPR/')) return 'opera';
  if (ua.includes('Chrome')) return 'chrome';
  if (ua.includes('Safari')) return 'safari';
  return 'unknown';
}
