import React from 'react';
import { optimizedSrcSet, optimizedUrl } from '../../../utils/responsiveImage';
import styles from '../styles/home.module.css';

const photos = [
  'DSC02040',
  'DSC01963',
  'DSC02380',
  'DSC02285',
  'DSC01989',
  'DSC02408',
  'DSC02284',
];

const SIZES = '(max-width: 600px) 140px, (max-width: 1200px) 14vw, 240px';
const srcFor = (id, width, ext) => optimizedUrl(id, width, ext);
const srcSetFor = (id, ext) => optimizedSrcSet(id, ext);

const PhotoCarousel = () => {
  return (
    <div className={styles.photoCarousel} aria-label="Home photo carousel">
      <div className={styles.photoCarouselTrack}>
        <div className={styles.photoCarouselMarquee}>
          <div className={styles.photoCarouselGroup}>
            {photos.map((id) => (
              <figure key={`a-${id}`} className={styles.photoCarouselItem} aria-hidden="true">
                <picture>
                  <source type="image/webp" srcSet={srcSetFor(id, 'webp')} sizes={SIZES} />
                  <source type="image/jpeg" srcSet={srcSetFor(id, 'jpg')} sizes={SIZES} />
                  <img
                    className={styles.photoCarouselImg}
                    src={srcFor(id, 640, 'jpg')}
                    alt=""
                    loading="lazy"
                    decoding="async"
                  />
                </picture>
              </figure>
            ))}
          </div>
          <div className={styles.photoCarouselGroup} aria-hidden="true">
            {photos.map((id) => (
              <figure key={`b-${id}`} className={styles.photoCarouselItem}>
                <picture>
                  <source type="image/webp" srcSet={srcSetFor(id, 'webp')} sizes={SIZES} />
                  <source type="image/jpeg" srcSet={srcSetFor(id, 'jpg')} sizes={SIZES} />
                  <img
                    className={styles.photoCarouselImg}
                    src={srcFor(id, 640, 'jpg')}
                    alt=""
                    loading="lazy"
                    decoding="async"
                  />
                </picture>
              </figure>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PhotoCarousel;

