import React from 'react';
import Navigation from '../../home/components/Navigation';
import Footer from '../../home/components/Footer';
import StudioModule from '../components/StudioModule';

const StudioPage = () => {
  return (
    <>
      <Navigation />
      <main id="main-content" tabIndex={-1}>
        <StudioModule />
        <Footer />
      </main>
    </>
  );
};

export default StudioPage;

