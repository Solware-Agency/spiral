import type { ImgHTMLAttributes } from 'react';
import { LOGO_WEBP_WIDTHS } from '../data/logoSources';
import styles from './ResponsiveImg.module.css';

function webpSrcSet(slug: string) {
  return LOGO_WEBP_WIDTHS.map((w) => `/images/optimized-logos/${slug}_${w}.webp ${w}w`).join(', ');
}

export type LogoPictureProps = {
  slug: string;
  pngSrc: string;
  alt?: string;
  className?: string;
  sizes?: string;
  loading?: 'lazy' | 'eager';
  decoding?: 'async' | 'auto' | 'sync';
  fetchPriority?: 'high' | 'low' | 'auto';
} & Omit<ImgHTMLAttributes<HTMLImageElement>, 'alt' | 'className' | 'src'>;

/**
 * Logo PNG con srcset WebP (320–1280w) + fallback PNG en &lt;img&gt;.
 */
export default function LogoPicture({
  slug,
  pngSrc,
  alt = '',
  className = '',
  sizes,
  loading = 'eager',
  decoding = 'async',
  fetchPriority,
  ...imgProps
}: LogoPictureProps) {
  return (
    <picture className={styles.picture}>
      <source type="image/webp" srcSet={webpSrcSet(slug)} sizes={sizes} />
      <img
        className={className}
        src={pngSrc}
        alt={alt}
        loading={loading}
        decoding={decoding}
        fetchPriority={fetchPriority}
        {...imgProps}
      />
    </picture>
  );
}
