import React, { Suspense, lazy } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import HomePage from './modules/home/pages/HomePage';
import ScrollToHash from './components/ScrollToHash';
import SeoHead from './components/SeoHead';
import SkipToContent from './components/SkipToContent';

const ServicesPage = lazy(() => import('./modules/services/pages/ServicesPage'));
const PortfolioPage = lazy(() => import('./modules/portfolio/pages/PortfolioPage'));
const AboutPage = lazy(() => import('./modules/about/pages/AboutPage'));
const StudioPage = lazy(() => import('./modules/studio/pages/StudioPage'));
const BookNowPage = lazy(() => import('./modules/bookNow/pages/BookNowPage'));

function App() {
  return (
    <div className="App">
      <SkipToContent />
      <SeoHead />
      <ScrollToHash />
      <Suspense fallback={null}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/services" element={<ServicesPage />} />
          <Route path="/studio" element={<StudioPage />} />
          <Route path="/book-now" element={<BookNowPage />} />
          <Route path="/portfolio" element={<PortfolioPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </div>
  );
}

export default App;