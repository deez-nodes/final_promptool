// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  // @nuxt/content must come after @nuxt/ui (https://ui.nuxt.com/docs/getting-started/integrations/content).
  // @nuxt/fonts, @nuxt/icon and @nuxtjs/color-mode are registered by @nuxt/ui itself
  // (https://ui.nuxt.com/docs/getting-started/installation/nuxt) and configured via their own keys.
  modules: ['@nuxt/ui', '@nuxt/content'],

  devtools: { enabled: true },

  css: ['~/assets/css/main.css'],

  // Every Promptor theme is dark; there is no light mode to switch to.
  // A dedicated storage key keeps a stale "light" choice from another app on the
  // same origin from flipping the scheme (https://color-mode.nuxtjs.org/#configuration).
  colorMode: {
    preference: 'dark',
    fallback: 'dark',
    storageKey: 'promptor-color-mode'
  },

  // Semantic color aliases beyond Nuxt UI's defaults (Nuxt UI `theme.colors`): the
  // component sheets use an amber third accent and a pink/magenta accent
  // (DELETE, VIM, + FILE). The palettes behind every alias are set in app.config.ts.
  ui: {
    theme: {
      colors: ['primary', 'secondary', 'tertiary', 'magenta', 'info', 'success', 'warning', 'error']
    }
  },

  compatibilityDate: '2025-07-15'
})
