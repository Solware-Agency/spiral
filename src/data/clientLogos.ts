/**
 * Logos del carrusel de clientes (home + about).
 * Cada ítem debe tener `instagram` o `href` para mantener el mismo patrón con enlace.
 */
export const clientLogos = [
  {
    alt: 'TUA Construction',
    src: '/images/client%20logos/CLIENT%20LOGOS/1.webp',
    scale: 1.75,
    instagram: 'https://www.instagram.com/tua.construction?igsh=cGZ2Ym1rNzVoemE1',
  },
  {
    alt: '6 Love Sports',
    src: '/images/client%20logos/CLIENT%20LOGOS/3%202.webp',
    scale: 1.75,
    instagram: 'https://www.instagram.com/6lovesports?igsh=YTg2dWdkdjNhM2Zk',
  },
  {
    alt: 'Real Padel',
    src: '/images/client%20logos/CLIENT%20LOGOS/3.webp',
    scale: 2.2,
    instagram: 'https://www.instagram.com/realpadelmiami?igsh=MTFtYnh5aHoxb2NxYw==',
  },
  {
    alt: 'Little Havana Shop',
    src: '/images/client%20logos/CLIENT%20LOGOS/4.webp',
    scale: 1.85,
    instagram: 'https://www.instagram.com/littlehavanashop?igsh=bzc1aDN6dWx2ZGZ5',
  },
  {
    alt: 'Canti',
    src: '/images/client%20logos/CLIENT%20LOGOS/5.webp',
    scale: 1.85,
    instagram: 'https://www.instagram.com/canti.vzla?igsh=N211a2xxYjdkZnRi',
  },
  {
    alt: 'Thirty Lov',
    src: '/images/client%20logos/CLIENT%20LOGOS/6.webp',
    scale: 2.4,
    instagram: 'https://www.instagram.com/thirty.lov?igsh=cGNuY3RtaW1iNGwy',
  },
  {
    alt: 'Aguabendita',
    src: '/images/client%20logos/CLIENT%20LOGOS/LogoAB_Horizontal_blanco.webp',
    scale: 1.6,
    instagram: 'https://www.instagram.com/aguabenditaven?igsh=MWhxeXpvbHg4dHNldQ==',
  },
  {
    alt: 'Elite Sports Management',
    src: '/images/client%20logos/CLIENT%20LOGOS/LOGOS_ESM-18.webp',
    instagram: 'https://www.instagram.com/elitesportsmanagement__?igsh=MWhmZnJoeXExNnVrMQ==',
  },
  {
    alt: 'Hesser',
    src: '/images/client%20logos/CLIENT%20LOGOS/Recurso%2030.webp',
    // Sustituir si el cliente usa otra URL (web o red social).
    instagram: 'https://www.instagram.com/hessthebrand/',
  },
  {
    alt: 'The Set Padel Haus',
    src: '/images/client%20logos/CLIENT%20LOGOS/White%20Logo.webp',
    scale: 1.5,
    instagram: 'https://www.instagram.com/thesetpadelhaus?igsh=anVlZm92M3Vtb2xn',
  },
];

let hasPreloadedClientLogos = false;

export const preloadClientLogos = () => {
  if (hasPreloadedClientLogos) return;
  if (typeof window === 'undefined') return;

  hasPreloadedClientLogos = true;
  clientLogos.forEach((logo) => {
    const img = new Image();
    img.decoding = 'async';
    img.src = logo.src;
  });
};
