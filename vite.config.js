import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import { readFileSync } from 'fs'

const pkg = JSON.parse(readFileSync('./package.json', 'utf-8'))

const isCFPages = !!process.env.CF_PAGES
const base = isCFPages ? '/jesussays/' : '/JesusSays/'

export default defineConfig({
  base,
  build: {
    outDir: isCFPages ? 'dist/jesussays' : 'dist'
  },
  define: {
    __APP_VERSION__: JSON.stringify(pkg.version),
    __BUILD_DATE__: JSON.stringify(new Date().toISOString().split('T')[0])
  },
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'favicon.ico', 'apple-touch-icon.png', 'icons/*.png'],
      manifest: {
        name: 'Jesus Says',
        short_name: 'Jesus Says',
        description: 'All recorded words of Jesus Christ from the New Testament',
        theme_color: '#1b2a40',
        background_color: '#faf9f6',
        display: 'standalone',
        start_url: isCFPages ? '/jesussays/' : '/JesusSays/',
        scope: isCFPages ? '/jesussays/' : '/JesusSays/',
        icons: [
          {
            src: 'icons/icon-192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'icons/icon-512.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      },
      workbox: {
        cleanupOutdatedCaches: true,
        globPatterns: ['**/*.{js,css,html,ico,png,svg}'],
        runtimeCaching: [
          {
            urlPattern: /\/teachings\.json$/,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'teachings-data',
              networkTimeoutSeconds: 4,
              expiration: {
                maxEntries: 1,
                maxAgeSeconds: 60 * 60 * 24
              }
            }
          },
          {
            urlPattern: /^https:\/\/rest\.api\.bible\//,
            handler: 'CacheFirst',
            options: {
              cacheName: 'bible-api-cache',
              expiration: {
                maxEntries: 300,
                maxAgeSeconds: 1209600
              }
            }
          },
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'google-fonts-stylesheets'
            }
          },
          {
            urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-webfonts',
              expiration: {
                maxEntries: 30,
                maxAgeSeconds: 60 * 60 * 24 * 30
              }
            }
          }
        ]
      }
    })
  ]
})
