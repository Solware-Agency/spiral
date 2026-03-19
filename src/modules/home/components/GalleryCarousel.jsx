import React from 'react';
import styles from '../styles/home.module.css';

const SEPARATOR = 'TIME TO GET SOCIAL! • ';
const LOOP_TEXT = SEPARATOR.repeat(18);

const GalleryCarousel = () => {
  return (
    <div className={styles.galleryStrip}>
      <div className={styles.galleryTrack} aria-label="Social ticker">
        <div className={styles.galleryMarquee}>
          <span className={styles.gallerySeparator}>{LOOP_TEXT}</span>
          <span className={styles.gallerySeparator} aria-hidden="true">{LOOP_TEXT}</span>
        </div>
      </div>
    </div>
  );
};

export default GalleryCarousel;
