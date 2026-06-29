import React, { useEffect } from 'react';
import type { CSSProperties } from 'react';
import { clientLogos, preloadClientLogos } from '../../../data/clientLogos';
import { usePauseCssAnimationWhenHidden } from '../../../hooks/usePauseCssAnimationWhenHidden';
import styles from '../styles/home.module.css';
import useMarqueeDrag from '../../../hooks/useMarqueeDrag';

const RegimeWork = () => {
  const { bind, dragStyle, isDragging, contentRef } = useMarqueeDrag();
  const { ref: pauseRef, paused } = usePauseCssAnimationWhenHidden<HTMLElement>('200px 0px');

  useEffect(() => {
    preloadClientLogos();
  }, []);

  return (
    <section
      ref={pauseRef}
      className={styles.clientsSection}
      data-marquee-paused={paused || undefined}
    >
      <div
        className={`${styles.clientsTrack} ${isDragging ? styles.trackDragging : ''}`}
        aria-label="Client logos"
        {...bind}
      >
        <div className={`${styles.clientsMarquee} ${isDragging ? styles.marqueeDragging : ''}`}>
          <div
            ref={contentRef}
            className={styles.clientsMarqueeDrag}
            style={dragStyle as CSSProperties}
          >
            <div className={styles.clientsGroup}>
              {clientLogos.map((logo) => (
                <span
                  key={logo.src}
                  role="img"
                  className={styles.clientLogoItem}
                  aria-label={logo.alt}
                  style={
                    {
                      '--client-logo-url': `url("${logo.src}")`,
                      '--client-logo-scale': logo.scale ?? 1,
                    } as CSSProperties
                  }
                />
              ))}
            </div>
            <div className={styles.clientsGroup} aria-hidden="true">
              {clientLogos.map((logo) => (
                <span
                  key={`${logo.src}-dup`}
                  className={styles.clientLogoItem}
                  aria-hidden="true"
                  style={
                    {
                      '--client-logo-url': `url("${logo.src}")`,
                      '--client-logo-scale': logo.scale ?? 1,
                    } as CSSProperties
                  }
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default RegimeWork;
