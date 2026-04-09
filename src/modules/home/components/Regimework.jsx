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
              {clientLogos.map((logo) => {
                const href = logo.href ?? logo.instagram;
                const sharedProps = {
                  className: styles.clientLogoItem,
                  'aria-label': logo.alt,
                  style: {
                    '--client-logo-url': `url("${logo.src}")`,
                    '--client-logo-scale': logo.scale ?? 1,
                  },
                };
                return (
                  <a key={logo.src} {...sharedProps} href={href} target="_blank" rel="noreferrer" />
                );
              })}
            </div>
            <div className={styles.clientsGroup} aria-hidden="true">
              {clientLogos.map((logo) => {
                const href = logo.href ?? logo.instagram;
                const sharedProps = {
                  className: styles.clientLogoItem,
                  tabIndex: -1,
                  'aria-hidden': 'true',
                  style: {
                    '--client-logo-url': `url("${logo.src}")`,
                    '--client-logo-scale': logo.scale ?? 1,
                  },
                };
                return (
                  <a
                    key={`${logo.src}-dup`}
                    {...sharedProps}
                    href={href}
                    target="_blank"
                    rel="noreferrer"
                  />
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default RegimeWork;
