import React from 'react';
import { Link } from 'react-router-dom';
import styles from '../styles/home.module.css';

const RecentWork = () => {
  return (
    <section className={styles.recentWork}>
      <div className={styles.recentWorkOverlay} />
      <div className={styles.recentWorkContent}>
        <h2 className={styles.recentWorkTitle}>
          <span className={styles.recentWorkTitleTop}>RECENT</span>
          <span className={styles.recentWorkTitleBottom}>WORK</span>
        </h2>
        <div className={styles.recentWorkCta}>
          <Link to="/portfolio" className={styles.portfolioBtn}>
            PORTFOLIO
          </Link>
        </div>
      </div>
    </section>
  );
};

export default RecentWork;
