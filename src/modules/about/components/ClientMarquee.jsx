import React from 'react';
import { clientLogos } from '../../../data/clientLogos.js';
import styles from '../styles/about.module.css';
import useMarqueeDrag from '../../../hooks/useMarqueeDrag';

const ClientMarquee = () => {
  const { bind, dragStyle, isDragging, contentRef } = useMarqueeDrag();

  return (
    <section className={styles.logosSection} aria-label="Client logos">
      <div
        className={`${styles.logosTrack} ${isDragging ? styles.trackDragging : ''}`}
        {...bind}
      >
        <div className={`${styles.logosMarquee} ${isDragging ? styles.marqueeDragging : ''}`}>
          <div ref={contentRef} className={styles.logosMarqueeDrag} style={dragStyle}>
            <div className={styles.logosGroup}>
              {clientLogos.map((logo) => {
                const href = logo.href ?? logo.instagram;
                const sharedProps = {
                  className: styles.logoItem,
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
            <div className={styles.logosGroup} aria-hidden="true">
              {clientLogos.map((logo) => {
                const href = logo.href ?? logo.instagram;
                const sharedProps = {
                  className: styles.logoItem,
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

export default ClientMarquee;
