import React, { Suspense, lazy, useEffect, useRef, useState } from 'react';
import Navigation from '../components/Navigation';
import Hero from '../components/Hero';
import WhatWeDo from '../components/WhatWedo';
import OurServices from '../components/OurServices';
import styles from '../styles/home.module.css';

const RecentWork = lazy(() => import('../components/RecentWork'));
const RegimeWork = lazy(() => import('../components/Regimework'));
const InstagramGrid = lazy(() => import('../components/InstagramGrid'));
const Footer = lazy(() => import('../components/Footer'));

function DeferredSection({
  children,
  minHeight,
}: {
  children: React.ReactNode;
  minHeight: string;
}) {
  const [shouldRender, setShouldRender] = useState(false);
  const hostRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (shouldRender) return;
    const el = hostRef.current;
    if (!el) return;

    if (!('IntersectionObserver' in window)) {
      setShouldRender(true);
      return;
    }

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          setShouldRender(true);
          io.disconnect();
        });
      },
      { rootMargin: '320px 0px' },
    );

    io.observe(el);
    return () => io.disconnect();
  }, [shouldRender]);

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

const HomePage = () => {
  return (
    <>
      <Navigation />
      <main id="main-content" tabIndex={-1} className={styles.homePage}>
        <Hero />
        <WhatWeDo />
        <OurServices />
        <DeferredSection minHeight="58rem">
          <Suspense fallback={null}>
            <RecentWork />
          </Suspense>
        </DeferredSection>
        <DeferredSection minHeight="52rem">
          <Suspense fallback={null}>
            <RegimeWork />
          </Suspense>
        </DeferredSection>
        <DeferredSection minHeight="54rem">
          <Suspense fallback={null}>
            <InstagramGrid />
          </Suspense>
        </DeferredSection>
        <DeferredSection minHeight="36rem">
          <Suspense fallback={null}>
            <Footer />
          </Suspense>
        </DeferredSection>
      </main>
    </>
  );
};

export default HomePage;
