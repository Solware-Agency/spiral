import React from 'react';
import LogoPicture from '../../../components/LogoPicture';
import { LOGO_SIZES, SPIRAL_LOGO_PNG, SPIRAL_LOGO_SLUG } from '../../../data/logoSources';
import styles from '../styles/home.module.css';

const Hero = () => {
  return (
    <section className={styles.hero}>
      <div className={styles.heroOverlay} />
      <div className={styles.heroContent}>
        <h1 className={styles.heroTitle}>
          <LogoPicture
            slug={SPIRAL_LOGO_SLUG.fullWhite}
            pngSrc={SPIRAL_LOGO_PNG.fullWhite}
            className={styles.heroLogoImage}
            alt=""
            width={736}
            height={325}
            sizes={LOGO_SIZES.hero}
            loading="eager"
            decoding="async"
            fetchPriority="high"
          />
          <span className={styles.heroTitleText}>SPIRAL Marketing Studio</span>
        </h1>
      </div>
    </section>
  );
};

export default Hero;
