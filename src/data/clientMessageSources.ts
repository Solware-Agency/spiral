import { mediaUrl } from '../utils/mediaCdn';

/** Reseñas de clientes en `public/images/photos/client-messages/` (CDN: `/photos/client-messages/`). */
const CLIENT_MESSAGE_FILES = ['82.png', '83.png', '84.png', '85.png', '86.png'] as const;
const CLIENT_MESSAGE_BASE = '/images/photos/client-messages';

function clientMessageUrl(filename: string): string {
  const path = `${CLIENT_MESSAGE_BASE}/${filename}`;
  if (import.meta.env.DEV) return path;
  return mediaUrl(path);
}

export const CLIENT_MESSAGE_REVIEW_IMAGES = CLIENT_MESSAGE_FILES.map(clientMessageUrl);

export const CLIENT_MESSAGES_ROTATE_MS = 4500;
