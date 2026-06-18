import React from 'react';
import { CONTACT_PORTAL_URL } from '../../../data/contactPortalUrl';
import styles from '../styles/portfolio.module.css';
import ClientMessagesCarousel from './ClientMessagesCarousel';

const PortfolioPreFooter = () => {
  return (
    <section className={styles.preFooterWrap}>
      <section className={styles.preFooterCta}>
        <div className={styles.preFooterCtaOverlay} />
        <div className={styles.preFooterCtaInner}>
          <h2 className={styles.preFooterCtaTitle}>
            <span className={styles.preFooterCtaTitleLine1}>READY TO MAKE YOUR</span>
            <br />
            BRAND STAND OUT?
          </h2>
          <a
            href={CONTACT_PORTAL_URL}
            className={styles.preFooterCtaBtn}
            target="_blank"
            rel="noreferrer"
          >
            LET&apos;S TALK
          </a>
        </div>
      </section>

      <section className={styles.preFooterTestimonials} data-testimonials-layout="compact">
        <div className={styles.preFooterTestimonialsScaler}>
          <div className={styles.preFooterTestimonialsInner}>
            <div className={styles.testimonialsLeft}>
              <span className={styles.testimonialsKicker}>FROM OUR CLIENTS</span>
              <h2 className={styles.testimonialsTitle}>
                <span className={styles.testimonialsTitleLine1}>DON&apos;T JUST TAKE IT</span>
                <br />
                FROM US —
              </h2>
            </div>

            <div className={styles.testimonialsRight} aria-hidden="true">
              <ClientMessagesCarousel />
            </div>
          </div>
        </div>
      </section>
    </section>
  );
};

export default PortfolioPreFooter;
