/** Lógica compartida entre Vite (CSS) y el bundle del cliente. */

export function normalizeMediaCdnOrigin(origin: string): string {
  return origin.trim().replace(/\/$/, '');
}

/** Detecta URLs del dashboard de Supabase copiadas por error en VITE_MEDIA_CDN_ORIGIN. */
export function isInvalidSupabaseDashboardCdnOrigin(origin: string): boolean {
  return /supabase\.com\/dashboard\//i.test(origin);
}

/**
 * Si el bucket guarda `Spiral/optimized/...` en lugar de `Spiral/images/optimized/...`,
 * define VITE_MEDIA_CDN_STRIP_PREFIX=/images en Vercel.
 */
export function resolveCdnAssetPath(path: string, stripPrefix: string): string {
  const normalized = path.startsWith('/') ? path : `/${path}`;
  const prefix = stripPrefix.trim();
  if (!prefix) return normalized;

  if (normalized === prefix || normalized.startsWith(`${prefix}/`)) {
    const rest = normalized.slice(prefix.length);
    return rest.startsWith('/') ? rest : `/${rest}`;
  }

  return normalized;
}

export function buildMediaCdnUrl(
  path: string,
  cdnOrigin: string,
  stripPrefix: string
): string {
  if (!path) return path;
  if (/^https?:\/\//i.test(path)) return path;
  const origin = normalizeMediaCdnOrigin(cdnOrigin);
  if (!origin) return path.startsWith('/') ? path : `/${path}`;
  const assetPath = resolveCdnAssetPath(path, stripPrefix);
  return `${origin}${assetPath}`;
}
