import { useEffect, useRef, useState } from 'react';

/** Pausa animaciones CSS infinitas cuando el bloque sale del viewport (menos trabajo al hacer scroll). */
export function usePauseCssAnimationWhenHidden<T extends HTMLElement>(rootMargin = '120px 0px') {
  const ref = useRef<T | null>(null);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return undefined;

    if (!('IntersectionObserver' in window)) return undefined;

    const io = new IntersectionObserver(
      ([entry]) => {
        const next = !entry?.isIntersecting;
        setPaused((prev) => (prev === next ? prev : next));
      },
      { rootMargin, threshold: 0 },
    );

    io.observe(el);
    return () => io.disconnect();
  }, [rootMargin]);

  return { ref, paused };
}
