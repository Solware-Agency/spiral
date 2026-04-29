import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const ScrollToHash = () => {
  const location = useLocation();

  useEffect(() => {
    const { hash } = location;
    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const behavior = prefersReducedMotion ? 'auto' : 'smooth';

    const t = window.setTimeout(() => {
      if (!hash) {
        window.scrollTo({ top: 0, left: 0, behavior });
        return;
      }

      const id = decodeURIComponent(hash.replace(/^#/, ''));
      let tries = 0;
      const maxTries = 24; // ~400ms at 60fps

      const attempt = () => {
        const el = document.getElementById(id);
        if (el) {
          el.scrollIntoView({ behavior, block: 'start' });
          return;
        }

        tries += 1;
        if (tries < maxTries) window.requestAnimationFrame(attempt);
      };

      window.requestAnimationFrame(attempt);
    }, 0);

    return () => window.clearTimeout(t);
  }, [location]);

  return null;
};

export default ScrollToHash;

