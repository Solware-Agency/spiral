import React, { useEffect, useMemo, useRef, useState } from 'react';
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
  const [isLoaded, setIsLoaded] = useState(false);

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

  useEffect(() => {
    const shell = shellRef.current;
    if (!shell) return;

    const isWidgetMounted = () => {
      const appNode = shell.querySelector(`.${className}`);
      return Boolean(appNode && appNode.childElementCount > 0);
    };

    if (isWidgetMounted()) {
      setIsLoaded(true);
      return;
    }

    const mo = new MutationObserver(() => {
      if (!isWidgetMounted()) return;
      setIsLoaded(true);
      mo.disconnect();
    });

    mo.observe(shell, { childList: true, subtree: true });
    return () => mo.disconnect();
  }, [className]);

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
   * Algunos badges "Free Instagram Feed Widget" se montan fuera del contenedor del widget
   * o con clases dinámicas. Este guardado por DOM los oculta de forma defensiva.
   */
  useEffect(() => {
    if (typeof document === 'undefined') return;

    const hideNode = (node: Element | null) => {
      if (!node || !(node instanceof HTMLElement)) return;
      if (node === document.body || node === document.documentElement) return;
      node.style.setProperty('display', 'none', 'important');
      node.style.setProperty('visibility', 'hidden', 'important');
      node.style.setProperty('pointer-events', 'none', 'important');
      node.setAttribute('aria-hidden', 'true');
    };

    const candidateSelectors = [
      '.eapps-widget-toolbar',
      '[class*="eapps-widget-toolbar"]',
      '.es-widget-footer',
      '[class*="es-widget-footer"]',
      'a[href*="elfsight.com"]',
      '[aria-label*="Instagram Feed Widget"]',
      '[title*="Instagram Feed Widget"]',
    ];

    const hideBranding = () => {
      for (const selector of candidateSelectors) {
        document.querySelectorAll(selector).forEach((el) => hideNode(el));
      }
      document.querySelectorAll('a, button').forEach((el) => {
        const text = String(el.textContent || '').trim().toLowerCase();
        if (text === 'free instagram feed widget' || text === 'instagram feed widget') {
          hideNode(el);
        }
      });
    };

    hideBranding();
    const mo = new MutationObserver(() => hideBranding());
    mo.observe(document.body, { childList: true, subtree: true });
    return () => {
      mo.disconnect();
    };
  }, []);

  /*
   * El nodo con elfsight-app-* debe tener SOLO esa clase: el platform usa
   * querySelector('*[class^="elfsight-app"]') y, si hay otra clase delante, no lo encuentra.
   */
  return (
    <div ref={shellRef} className={styles.shell} aria-busy={!isLoaded}>
      {!isLoaded && (
        <div className={styles.preloader} role="status" aria-live="polite" aria-label="Cargando feed de Instagram">
          <div className={styles.preloaderCard}>
            <span className={styles.spinner} />
            <p className={styles.preloaderTitle}>Cargando Instagram</p>
            <p className={styles.preloaderHint}>Preparando el feed visual</p>
          </div>
        </div>
      )}
      <div className={className} data-elfsight-app-lazy="" />
    </div>
  );
};

export default ElfsightInstagramFeed;
