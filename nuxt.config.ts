// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  // @nuxt/content must come after @nuxt/ui (https://ui.nuxt.com/docs/getting-started/integrations/content).
  // @nuxt/fonts, @nuxt/icon and @nuxtjs/color-mode are registered by @nuxt/ui itself
  // (https://ui.nuxt.com/docs/getting-started/installation/nuxt) and configured via their own keys.
  modules: ['@nuxt/ui', '@nuxt/content'],

  devtools: { enabled: true },

  css: ['~/assets/css/main.css'],

  colorMode: {
    preference: 'dark'
  },

  compatibilityDate: '2025-07-15'
})
