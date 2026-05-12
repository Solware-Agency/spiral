function safeUrlParse(value) {
  try {
    return new URL(String(value));
  } catch {
    return null;
  }
}

function normalizeHost(host) {
  const h = String(host || '').trim().toLowerCase();
  return h.startsWith('www.') ? h.slice(4) : h;
}

function normalizeOrigin(origin) {
  const u = safeUrlParse(origin);
  if (!u) return String(origin || '').trim().replace(/\/+$/, '');
  const proto = String(u.protocol || '').toLowerCase();
  const host = normalizeHost(u.host);
  return `${proto}//${host}`;
}

function parseAllowedOrigins(value) {
  return String(value || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
}

function matchesAllowed(origin, allowed) {
  const originUrl = safeUrlParse(origin);
  const originHost = originUrl ? normalizeHost(originUrl.host) : '';
  const normOrigin = normalizeOrigin(origin);

  for (const raw of allowed) {
    if (raw === '*') return true;

    // Support host-only entries like "example.com" or "*.vercel.app"
    const hasScheme = raw.includes('://');
    const entry = hasScheme ? normalizeOrigin(raw) : normalizeHost(raw);

    if (hasScheme) {
      if (normOrigin === entry) return true;
      continue;
    }

    if (!originHost) continue;
    if (entry.startsWith('*.')) {
      const suffix = entry.slice(1); // ".vercel.app"
      if (originHost.endsWith(suffix) && originHost.length > suffix.length) return true;
      continue;
    }

    if (originHost === entry) return true;
  }

  return false;
}

export function isAllowedRequestOrigin(req) {
  const allowedRaw = process.env.ALLOWED_ORIGIN || '';
  const origin = req?.headers?.origin || '';

  if (!allowedRaw) return true;
  if (!origin) return true;

  const allowed = parseAllowedOrigins(allowedRaw);
  if (allowed.length === 0) return true;

  return matchesAllowed(origin, allowed);
}

