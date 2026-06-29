import React, { useCallback, useEffect, useRef, useState } from 'react';
import ResponsiveImg from '../../../components/ResponsiveImg';
import styles from '../styles/portfolio.module.css';
import {
  portfolioPhotosRows,
  portfolioVideosRows,
  type PortfolioPhotoItem,
  type PortfolioVideoItem,
  type PortfolioVideoRow,
} from '../data/portfolioData';

const MEDIA_THUMB_SIZES = '(max-width: 640px) 100vw, (max-width: 1100px) 50vw, min(36vw, 720px)';
const PHOTO_CAROUSEL_SIZES = '(max-width: 1100px) 100vw, min(92vw, 1240px)';
const PHOTO_CAROUSEL_INTERVAL_MS = 3600;
const VIDEO_VIEW_ROOT_MARGIN = '160px 0px';

function cleanedPhotoCaption(title) {
  if (title == null || title === '') return '';
  return String(title)
    .replace(/^spiral(?:\s+mstudio|\s+studio)?\s+/i, '')
    .replace(/^studio\s+/i, '')
    .trim();
}

function photoImageAlt(item: PortfolioPhotoItem) {
  if (item.alt) return item.alt;
  const caption = cleanedPhotoCaption(item.title);
  if (caption) return `Portfolio photograph: ${caption}`;
  return 'Photography sample from Spiral portfolio';
}

function videoFallbackImageAlt(item: PortfolioVideoItem, row: PortfolioVideoRow) {
  if (item.alt) return item.alt;
  if (row.label) return `${row.label} — marketing video preview from Spiral portfolio`;
  return 'Video preview from Spiral portfolio';
}

/** Carátula: explícita, imagen auxiliar del ítem, o mismo nombre que el .mp4 con extensión .jpg */
function videoPosterUrl(item: PortfolioVideoItem) {
  if (item.posterSrc) return item.posterSrc;
  if (item.src || item.imageUrl) return item.src || item.imageUrl;
  if (item.videoSrc && /\.mp4$/i.test(item.videoSrc)) {
    return item.videoSrc.replace(/\.mp4$/i, '.jpg');
  }
  return null;
}

function useNearViewport<T extends Element>(rootMargin = VIDEO_VIEW_ROOT_MARGIN) {
  const ref = useRef<T | null>(null);
  const [isNear, setIsNear] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (!('IntersectionObserver' in window)) {
      setIsNear(true);
      return undefined;
    }
    const io = new IntersectionObserver(
      ([entry]) => {
        const next = Boolean(entry?.isIntersecting);
        setIsNear((prev) => (prev === next ? prev : next));
      },
      { rootMargin, threshold: 0.08 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [rootMargin]);

  return { ref, isNear };
}

function VideoPlayBadge() {
  return (
    <span className={styles.mediaThumbPlayBadge} aria-hidden>
      <span className={styles.mediaThumbPlayIcon} />
    </span>
  );
}

function PortfolioVideoThumb({
  item,
  row,
  layoutIdx,
}: {
  item: PortfolioVideoItem & { videoSrc: string };
  row: PortfolioVideoRow;
  layoutIdx: number;
}) {
  const { ref: containerRef, isNear } = useNearViewport<HTMLDivElement>();
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [shouldLoadVideo, setShouldLoadVideo] = useState(false);
  const [videoBroken, setVideoBroken] = useState(false);
  const [posterBroken, setPosterBroken] = useState(false);

  const posterUrl = videoPosterUrl(item);
  const alt = videoFallbackImageAlt(item, row);
  const showPoster = Boolean(posterUrl) && !posterBroken && !shouldLoadVideo;
  const showMissing = shouldLoadVideo && videoBroken;

  useEffect(() => {
    if (!shouldLoadVideo) return;
    const video = videoRef.current;
    if (!video || !isNear) {
      video?.pause();
      return;
    }
    void video.play().catch(() => {});
  }, [shouldLoadVideo, isNear]);

  const activateVideo = useCallback(() => {
    if (videoBroken) return;
    setShouldLoadVideo(true);
  }, [videoBroken]);

  return (
    <div
      ref={containerRef}
      className={styles.mediaThumb}
      data-variant="video"
      data-layout={layoutIdx}
      data-video-missing={showMissing ? 'true' : undefined}
    >
      {shouldLoadVideo && !videoBroken ? (
        <video
          ref={videoRef}
          className={styles.mediaThumbVideo}
          src={item.videoSrc}
          poster={posterUrl || undefined}
          preload="metadata"
          playsInline
          muted
          loop
          controls
          onError={() => setVideoBroken(true)}
        />
      ) : showPoster ? (
        <button
          type="button"
          className={styles.mediaThumbPosterButton}
          onClick={activateVideo}
          aria-label={`Play video: ${alt}`}
        >
          <img
            className={styles.mediaThumbVideo}
            src={posterUrl}
            alt=""
            width={720}
            height={1280}
            loading={isNear ? 'eager' : 'lazy'}
            decoding="async"
            draggable={false}
            onError={() => setPosterBroken(true)}
          />
          <VideoPlayBadge />
        </button>
      ) : null}
      {showMissing ? (
        <div className={styles.videoMissing} role="status">
          VIDEO NOT FOUND
        </div>
      ) : null}
    </div>
  );
}

function PortfolioPhotoCarouselRow({
  row,
}: {
  row: (typeof portfolioPhotosRows)[number];
}) {
  const slides = row.items;
  const [activeIdx, setActiveIdx] = useState(0);

  useEffect(() => {
    if (slides.length <= 1) return undefined;
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (reduceMotion.matches) return undefined;

    const id = window.setInterval(() => {
      setActiveIdx((prev) => (prev + 1) % slides.length);
    }, PHOTO_CAROUSEL_INTERVAL_MS);

    return () => window.clearInterval(id);
  }, [slides.length]);

  if (slides.length === 0) return null;

  return (
    <div key={row.id} className={styles.mediaRow}>
      {row.label && <span className={styles.mediaRowLabel}>{row.label}</span>}
      <div className={styles.mediaGridPhotos}>
        <div
          className={styles.mediaGridPhotosTrack}
          style={{ transform: `translateX(-${activeIdx * 100}%)` }}
        >
          {slides.map((item, idx) => {
            const caption = cleanedPhotoCaption(item.title);
            return (
              <div
                key={item.id}
                className={styles.mediaThumb}
                data-variant="photo"
                data-layout={idx + 1}
              >
                {caption ? <span className={styles.mediaPhotoCaption}>{caption}</span> : null}
                {(item.src || item.imageUrl) && (
                  <ResponsiveImg
                    className={styles.mediaThumbImage}
                    src={item.src || item.imageUrl}
                    alt={photoImageAlt(item)}
                    loading={idx === 0 ? 'eager' : 'lazy'}
                    decoding="async"
                    sizes={PHOTO_CAROUSEL_SIZES}
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>
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
                    <PortfolioVideoThumb
                      key={item.id}
                      item={item as PortfolioVideoItem & { videoSrc: string }}
                      row={row}
                      layoutIdx={idx + 1}
                    />
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
            <PortfolioPhotoCarouselRow key={row.id} row={row} />
          ))}
        </section>
      </div>
    </section>
  );
};

export default PortfolioModule;
