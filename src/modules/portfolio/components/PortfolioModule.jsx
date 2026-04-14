import React, { useState } from 'react';
import ResponsiveImg from '../../../components/ResponsiveImg.jsx';
import styles from '../styles/portfolio.module.css';
import { portfolioPhotosRows, portfolioVideosRows } from '../data/portfolioData';

const MEDIA_THUMB_SIZES = '(max-width: 640px) 100vw, (max-width: 1100px) 50vw, min(36vw, 720px)';

function cleanedPhotoCaption(title) {
  if (title == null || title === '') return '';
  return String(title)
    .replace(/^spiral(?:\s+mstudio|\s+studio)?\s+/i, '')
    .replace(/^studio\s+/i, '')
    .trim();
}

function photoImageAlt(item) {
  if (item.alt) return item.alt;
  const caption = cleanedPhotoCaption(item.title);
  if (caption) return `Portfolio photograph: ${caption}`;
  return 'Photography sample from Spiral portfolio';
}

function videoFallbackImageAlt(item, row) {
  if (item.alt) return item.alt;
  if (row.label) return `${row.label} — marketing video preview from Spiral portfolio`;
  return 'Video preview from Spiral portfolio';
}

/** Carátula: explícita, imagen auxiliar del ítem, o mismo nombre que el .mp4 con extensión .jpg */
function videoPosterUrl(item) {
  if (item.posterSrc) return item.posterSrc;
  if (item.src || item.imageUrl) return item.src || item.imageUrl;
  if (item.videoSrc && /\.mp4$/i.test(item.videoSrc)) {
    return item.videoSrc.replace(/\.mp4$/i, '.jpg');
  }
  return null;
}

function PortfolioVideoThumb({ item, row, layoutIdx }) {
  const [videoBroken, setVideoBroken] = useState(false);
  const [posterBroken, setPosterBroken] = useState(false);
  const [posterImgBroken, setPosterImgBroken] = useState(false);
  const [showPosterOverlay, setShowPosterOverlay] = useState(() => Boolean(videoPosterUrl(item)));

  const posterUrl = videoPosterUrl(item);
  const alt = videoFallbackImageAlt(item, row);
  const showPosterOnly = videoBroken && posterUrl && !posterBroken;
  const showMissing = videoBroken && (!posterUrl || posterBroken);

  const syncPosterOverlay = (v) => {
    if (!posterUrl || posterImgBroken) {
      setShowPosterOverlay(false);
      return;
    }
    setShowPosterOverlay(v.paused && v.currentTime < 0.25);
  };

  return (
    <div
      className={styles.mediaThumb}
      data-variant="video"
      data-layout={layoutIdx}
      data-video-missing={showMissing ? 'true' : undefined}
    >
      {!videoBroken ? (
        <div className={styles.mediaThumbVideoStack}>
          <video
            className={styles.mediaThumbVideo}
            src={item.videoSrc}
            poster={posterUrl || undefined}
            preload="auto"
            playsInline
            muted
            loop
            controls
            onError={() => setVideoBroken(true)}
            onLoadedMetadata={(e) => syncPosterOverlay(e.currentTarget)}
            onLoadedData={(e) => syncPosterOverlay(e.currentTarget)}
            onPlay={() => setShowPosterOverlay(false)}
            onPause={(e) => syncPosterOverlay(e.currentTarget)}
            onTimeUpdate={(e) => {
              const v = e.currentTarget;
              if (v.paused) syncPosterOverlay(v);
            }}
            onSeeked={(e) => syncPosterOverlay(e.currentTarget)}
            onEnded={(e) => syncPosterOverlay(e.currentTarget)}
          />
          {posterUrl && !posterImgBroken ? (
            <img
              src={posterUrl}
              alt=""
              className={`${styles.mediaThumbPosterOverlay} ${
                showPosterOverlay ? styles.mediaThumbPosterOverlayVisible : ''
              }`}
              aria-hidden
              loading="eager"
              decoding="async"
              draggable={false}
              onError={() => setPosterImgBroken(true)}
            />
          ) : null}
        </div>
      ) : showPosterOnly ? (
        <img
          className={styles.mediaThumbVideo}
          src={posterUrl}
          alt={alt}
          loading="lazy"
          decoding="async"
          onError={() => setPosterBroken(true)}
        />
      ) : null}
      {showMissing ? (
        <div className={styles.videoMissing} role="status">
          VIDEO NOT FOUND
        </div>
      ) : null}
    </div>
  );
}

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
                {row.items.map((item, idx) =>
                  item.videoSrc ? (
                    <PortfolioVideoThumb key={item.id} item={item} row={row} layoutIdx={idx + 1} />
                  ) : item.src || item.imageUrl ? (
                    <div
                      key={item.id}
                      className={styles.mediaThumb}
                      data-variant="video"
                      data-layout={idx + 1}
                    >
                      <ResponsiveImg
                        className={styles.mediaThumbImage}
                        src={item.src || item.imageUrl}
                        alt={videoFallbackImageAlt(item, row)}
                        loading="lazy"
                        decoding="async"
                        sizes={MEDIA_THUMB_SIZES}
                      />
                    </div>
                  ) : null,
                )}
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
                      const caption = cleanedPhotoCaption(item.title);
                      return caption ? (
                        <span className={styles.mediaPhotoCaption}>{caption}</span>
                      ) : null;
                    })() : null}
                    {(item.src || item.imageUrl) && (
                      <ResponsiveImg
                        className={styles.mediaThumbImage}
                        src={item.src || item.imageUrl}
                        alt={photoImageAlt(item)}
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

