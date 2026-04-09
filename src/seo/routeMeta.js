/**
 * Metadatos por ruta (SPA). Las descripciones siguen el tono del sitio; ajustar dominio vía VITE_SITE_ORIGIN.
 * imagePath: ruta absoluta desde la raíz del sitio (mismo host que SITE_ORIGIN).
 */
export const ROUTE_META = {
  '/': {
    title: 'SPIRAL Marketing Studio',
    description:
      'Creative marketing studio in Miami. Brand strategy, content production, and digital experiences for teams that want to lead.',
    imagePath: '/images/optimized/DSC01989_1280.jpg',
  },
  '/services': {
    title: 'Services | SPIRAL Marketing Studio',
    description:
      'Marketing and creative services from SPIRAL: strategy, production, and packages tailored to your brand goals.',
    imagePath: '/images/optimized/DSC09102_1280.jpg',
  },
  '/studio': {
    title: 'Studio | SPIRAL Marketing Studio',
    description:
      'Rent a modern creative studio in Miami: atmosphere, flexible setup, and a polished space for photo and video.',
    imagePath: '/images/optimized/DSC01989_1280.jpg',
  },
  '/book-now': {
    title: 'Book Now | SPIRAL Marketing Studio',
    description:
      'Book studio time or a consultation with SPIRAL Marketing Studio. Simple scheduling and clear rates.',
    imagePath: '/images/optimized/DSC01989_1280.jpg',
  },
  '/portfolio': {
    title: 'Portfolio | SPIRAL Marketing Studio',
    description:
      'Selected work and campaigns from SPIRAL Marketing Studio—visual storytelling built for brands that stand out.',
    imagePath: '/images/optimized/DSC01973_1280.jpg',
  },
  '/about': {
    title: 'About | SPIRAL Marketing Studio',
    description:
      'Meet SPIRAL Marketing Studio: who we are, how we work, and the creative drive behind our Miami-based team.',
    imagePath: '/images/optimized/DSC01989_1280.jpg',
  },
};

export function metaForPathname(pathname) {
  const key = (pathname || '/').replace(/\/+$/, '') || '/';
  return ROUTE_META[key] || ROUTE_META['/'];
}
