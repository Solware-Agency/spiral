import React, { useEffect, useRef, useState } from 'react';

type DeferredSectionProps = {
  children: React.ReactNode;
  minHeight: string;
  rootMargin?: string;
};

/** Monta hijos cerca del viewport; reserva altura solo hasta que el contenido aparece. */
export default function DeferredSection({
  children,
  minHeight,
  rootMargin = '320px 0px',
}: DeferredSectionProps) {
  const [shouldRender, setShouldRender] = useState(false);
  const hostRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (shouldRender) return undefined;
    const el = hostRef.current;
    if (!el) return undefined;

    if (!('IntersectionObserver' in window)) {
      setShouldRender(true);
      return undefined;
    }

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          setShouldRender(true);
          io.disconnect();
        });
      },
      { rootMargin },
    );

    io.observe(el);
    return () => io.disconnect();
  }, [shouldRender, rootMargin]);

  return (
    <div
      ref={hostRef}
      style={
        shouldRender
          ? { contentVisibility: 'auto', containIntrinsicSize: minHeight }
          : { minHeight, contentVisibility: 'auto', containIntrinsicSize: minHeight }
      }
    >
      {shouldRender ? children : null}
    </div>
  );
}
