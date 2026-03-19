import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const projectRoot = path.resolve(__dirname, '..');
const inputDir = path.join(projectRoot, 'public', 'images', 'photos');
const outputDir = path.join(projectRoot, 'public', 'images', 'optimized');

const TARGET_WIDTHS = [640, 960, 1280, 1600, 2560, 3200];

// Only optimize images we actually reference across the app (to keep build time reasonable).
const SOURCES = [
  // Hero / backgrounds (critical)
  'DSC01989.jpg',
  'DSC01973.jpg',
  'DSC02285.jpg',
  'DSC09041.jpg',
  'DSC09102.jpg',
  'DSC09031.jpg',

  // Carousels / commonly shown
  'DSC02380.jpg',
  'DSC02040.jpg',
  'DSC01963.jpg',
  'DSC04163.jpg',
  'DSC02284.jpg',
  'DSC02408.jpg',
  'IMG_6230.jpg',
  'DSC01921.jpg',
  'DSC02521.jpg',

  // Services polaroids
  'DSC01393.JPG',
  'DSC02545.jpg',
  'DSC03276.JPG',
  'IMG_9072.JPG',
];

const outName = (file, w, ext) => {
  const base = file.replace(/\.[^.]+$/, '');
  return `${base}_${w}.${ext}`;
};

async function exists(p) {
  try {
    await fs.access(p);
    return true;
  } catch {
    return false;
  }
}

async function shouldRegenerate(srcPath, outPath) {
  if (!(await exists(outPath))) return true;
  const [srcStat, outStat] = await Promise.all([fs.stat(srcPath), fs.stat(outPath)]);
  return srcStat.mtimeMs > outStat.mtimeMs;
}

async function main() {
  await fs.mkdir(outputDir, { recursive: true });
  const tasks = [];

  for (const file of SOURCES) {
    const srcPath = path.join(inputDir, file);
    if (!(await exists(srcPath))) continue;

    for (const w of TARGET_WIDTHS) {
      const webpOut = path.join(outputDir, outName(file, w, 'webp'));
      const jpgOut = path.join(outputDir, outName(file, w, 'jpg'));

      // Skip if up to date.
      const regenWebp = await shouldRegenerate(srcPath, webpOut);
      const regenJpg = await shouldRegenerate(srcPath, jpgOut);
      if (!regenWebp && !regenJpg) continue;
      tasks.push(
        (async () => {
          if (regenWebp) {
            await sharp(srcPath)
              .resize({ width: w, withoutEnlargement: true })
              .webp({ quality: 80 })
              .toFile(webpOut);
          }

          if (regenJpg) {
            await sharp(srcPath)
              .resize({ width: w, withoutEnlargement: true })
              .jpeg({ quality: 82, progressive: true, mozjpeg: true })
              .toFile(jpgOut);
          }
        })()
      );
    }
  }

  await Promise.all(tasks);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

