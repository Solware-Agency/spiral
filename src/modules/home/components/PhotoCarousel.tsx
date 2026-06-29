import React, { useEffect, useState } from 'react';
import {
  getStudioCarouselDisplaySrc,
  hydrateStudioCarouselImages,
  studioCarouselPhotos,
} from '../../../data/studioCarouselPhotos';
import styles from '../styles/home.module.css';

const CAROUSEL_SIZES = '(max-width: 600px) 42vw, 240px';

type CarouselPhotoProps = {
  id: string;
  alt: string;
  hidden?: boolean;
  priority?: boolean;
  refreshKey?: number;
};

const CarouselPhoto = ({ id, alt, hidden = false, priority = false, refreshKey = 0 }: CarouselPhotoProps) => {
  void refreshKey;
  const src = getStudioCarouselDisplaySrc(id);

  return (
    <figure className={styles.photoCarouselItem} aria-hidden={hidden || undefined}>
      <img
        className={styles.photoCarouselImg}
        src={src}
        alt={hidden ? '' : alt}
        sizes={CAROUSEL_SIZES}
        loading={priority ? 'eager' : 'lazy'}
        decoding="async"
        fetchPriority={priority ? 'high' : 'low'}
        draggable={false}
      />
    </figure>
  );
};

const PhotoCarousel = () => {
  const [hydrated, setHydrated] = useState(0);

  useEffect(() => {
    let active = true;
    void hydrateStudioCarouselImages().then(() => {
      if (active) setHydrated((n) => n + 1);
    });
    return () => {
      active = false;
    };
  }, []);

  return (
    <div className={styles.photoCarousel} aria-label="Home photo carousel">
      <div className={styles.photoCarouselTrack}>
        <div className={styles.photoCarouselMarquee}>
          <div className={styles.photoCarouselGroup} data-marquee-photo-group>
            {studioCarouselPhotos.map(({ id, alt }, index) => (
              <CarouselPhoto
                key={`a-${id}`}
                id={id}
                alt={alt}
                priority={index < 2}
                refreshKey={hydrated}
              />
            ))}
          </div>
          <div className={styles.photoCarouselGroup} aria-hidden="true">
            {studioCarouselPhotos.map(({ id }) => (
              <CarouselPhoto key={`b-${id}`} id={id} alt="" hidden refreshKey={hydrated} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PhotoCarousel;
