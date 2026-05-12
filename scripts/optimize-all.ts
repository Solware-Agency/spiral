import { spawn } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');

function run(script: string) {
  return new Promise<void>((resolve, reject) => {
    const child = spawn(
      process.execPath,
      ['--experimental-strip-types', path.join(root, 'scripts', script)],
      {
        cwd: root,
        stdio: 'inherit',
        env: process.env,
      }
    );
    child.on('error', reject);
    child.on('close', (code) => {
      if (code === 0) resolve();
      else reject(new Error(`[optimize-all] ${script} salio con codigo ${code}`));
    });
  });
}

await Promise.all([run('optimize-images.ts'), run('optimize-client-logos.ts'), run('optimize-logos.ts')]);

