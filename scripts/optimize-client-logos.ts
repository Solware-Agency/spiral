import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const projectRoot = path.resolve(__dirname, '..');
const clientLogosDir = path.join(projectRoot, 'public', 'images', 'client logos', 'CLIENT LOGOS');

async function exists(p: string) {
  try {
    await fs.access(p);
    return true;
  } catch {
    return false;
  }
}

async function shouldRegenerate(srcPath: string, outPath: string) {
  if (!(await exists(outPath))) return true;
  const [srcStat, outStat] = await Promise.all([fs.stat(srcPath), fs.stat(outPath)]);
  return srcStat.mtimeMs > outStat.mtimeMs;
}

async function main() {
  if (!(await exists(clientLogosDir))) {
    console.warn('[optimize-client-logos] Carpeta no encontrada, se omite:', clientLogosDir);
    return;
  }

  const entries = await fs.readdir(clientLogosDir, { withFileTypes: true });
  const pngFiles = entries.filter((e) => e.isFile() && /\.png$/i.test(e.name)).map((e) => e.name);

  if (pngFiles.length === 0) {
    console.warn('[optimize-client-logos] No hay PNG en', clientLogosDir);
    return;
  }

  const tasks: Promise<void>[] = [];

  for (const name of pngFiles) {
    const srcPath = path.join(clientLogosDir, name);
    const base = name.replace(/\.png$/i, '');
    const webpPath = path.join(clientLogosDir, `${base}.webp`);

    const regen = await shouldRegenerate(srcPath, webpPath);
    if (!regen) continue;

    tasks.push(
      (async () => {
        await sharp(srcPath)
          .webp({
            quality: 86,
            alphaQuality: 100,
            effort: 6,
          })
          .toFile(webpPath);
        const [srcStat, outStat] = await Promise.all([fs.stat(srcPath), fs.stat(webpPath)]);
        const pct = Math.round((1 - outStat.size / srcStat.size) * 100);
        console.log(
          `[optimize-client-logos] ${name} -> ${base}.webp (${srcStat.size} -> ${outStat.size} B, ~${pct}% menos)`
        );
      })()
    );
  }

  await Promise.all(tasks);
  if (tasks.length === 0) {
    console.log('[optimize-client-logos] WebP al dia.');
  }
}

main().catch((err: unknown) => {
  console.error(err);
  process.exit(1);
});

