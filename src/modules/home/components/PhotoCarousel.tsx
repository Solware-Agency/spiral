import React from 'react';
import ResponsiveImg from '../../../components/ResponsiveImg';
import { studioCarouselPhotos } from '../../../data/studioCarouselPhotos';
import styles from '../styles/home.module.css';

const CAROUSEL_SIZES = '(max-width: 600px) 42vw, 240px';

type CarouselPhotoProps = {
  id: string;
  alt: string;
  hidden?: boolean;
  fetchPriority?: 'high' | 'low' | 'auto';
};

const CarouselPhoto = ({ id, alt, hidden = false, fetchPriority = 'auto' }: CarouselPhotoProps) => (
  <figure className={styles.photoCarouselItem} aria-hidden={hidden || undefined}>
    <ResponsiveImg
      className={styles.photoCarouselImg}
      src={`/images/photos/${id}.jpg`}
      alt={hidden ? '' : alt}
      sizes={CAROUSEL_SIZES}
      loading="eager"
      decoding="async"
      fetchPriority={fetchPriority}
    />
  </figure>
);

const PhotoCarousel = () => {
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
