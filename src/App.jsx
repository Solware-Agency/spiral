import React, { Suspense, lazy } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import HomePage from './modules/home/pages/HomePage.jsx';
import './styles/global.css';
import ScrollToHash from './components/ScrollToHash.jsx';
import SkipToContent from './components/SkipToContent.jsx';

const ServicesPage = lazy(() => import('./modules/services/pages/ServicesPage.jsx'));
const PortfolioPage = lazy(() => import('./modules/portfolio/pages/PortfolioPage.jsx'));
const AboutPage = lazy(() => import('./modules/about/pages/AboutPage.jsx'));
const StudioPage = lazy(() => import('./modules/studio/pages/StudioPage.jsx'));
const BookNowPage = lazy(() => import('./modules/bookNow/pages/BookNowPage.jsx'));

function App() {
  return (
    <div className="App">
      <SkipToContent />
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