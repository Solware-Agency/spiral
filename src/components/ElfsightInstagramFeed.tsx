import React, { useEffect, useMemo, useRef } from 'react';
import styles from './ElfsightInstagramFeed.module.css';
import {
  eventComposedPathIncludes,
  resolveInstagramPostUrlFromEvent,
} from './resolveInstagramPostUrl';

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
  const shellRef = useRef<HTMLDivElement>(null);
  const className = useMemo(() => `elfsight-app-${appId}`, [appId]);

  useEffect(() => {
    const shell = shellRef.current;
    if (!shell) return;

    if (!('IntersectionObserver' in window)) {
      ensurePlatformScript();
      return;
    }

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          ensurePlatformScript();
          io.disconnect();
        });
      },
      { rootMargin: '300px 0px' },
    );

    io.observe(shell);
    return () => io.disconnect();
  }, []);

  /*
   * Sin depender solo del panel de Elfsight: interceptamos click en captura (antes que el popup)
   * y abrimos la publicación en Instagram. Shadow DOM vía composedPath.
   * Solo `click` (no pointerdown) para no abrir dos pestañas por gesto.
   */
  useEffect(() => {
    const shell = shellRef.current;
    if (!shell) return;

    let lastOpenedUrl = '';
    let lastOpenedAt = 0;

    const onClickCapture = (e: MouseEvent) => {
      if (!eventComposedPathIncludes(shell, e)) return;
      const url = resolveInstagramPostUrlFromEvent(e);
      if (!url) return;
      const now = Date.now();
      if (url === lastOpenedUrl && now - lastOpenedAt < 700) return;
      lastOpenedUrl = url;
      lastOpenedAt = now;
      e.preventDefault();
      e.stopImmediatePropagation();
      window.open(url, '_blank', 'noopener,noreferrer');
    };

    window.addEventListener('click', onClickCapture, true);
    return () => window.removeEventListener('click', onClickCapture, true);
  }, []);

  /*
   * El nodo con elfsight-app-* debe tener SOLO esa clase: el platform usa
   * querySelector('*[class^="elfsight-app"]') y, si hay otra clase delante, no lo encuentra.
   */
  return (
    <div ref={shellRef} className={styles.shell}>
      <div className={className} data-elfsight-app-lazy="" />
    </div>
  );
};

export default ElfsightInstagramFeed;
