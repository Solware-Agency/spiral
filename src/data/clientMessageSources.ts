/** Reseñas de clientes: se sirven desde el propio sitio (`public/photos/client-messages/`). */
const CLIENT_MESSAGE_FILES = ['82.png', '83.png', '84.png', '85.png', '86.png'] as const;

export const CLIENT_MESSAGE_REVIEW_IMAGES = CLIENT_MESSAGE_FILES.map(
  (filename) => `/photos/client-messages/${filename}`
);

export const CLIENT_MESSAGES_ROTATE_MS = 4500;
