import React from 'react';
import styles from '../styles/portfolio.module.css';
import { portfolioPhotosRows, portfolioVideosRows } from '../data/portfolioData';

const PortfolioModule = () => {
  return (
    <section className={styles.portfolioSection}>
      <header className={styles.hero} aria-hidden>
        <div className={styles.heroOverlay} />
        <div className={styles.heroContent}>
          <h1 className={styles.heroTitle}>
            <span className={styles.heroTitleTop}>RECENT</span>
            <span className={styles.heroTitleBottom}>WORK</span>
          </h1>
        </div>
      </header>

      <section className={styles.introBand}>
        <div className={styles.introInner}>
          <span className={styles.introKicker}>VIEW OUR</span>
          <h2 className={styles.introTitle}>RECENT WORK</h2>
          <p className={styles.introText}>
            Social media management at Spiral means more than just posting—it&apos;s
            about building your brand&apos;s voice, engaging your audience, and creating
            a strategy that delivers real results. We handle everything from planning
            and content creation to posting analytics, so your socials always look
            polished, purposeful, and on-brand. Let us turn your presence into real
            connection.
          </p>
        </div>
      </section>

      <div className={styles.mediaWrap}>
        <section className={`${styles.mediaBlock} ${styles.mediaBlockVideos}`}>
          <h2 className={styles.mediaHeading}>Videos</h2>
          {portfolioVideosRows.map((row) => (
            <div key={row.id} className={styles.mediaRow}>
              {row.label && <span className={styles.mediaRowLabel}>{row.label}</span>}
              <div className={styles.mediaGridVideos}>
                {row.items.map((item, idx) => (
                  <div
                    key={item.id}
                    className={styles.mediaThumb}
                    data-variant="video"
                    data-layout={idx + 1}
                  >
                    {(item.src || item.imageUrl) && (
                      <img
                        className={styles.mediaThumbImage}
                        src={item.src || item.imageUrl}
                        alt=""
                        loading="lazy"
                        decoding="async"
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </section>

        <section className={`${styles.mediaBlock} ${styles.mediaBlockPhotos}`}>
          <h2 className={styles.mediaHeading}>Photos</h2>
          {portfolioPhotosRows.map((row) => (
            <div key={row.id} className={styles.mediaRow}>
              {row.label && <span className={styles.mediaRowLabel}>{row.label}</span>}
              <div className={styles.mediaGridPhotos}>
                {row.items.map((item, idx) => (
                  <div
                    key={item.id}
                    className={styles.mediaThumb}
                    data-variant="photo"
                    data-layout={idx + 1}
                  >
                    {(item.src || item.imageUrl) && (
                      <img
                        className={styles.mediaThumbImage}
                        src={item.src || item.imageUrl}
                        alt=""
                        loading="lazy"
                        decoding="async"
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </section>
      </div>
    </section>
  );
};

export default PortfolioModule;

