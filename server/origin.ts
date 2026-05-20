const DEFAULT_SITE_HOST = 'spiralmstudio.com';

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

function hostFromSiteEnvValue(value) {
  const raw = String(value || '').trim();
  if (!raw) return '';
  const u = safeUrlParse(raw);
  if (u) return normalizeHost(u.host);
  return normalizeHost(raw.replace(/^\/+/, ''));
}

function expandOriginVariants(entry) {
  const out = [entry];
  const u = safeUrlParse(entry);
  if (!u) return out;

  const proto = String(u.protocol || 'https:').toLowerCase();
  const host = String(u.host || '').toLowerCase();
  if (!host) return out;

  const bare = normalizeHost(host);
  out.push(`${proto}//${bare}`);
  if (!host.startsWith('www.')) {
    out.push(`${proto}//www.${bare}`);
  }
  out.push(bare);
  return out;
}

function collectAllowedOrigins() {
  const entries = new Set<string>();

  const envValues = [
    process.env.ALLOWED_ORIGIN,
    process.env.ALLOWED_ORIGINS,
    process.env.PUBLIC_SITE_ORIGIN,
    process.env.VITE_SITE_ORIGIN,
    process.env.SITE_ORIGIN,
    process.env.VERCEL_PROJECT_PRODUCTION_URL,
    process.env.VERCEL_URL,
  ];

  for (const raw of envValues) {
    for (const item of parseAllowedOrigins(raw)) {
      for (const variant of expandOriginVariants(item)) {
        entries.add(variant);
      }
    }
  }

  const deployEnv = String(process.env.VERCEL_ENV || process.env.NODE_ENV || '')
    .trim()
    .toLowerCase();
  const isProduction = deployEnv === 'production';

  entries.add(DEFAULT_SITE_HOST);
  entries.add(`https://${DEFAULT_SITE_HOST}`);
  entries.add(`https://www.${DEFAULT_SITE_HOST}`);

  if (!isProduction) {
    for (const host of ['localhost:5173', '127.0.0.1:5173', 'localhost:4173', '127.0.0.1:4173']) {
      entries.add(`http://${host}`);
      entries.add(host);
    }
  }

  return [...entries];
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

export function getRequestOrigin(req) {
  const origin = String(req?.headers?.origin || '').trim();
  if (origin) return origin;

  const referer = String(req?.headers?.referer || req?.headers?.referrer || '').trim();
  if (!referer) return '';

  const u = safeUrlParse(referer);
  if (!u) return '';
  return `${u.protocol}//${u.host}`;
}

export function isAllowedRequestOrigin(req) {
  const origin = getRequestOrigin(req);
  if (!origin) return true;

  const allowed = collectAllowedOrigins();
  if (allowed.length === 0) return true;

  return matchesAllowed(origin, allowed);
}
