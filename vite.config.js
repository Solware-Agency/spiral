import process from 'node:process'
import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

const DEFAULT_SITE_ORIGIN = 'https://spiralmstudio.com'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const siteOrigin = (env.VITE_SITE_ORIGIN || DEFAULT_SITE_ORIGIN).replace(/\/$/, '')

  return {
  plugins: [
    react(),
    {
      name: 'html-site-origin',
      transformIndexHtml(html) {
        return html.replaceAll('%SITE_ORIGIN%', siteOrigin)
      },
    },
  ],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules/react-dom') || id.includes('node_modules/react/')) {
            return 'react-vendor'
          }
          if (id.includes('node_modules/react-router')) {
            return 'router'
          }
        },
      },
    },
  },
  }
})
