// Simple in-memory sliding-window rate limiter.
// Keyed by an identifier (usually client IP). Good enough for a single-region
// deployment and a student-org traffic level. For multi-instance scale, back
// this with Firestore or Upstash Redis later.

type Hit = { count: number; reset: number };
const buckets = new Map<string, Hit>();

// Opportunistic cleanup so the map does not grow unbounded.
function sweep(now: number) {
  if (buckets.size < 5000) return;
  for (const [k, v] of buckets) if (v.reset < now) buckets.delete(k);
}

export function rateLimit(
  key: string,
  limit: number,
  windowMs: number
): { ok: boolean; remaining: number; retryAfter: number } {
  const now = Date.now();
  sweep(now);
  const hit = buckets.get(key);
  if (!hit || hit.reset < now) {
    buckets.set(key, { count: 1, reset: now + windowMs });
    return { ok: true, remaining: limit - 1, retryAfter: 0 };
  }
  if (hit.count >= limit) {
    return { ok: false, remaining: 0, retryAfter: Math.ceil((hit.reset - now) / 1000) };
  }
  hit.count += 1;
  return { ok: true, remaining: limit - hit.count, retryAfter: 0 };
}

// Best-effort client IP from common proxy headers.
export function clientIp(req: Request): string {
  const h = req.headers;
  const xff = h.get("x-forwarded-for");
  if (xff) return xff.split(",")[0].trim();
  return h.get("x-real-ip") || h.get("cf-connecting-ip") || "unknown";
}
