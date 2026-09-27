const VERSION_PART = /^(\d+)(?:\.(\d+))?(?:\.(\d+))?/;

function parseParts(version: string): [number, number, number] {
  const match = VERSION_PART.exec(version.trim().replace(/^v/i, ''));
  if (!match) return [0, 0, 0];
  return [Number(match[1] ?? 0), Number(match[2] ?? 0), Number(match[3] ?? 0)];
}

export function compareVersions(a: string, b: string): number {
  const left = parseParts(a);
  const right = parseParts(b);
  if (left[0] !== right[0]) return left[0] - right[0];
  if (left[1] !== right[1]) return left[1] - right[1];
  if (left[2] !== right[2]) return left[2] - right[2];
  return 0;
}

export function isAtLeast(version: string, min: string): boolean {
  return compareVersions(version, min) >= 0;
}
