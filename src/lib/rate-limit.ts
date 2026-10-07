const store = globalThis as typeof globalThis & { __ulzLimit?: Map<string, number[]> };

function bucket() {
  store.__ulzLimit ??= new Map();
  return store.__ulzLimit;
}

export function rateLimit(key: string, max: number, windowMs: number) {
  const now = Date.now();
  const hits = (bucket().get(key) ?? []).filter((stamp) => now - stamp < windowMs);
  if (hits.length >= max) return false;
  hits.push(now);
  bucket().set(key, hits);
  return true;
}

export function clientKey(prefix: string, extra: string) {
  return `${prefix}:${extra.toLowerCase().trim() || "anon"}`;
}
