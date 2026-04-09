import React from 'react';
import {
  buildOptimizedPictureProps,
  buildUnsplashSrcSet,
  isUnsplashUrl,
} from '../utils/responsiveImage';
import styles from './ResponsiveImg.module.css';

const defaultSizes = '100vw';

/** Picture+srcset para /images/photos optimizadas; srcset w para Unsplash; resto img simple. */
export default function ResponsiveImg({
  src,
  alt = '',
  className = '',
  loading = 'lazy',
  decoding = 'async',
  sizes = defaultSizes,
  fetchPriority,
}) {
  const opt = buildOptimizedPictureProps(src);

  if (opt) {
    return (
      <picture className={styles.picture}>
        <source type="image/webp" srcSet={opt.webpSrcSet} sizes={sizes} />
        <source type="image/jpeg" srcSet={opt.jpegSrcSet} sizes={sizes} />
        <img
          className={className}
          src={opt.fallbackSrc}
          alt={alt}
          loading={loading}
          decoding={decoding}
          fetchPriority={fetchPriority}
        />
      </picture>
    );
  }

  if (isUnsplashUrl(src)) {
    const u = buildUnsplashSrcSet(src);
    if (u) {
      return (
        <img
          className={className}
          src={u.fallback}
          srcSet={u.srcSet}
          sizes={sizes}
          alt={alt}
          loading={loading}
          decoding={decoding}
          fetchPriority={fetchPriority}
        />
      );
    }
  }

  return (
    <img
      className={className}
      src={src}
      alt={alt}
      loading={loading}
      decoding={decoding}
      fetchPriority={fetchPriority}
    />
  );
}
