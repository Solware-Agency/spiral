import React from 'react';
import styles from '../styles/about.module.css';
import useMarqueeDrag from '../../../hooks/useMarqueeDrag';

const clientLogos = [
  {
    alt: 'TUA Construction',
    src: '/images/client%20logos/CLIENT%20LOGOS/1.png',
    scale: 1.75,
    instagram: 'https://www.instagram.com/tua.construction?igsh=cGZ2Ym1rNzVoemE1',
  },
  {
    alt: '6 Love Sports',
    src: '/images/client%20logos/CLIENT%20LOGOS/3%202.png',
    scale: 1.75,
    instagram: 'https://www.instagram.com/6lovesports?igsh=YTg2dWdkdjNhM2Zk',
  },
  {
    alt: 'Real Padel',
    src: '/images/client%20logos/CLIENT%20LOGOS/3.png',
    scale: 2.2,
    instagram: 'https://www.instagram.com/realpadelmiami?igsh=MTFtYnh5aHoxb2NxYw==',
  },
  {
    alt: 'Little Havana Shop',
    src: '/images/client%20logos/CLIENT%20LOGOS/4.png',
    scale: 1.85,
    instagram: 'https://www.instagram.com/littlehavanashop?igsh=bzc1aDN6dWx2ZGZ5',
  },
  {
    alt: 'Canti',
    src: '/images/client%20logos/CLIENT%20LOGOS/5.png',
    scale: 1.85,
    instagram: 'https://www.instagram.com/canti.vzla?igsh=N211a2xxYjdkZnRi',
  },
  {
    alt: 'Thirty Lov',
    src: '/images/client%20logos/CLIENT%20LOGOS/6.png',
    scale: 2.4,
    instagram: 'https://www.instagram.com/thirty.lov?igsh=cGNuY3RtaW1iNGwy',
  },
  {
    alt: 'Aguabendita',
    src: '/images/client%20logos/CLIENT%20LOGOS/LogoAB_Horizontal_blanco.png',
    scale: 1.6,
    instagram: 'https://www.instagram.com/aguabenditaven?igsh=MWhxeXpvbHg4dHNldQ==',
  },
  {
    alt: 'Elite Sports Management',
    src: '/images/client%20logos/CLIENT%20LOGOS/LOGOS_ESM-18.png',
    instagram: 'https://www.instagram.com/elitesportsmanagement__?igsh=MWhmZnJoeXExNnVrMQ==',
  },
  { alt: 'Hesser', src: '/images/client%20logos/CLIENT%20LOGOS/Recurso%2030.png' },
  {
    alt: 'The Set Padel Haus',
    src: '/images/client%20logos/CLIENT%20LOGOS/White%20Logo.png',
    scale: 1.5,
    instagram: 'https://www.instagram.com/thesetpadelhaus?igsh=anVlZm92M3Vtb2xn',
  },
];

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
                const href = logo.href ?? logo.instagram ?? null;
                const sharedProps = {
                  className: styles.logoItem,
                  'aria-label': logo.alt,
                  style: {
                    '--client-logo-url': `url("${logo.src}")`,
                    '--client-logo-scale': logo.scale ?? 1,
                  },
                };
                if (!href) {
                  return <div key={logo.src} {...sharedProps} role="img" />;
                }
                return <a key={logo.src} {...sharedProps} href={href} target="_blank" rel="noreferrer" />;
              })}
            </div>
            <div className={styles.logosGroup} aria-hidden="true">
              {clientLogos.map((logo) => {
                const href = logo.href ?? logo.instagram ?? null;
                const sharedProps = {
                  className: styles.logoItem,
                  tabIndex: -1,
                  'aria-hidden': 'true',
                  style: {
                    '--client-logo-url': `url("${logo.src}")`,
                    '--client-logo-scale': logo.scale ?? 1,
                  },
                };
                if (!href) {
                  return <div key={`${logo.src}-dup`} {...sharedProps} />;
                }
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

