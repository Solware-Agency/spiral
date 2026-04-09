import React from 'react';
import ResponsiveImg from '../../../components/ResponsiveImg.jsx';
import styles from '../styles/portfolio.module.css';

const CARD_IMAGE_SIZES = '(max-width: 900px) 100vw, min(33vw, 520px)';

const PortfolioItem = ({ title, category, imageUrl }) => {
  return (
    <article className={styles.portfolioCard}>
      <div className={styles.portfolioMedia}>
        <ResponsiveImg
          className={styles.portfolioImage}
          src={imageUrl}
          alt={title}
          loading="lazy"
          decoding="async"
          sizes={CARD_IMAGE_SIZES}
        />
        <div className={styles.portfolioScrim} aria-hidden />
        <div className={styles.portfolioCaption}>
          <span className={styles.portfolioCategory}>{category}</span>
          <h3 className={styles.portfolioTitle}>{title}</h3>
        </div>
      </div>
    </article>
  );
};

export default PortfolioItem;

