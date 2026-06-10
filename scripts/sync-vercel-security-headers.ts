import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { getVercelHeaderEntries } from '../server/securityHeaders.ts';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');
const vercelPath = path.join(root, 'vercel.json');

const config = JSON.parse(fs.readFileSync(vercelPath, 'utf8'));
const securityHeaders = getVercelHeaderEntries().filter(
  (entry) => typeof entry.value === 'string' && entry.value.length > 0,
);

if (securityHeaders.length !== getVercelHeaderEntries().length) {
  console.error('[sync-vercel-security-headers] Hay headers sin value. Revisa server/securityHeaders.ts');
  process.exit(1);
}

// Fusiona solo el bloque headers; conserva framework, build, routes (SPA), etc.
config.headers = [
  {
    source: '/(.*)',
    headers: securityHeaders,
  },
];

fs.writeFileSync(vercelPath, `${JSON.stringify(config, null, 2)}\n`);
console.log('[sync-vercel-security-headers] vercel.json actualizado (headers fusionados).');
