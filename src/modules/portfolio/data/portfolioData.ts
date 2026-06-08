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

export type PortfolioVideoItem = {
  id: string;
  videoSrc?: string;
  posterSrc?: string;
  src?: string;
  imageUrl?: string;
  alt?: string;
};

export type PortfolioVideoRow = {
  id: string;
  label: string;
  items: PortfolioVideoItem[];
};

/** Carátulas en `public/images/video covers/{carpeta}/` — una por vídeo en cada sección. */
const VIDEO_COVERS_BASE = '/images/video%20covers';

const VIDEO_COVER_FILES = {
  Padel: ['1.jpg', '2.jpg', '3.jpg', '4.jpg'],
  Fashion: ['1.JPG', '2.jpg', '3.jpg', '4.JPG'],
  Drinks: ['1.jpg', '2.jpg', '3.jpg', '4.jpg'],
} as const;

type VideoCoverFolder = keyof typeof VIDEO_COVER_FILES;

function videoCoverSrc(folder: VideoCoverFolder, index: number): string {
  const file = VIDEO_COVER_FILES[folder][index - 1];
  return `${VIDEO_COVERS_BASE}/${encodeURIComponent(folder)}/${encodeURIComponent(file)}`;
}

function videoItemsWithCovers(
  rowId: string,
  folder: VideoCoverFolder,
  videoSrcs: string[]
): PortfolioVideoItem[] {
  return videoSrcs.map((videoSrc, idx) => ({
    id: `${rowId}-${idx + 1}`,
    videoSrc,
    posterSrc: videoCoverSrc(folder, idx + 1),
  }));
}

/**
 * Vídeos: `posterSrc` apunta a `public/images/video covers/`.
 * Sin carátula y sin vídeo → mensaje sobre fondo oscuro (no blanco).
 */
export const portfolioVideosRows: PortfolioVideoRow[] = [
  {
    id: 'vrow-sports',
    label: 'SPORTS',
    items: videoItemsWithCovers('v-sports', 'Padel', [
      '/videos/videos/Sports/24.mp4',
      '/videos/videos/Sports/26.mp4',
      '/videos/videos/Sports/27.mp4',
      '/videos/videos/Sports/28.mp4',
    ]),
  },
  {
    id: 'vrow-fashion',
    label: 'FASHION',
    items: videoItemsWithCovers('v-fashion', 'Fashion', [
      '/videos/videos/Fashion/29.mp4',
      '/videos/videos/Fashion/30.mp4',
      '/videos/videos/Fashion/31.mp4',
      '/videos/videos/Fashion/32.mp4',
    ]),
  },
  {
    id: 'vrow-drinks',
    label: 'DRINKS',
    items: videoItemsWithCovers('v-drinks', 'Drinks', [
      '/videos/videos/Drinks/33.mp4',
      '/videos/videos/Drinks/34.mp4',
      '/videos/videos/Drinks/35.mp4',
      '/videos/videos/Drinks/36.mp4',
    ]),
  },
];

export type PortfolioPhotoItem = {
  id: string;
  title: string;
  alt: string;
  src: string;
  imageUrl?: string;
};

function coverPhotoItems(
  rowId: string,
  folder: VideoCoverFolder,
  sectionLabel: string
): PortfolioPhotoItem[] {
  return VIDEO_COVER_FILES[folder].map((file, idx) => ({
    id: `${rowId}-cover-${idx + 1}`,
    title: sectionLabel,
    alt: `${sectionLabel} portfolio cover ${idx + 1} from Spiral`,
    src: `${VIDEO_COVERS_BASE}/${encodeURIComponent(folder)}/${encodeURIComponent(file)}`,
  }));
}

export const portfolioPhotosRows: { id: string; label: string; items: PortfolioPhotoItem[] }[] = [
  { id: 'prow-sports', label: 'SPORTS', items: coverPhotoItems('prow-sports', 'Padel', 'Sports') },
  { id: 'prow-fashion', label: 'FASHION', items: coverPhotoItems('prow-fashion', 'Fashion', 'Fashion') },
  { id: 'prow-drinks', label: 'DRINKS', items: coverPhotoItems('prow-drinks', 'Drinks', 'Drinks') },
];

