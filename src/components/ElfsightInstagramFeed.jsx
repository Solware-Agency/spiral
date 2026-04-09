import React, { useEffect, useMemo, useRef, useState } from 'react';

const PLATFORM_SRC = 'https://elfsightcdn.com/platform.js';
const DEFAULT_APP_ID = 'e1077f31-d2f4-4b2c-8d9b-bb2e032f40da';

const ensurePlatformScript = () => {
  if (typeof document === 'undefined') return;
  if (document.querySelector(`script[src="${PLATFORM_SRC}"]`)) return;

  const script = document.createElement('script');
  script.src = PLATFORM_SRC;
  script.async = true;
  document.head.appendChild(script);
};

const ElfsightInstagramFeed = ({ appId = DEFAULT_APP_ID }) => {
  const className = useMemo(() => `elfsight-app-${appId}`, [appId]);
  const hostRef = useRef(null);
  const [shouldLoad, setShouldLoad] = useState(false);

  useEffect(() => {
    const el = hostRef.current;
    if (!el || typeof IntersectionObserver === 'undefined') {
      setShouldLoad(true);
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

  return <div ref={hostRef} className={className} data-elfsight-app-lazy="" />;
};

export default ElfsightInstagramFeed;

