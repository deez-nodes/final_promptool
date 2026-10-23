/**
 * Theme cycling (DECIDED.md "Themes you can cycle through").
 * 'system' leaves <html> without data-theme so tokens.css follows the OS; the others
 * pin a theme. The choice is a per-device convenience kept under its own key.
 */
export const THEMES = ['system', 'light', 'dark', 'paper'] as const
export type Theme = (typeof THEMES)[number]
export const THEME_KEY = 'promptool:theme'

const apply = (theme: Theme) => {
  const root = document.documentElement
  if (theme === 'system') delete root.dataset.theme
  else root.dataset.theme = theme
}

export function useTheme() {
  const theme = useState<Theme>('promptool_theme', () => 'system')

  const loadTheme = () => {
    if (import.meta.server) return
    try {
      const saved = localStorage.getItem(THEME_KEY) as Theme | null
      if (saved && THEMES.includes(saved)) theme.value = saved
    } catch {
      // Storage may be unavailable; the system theme still works.
    }
    apply(theme.value)
  }

  const cycleTheme = () => {
    theme.value = THEMES[(THEMES.indexOf(theme.value) + 1) % THEMES.length]
    apply(theme.value)
    try {
      localStorage.setItem(THEME_KEY, theme.value)
    } catch {
      // Not persisted this time; the theme still applies for the session.
    }
  }

  return { theme, loadTheme, cycleTheme }
}
