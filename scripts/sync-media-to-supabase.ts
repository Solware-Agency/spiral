/**
 * Sube public/images y public/videos a un bucket público de Supabase Storage.
 *
 * Requiere:
 *   SUPABASE_URL=https://xxxx.supabase.co
 *   SUPABASE_SERVICE_ROLE_KEY=eyJ...
 *   SUPABASE_STORAGE_BUCKET=imagenes         (opcional, default spiral-media)
 *   SUPABASE_STORAGE_PREFIX=Spiral             (opcional, carpeta raíz dentro del bucket)
 *
 * Uso: pnpm media:sync-supabase
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');
const publicDir = path.join(root, 'public');

const SUPABASE_URL = String(process.env.SUPABASE_URL || '').trim().replace(/\/$/, '');
const SERVICE_KEY = String(process.env.SUPABASE_SERVICE_ROLE_KEY || '').trim();
const BUCKET = String(process.env.SUPABASE_STORAGE_BUCKET || 'spiral-media').trim();
const PREFIX = String(process.env.SUPABASE_STORAGE_PREFIX || '')
  .trim()
  .replace(/^\/+|\/+$/g, '');

function storageObjectPath(relativePublicPath: string): string {
  return PREFIX ? `${PREFIX}/${relativePublicPath}` : relativePublicPath;
}

const UPLOAD_ROOTS = [
  'images/optimized',
  'images/photos',
  'images/video covers',
  'images/email',
  'images/client logos',
  'images/spiral logos',
  'images/optimized-logos',
  'videos',
  'Polaroids',
];

const MIME: Record<string, string> = {
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.mp4': 'video/mp4',
  '.webm': 'video/webm',
  '.ico': 'image/x-icon',
};

function walkFiles(dir: string): string[] {
  if (!fs.existsSync(dir)) return [];
  const out: string[] = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...walkFiles(full));
    else out.push(full);
  }
  return out;
}

async function ensureBucket() {
  const res = await fetch(`${SUPABASE_URL}/storage/v1/bucket`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${SERVICE_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ id: BUCKET, name: BUCKET, public: true }),
  });
  if (res.ok || res.status === 409) return;
  const text = await res.text();
  throw new Error(`No se pudo crear/verificar bucket: ${res.status} ${text}`);
}

async function uploadObject(objectPath: string, filePath: string) {
  const ext = path.extname(filePath).toLowerCase();
  const contentType = MIME[ext] || 'application/octet-stream';
  const body = fs.readFileSync(filePath);
  const encoded = objectPath
    .split('/')
    .map((seg) => encodeURIComponent(seg))
    .join('/');

  const res = await fetch(`${SUPABASE_URL}/storage/v1/object/${BUCKET}/${encoded}`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${SERVICE_KEY}`,
      'Content-Type': contentType,
      'x-upsert': 'true',
    },
    body,
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Upload failed ${objectPath}: ${res.status} ${text}`);
  }
}

async function main() {
  if (!SUPABASE_URL || !SERVICE_KEY) {
    console.error('Define SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY.');
    process.exit(1);
  }

  await ensureBucket();

  let uploaded = 0;
  for (const relRoot of UPLOAD_ROOTS) {
    const absRoot = path.join(publicDir, relRoot);
    for (const file of walkFiles(absRoot)) {
      const rel = path.relative(publicDir, file).replace(/\\/g, '/');
      await uploadObject(storageObjectPath(rel), file);
      uploaded++;
      if (uploaded % 25 === 0) console.log(`[sync-media] ${uploaded} archivos…`);
    }
  }

  const publicBase = `${SUPABASE_URL}/storage/v1/object/public/${BUCKET}${PREFIX ? `/${PREFIX}` : ''}`;
  console.log(`[sync-media] Listo: ${uploaded} archivos.`);
  console.log(`[sync-media] En Vercel define:`);
  console.log(`  VITE_MEDIA_CDN_ORIGIN=${publicBase}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
