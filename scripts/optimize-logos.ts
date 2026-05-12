import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';
import { LOGO_OPTIMIZE_ENTRIES, LOGO_WEBP_WIDTHS } from '../src/data/logoSources.ts';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, '..');
const imagesRoot = path.join(projectRoot, 'public', 'images');
const outputDir = path.join(projectRoot, 'public', 'images', 'optimized-logos');

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
  await fs.mkdir(outputDir, { recursive: true });
  const tasks: Promise<void>[] = [];

  for (const { slug, relativePath } of LOGO_OPTIMIZE_ENTRIES) {
    const srcPath = path.join(imagesRoot, ...relativePath.split('/'));
    if (!(await exists(srcPath))) {
      console.warn('[optimize-logos] Origen no encontrado, se omite:', srcPath);
      continue;
    }

    for (const w of LOGO_WEBP_WIDTHS) {
      const outPath = path.join(outputDir, `${slug}_${w}.webp`);
      const regen = await shouldRegenerate(srcPath, outPath);
      if (!regen) continue;

      tasks.push(
        (async () => {
          await sharp(srcPath)
            .resize({ width: w, withoutEnlargement: true })
            .webp({ quality: 92, alphaQuality: 100, effort: 6 })
            .toFile(outPath);
          const [srcStat, outStat] = await Promise.all([fs.stat(srcPath), fs.stat(outPath)]);
          console.log(
            `[optimize-logos] ${slug} ${w}w -> ${outPath.split('public').pop()} (${outStat.size} B, orig ${srcStat.size} B)`
          );
        })()
      );
    }
  }

  await Promise.all(tasks);
  if (tasks.length === 0) {
    console.log('[optimize-logos] WebP de logos al dia.');
  }
}

main().catch((err: unknown) => {
  console.error(err);
  process.exit(1);
});

