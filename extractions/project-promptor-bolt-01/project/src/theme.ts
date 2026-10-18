import { createSystem, defaultConfig, defineConfig } from "@chakra-ui/react"
import { DEFAULT_PALETTE_ID, PALETTES } from "@/lib/palettes"

const THEME_TRANSITION = {
  transitionProperty:
    "background-color, border-color, color, fill, stroke, box-shadow",
  transitionDuration: "200ms",
  transitionTimingFunction: "cubic-bezier(0.4, 0, 0.2, 1)",
}

const DEFAULT_PALETTE = PALETTES.find((p) => p.id === DEFAULT_PALETTE_ID)!

const config = defineConfig({
  globalCss: {
    // Tells the browser how to render native UI (scrollbars, form controls,
    // autofill) so they match the active theme.
    html: {
      colorScheme: "light",
      _dark: { colorScheme: "dark" },
      // Transitions are scoped to an opt-in class that is only present for the
      // duration of a theme switch. This keeps hover states snappy the rest of
      // the time instead of animating every colour change in the app.
      "&.theme-transition, &.theme-transition *": THEME_TRANSITION,
      "&.theme-transition *::before, &.theme-transition *::after":
        THEME_TRANSITION,
      "@media (prefers-reduced-motion: reduce)": {
        "&.theme-transition, &.theme-transition *": {
          transitionProperty: "none",
          transitionDuration: "0ms",
        },
        "&.theme-transition *::before, &.theme-transition *::after": {
          transitionProperty: "none",
          transitionDuration: "0ms",
        },
      },
    },
    body: {
      bg: "app.bg",
      color: "app.fg",
    },
  },
  theme: {
    tokens: {
      fonts: {
        body: { value: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" },
        heading: { value: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" },
        mono: { value: "'JetBrains Mono', 'Fira Code', 'Cascadia Code', monospace" },
      },
    },
    semanticTokens: {
      colors: {
        // Surfaces, text and borders. The default palette lives here; other
        // palettes override these same variables per data-theme. Every pair
        // meets WCAG AA (4.5:1) for body text in both modes.
        app: {
          bg: { value: { base: DEFAULT_PALETTE.light.bg, _dark: DEFAULT_PALETTE.dark.bg } },
          surface: { value: { base: DEFAULT_PALETTE.light.surface, _dark: DEFAULT_PALETTE.dark.surface } },
          subtle: { value: { base: DEFAULT_PALETTE.light.subtle, _dark: DEFAULT_PALETTE.dark.subtle } },
          hover: { value: { base: DEFAULT_PALETTE.light.hover, _dark: DEFAULT_PALETTE.dark.hover } },
          border: { value: { base: DEFAULT_PALETTE.light.border, _dark: DEFAULT_PALETTE.dark.border } },
          borderStrong: { value: { base: DEFAULT_PALETTE.light.borderStrong, _dark: DEFAULT_PALETTE.dark.borderStrong } },
          fg: { value: { base: DEFAULT_PALETTE.light.fg, _dark: DEFAULT_PALETTE.dark.fg } },
          fgMuted: { value: { base: DEFAULT_PALETTE.light.fgMuted, _dark: DEFAULT_PALETTE.dark.fgMuted } },
          accent: { value: { base: DEFAULT_PALETTE.light.accent, _dark: DEFAULT_PALETTE.dark.accent } },
          accentFg: { value: { base: DEFAULT_PALETTE.light.accentFg, _dark: DEFAULT_PALETTE.dark.accentFg } },
        },
        // Semantic section colours. Usable as text on app.bg / app.surface
        // and as a solid pill background with sectionPillFg on top.
        section: {
          green: { value: { base: "#047857", _dark: "#34d399" } },
          rose: { value: { base: "#be123c", _dark: "#fb7185" } },
          amber: { value: { base: "#b45309", _dark: "#fbbf24" } },
          sky: { value: { base: "#0369a1", _dark: "#38bdf8" } },
          purple: { value: { base: "#7e22ce", _dark: "#c084fc" } },
          slate: { value: { base: "#475569", _dark: "#94a3b8" } },
        },
        sectionPillFg: {
          green: { value: { base: "#ffffff", _dark: "#0b1120" } },
          rose: { value: { base: "#ffffff", _dark: "#0b1120" } },
          amber: { value: { base: "#ffffff", _dark: "#0b1120" } },
          sky: { value: { base: "#ffffff", _dark: "#0b1120" } },
          purple: { value: { base: "#ffffff", _dark: "#0b1120" } },
          slate: { value: { base: "#ffffff", _dark: "#0b1120" } },
        },
      },
    },
  },
})

export const system = createSystem(defaultConfig, config)
