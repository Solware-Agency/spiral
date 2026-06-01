import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { hydrateStudioCarouselImages } from '../../../data/studioCarouselPhotos';
import styles from '../styles/home.module.css';
import PhotoCarousel from './PhotoCarousel';
import GalleryCarousel from './GalleryCarousel';

/** Segundos de una vuelta completa (texto y fotos; misma velocidad en móvil y desktop). */
const STUDIO_MARQUEE_BASE_SEC = 26;

const WhatWeDo = () => {
  const studioMarqueesRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    hydrateStudioCarouselImages();
  }, []);

  useEffect(() => {
    const root = studioMarqueesRef.current;
    if (!root) return;
    const galleryEl = root.querySelector<HTMLElement>('[data-marquee-gallery-segment]');
    if (!galleryEl) return;

    let rafId = 0;
    let prevDurations = '';
    let prevGalleryShift = '';

    const measureAndApply = () => {
      const wGallery = galleryEl.offsetWidth;
      if (wGallery >= 1) {
        const nextShift = `${wGallery}px`;
        if (nextShift !== prevGalleryShift) {
          prevGalleryShift = nextShift;
          root.style.setProperty('--studio-marquee-shift-gallery', nextShift);
        }
      }

      const sameSec = `${STUDIO_MARQUEE_BASE_SEC}s`;
      if (sameSec === prevDurations) return;
      prevDurations = sameSec;
      root.style.setProperty('--studio-marquee-duration-gallery', sameSec);
      root.style.setProperty('--studio-marquee-duration-photo', sameSec);
    };

    const queueMeasure = () => {
      cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(measureAndApply);
    };

    const ro = new ResizeObserver(queueMeasure);
    ro.observe(root);
    ro.observe(galleryEl);

    queueMeasure();

    if (document.fonts?.ready) {
      document.fonts.ready.then(queueMeasure).catch(() => undefined);
    }

    const imgs = root.querySelectorAll<HTMLImageElement>('img');
    const onImgLoad = () => queueMeasure();
    imgs.forEach((img) => {
      if (!img.complete) img.addEventListener('load', onImgLoad, { once: true });
    });

    return () => {
      cancelAnimationFrame(rafId);
      ro.disconnect();
    };
  }, []);

  return (
    <section id="the-studio" className={styles.whatWeDoWrap}>
      <div className={styles.whatWeDo}>
        <h2 className={styles.whatWeDoLabel}>WHAT WE DO</h2>
        <p className={styles.whatWeDoText}>
          We capture the pulse of your brand and translate it into visuals that
          <br />
          resonate. Every detail is <strong>intentional,</strong> every project a new chapter. At
          <br />
          Spiral, we don&apos;t just create content—we create <strong>meaning</strong>.
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
