import React from 'react';
import styles from '../styles/home.module.css';

const GRID_SIZE = 6;

const InstagramGrid = () => {
  return (
    <section className={styles.instagramSection}>
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
      <div className={styles.instagramGrid} aria-hidden>
        {Array.from({ length: GRID_SIZE }).map((_, i) => (
          <div key={i} className={styles.instagramCell} />
        ))}
      </div>
    </section>
  );
};

export default InstagramGrid;
