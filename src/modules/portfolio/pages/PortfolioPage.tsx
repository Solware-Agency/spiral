import React from 'react';
import Navigation from '../../home/components/Navigation';
import InstagramGrid from '../../home/components/InstagramGrid';
import Footer from '../../home/components/Footer';
import PortfolioModule from '../components/PortfolioModule';
import PortfolioPreFooter from '../components/PortfolioPreFooter';

const PortfolioPage = () => {
  return (
    <>
      <Navigation />
      <main id="main-content" tabIndex={-1}>
        <PortfolioModule />
        <PortfolioPreFooter />
        <InstagramGrid />
        <Footer />
      </main>
    </>
  );
};

export default PortfolioPage;

