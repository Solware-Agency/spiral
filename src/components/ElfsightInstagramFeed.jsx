import React, { useEffect, useMemo, useRef, useState } from 'react';
import styles from './ElfsightInstagramFeed.module.css';

const PLATFORM_SRC = 'https://elfsightcdn.com/platform.js';
const DEFAULT_APP_ID = 'e1077f31-d2f4-4b2c-8d9b-bb2e032f40da';

const ensurePlatformScript = () => {
  if (typeof document === 'undefined') return;
  if (document.querySelector(`script[src="${PLATFORM_SRC}"]`)) return;

  const script = document.createElement('script');
  /* Scripts insertados por JS son async por defecto; async=false + defer evita ejecución “en caliente” y alinea mejor con el parseo (menos competencia con el hilo principal que async). */
  script.async = false;
  script.defer = true;
  script.src = PLATFORM_SRC;
  document.head.appendChild(script);
};

const ElfsightInstagramFeed = ({ appId = DEFAULT_APP_ID }) => {
  const className = useMemo(() => `elfsight-app-${appId}`, [appId]);
  const shellRef = useRef(null);
  const hostRef = useRef(null);
  const [shouldLoad, setShouldLoad] = useState(false);

  useEffect(() => {
    /* Observar el shell (tiene min-height real). El host interno con min-height % podía quedar en ~0 px y nunca intersectar. */
    const el = shellRef.current;
    if (!el || typeof IntersectionObserver === 'undefined') {
      queueMicrotask(() => setShouldLoad(true));
      return () => {};
    }
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShouldLoad(true);
          io.disconnect();
        }
      },
      { rootMargin: '280px 0px', threshold: 0.01 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (shouldLoad) ensurePlatformScript();
  }, [shouldLoad]);

  return (
    <div ref={shellRef} className={styles.shell} aria-hidden="true">
      <div
        ref={hostRef}
        className={`${styles.host} ${className}`}
        data-elfsight-app-lazy=""
      />
    </div>
  );
};

export default ElfsightInstagramFeed;

