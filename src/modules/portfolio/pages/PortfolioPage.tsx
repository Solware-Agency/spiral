import React, { Suspense, lazy } from 'react';
import Navigation from '../../home/components/Navigation';
import Footer from '../../home/components/Footer';
import PortfolioModule from '../components/PortfolioModule';
import PortfolioPreFooter from '../components/PortfolioPreFooter';

const InstagramGrid = lazy(() => import('../../home/components/InstagramGrid'));

const PortfolioPage = () => {
  return (
    <>
      <Navigation />
      <main id="main-content" tabIndex={-1}>
        <PortfolioModule />
        <PortfolioPreFooter />
        <Suspense fallback={null}>
          <InstagramGrid />
        </Suspense>
        <Footer />
      </main>
    </>
  );
};

export default PortfolioPage;
