import React from 'react';
import ResponsiveImg from '../../../components/ResponsiveImg.jsx';
import styles from '../styles/portfolio.module.css';
import { portfolioPhotosRows, portfolioVideosRows } from '../data/portfolioData';

const MEDIA_THUMB_SIZES = '(max-width: 640px) 100vw, (max-width: 1100px) 50vw, min(36vw, 720px)';

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
            Social media management at Spiral means more than just posting, it&apos;s
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
                    {item.videoSrc ? (
                      <video
                        className={styles.mediaThumbVideo}
                        src={item.videoSrc}
                        poster={item.posterSrc || undefined}
                        preload="metadata"
                        playsInline
                        muted
                        loop
                        controls
                        onError={(e) => {
                          // If the file doesn't exist / can't be decoded, show a clear fallback.
                          const el = e.currentTarget;
                          el.style.display = 'none';
                          const parent = el.parentElement;
                          if (parent) parent.setAttribute('data-video-missing', 'true');
                        }}
                      />
                    ) : item.src || item.imageUrl ? (
                      <ResponsiveImg
                        className={styles.mediaThumbImage}
                        src={item.src || item.imageUrl}
                        alt=""
                        loading="lazy"
                        decoding="async"
                        sizes={MEDIA_THUMB_SIZES}
                      />
                    ) : null}
                    {item.videoSrc ? (
                      <div className={styles.videoMissing} aria-hidden="true">
                        VIDEO NOT FOUND
                      </div>
                    ) : null}
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
                    {item.title ? (() => {
                      const caption = String(item.title)
                        .replace(/^spiral(?:\s+mstudio|\s+studio)?\s+/i, '')
                        .replace(/^studio\s+/i, '')
                        .trim();
                      return caption ? (
                        <span className={styles.mediaPhotoCaption}>{caption}</span>
                      ) : null;
                    })() : null}
                    {(item.src || item.imageUrl) && (
                      <ResponsiveImg
                        className={styles.mediaThumbImage}
                        src={item.src || item.imageUrl}
                        alt=""
                        loading="lazy"
                        decoding="async"
                        sizes={MEDIA_THUMB_SIZES}
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

