/**
 * En deploy con VITE_MEDIA_CDN_ORIGIN, quita carpetas pesadas de public/
 * antes del build de Vite para que Vercel no empaquete cientos de assets locales.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');
const publicDir = path.join(root, 'public');

const HEAVY_REL_DIRS = [
  'images/optimized',
  'images/photos',
  'images/video covers',
  'images/client logos',
  'images/spiral logos',
  'images/optimized-logos',
  'videos',
  'Polaroids',
];

function rmDirSafe(dir: string) {
  if (!fs.existsSync(dir)) return;
  fs.rmSync(dir, { recursive: true, force: true });
  console.log(`[strip-local-media] removed ${path.relative(root, dir)}`);
}

const cdnOrigin = String(process.env.VITE_MEDIA_CDN_ORIGIN || '').trim();
const onVercel = process.env.VERCEL === '1';

if (!cdnOrigin) {
  console.log('[strip-local-media] VITE_MEDIA_CDN_ORIGIN no definido; se conservan assets locales.');
  process.exit(0);
}

if (!onVercel) {
  console.log('[strip-local-media] Solo se ejecuta en Vercel; omitido en build local.');
  process.exit(0);
}

for (const rel of HEAVY_REL_DIRS) {
  rmDirSafe(path.join(publicDir, rel));
}

console.log('[strip-local-media] Build listo para servir media desde CDN externo.');
