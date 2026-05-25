import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import './styles/variables.css';
import './styles/global.css';

const path = window.location.pathname.replace(/\/+$/, '') || '/';
if (path === '/') {
  void import('./data/studioCarouselPhotos').then((m) => m.hydrateStudioCarouselImages());
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);
