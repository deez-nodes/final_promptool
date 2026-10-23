export default defineNuxtConfig({
  compatibilityDate: '2025-01-01',
  devtools: { enabled: false },
  modules: [
    '@nuxtjs/tailwindcss'
  ],
  css: [
    '~/assets/css/main.css'
  ],
  app: {
    head: {
      title: 'prompTOR',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'description', content: 'prompTOR prompt engineering studio' }
      ],
      link: [
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
        { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=JetBrains+Mono:ital,wght@0,300;0,400;0,500;0,600;0,700;1,400&family=Orbitron:wght@600;700;800;900&family=Rajdhani:wght@500;600;700&family=Inter:wght@300;400;500;600;700&display=swap' }
      ]
    }
  },
  tailwindcss: {
    viewer: false
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
