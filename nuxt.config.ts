export default defineNuxtConfig({
  compatibilityDate: '2025-01-01',
  devtools: { enabled: false },
  modules: [
    '@nuxt/ui'
  ],
  css: [
    '~/assets/css/main.css'
  ],
  // Local only: no web fonts are fetched, and themes come from data-theme on <html>
  // (assets/css/tokens.css), not from Nuxt UI's color-mode class.
  ui: {
    fonts: false,
    colorMode: false
  },
  app: {
    head: {
      title: 'prompTOR',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'description', content: 'prompTOR prompt engineering studio' }
      ]
    }
  },
  nitro: {
    routeRules: {
      '/**': { cors: true }
    }
  },
  // The studio lives at `/` only; legacy paths redirect there.
  routeRules: {
    '/editor': { redirect: '/' },
    '/promptool': { redirect: '/' }
  }
})
