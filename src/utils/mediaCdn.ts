import { resolveMediaCdnStripPrefix } from '../../scripts/mediaCdnShared.ts';

const CDN_ORIGIN = String(import.meta.env.VITE_MEDIA_CDN_ORIGIN || '')
  .trim()
  .replace(/\/$/, '');

const CDN_STRIP_PREFIX = resolveMediaCdnStripPrefix(import.meta.env.VITE_MEDIA_CDN_STRIP_PREFIX);

function resolveCdnAssetPath(path: string): string {
  const normalized = path.startsWith('/') ? path : `/${path}`;
  if (!CDN_ORIGIN || !CDN_STRIP_PREFIX) return normalized;

  if (normalized === CDN_STRIP_PREFIX || normalized.startsWith(`${CDN_STRIP_PREFIX}/`)) {
    const rest = normalized.slice(CDN_STRIP_PREFIX.length);
    return rest.startsWith('/') ? rest : `/${rest}`;
  }

  return normalized;
}

/** true cuando los assets se sirven desde un bucket/CDN externo (no desde /public). */
export function usesExternalMediaCdn(): boolean {
  return CDN_ORIGIN.length > 0;
}

/** Ruta pública del asset: local (/images/...) o CDN si VITE_MEDIA_CDN_ORIGIN está definido. */
export function mediaUrl(path: string): string {
  if (!path) return path;
  if (/^https?:\/\//i.test(path)) return path;
  const normalized = path.startsWith('/') ? path : `/${path}`;
  if (!CDN_ORIGIN) return normalized;
  return `${CDN_ORIGIN}${resolveCdnAssetPath(normalized)}`;
}

/** URL absoluta para Open Graph, preload, etc. */
export function absoluteMediaUrl(path: string, siteOrigin?: string): string {
  if (!path) return path;
  if (/^https?:\/\//i.test(path)) return path;
  const normalized = path.startsWith('/') ? path : `/${path}`;
  const origin =
    CDN_ORIGIN ||
    String(siteOrigin || import.meta.env.VITE_SITE_ORIGIN || '')
      .trim()
      .replace(/\/$/, '');
  const assetPath = CDN_ORIGIN ? resolveCdnAssetPath(normalized) : normalized;
  return origin ? `${origin}${assetPath}` : assetPath;
}

export function optimizedImageSet(baseId: string, width: number): string {
  const webp = mediaUrl(`/images/optimized/${baseId}_${width}.webp`);
  const jpg = mediaUrl(`/images/optimized/${baseId}_${width}.jpg`);
  return `image-set(url("${webp}") type("image/webp"), url("${jpg}") type("image/jpeg"))`;
}
