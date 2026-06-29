/** Lógica compartida entre Vite (CSS) y el bundle del cliente. */

export function normalizeMediaCdnOrigin(origin: string): string {
  return origin.trim().replace(/\/$/, '');
}

/** Detecta URLs del dashboard de Supabase copiadas por error en VITE_MEDIA_CDN_ORIGIN. */
export function isInvalidSupabaseDashboardCdnOrigin(origin: string): boolean {
  return /supabase\.com\/dashboard\//i.test(origin);
}

/**
 * Prefijo a quitar de rutas `/images/...` al armar URLs del CDN.
 * Por defecto `/images` (bucket con `Spiral/optimized/...` sin carpeta intermedia).
 * Pon `VITE_MEDIA_CDN_STRIP_PREFIX=0` si subiste con `pnpm media:sync-supabase`
 * (`Spiral/images/optimized/...`).
 */
export function resolveMediaCdnStripPrefix(raw: unknown): string {
  const value = raw === undefined || raw === null ? '' : String(raw).trim();
  if (value === '0' || value.toLowerCase() === 'false') return '';
  if (value === '') return '/images';
  return value;
}

/**
 * Prefijo a quitar de rutas `/videos/...` al armar URLs del CDN de vídeo.
 * Por defecto vacío (mantiene `/videos/videos/Sports/24.mp4` tal cual).
 * Pon `/videos` si en el bucket los archivos viven en `videos/Sports/24.mp4`.
 */
export function resolveVideoCdnStripPrefix(raw: unknown): string {
  const value = raw === undefined || raw === null ? '' : String(raw).trim();
  if (value === '0' || value.toLowerCase() === 'false') return '';
  return value;
}

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

/** Base URL para preloads inline (`.../optimized/` o `/images/optimized/`). */
export function buildOptimizedMediaBase(cdnOrigin: string, stripPrefix: string): string {
  const origin = normalizeMediaCdnOrigin(cdnOrigin);
  if (!origin) return '/images/optimized/';
  const folder = resolveCdnAssetPath('/images/optimized/', stripPrefix);
  return `${origin}${folder}`;
}
