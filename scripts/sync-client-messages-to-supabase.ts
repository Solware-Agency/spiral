/**
 * Sube public/images/photos/client-messages/ a Supabase Storage.
 * Requiere SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY y opcionalmente
 * SUPABASE_STORAGE_BUCKET=imagenes, SUPABASE_STORAGE_PREFIX=Spiral
 *
 * Uso: pnpm media:sync-client-messages
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');
const messagesDir = path.join(root, 'public', 'images', 'photos', 'client-messages');

const SUPABASE_URL = String(process.env.SUPABASE_URL || '').trim().replace(/\/$/, '');
const SERVICE_KEY = String(process.env.SUPABASE_SERVICE_ROLE_KEY || '').trim();
const BUCKET = String(process.env.SUPABASE_STORAGE_BUCKET || 'imagenes').trim();
const PREFIX = String(process.env.SUPABASE_STORAGE_PREFIX || 'Spiral')
  .trim()
  .replace(/^\/+|\/+$/g, '');

const MIME: Record<string, string> = {
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.webp': 'image/webp',
};

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
    console.error('Define SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY en .env');
    process.exit(1);
  }
  if (!fs.existsSync(messagesDir)) {
    console.error(`No existe ${messagesDir}`);
    process.exit(1);
  }

  const files = fs.readdirSync(messagesDir).filter((f) => fs.statSync(path.join(messagesDir, f)).isFile());
  if (files.length === 0) {
    console.error('No hay archivos en public/images/photos/client-messages/');
    process.exit(1);
  }

  for (const file of files) {
    const rel = `photos/client-messages/${file}`;
    const objectPath = PREFIX ? `${PREFIX}/${rel}` : rel;
    await uploadObject(objectPath, path.join(messagesDir, file));
    console.log(`[sync-client-messages] ${objectPath}`);
  }

  const publicBase = `${SUPABASE_URL}/storage/v1/object/public/${BUCKET}${PREFIX ? `/${PREFIX}` : ''}`;
  console.log(`[sync-client-messages] Listo (${files.length} archivos). Base CDN: ${publicBase}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
