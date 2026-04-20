import React, { useLayoutEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import styles from '../styles/home.module.css';
import PhotoCarousel from './PhotoCarousel';
import GalleryCarousel from './GalleryCarousel';

/** Segundos de una vuelta del carrusel de texto (referencia para igualar velocidad lineal con las fotos). */
const STUDIO_MARQUEE_BASE_SEC = 26;

const WhatWeDo = () => {
  const studioMarqueesRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const root = studioMarqueesRef.current;
    if (!root) return;

    const measureAndApply = () => {
      const photoEl = root.querySelector<HTMLElement>('[data-marquee-photo-group]');
      const galleryEl = root.querySelector<HTMLElement>('[data-marquee-gallery-segment]');
      if (!photoEl || !galleryEl) return;
      const wPhoto = photoEl.getBoundingClientRect().width;
      const wGallery = galleryEl.getBoundingClientRect().width;
      if (wGallery < 1 || wPhoto < 1) return;
      const photoSec = (STUDIO_MARQUEE_BASE_SEC * wPhoto) / wGallery;
      root.style.setProperty('--studio-marquee-duration-gallery', `${STUDIO_MARQUEE_BASE_SEC}s`);
      root.style.setProperty('--studio-marquee-duration-photo', `${photoSec}s`);
    };

    const ro = new ResizeObserver(() => {
      requestAnimationFrame(measureAndApply);
    });
    ro.observe(root);
    const photoEl = root.querySelector('[data-marquee-photo-group]');
    const galleryEl = root.querySelector('[data-marquee-gallery-segment]');
    if (photoEl) ro.observe(photoEl);
    if (galleryEl) ro.observe(galleryEl);

    measureAndApply();

    const imgs = root.querySelectorAll<HTMLImageElement>('img');
    const onImgLoad = () => measureAndApply();
    imgs.forEach((img) => {
      if (!img.complete) img.addEventListener('load', onImgLoad, { once: true });
    });

    window.addEventListener('resize', measureAndApply);

    return () => {
      ro.disconnect();
      window.removeEventListener('resize', measureAndApply);
    };
  }, []);

  return (
    <section id="the-studio" className={styles.whatWeDoWrap}>
      <div className={styles.whatWeDo}>
        <h2 className={styles.whatWeDoLabel}>WHAT WE DO</h2>
        <p className={styles.whatWeDoText}>
          We capture the pulse of your brand and translate it into visuals that resonate. Every detail is{' '}
          <strong>intentional,</strong> every project a new chapter. At Spiral, we don&apos;t just create content—we create{' '}
          <strong>meaning</strong>.
        </p>
        <Link to="/#contact-us" className={styles.workWithUsBtn}>
          WORK WITH US
        </Link>
      </div>
      <div ref={studioMarqueesRef} className={styles.studioMarquees}>
        <PhotoCarousel />
        <GalleryCarousel />
      </div>
    </section>
  );
};

export default WhatWeDo;
