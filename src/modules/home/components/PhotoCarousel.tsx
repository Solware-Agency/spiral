import React, { useEffect, useState } from 'react';
import {
  studioCarouselPhotos,
  hydrateStudioCarouselImages,
  getStudioCarouselDisplaySrc,
} from '../../../data/studioCarouselPhotos';
import styles from '../styles/home.module.css';

type CarouselPhotoProps = {
  id: string;
  alt: string;
  hidden?: boolean;
  fetchPriority?: 'high' | 'low' | 'auto';
};

const CarouselPhoto = ({ id, alt, hidden = false, fetchPriority = 'auto' }: CarouselPhotoProps) => (
  <figure className={styles.photoCarouselItem}>
    <img
      className={styles.photoCarouselImg}
      src={getStudioCarouselDisplaySrc(id)}
      alt={hidden ? '' : alt}
      width={640}
      height={960}
      loading="eager"
      decoding="async"
      fetchPriority={fetchPriority}
      aria-hidden={hidden || undefined}
    />
  </figure>
);

const PhotoCarousel = () => {
  const [, setHydrated] = useState(0);

  useEffect(() => {
    let alive = true;
    hydrateStudioCarouselImages().then(() => {
      if (alive) setHydrated((n) => n + 1);
    });
    return () => {
      alive = false;
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
                fetchPriority={index < 3 ? 'high' : 'auto'}
              />
            ))}
          </div>
          <div className={styles.photoCarouselGroup} aria-hidden="true">
            {studioCarouselPhotos.map(({ id }) => (
              <CarouselPhoto key={`b-${id}`} id={id} alt="" hidden fetchPriority="low" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PhotoCarousel;
