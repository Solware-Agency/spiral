import React from 'react';
import Navigation from '../../home/components/Navigation';
import Footer from '../../home/components/Footer';
import ServicesModule from '../components/ServicesModule';

const ServicesPage = () => {
  return (
    <>
      <Navigation />
      <main id="main-content" tabIndex={-1}>
        <ServicesModule />
        <Footer />
      </main>
    </>
  );
};

export default ServicesPage;

