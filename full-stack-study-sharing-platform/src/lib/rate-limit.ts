type Entry = { count: number; resetAt: number };
const buckets = new Map<string, Entry>();

/** Process-local limiter. Use a shared store such as Redis when horizontally scaling. */
export function rateLimit(key: string, max: number, windowMs: number) {
  const now = Date.now();
  const entry = buckets.get(key);
  if (!entry || entry.resetAt <= now) { buckets.set(key, { count: 1, resetAt: now + windowMs }); return true; }
  entry.count += 1;
  return entry.count <= max;
}
