import process from 'node:process';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

const DEFAULT_SITE_ORIGIN = 'https://spiralmstudio.com';

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const siteOrigin = (env.VITE_SITE_ORIGIN || DEFAULT_SITE_ORIGIN).replace(/\/$/, '');
  const devHost = env.VITE_DEV_HOST || 'localhost';
  const devPort = Number(env.VITE_DEV_PORT || 5173);
  const hmrHost = env.VITE_HMR_HOST;
  const hmrPort = env.VITE_HMR_PORT ? Number(env.VITE_HMR_PORT) : undefined;
  const hmrClientPort = env.VITE_HMR_CLIENT_PORT ? Number(env.VITE_HMR_CLIENT_PORT) : undefined;
  const hmrProtocol = env.VITE_HMR_PROTOCOL as 'ws' | 'wss' | undefined;

  return {
    plugins: [
      react(),
      {
        name: 'html-site-origin',
        transformIndexHtml(html: string) {
          return html.replaceAll('%SITE_ORIGIN%', siteOrigin);
        },
      },
    ],
    build: {
      rollupOptions: {
        output: {
          manualChunks(id: string) {
            if (id.includes('node_modules/react-dom') || id.includes('node_modules/react/')) {
              return 'react-vendor';
            }
            if (id.includes('node_modules/react-router')) {
              return 'router';
            }
          },
        },
      },
    },
    server: {
      host: devHost,
      port: devPort,
      strictPort: true,
      hmr: {
        ...(hmrHost ? { host: hmrHost } : {}),
        ...(hmrPort ? { port: hmrPort } : {}),
        ...(hmrClientPort ? { clientPort: hmrClientPort } : {}),
        ...(hmrProtocol ? { protocol: hmrProtocol } : {}),
      },
    },
  };
});
