import React, { useEffect, useRef } from 'react';
import { CONTACT_PORTAL_URL } from '../../../data/contactPortalUrl';
import { usePauseCssAnimationWhenHidden } from '../../../hooks/usePauseCssAnimationWhenHidden';
import styles from '../styles/home.module.css';
import PhotoCarousel from './PhotoCarousel';
import GalleryCarousel from './GalleryCarousel';

/** Segundos de una vuelta de la banda de texto; el carrusel de fotos escala su duración para igualar px/s. */
const STUDIO_MARQUEE_BASE_SEC = 26;

const WhatWeDo = () => {
  const studioMarqueesRef = useRef<HTMLDivElement>(null);
  const { ref: pauseRef, paused } = usePauseCssAnimationWhenHidden<HTMLDivElement>('200px 0px');

  const setMarqueeHostRef = (node: HTMLDivElement | null) => {
    studioMarqueesRef.current = node;
    pauseRef.current = node;
  };

  useEffect(() => {
    const root = studioMarqueesRef.current;
    if (!root) return;
    const galleryEl = root.querySelector<HTMLElement>('[data-marquee-gallery-segment]');
    const photoEl = root.querySelector<HTMLElement>('[data-marquee-photo-group]');
    if (!galleryEl || !photoEl) return;

    let rafId = 0;
    let prevGalleryShift = '';
    let prevPhotoShift = '';
    let prevGalleryDuration = '';
    let prevPhotoDuration = '';

    const measureAndApply = () => {
      const wGallery = galleryEl.offsetWidth;
      const wPhoto = photoEl.offsetWidth;
      if (wGallery < 1 || wPhoto < 1) return;

      const nextGalleryShift = `${wGallery}px`;
      if (nextGalleryShift !== prevGalleryShift) {
        prevGalleryShift = nextGalleryShift;
        root.style.setProperty('--studio-marquee-shift-gallery', nextGalleryShift);
      }

      const nextPhotoShift = `${wPhoto}px`;
      if (nextPhotoShift !== prevPhotoShift) {
        prevPhotoShift = nextPhotoShift;
        root.style.setProperty('--studio-marquee-shift-photo', nextPhotoShift);
      }

      // Misma velocidad lineal (px/s): la banda de texto es la referencia.
      const gallerySec = STUDIO_MARQUEE_BASE_SEC;
      const photoSec = gallerySec * (wPhoto / wGallery);
      const nextGalleryDuration = `${gallerySec}s`;
      const nextPhotoDuration = `${photoSec}s`;

      if (nextGalleryDuration !== prevGalleryDuration) {
        prevGalleryDuration = nextGalleryDuration;
        root.style.setProperty('--studio-marquee-duration-gallery', nextGalleryDuration);
      }
      if (nextPhotoDuration !== prevPhotoDuration) {
        prevPhotoDuration = nextPhotoDuration;
        root.style.setProperty('--studio-marquee-duration-photo', nextPhotoDuration);
      }
    };

    const queueMeasure = () => {
      cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(measureAndApply);
    };

    const ro = new ResizeObserver(queueMeasure);
    ro.observe(root);
    ro.observe(galleryEl);
    ro.observe(photoEl);

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
        <a
          href={CONTACT_PORTAL_URL}
          className={styles.workWithUsBtn}
          target="_blank"
          rel="noreferrer"
        >
          WORK WITH US
        </a>
      </div>
      <div
        ref={setMarqueeHostRef}
        className={styles.studioMarquees}
        data-marquee-paused={paused || undefined}
      >
        <PhotoCarousel />
        <GalleryCarousel />
      </div>
    </section>
  );
};

export default WhatWeDo;
