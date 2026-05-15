const RATE_BUCKETS = new Map<string, { count: number; resetAt: number }>();

function normalizeIp(value) {
  return String(value ?? '').trim().toLowerCase();
}

export function getClientIp(req) {
  const xff = String(req?.headers?.['x-forwarded-for'] || '')
    .split(',')
    .map((v) => normalizeIp(v))
    .filter(Boolean);
  if (xff.length > 0) return xff[0];

  const xri = normalizeIp(req?.headers?.['x-real-ip']);
  if (xri) return xri;

  const remote = normalizeIp(req?.socket?.remoteAddress || req?.connection?.remoteAddress || '');
  return remote || 'unknown';
}

export function consumeRateLimit({ key, max, windowMs }) {
  const now = Date.now();
  const normalizedKey = String(key || '').trim() || 'unknown';
  const safeMax = Number.isFinite(max) && max > 0 ? Math.floor(max) : 10;
  const safeWindowMs =
    Number.isFinite(windowMs) && windowMs > 0 ? Math.floor(windowMs) : 60_000;

  let bucket = RATE_BUCKETS.get(normalizedKey);
  if (!bucket || bucket.resetAt <= now) {
    bucket = { count: 0, resetAt: now + safeWindowMs };
  }

  bucket.count += 1;
  RATE_BUCKETS.set(normalizedKey, bucket);

  // Opportunistic cleanup to keep memory bounded in long-lived instances.
  if (RATE_BUCKETS.size > 2000) {
    for (const [entryKey, entry] of RATE_BUCKETS.entries()) {
      if (entry.resetAt <= now) RATE_BUCKETS.delete(entryKey);
    }
  }

  return {
    allowed: bucket.count <= safeMax,
    limit: safeMax,
    remaining: Math.max(0, safeMax - bucket.count),
    resetAt: bucket.resetAt,
    retryAfterSeconds: Math.max(1, Math.ceil((bucket.resetAt - now) / 1000)),
  };
}

