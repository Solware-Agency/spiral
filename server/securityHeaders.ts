/**
 * HTTP security headers for static pages, API routes, and local Vite dev/preview.
 * Keep in sync with vercel.json (production) — run `pnpm security:sync-vercel` after edits.
 *
 * Para probar la CSP sin bloquear recursos, cambia temporalmente la key exportada en
 * getVercelHeaderEntries() de "Content-Security-Policy" a "Content-Security-Policy-Report-Only".
 */

const CSP_DIRECTIVES = [
  "default-src 'self'",
  // 'unsafe-inline' requerido por scripts inline en index.html (gtag, LCP, carrusel) y onload de fuentes.
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
  "frame-ancestors 'none'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
];

const CONTENT_SECURITY_POLICY = [...CSP_DIRECTIVES, 'upgrade-insecure-requests'].join('; ');

const CONTENT_SECURITY_POLICY_DEV = CSP_DIRECTIVES.join('; ');

const BASE_SECURITY_HEADERS = Object.freeze({
  'Content-Security-Policy': CONTENT_SECURITY_POLICY,
  'Cross-Origin-Resource-Policy': 'same-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=(), browsing-topics=(), payment=()',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
});

export const SECURITY_HEADERS = Object.freeze({
  ...BASE_SECURITY_HEADERS,
  // includeSubDomains sin preload (reversible; preload exige HTTPS en todos los subdominios).
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
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
  const order = [
    'Content-Security-Policy-Report-Only',
    'Strict-Transport-Security',
    'X-Content-Type-Options',
    'X-Frame-Options',
    'Referrer-Policy',
    'Permissions-Policy',
    'Cross-Origin-Resource-Policy',
  ];
  return order.map((key) => ({ key, value: SECURITY_HEADERS[key] }));
}
