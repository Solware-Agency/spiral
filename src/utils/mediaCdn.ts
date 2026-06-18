import {
  buildMediaCdnUrl,
  resolveMediaCdnStripPrefix,
  resolveVideoCdnStripPrefix,
} from '../../scripts/mediaCdnShared.ts';

const CDN_ORIGIN = String(import.meta.env.VITE_MEDIA_CDN_ORIGIN || '')
  .trim()
  .replace(/\/$/, '');

const VIDEO_CDN_ORIGIN = String(import.meta.env.VITE_VIDEO_CDN_ORIGIN || '')
  .trim()
  .replace(/\/$/, '');

const CDN_STRIP_PREFIX = resolveMediaCdnStripPrefix(import.meta.env.VITE_MEDIA_CDN_STRIP_PREFIX);
const VIDEO_CDN_STRIP_PREFIX = resolveVideoCdnStripPrefix(
  import.meta.env.VITE_VIDEO_CDN_STRIP_PREFIX
);

function resolveCdnAssetPath(path: string, stripPrefix: string): string {
  const normalized = path.startsWith('/') ? path : `/${path}`;
  if (!stripPrefix) return normalized;

  if (normalized === stripPrefix || normalized.startsWith(`${stripPrefix}/`)) {
    const rest = normalized.slice(stripPrefix.length);
    return rest.startsWith('/') ? rest : `/${rest}`;
  }

  return normalized;
}

function isVideoPath(path: string): boolean {
  const normalized = path.startsWith('/') ? path : `/${path}`;
  return normalized === '/videos' || normalized.startsWith('/videos/');
}

/** true cuando los assets se sirven desde un bucket/CDN externo (no desde /public). */
export function usesExternalMediaCdn(): boolean {
  return CDN_ORIGIN.length > 0 || VIDEO_CDN_ORIGIN.length > 0;
}

/** Ruta pública del asset: local (/images/...) o CDN si VITE_MEDIA_CDN_ORIGIN está definido. */
export function mediaUrl(path: string): string {
  if (!path) return path;
  if (/^https?:\/\//i.test(path)) return path;
  if (isVideoPath(path)) return videoUrl(path);
  const normalized = path.startsWith('/') ? path : `/${path}`;
  if (!CDN_ORIGIN) return normalized;
  return `${CDN_ORIGIN}${resolveCdnAssetPath(normalized, CDN_STRIP_PREFIX)}`;
}

/** Vídeos: bucket propio con VITE_VIDEO_CDN_ORIGIN, o el mismo CDN de imágenes si no está definido. */
export function videoUrl(path: string): string {
  if (!path) return path;
  if (/^https?:\/\//i.test(path)) return path;

  if (VIDEO_CDN_ORIGIN) {
    return buildMediaCdnUrl(path, VIDEO_CDN_ORIGIN, VIDEO_CDN_STRIP_PREFIX);
  }

  const normalized = path.startsWith('/') ? path : `/${path}`;
  if (!CDN_ORIGIN) return normalized;
  return `${CDN_ORIGIN}${resolveCdnAssetPath(normalized, CDN_STRIP_PREFIX)}`;
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
  const assetPath = CDN_ORIGIN ? resolveCdnAssetPath(normalized, CDN_STRIP_PREFIX) : normalized;
  return origin ? `${origin}${assetPath}` : assetPath;
}

export function optimizedImageSet(baseId: string, width: number): string {
  const webp = mediaUrl(`/images/optimized/${baseId}_${width}.webp`);
  const jpg = mediaUrl(`/images/optimized/${baseId}_${width}.jpg`);
  return `image-set(url("${webp}") type("image/webp"), url("${jpg}") type("image/jpeg"))`;
}
