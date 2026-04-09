import React from 'react';
import Navigation from '../../home/components/Navigation';
import Footer from '../../home/components/Footer';
import BookNowModule from '../components/BookNowModule';

const BookNowPage = () => {
  return (
    <>
      <Navigation />
      <main id="main-content" tabIndex={-1}>
        <BookNowModule />
        <Footer />
      </main>
    </>
  );
};

export default BookNowPage;

