import React, { Suspense, lazy } from 'react';
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
        <Suspense fallback={null}>
          <RecentWork />
          <RegimeWork />
          <InstagramGrid />
          <Footer />
        </Suspense>
      </main>
    </>
  );
};

export default HomePage;
