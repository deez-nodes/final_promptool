const TRANSITION_CLASS = "theme-transition"
const TRANSITION_MS = 220

// Colour transitions are enabled only for the duration of a theme switch so
// that unrelated hover and focus changes stay instant.
export function withThemeTransition(apply: () => void) {
  const root = document.documentElement
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    apply()
    return
  }
  root.classList.add(TRANSITION_CLASS)
  apply()
  window.setTimeout(() => root.classList.remove(TRANSITION_CLASS), TRANSITION_MS)
}
