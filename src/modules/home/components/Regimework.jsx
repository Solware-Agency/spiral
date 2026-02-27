import React from 'react';
import styles from '../styles/home.module.css';

const clientLogos = [
  {
    alt: 'TUA Construction',
    src: '/images/client%20logos/CLIENT%20LOGOS/1.png',
    scale: 1.75,
  },
  {
    alt: 'Client logo',
    src: '/images/client%20logos/CLIENT%20LOGOS/3%202.png',
    scale: 1.75,
  },
  {
    alt: 'Real Padel',
    src: '/images/client%20logos/CLIENT%20LOGOS/3.png',
    scale: 2.2,
  },
  {
    alt: 'Little Havana Shop',
    src: '/images/client%20logos/CLIENT%20LOGOS/4.png',
    scale: 1.85,
  },
  {
    alt: 'Canti',
    src: '/images/client%20logos/CLIENT%20LOGOS/5.png',
    scale: 1.85,
  },
  {
    alt: 'Client logo',
    src: '/images/client%20logos/CLIENT%20LOGOS/6.png',
    scale: 2.4,
  },
  {
    alt: 'Aguabendita',
    src: '/images/client%20logos/CLIENT%20LOGOS/LogoAB_Horizontal_blanco.png',
    scale: 1.6,
  },
  {
    alt: 'Elite Sports Management',
    src: '/images/client%20logos/CLIENT%20LOGOS/LOGOS_ESM-18.png',
  },
  { alt: 'Hesser', src: '/images/client%20logos/CLIENT%20LOGOS/Recurso%2030.png' },
  {
    alt: 'Client logo',
    src: '/images/client%20logos/CLIENT%20LOGOS/White%20Logo.png',
    scale: 1.5,
  },
];

const RegimeWork = () => {
  return (
    <section className={styles.clientsSection}>
      <div className={styles.clientsTrack} aria-label="Client logos">
        <div className={styles.clientsMarquee}>
          <div className={styles.clientsGroup}>
            {clientLogos.map((logo) => {
              const href = logo.href ?? logo.src;
              return (
                <a
                  key={logo.src}
                  className={styles.clientLogoItem}
                  href={href}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={logo.alt}
                  style={{
                    '--client-logo-url': `url("${logo.src}")`,
                    '--client-logo-scale': logo.scale ?? 1,
                  }}
                />
              );
            })}
          </div>
          <div className={styles.clientsGroup} aria-hidden="true">
            {clientLogos.map((logo) => {
              const href = logo.href ?? logo.src;
              return (
                <a
                  key={`${logo.src}-dup`}
                  className={styles.clientLogoItem}
                  href={href}
                  target="_blank"
                  rel="noreferrer"
                  tabIndex={-1}
                  aria-hidden="true"
                  style={{
                    '--client-logo-url': `url("${logo.src}")`,
                    '--client-logo-scale': logo.scale ?? 1,
                  }}
                />
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};

export default RegimeWork;
