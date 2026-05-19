import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import styles from '../styles/home.module.css';
import PhotoCarousel from './PhotoCarousel';
import GalleryCarousel from './GalleryCarousel';

/** Segundos de una vuelta del carrusel de texto (referencia para igualar velocidad lineal con las fotos). */
const STUDIO_MARQUEE_BASE_SEC = 26;

const WhatWeDo = () => {
  const studioMarqueesRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = studioMarqueesRef.current;
    if (!root) return;
    const photoEl = root.querySelector<HTMLElement>('[data-marquee-photo-group]');
    const galleryEl = root.querySelector<HTMLElement>('[data-marquee-gallery-segment]');
    if (!photoEl || !galleryEl) return;
    const mobileMq = window.matchMedia('(max-width: 900px)');

    let rafId = 0;
    let prevPhotoSec = '';

    const measureAndApply = () => {
      if (mobileMq.matches) {
        const sameSec = `${STUDIO_MARQUEE_BASE_SEC}s`;
        if (prevPhotoSec === sameSec) return;
        prevPhotoSec = sameSec;
        root.style.setProperty('--studio-marquee-duration-gallery', sameSec);
        root.style.setProperty('--studio-marquee-duration-photo', sameSec);
        return;
      }
      const wPhoto = photoEl.clientWidth;
      const wGallery = galleryEl.clientWidth;
      if (wGallery < 1 || wPhoto < 1) return;
      const photoSec = (STUDIO_MARQUEE_BASE_SEC * wPhoto) / wGallery;
      const nextPhotoSec = `${photoSec}s`;
      if (nextPhotoSec === prevPhotoSec) return;
      prevPhotoSec = nextPhotoSec;
      root.style.setProperty('--studio-marquee-duration-gallery', `${STUDIO_MARQUEE_BASE_SEC}s`);
      root.style.setProperty('--studio-marquee-duration-photo', nextPhotoSec);
    };

    const queueMeasure = () => {
      cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(measureAndApply);
    };

    const ro = new ResizeObserver(queueMeasure);
    ro.observe(root);
    ro.observe(photoEl);
    ro.observe(galleryEl);
    mobileMq.addEventListener('change', queueMeasure);

    queueMeasure();

    const imgs = root.querySelectorAll<HTMLImageElement>('img');
    const onImgLoad = () => queueMeasure();
    imgs.forEach((img) => {
      if (!img.complete) img.addEventListener('load', onImgLoad, { once: true });
    });

    return () => {
      cancelAnimationFrame(rafId);
      ro.disconnect();
      mobileMq.removeEventListener('change', queueMeasure);
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
