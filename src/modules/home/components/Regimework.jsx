import React from 'react';
import { clientLogos } from '../../../data/clientLogos.js';
import styles from '../styles/home.module.css';
import useMarqueeDrag from '../../../hooks/useMarqueeDrag';

const RegimeWork = () => {
  const { bind, dragStyle, isDragging, contentRef } = useMarqueeDrag();

  return (
    <section className={styles.clientsSection}>
      <div
        className={`${styles.clientsTrack} ${isDragging ? styles.trackDragging : ''}`}
        aria-label="Client logos"
        {...bind}
      >
        <div className={`${styles.clientsMarquee} ${isDragging ? styles.marqueeDragging : ''}`}>
          <div ref={contentRef} className={styles.clientsMarqueeDrag} style={dragStyle}>
            <div className={styles.clientsGroup}>
              {clientLogos.map((logo) => (
                <span
                  key={logo.src}
                  role="img"
                  className={styles.clientLogoItem}
                  aria-label={logo.alt}
                  style={{
                    '--client-logo-url': `url("${logo.src}")`,
                    '--client-logo-scale': logo.scale ?? 1,
                  }}
                />
              ))}
            </div>
            <div className={styles.clientsGroup} aria-hidden="true">
              {clientLogos.map((logo) => (
                <span
                  key={`${logo.src}-dup`}
                  className={styles.clientLogoItem}
                  aria-hidden="true"
                  style={{
                    '--client-logo-url': `url("${logo.src}")`,
                    '--client-logo-scale': logo.scale ?? 1,
                  }}
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
