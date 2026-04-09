import React, { useEffect, useMemo } from 'react';
import styles from './ElfsightInstagramFeed.module.css';

/* Misma URL que el paquete oficial react-elfsight-widget. */
const PLATFORM_SRC = 'https://static.elfsight.com/platform/platform.js';

const ensurePlatformScript = () => {
  if (typeof document === 'undefined') return;
  if ('eapps' in window || document.querySelector(`script[src="${PLATFORM_SRC}"]`)) return;

  const script = document.createElement('script');
  script.src = PLATFORM_SRC;
  script.defer = true;
  document.body.appendChild(script);
};

const ElfsightInstagramFeed = ({ appId = 'e1077f31-d2f4-4b2c-8d9b-bb2e032f40da' }) => {
  const className = useMemo(() => `elfsight-app-${appId}`, [appId]);

  useEffect(() => {
    ensurePlatformScript();
  }, []);

  /*
   * El nodo con elfsight-app-* debe tener SOLO esa clase: el platform usa
   * querySelector('*[class^="elfsight-app"]') y, si hay otra clase delante, no lo encuentra.
   */
  return (
    <div className={styles.shell}>
      <div className={className} data-elfsight-app-lazy="" />
    </div>
  );
};

export default ElfsightInstagramFeed;
