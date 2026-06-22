import {
  buildOptimizedPictureProps,
  buildUnsplashSrcSet,
  isUnsplashUrl,
} from '../utils/responsiveImage';
import { mediaUrl } from '../utils/mediaCdn';
import styles from './ResponsiveImg.module.css';

const defaultSizes = '100vw';

export type ResponsiveImgProps = {
  src: string;
  alt?: string;
  className?: string;
  loading?: 'lazy' | 'eager';
  decoding?: 'async' | 'auto' | 'sync';
  sizes?: string;
  fetchPriority?: 'high' | 'low' | 'auto';
  width?: number | string;
  height?: number | string;
  style?: React.CSSProperties;
};

/** Picture+srcset para /images/photos optimizadas; srcset w para Unsplash; resto img simple. */
export default function ResponsiveImg({
  src,
  alt = '',
  className = '',
  loading = 'lazy',
  decoding = 'async',
  sizes = defaultSizes,
  fetchPriority,
  width,
  height,
  style,
}: ResponsiveImgProps) {
  const opt = buildOptimizedPictureProps(src);

  if (opt) {
    return (
      <picture className={styles.picture} style={style}>
        <source type="image/webp" srcSet={opt.webpSrcSet} sizes={sizes} />
        <img
          className={className}
          src={opt.fallbackSrc}
          srcSet={opt.jpgSrcSet}
          sizes={sizes}
          alt={alt}
          loading={loading}
          decoding={decoding}
          fetchPriority={fetchPriority}
          width={width}
          height={height}
          style={style}
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
          width={width}
          height={height}
          style={style}
        />
      );
    }
  }

  return (
    <img
      className={className}
      src={mediaUrl(src)}
      alt={alt}
      loading={loading}
      decoding={decoding}
      fetchPriority={fetchPriority}
      width={width}
      height={height}
      style={style}
    />
  );
}
