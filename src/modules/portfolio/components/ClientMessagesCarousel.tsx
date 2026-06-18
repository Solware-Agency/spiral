import React, { useCallback, useEffect, useState } from 'react';
import {
  CLIENT_MESSAGE_REVIEW_IMAGES,
  CLIENT_MESSAGES_ROTATE_MS,
} from '../../../data/clientMessageSources';
import styles from '../styles/portfolio.module.css';

const ClientMessagesCarousel = () => {
  const slides = CLIENT_MESSAGE_REVIEW_IMAGES;
  const [index, setIndex] = useState(0);
  const advance = useCallback(
    () => setIndex((current) => (current + 1) % slides.length),
    [slides.length]
  );

  useEffect(() => {
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (reduceMotion.matches || slides.length < 2) return undefined;

    const id = window.setInterval(advance, CLIENT_MESSAGES_ROTATE_MS);
    return () => window.clearInterval(id);
  }, [advance, slides.length]);

  return (
    <div className={styles.testimonialsAssetStack}>
      {slides.map((src, slideIndex) => {
        const isActive = slideIndex === index;
        return (
          <img
            key={src}
            className={`${styles.testimonialsAsset} ${
              isActive ? styles.testimonialsAssetActive : styles.testimonialsAssetInactive
            }`}
            src={src}
            alt=""
            width={1080}
            height={1350}
            loading={slideIndex === 0 ? 'eager' : 'lazy'}
            decoding="async"
          />
        );
      })}
    </div>
  );
};

export default ClientMessagesCarousel;
