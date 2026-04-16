/**
 * Logos PNG de marca: variantes WebP en /images/optimized-logos/{slug}_{ancho}.webp
 * (scripts/optimize-logos.mjs). Mantener rutas alineadas con public/images.
 */
export const LOGO_WEBP_WIDTHS = [320, 640, 960, 1280];

export const LOGO_OPTIMIZE_ENTRIES = [
  { slug: 'spiral-logo-white', relativePath: 'spiral logos/SPIRAL Logos/Full/Spiral-logo-white.png' },
  { slug: 'spiral-icon-white', relativePath: 'spiral logos/SPIRAL Logos/Icon/Spiral-Icon-White.png' },
  { slug: 'casa-spiral-white', relativePath: 'spiral logos/SPIRAL Logos/Casa Spiral/Casa.spiral-white.png' },
];

/** URLs PNG (fallback dentro de picture) */
export const SPIRAL_LOGO_PNG = {
  fullWhite: '/images/spiral%20logos/SPIRAL%20Logos/Full/Spiral-logo-white.png',
  iconWhite: '/images/spiral%20logos/SPIRAL%20Logos/Icon/Spiral-Icon-White.png',
  casaWhite: '/images/spiral%20logos/SPIRAL%20Logos/Casa%20Spiral/Casa.spiral-white.png',
};

export const SPIRAL_LOGO_SLUG = {
  fullWhite: 'spiral-logo-white',
  iconWhite: 'spiral-icon-white',
  casaWhite: 'casa-spiral-white',
};

/** Valores `sizes` alineados con el CSS de cada ubicación */
export const LOGO_SIZES = {
  nav: 'clamp(140px, 14vw, 240px)',
  hero: 'clamp(240px, 38vw, 620px)',
  footer: 'clamp(190px, 18vw, 320px)',
  brandIcon: '96px',
  /* Tope ancho de dibujo × scale (hasta ~1.28 en móvil) */
  aboutMonogram: 'calc(min(96vw, 900px) * 1.3)',
  casaStudio: 'clamp(200px, 32vw, 340px)',
  casaBook: 'clamp(220px, 34vw, 360px)',
};
