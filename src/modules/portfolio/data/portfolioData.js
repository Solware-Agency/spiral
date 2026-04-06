export const portfolioData = [
  {
    id: 'p01',
    title: 'CAMPAIGN CREATIVE',
    category: 'Content + Strategy',
    imageUrl:
      'https://images.unsplash.com/photo-1520975682030-1a5b0d97f0df?auto=format&fit=crop&w=1600&q=80',
  },
  {
    id: 'p02',
    title: 'BRAND IDENTITY',
    category: 'Design System',
    imageUrl:
      'https://images.unsplash.com/photo-1520975958225-27d5d70b28ee?auto=format&fit=crop&w=1600&q=80',
  },
  {
    id: 'p03',
    title: 'SOCIAL LAUNCH',
    category: 'Social Media',
    imageUrl:
      'https://images.unsplash.com/photo-1520975916555-1f0b7a4bf6d1?auto=format&fit=crop&w=1600&q=80',
  },
  {
    id: 'p04',
    title: 'PRODUCT SHOOT',
    category: 'Photography',
    imageUrl:
      'https://images.unsplash.com/photo-1520975867597-0b273a1a613a?auto=format&fit=crop&w=1600&q=80',
  },
  {
    id: 'p05',
    title: 'EDITORIAL LAYOUTS',
    category: 'Graphic Design',
    imageUrl:
      'https://images.unsplash.com/photo-1520975832904-0e0a6e8b3b1f?auto=format&fit=crop&w=1600&q=80',
  },
  {
    id: 'p06',
    title: 'CONTENT DAY',
    category: 'All Access',
    imageUrl:
      'https://images.unsplash.com/photo-1520975900651-5f8b9c9f3f5b?auto=format&fit=crop&w=1600&q=80',
  },
];

export const portfolioVideosRows = [
  {
    id: 'vrow-sports',
    label: 'SPORTS',
    items: [
      { id: 'v-sports-24', videoSrc: '/videos/videos/Sports/24.mp4' },
      { id: 'v-sports-26', videoSrc: '/videos/videos/Sports/26.mp4' },
      { id: 'v-sports-27', videoSrc: '/videos/videos/Sports/27.mp4' },
      { id: 'v-sports-28', videoSrc: '/videos/videos/Sports/28.mp4' },
    ],
  },
  {
    id: 'vrow-fashion',
    label: 'FASHION',
    items: [
      { id: 'v-fashion-29', videoSrc: '/videos/videos/Fashion/29.mp4' },
      { id: 'v-fashion-30', videoSrc: '/videos/videos/Fashion/30.mp4' },
      { id: 'v-fashion-31', videoSrc: '/videos/videos/Fashion/31.mp4' },
      { id: 'v-fashion-32', videoSrc: '/videos/videos/Fashion/32.mp4' },
    ],
  },
  {
    id: 'vrow-drinks',
    label: 'DRINKS',
    items: [
      { id: 'v-drinks-33', videoSrc: '/videos/videos/Drinks/33.mp4' },
      { id: 'v-drinks-34', videoSrc: '/videos/videos/Drinks/34.mp4' },
      { id: 'v-drinks-35', videoSrc: '/videos/videos/Drinks/35.mp4' },
      { id: 'v-drinks-36', videoSrc: '/videos/videos/Drinks/36.mp4' },
    ],
  },
];

const PUBLIC_PHOTOS_BASE = '/images/photos/Portfolio%20Photos';

// Lista explícita: Vite no puede auto-listar el directorio `public/` en runtime.
// Si agregás más PNGs a esa carpeta, sumalos acá (o te lo automatizo moviéndolos a `src/assets`).
const publicPortfolioPngFiles = [
  { title: 'Sports', src: '/images/photos/DSC03276.JPG', focusY: '50%' },
  { name: '23.png', title: 'Fashion', focusY: '88%' },
  { name: '24.png', title: 'Drinks', focusY: '90%' },
];

const publicPortfolioPngs = publicPortfolioPngFiles.map((item, index) => {
  const base =
    item.src != null
      ? {
          id: `public:photo-${index}`,
          title: item.title,
          src: item.src,
        }
      : {
          id: `public:${item.name}`,
          title: item.title,
          src: `${PUBLIC_PHOTOS_BASE}/${encodeURIComponent(item.name)}`,
        };
  if (item.focusY != null) base.focusY = item.focusY;
  return base;
});

export const portfolioPhotosRows = [
  { id: 'prow-photos', label: '', items: publicPortfolioPngs },
];

