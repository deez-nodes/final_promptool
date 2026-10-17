import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import ui from '@nuxt/ui/vite'

export default defineConfig({
  plugins: [vue(), ui({ colorMode: false, ui: { colors: { primary: 'neutral', neutral: 'neutral' } } })],
  clearScreen: false,
  server: { port: 1420, strictPort: true },
  css: { modules: { localsConvention: 'camelCaseOnly' } },
  build: { target: 'esnext' },
})
