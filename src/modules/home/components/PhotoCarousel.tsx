import React from 'react';
import { optimizedSrcSet, optimizedUrl } from '../../../utils/responsiveImage';
import styles from '../styles/home.module.css';

/** id = base de archivo en /images/optimized; alt describe el contenido para WCAG 1.1.1 */
const photos = [
  {
    id: 'DSC02040',
    alt: 'Content production setup in the Spiral photo studio, styled for brand shoots',
  },
  {
    id: 'DSC01963',
    alt: 'Studio lighting equipment and photography backdrop in Casa Spiral',
  },
  {
    id: 'DSC02380',
    alt: 'Interior view of Casa Spiral creative studio space',
  },
  {
    id: 'DSC02285',
    alt: 'Studio interior with styling and aesthetic detail',
  },
  {
    id: 'DSC01989',
    alt: 'Atmospheric brand and studio photography',
  },
  {
    id: 'DSC02408',
    alt: 'Lifestyle and brand imagery from Spiral client work',
  },
  {
    id: 'DSC02284',
    alt: 'Modern creative studio seating area and aesthetic',
  },
];

const SIZES = '(max-width: 600px) 140px, (max-width: 1200px) 14vw, 240px';
const srcFor = (id, width, ext) => optimizedUrl(id, width, ext);
const srcSetFor = (id, ext) => optimizedSrcSet(id, ext);

const PhotoCarousel = () => {
  return (
    <div className={styles.photoCarousel} aria-label="Home photo carousel">
      <div className={styles.photoCarouselTrack}>
        <div className={styles.photoCarouselMarquee}>
          <div className={styles.photoCarouselGroup} data-marquee-photo-group>
            {photos.map(({ id, alt }) => (
              <figure key={`a-${id}`} className={styles.photoCarouselItem}>
                <picture>
                  <source type="image/webp" srcSet={srcSetFor(id, 'webp')} sizes={SIZES} />
                  <source type="image/jpeg" srcSet={srcSetFor(id, 'jpg')} sizes={SIZES} />
                  <img
                    className={styles.photoCarouselImg}
                    src={srcFor(id, 640, 'jpg')}
                    alt={alt}
                    loading="lazy"
                    decoding="async"
                  />
                </picture>
              </figure>
            ))}
          </div>
          <div className={styles.photoCarouselGroup} aria-hidden="true">
            {photos.map(({ id }) => (
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

