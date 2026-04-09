import React from 'react';
import LogoPicture from '../../../components/LogoPicture.jsx';
import ResponsiveImg from '../../../components/ResponsiveImg.jsx';
import { LOGO_SIZES, SPIRAL_LOGO_PNG, SPIRAL_LOGO_SLUG } from '../../../data/logoSources.js';
import styles from '../styles/services.module.css';
import ElfsightInstagramFeed from '../../../components/ElfsightInstagramFeed';

const POLAROID_SIZES = '(max-width: 900px) 40vw, min(22vw, 420px)';

const polaroids = [
  {
    src: '/images/photos/DSC01393.JPG',
    className: styles.polaroidTopLeft,
  },
  {
    src: '/images/photos/DSC04163.jpg',
    className: styles.polaroidTopRight,
  },
  {
    src: '/images/photos/DSC02545.jpg',
    className: styles.polaroidBottomLeft,
  },
  {
    src: '/images/photos/DSC03276.JPG',
    className: styles.polaroidBottomRight,
  },
];

const BrandShowcase = () => {
  return (
    <section className={styles.brandShowcase}>
      <div className={styles.brandMaroon}>
        {polaroids.map((p, idx) => (
          <figure key={idx} className={`${styles.polaroid} ${p.className}`} aria-hidden>
            <ResponsiveImg
              className={styles.polaroidImage}
              src={p.src}
              alt=""
              loading="lazy"
              decoding="async"
              sizes={POLAROID_SIZES}
            />
          </figure>
        ))}

        <div className={styles.brandCenter}>
          <LogoPicture
            slug={SPIRAL_LOGO_SLUG.iconWhite}
            pngSrc={SPIRAL_LOGO_PNG.iconWhite}
            className={styles.brandMonogram}
            alt=""
            sizes={LOGO_SIZES.brandIcon}
            loading="lazy"
            decoding="async"
            aria-hidden="true"
          />
          <div className={styles.brandHeadline}>
            <span className={styles.brandScript}>Lifting brands</span>
            <span className={styles.brandCaps}>BEYOND THE ORDINARY</span>
          </div>
          <div className={styles.brandSub}>SPIRAL MARKETING STUDIO</div>
        </div>
      </div>

      <div className={styles.brandStrip} role="region" aria-label="Instagram">
        <div className={styles.brandStripInner}>
          <a
            className={styles.brandHandle}
            href="https://www.instagram.com/spiral.mstudio/"
            target="_blank"
            rel="noreferrer"
          >
            @SPIRAL.MSTUDIO
          </a>
        </div>
        <div className={styles.brandGrid}>
          <ElfsightInstagramFeed />
        </div>
      </div>
    </section>
  );
};

export default BrandShowcase;

