import { OPTIMIZED_PHOTO_FILES } from '../data/optimizedSources.js';

/** Anchos alineados con scripts/optimize-images.mjs */
export const RESPONSIVE_WIDTHS = [640, 960, 1280, 1600, 2560, 3200];

const baseFromSourceFile = (file) => {
  const name = file.split('/').pop();
  return name.replace(/\.[^.]+$/, '');
};

export const OPTIMIZED_IMAGE_BASE_IDS = new Set(OPTIMIZED_PHOTO_FILES.map(baseFromSourceFile));

export function optimizedUrl(baseId, width, ext) {
  return `/images/optimized/${baseId}_${width}.${ext}`;
}

export function optimizedSrcSet(baseId, ext) {
  return RESPONSIVE_WIDTHS.map((w) => `${optimizedUrl(baseId, w, ext)} ${w}w`).join(', ');
}

/** Base id desde URL local tipo /images/photos/... o null */
export function optimizedBaseIdFromSrc(src) {
  if (!src || typeof src !== 'string' || src.startsWith('data:')) return null;
  if (/^https?:\/\//i.test(src)) return null;
  if (!src.includes('/images/photos/')) return null;
  try {
    const pathOnly = src.split('?')[0];
    const decoded = decodeURIComponent(pathOnly);
    const file = decoded.split('/').pop();
    if (!file) return null;
    return file.replace(/\.[^.]+$/, '');
  } catch {
    return null;
  }
}

export function buildOptimizedPictureProps(src) {
  const base = optimizedBaseIdFromSrc(src);
  if (!base || !OPTIMIZED_IMAGE_BASE_IDS.has(base)) return null;
  return {
    webpSrcSet: optimizedSrcSet(base, 'webp'),
    jpegSrcSet: optimizedSrcSet(base, 'jpg'),
    fallbackSrc: optimizedUrl(base, 960, 'jpg'),
  };
}

export function isUnsplashUrl(src) {
  return typeof src === 'string' && src.includes('images.unsplash.com');
}

export function buildUnsplashSrcSet(url) {
  try {
    const u = new URL(url);
    if (!u.hostname.includes('unsplash.com')) return null;
    const widths = [480, 720, 960, 1280, 1600];
    const parts = [];
    for (const w of widths) {
      const copy = new URL(u.toString());
      copy.searchParams.set('w', String(w));
      copy.searchParams.set('auto', 'format');
      copy.searchParams.set('fit', 'crop');
      if (!copy.searchParams.has('q')) copy.searchParams.set('q', '80');
      parts.push(`${copy.toString()} ${w}w`);
    }
    const fallback = new URL(u.toString());
    fallback.searchParams.set('w', '960');
    fallback.searchParams.set('auto', 'format');
    fallback.searchParams.set('fit', 'crop');
    if (!fallback.searchParams.has('q')) fallback.searchParams.set('q', '80');
    return { srcSet: parts.join(', '), fallback: fallback.toString() };
  } catch {
    return null;
  }
}
