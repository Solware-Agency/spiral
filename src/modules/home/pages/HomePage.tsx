import React, { Suspense, lazy } from 'react';
import DeferredSection from '../../../components/DeferredSection';
import Navigation from '../components/Navigation';
import Hero from '../components/Hero';
import WhatWeDo from '../components/WhatWedo';
import OurServices from '../components/OurServices';
import styles from '../styles/home.module.css';

const RecentWork = lazy(() => import('../components/RecentWork'));
const RegimeWork = lazy(() => import('../components/Regimework'));
const InstagramGrid = lazy(() => import('../components/InstagramGrid'));
const Footer = lazy(() => import('../components/Footer'));

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
