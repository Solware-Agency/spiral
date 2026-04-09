import React from 'react';
import Navigation from '../../home/components/Navigation';
import Footer from '../../home/components/Footer';
import AboutModule from '../components/AboutModule';

const AboutPage = () => {
  return (
    <>
      <Navigation />
      <main id="main-content" tabIndex={-1}>
        <AboutModule />
        <Footer />
      </main>
    </>
  );
};

export default AboutPage;

