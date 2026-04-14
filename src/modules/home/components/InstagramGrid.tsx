import React from 'react';
import styles from '../styles/home.module.css';
import InstagramFeedGrid from '../../../components/InstagramFeedGrid';

const InstagramGrid = () => {
  return (
    <section className={styles.instagramSection} aria-label="Instagram">
      <div className={styles.instagramTop}>
        <a
          className={styles.instagramHandle}
          href="https://www.instagram.com/spiral.mstudio/"
          target="_blank"
          rel="noreferrer"
        >
          @SPIRAL.MSTUDIO
        </a>
      </div>
      <div className={styles.instagramGrid}>
        <InstagramFeedGrid />
      </div>
    </section>
  );
};

export default InstagramGrid;
