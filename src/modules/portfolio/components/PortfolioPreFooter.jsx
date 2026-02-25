import React from 'react';
import { Link } from 'react-router-dom';
import styles from '../styles/portfolio.module.css';

const PortfolioPreFooter = () => {
  return (
    <section className={styles.preFooterWrap}>
      <section className={styles.preFooterCta}>
        <div className={styles.preFooterCtaOverlay} />
        <div className={styles.preFooterCtaInner}>
          <h2 className={styles.preFooterCtaTitle}>
            READY TO MAKE YOUR
            <br />
            BRAND STAND OUT?
          </h2>
          <Link to="/#contact-us" className={styles.preFooterCtaBtn}>
            LET&apos;S TALK
          </Link>
        </div>
      </section>

      <section className={styles.preFooterTestimonials}>
        <div className={styles.preFooterTestimonialsInner}>
          <div className={styles.testimonialsLeft}>
            <span className={styles.testimonialsKicker}>FROM OUR CLIENTS</span>
            <h3 className={styles.testimonialsTitle}>
              DON&apos;T JUST TAKE IT
              <br />
              FROM US -
            </h3>
          </div>

          <div className={styles.testimonialsRight} aria-hidden>
            <img
              className={styles.testimonialsAsset}
              src="/images/photos/ENVELOPE.png"
              alt=""
              loading="lazy"
              decoding="async"
            />
          </div>
        </div>
      </section>
    </section>
  );
};

export default PortfolioPreFooter;

