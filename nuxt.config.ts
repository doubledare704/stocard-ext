// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-05-15',
  devtools: { enabled: true },
  modules: ['@nuxtjs/tailwindcss', '@vite-pwa/nuxt', '@vueuse/nuxt', '@sentry/nuxt/module'],

  // PWA Configuration
  pwa: {
    registerType: 'autoUpdate',
    workbox: {
      navigateFallback: '/',
      globPatterns: ['**/*.{js,css,html,png,svg,ico}'],
    },
    client: {
      installPrompt: true,
      periodicSyncForUpdates: 20,
    },
    devOptions: {
      enabled: true,
      suppressWarnings: true,
      navigateFallbackAllowlist: [/^\/$/],
      type: 'module',
    },
    manifest: {
      id: '/',
      name: 'StoreCard Manager',
      short_name: 'StoreCard',
      description: 'Manage your store loyalty cards and barcodes offline',
      theme_color: '#3b82f6',
      background_color: '#ffffff',
      display: 'standalone',
      orientation: 'portrait',
      scope: '/',
      start_url: '/',
      categories: ['productivity', 'utilities'],
      lang: 'en',
      icons: [
        {
          src: 'pwa-192x192.png',
          sizes: '192x192',
          type: 'image/png',
          purpose: 'any',
        },
        {
          src: 'pwa-512x512.png',
          sizes: '512x512',
          type: 'image/png',
          purpose: 'any',
        },
        {
          src: 'pwa-512x512.png',
          sizes: '512x512',
          type: 'image/png',
          purpose: 'maskable',
        },
      ],
    },
  },

  // CSS Configuration
  css: ['~/assets/css/main.css'],

  // App Configuration
  app: {
    head: {
      title: 'StoreCard Manager',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'description', content: 'Manage your store loyalty cards and barcodes offline' },
        { name: 'theme-color', content: '#3b82f6', media: '(prefers-color-scheme: light)' },
        { name: 'theme-color', content: '#1f2937', media: '(prefers-color-scheme: dark)' },
      ],
    },
  },

  sentry: {
    sourceMapsUploadOptions: {
      org: 'oleksiy-av',
      project: 'stocard',
    },

    autoInjectServerSentry: 'top-level-import',
  },

  sourcemap: {
    client: 'hidden',
  },
})