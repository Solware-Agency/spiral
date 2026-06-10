/**
 * HTTP security headers for static pages, API routes, and local Vite dev/preview.
 * Keep in sync with vercel.json (production) — values are exported from here.
 */

const CSP_DIRECTIVES = [
  "default-src 'self'",
  [
    "script-src 'self' 'unsafe-inline'",
    'https://www.googletagmanager.com',
    'https://www.google-analytics.com',
    'https://challenges.cloudflare.com',
    'https://static.elfsight.com',
  ].join(' '),
  ["style-src 'self' 'unsafe-inline'", 'https://fonts.googleapis.com'].join(' '),
  ["font-src 'self'", 'https://fonts.gstatic.com', 'data:'].join(' '),
  [
    "img-src 'self' data: blob:",
    'https://*.supabase.co',
    'https://images.unsplash.com',
    'https://www.google-analytics.com',
    'https://www.googletagmanager.com',
    'https://static.elfsight.com',
    'https://*.elfsight.com',
    'https://*.googleusercontent.com',
    'https://maps.googleapis.com',
    'https://maps.gstatic.com',
    'https://www.google.com',
  ].join(' '),
  [
    "connect-src 'self'",
    'https://www.google-analytics.com',
    'https://analytics.google.com',
    'https://region1.google-analytics.com',
    'https://www.googletagmanager.com',
    'https://challenges.cloudflare.com',
    'https://*.supabase.co',
    'https://static.elfsight.com',
    'https://*.elfsight.com',
  ].join(' '),
  [
    "frame-src 'self'",
    'https://www.google.com',
    'https://challenges.cloudflare.com',
    'https://*.elfsight.com',
  ].join(' '),
  "frame-ancestors 'self'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
];

const CONTENT_SECURITY_POLICY = [...CSP_DIRECTIVES, 'upgrade-insecure-requests'].join('; ');

const CONTENT_SECURITY_POLICY_DEV = CSP_DIRECTIVES.join('; ');

const BASE_SECURITY_HEADERS = Object.freeze({
  'Content-Security-Policy': CONTENT_SECURITY_POLICY,
  'Cross-Origin-Resource-Policy': 'same-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=(), payment=()',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'SAMEORIGIN',
});

export const SECURITY_HEADERS = Object.freeze({
  ...BASE_SECURITY_HEADERS,
  'Strict-Transport-Security': 'max-age=63072000; includeSubDomains; preload',
});

const DEV_SECURITY_HEADERS = Object.freeze({
  ...BASE_SECURITY_HEADERS,
  'Content-Security-Policy': CONTENT_SECURITY_POLICY_DEV,
});

/** @param {import('node:http').ServerResponse} res */
export function applySecurityHeaders(res) {
  for (const [name, value] of Object.entries(SECURITY_HEADERS)) {
    if (!res.getHeader(name)) {
      res.setHeader(name, value);
    }
  }
}

/** Plain object for Vite server/preview `headers` config (sin HSTS ni upgrade-insecure-requests). */
export function getSecurityHeadersRecord() {
  return { ...DEV_SECURITY_HEADERS };
}

/** Vercel `headers` array entries derived from {@link SECURITY_HEADERS}. */
export function getVercelHeaderEntries() {
  return Object.entries(SECURITY_HEADERS).map(([key, value]) => ({ key, value }));
}
