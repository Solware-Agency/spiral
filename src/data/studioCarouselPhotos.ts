import { optimizedUrl } from '../utils/responsiveImage';

/** Fotos del carrusel de estudio (home — What We Do). */
export const studioCarouselPhotos = [
  {
    id: 'DSC02040',
    alt: 'Content production setup in the Spiral photo studio, styled for brand shoots',
  },
  {
    id: 'DSC01963',
    alt: 'Studio lighting equipment and photography backdrop in Casa Spiral',
  },
  {
    id: 'DSC02380',
    alt: 'Interior view of Casa Spiral creative studio space',
  },
  {
    id: 'DSC02285',
    alt: 'Studio interior with styling and aesthetic detail',
  },
  {
    id: 'DSC01989',
    alt: 'Atmospheric brand and studio photography',
  },
  {
    id: 'DSC02408',
    alt: 'Lifestyle and brand imagery from Spiral client work',
  },
  {
    id: 'DSC02284',
    alt: 'Modern creative studio seating area and aesthetic',
  },
] as const;

export const STUDIO_CAROUSEL_IDS = studioCarouselPhotos.map((p) => p.id);

/** Alineado al tamaño real del carrusel (~140–240px de ancho). */
export function resolveStudioCarouselImageWidth(): number {
  if (typeof window === 'undefined') return 480;
  if (window.matchMedia('(max-width: 600px)').matches) return 320;
  return 480;
}

export function resolveStudioCarouselImageSrc(id: string): string {
  return optimizedUrl(id, resolveStudioCarouselImageWidth(), 'webp');
}

const displaySrcById = new Map<string, string>();
let hydratePromise: Promise<void> | null = null;

export function getStudioCarouselDisplaySrc(id: string): string {
  return displaySrcById.get(id) ?? resolveStudioCarouselImageSrc(id);
}

async function fetchAsBlobUrl(src: string): Promise<string> {
  const response = await fetch(src);
  if (!response.ok) throw new Error(`Failed to fetch ${src}`);
  const blob = await response.blob();
  return URL.createObjectURL(blob);
}

/** Una descarga + un decode por foto; todas las copias del loop comparten blob URL. */
export function hydrateStudioCarouselImages(): Promise<void> {
  if (typeof window === 'undefined') return Promise.resolve();
  if (hydratePromise) return hydratePromise;

  hydratePromise = Promise.all(
    studioCarouselPhotos.map(async ({ id }) => {
      const networkSrc = resolveStudioCarouselImageSrc(id);
      if (displaySrcById.has(id)) return;
      try {
        const blobUrl = await fetchAsBlobUrl(networkSrc);
        displaySrcById.set(id, blobUrl);
      } catch {
        displaySrcById.set(id, networkSrc);
      }
    })
  ).then(() => undefined);

  return hydratePromise;
}

/** @deprecated Usar hydrateStudioCarouselImages */
export function preloadStudioCarouselPhotos(): Promise<void> {
  return hydrateStudioCarouselImages();
}
