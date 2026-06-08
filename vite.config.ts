import process from 'node:process';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import {
  buildMediaCdnUrl,
  isInvalidSupabaseDashboardCdnOrigin,
  normalizeMediaCdnOrigin,
  resolveMediaCdnStripPrefix,
} from './scripts/mediaCdnShared.ts';

const DEFAULT_SITE_ORIGIN = 'https://spiralmstudio.com';

function mediaCdnPlugin(cdnOrigin: string, stripPrefix: string) {
  const origin = normalizeMediaCdnOrigin(cdnOrigin);
  if (!origin) return null;

  if (isInvalidSupabaseDashboardCdnOrigin(origin)) {
    throw new Error(
      'VITE_MEDIA_CDN_ORIGIN apunta al dashboard de Supabase, no al CDN público. ' +
        'Usa: https://TU-PROJECT.supabase.co/storage/v1/object/public/NOMBRE-BUCKET/Spiral'
    );
  }

  const rewrite = (code: string) =>
    code.replace(
      /url\((['"]?)(\/(?:images|videos|Polaroids)(?:[^'")]|\\.)*)\1\)/gi,
      (_match, quote: string, assetPath: string) =>
        `url(${quote}${buildMediaCdnUrl(assetPath, origin, stripPrefix)}${quote})`
    );

  return {
    name: 'media-cdn-css',
    transform(code: string, id: string) {
      if (!/\.(css|module\.css)$/.test(id)) return null;
      const next = rewrite(code);
      return next === code ? null : next;
    },
  };
}

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const siteOrigin = (env.VITE_SITE_ORIGIN || DEFAULT_SITE_ORIGIN).replace(/\/$/, '');
  const mediaCdnOrigin = String(env.VITE_MEDIA_CDN_ORIGIN || '').trim();
  const mediaCdnStripPrefix = resolveMediaCdnStripPrefix(env.VITE_MEDIA_CDN_STRIP_PREFIX);
  const devHost = env.VITE_DEV_HOST || 'localhost';
  const devPort = Number(env.VITE_DEV_PORT || 5173);
  const hmrHost = env.VITE_HMR_HOST;
  const hmrPort = env.VITE_HMR_PORT ? Number(env.VITE_HMR_PORT) : undefined;
  const hmrClientPort = env.VITE_HMR_CLIENT_PORT ? Number(env.VITE_HMR_CLIENT_PORT) : undefined;
  const hmrProtocol = env.VITE_HMR_PROTOCOL as 'ws' | 'wss' | undefined;

  return {
    plugins: [
      react(),
      mediaCdnPlugin(mediaCdnOrigin, mediaCdnStripPrefix),
      {
        name: 'html-site-origin',
        transformIndexHtml(html: string) {
          return html.replaceAll('%SITE_ORIGIN%', siteOrigin);
        },
      },
      {
        name: 'html-async-local-css',
        transformIndexHtml: {
          order: 'post',
          handler(html: string) {
            return html.replace(
              /<link rel="stylesheet"(?:\s+crossorigin)? href="(\/assets\/[^"]+\.css)">/g,
              (_m, href: string) =>
                [
                  `<link rel="preload" as="style" href="${href}">`,
                  `<link rel="stylesheet" href="${href}" media="print" onload="this.media='all'">`,
                  `<noscript><link rel="stylesheet" href="${href}"></noscript>`,
                ].join(''),
            );
          },
        },
      },
    ].filter(Boolean),
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
