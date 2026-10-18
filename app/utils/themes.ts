// Promptor themes: names and sources only. The colors themselves live in
// app/assets/css/main.css (palettes + `:root.theme-<id>` variable blocks) and the
// semantic aliases of the default theme in app/app.config.ts.
//
// Only dark themes exist. The owner banned the zinc/fuchsia palette of
// myfiles/DESIGN_SYSTEM.md and any purple or light theme, so none is listed here.

export const THEME = {
  acid: 'acid',
  arc: 'arc',
  minty: 'minty'
} as const

export type ThemeId = (typeof THEME)[keyof typeof THEME]

export const DEFAULT_THEME: ThemeId = THEME.acid

// Cookie, so the server renders the chosen theme class and the page never flashes
// the default first.
export const THEME_COOKIE = 'promptor-theme'

export interface ThemeOption {
  id: ThemeId
  label: string
  source: string
}

export const THEMES: readonly ThemeOption[] = [
  {
    id: THEME.acid,
    label: 'Acid Obsidian',
    source: 'extractions/component_designs (owner design system, default)'
  },
  {
    id: THEME.arc,
    label: 'Bearded Arc',
    source: 'extractions/promptor_served_implementation/theme/bearded-theme-arc.json'
  },
  {
    id: THEME.minty,
    label: 'Minty Neutral',
    source: 'extractions/tauri_with_design_files/src/assets/tokens.css (dark scheme)'
  }
]

export function isThemeId(value: unknown): value is ThemeId {
  return THEMES.some(theme => theme.id === value)
}

export function themeClass(id: ThemeId): string {
  return `theme-${id}`
}
