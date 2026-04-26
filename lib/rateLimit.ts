// In-memory sliding-window limiter. Sufficient to stop casual abuse on a demo

const buckets = new Map<string, number[]>();

interface RateLimitConfig {
  limit: number;
  windowMs: number;
}

interface RateLimitResult {
  ok: boolean;
  retryAfterSeconds?: number;
}

export function checkRateLimit(
  key: string,
  { limit, windowMs }: RateLimitConfig
): RateLimitResult {
  const now = Date.now();
  const windowStart = now - windowMs;
  const timestamps = (buckets.get(key) ?? []).filter((t) => t > windowStart);

  if (timestamps.length >= limit) {
    const retryAfterMs = timestamps[0] + windowMs - now;
    return { ok: false, retryAfterSeconds: Math.ceil(retryAfterMs / 1000) };
  }

  timestamps.push(now);
  buckets.set(key, timestamps);
  return { ok: true };
}

export function getClientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0]!.trim();
  const real = request.headers.get("x-real-ip");
  if (real) return real.trim();
  return "unknown";
}
