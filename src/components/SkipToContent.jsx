import React from 'react';
import styles from './SkipToContent.module.css';

/**
 * Primer enlace enfocable de la app: salta la navegación repetitiva (WCAG 2.4.1).
 */
export default function SkipToContent() {
  const onClick = (e) => {
    const el = document.getElementById('main-content');
    if (!el) return;
    e.preventDefault();
    el.focus({ preventScroll: true });
    const reduceMotion =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    el.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' });
  };

  return (
    <a href="#main-content" className={styles.skipLink} onClick={onClick}>
      Saltar al contenido
    </a>
  );
}
