import type { EffectScope } from 'vue'

/**
 * Layout preferences, stored under their own key so that clearing or corrupting
 * them never touches workspace data (`promptor:workspace:v1`), and vice versa.
 * Defaults only for now; Phase 2 (resizable / collapsible panes, sounds, timer) consumes them.
 */
export const LAYOUT_PREFS_KEY = 'promptool:layout'
const PREFS_VERSION = 1
const PREFS_DEBOUNCE_MS = 400

export interface LayoutPrefs {
  version: number
  /** Pane widths as fractions of window width (0..1). */
  paneWidths: { sidebar: number; preview: number }
  collapsed: { sidebar: boolean; preview: boolean }
  sounds: { enabled: boolean; volume: number }
  timer: { enabled: boolean; workMinutes: number; breakMinutes: number }
}

export function defaultLayoutPrefs(): LayoutPrefs {
  return {
    version: PREFS_VERSION,
    paneWidths: { sidebar: 0.2, preview: 0.38 },
    collapsed: { sidebar: false, preview: false },
    sounds: { enabled: false, volume: 0.5 },
    timer: { enabled: false, workMinutes: 25, breakMinutes: 5 }
  }
}

const num = (v: unknown, fallback: number, min: number, max: number) =>
  typeof v === 'number' && Number.isFinite(v) && v >= min && v <= max ? v : fallback
const bool = (v: unknown, fallback: boolean) => (typeof v === 'boolean' ? v : fallback)

/** Field-by-field merge onto defaults: a bad field falls back alone, never the whole object. */
export function normalizeLayoutPrefs(input: unknown): LayoutPrefs {
  const d = defaultLayoutPrefs()
  const p = (input && typeof input === 'object' ? input : {}) as any
  return {
    version: PREFS_VERSION,
    paneWidths: {
      sidebar: num(p.paneWidths?.sidebar, d.paneWidths.sidebar, 0, 1),
      preview: num(p.paneWidths?.preview, d.paneWidths.preview, 0, 1)
    },
    collapsed: {
      sidebar: bool(p.collapsed?.sidebar, d.collapsed.sidebar),
      preview: bool(p.collapsed?.preview, d.collapsed.preview)
    },
    sounds: {
      enabled: bool(p.sounds?.enabled, d.sounds.enabled),
      volume: num(p.sounds?.volume, d.sounds.volume, 0, 1)
    },
    timer: {
      enabled: bool(p.timer?.enabled, d.timer.enabled),
      workMinutes: num(p.timer?.workMinutes, d.timer.workMinutes, 1, 240),
      breakMinutes: num(p.timer?.breakMinutes, d.timer.breakMinutes, 1, 120)
    }
  }
}

let prefsTimer: ReturnType<typeof setTimeout> | null = null
let prefsDirty = false
let prefsScope: EffectScope | null = null

export function useLayoutPrefs() {
  const prefs = useState<LayoutPrefs>('promptool_layout_prefs', defaultLayoutPrefs)
  const loaded = useState<boolean>('promptool_layout_prefs_loaded', () => false)

  const flushPrefs = () => {
    if (process.server) return
    if (prefsTimer) {
      clearTimeout(prefsTimer)
      prefsTimer = null
    }
    if (!prefsDirty) return
    try {
      localStorage.setItem(LAYOUT_PREFS_KEY, JSON.stringify(prefs.value))
      prefsDirty = false
    } catch {
      // Preferences are disposable; a failed write here never affects prompt data.
    }
  }

  const schedule = () => {
    prefsDirty = true
    if (prefsTimer) clearTimeout(prefsTimer)
    prefsTimer = setTimeout(flushPrefs, PREFS_DEBOUNCE_MS)
  }

  const resetLayoutPrefs = () => {
    prefs.value = defaultLayoutPrefs()
  }

  if (process.client && !loaded.value) {
    loaded.value = true
    try {
      const raw = localStorage.getItem(LAYOUT_PREFS_KEY)
      prefs.value = raw ? normalizeLayoutPrefs(JSON.parse(raw)) : defaultLayoutPrefs()
    } catch {
      prefs.value = defaultLayoutPrefs()
    }
    if (!prefsScope) {
      prefsScope = effectScope(true)
      prefsScope.run(() => watch(prefs, schedule, { deep: true }))
    }
  }

  return { prefs, flushPrefs, resetLayoutPrefs }
}
