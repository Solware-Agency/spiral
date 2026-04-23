import { spawnSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');

const onVercel = process.env.VERCEL === '1';

/* Vercel: sin Sharp por defecto (misma calidad: assets ya en repo). Forzar: RUN_SHARP_OPTIMIZE=1 */
const skip = onVercel
  ? process.env.RUN_SHARP_OPTIMIZE !== '1'
  : process.env.SKIP_IMAGE_OPTIMIZE === '1' || process.env.SKIP_IMAGE_OPTIMIZE === 'true';

if (skip) {
  const reason = onVercel
    ? 'deploy en Vercel (definí RUN_SHARP_OPTIMIZE=1 para regenerar con Sharp).'
    : 'SKIP_IMAGE_OPTIMIZE activo.';
  console.log(`[build] Se omite optimize:images/logos (${reason})`);
} else {
  const r = spawnSync(process.execPath, [path.join(root, 'scripts', 'optimize-all.mjs')], {
    cwd: root,
    stdio: 'inherit',
    env: process.env,
  });
  if (r.status !== 0) process.exit(r.status ?? 1);
}

const vite = spawnSync('pnpm', ['exec', 'vite', 'build'], {
  cwd: root,
  stdio: 'inherit',
  env: process.env,
});

process.exit(vite.status ?? 0);
