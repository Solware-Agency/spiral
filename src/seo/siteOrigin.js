/** Origen público del sitio (sin barra final). Open Graph y canonical requieren URL absoluta. */
const DEFAULT = 'https://spiralmstudio.com';

export const SITE_ORIGIN = (import.meta.env.VITE_SITE_ORIGIN || DEFAULT).replace(/\/$/, '');
