import type { EffectScope } from 'vue'

/**
 * Layout preferences, stored under their own key so that clearing or corrupting
 * them never touches workspace data (`promptor:workspace:v1`), and vice versa.
 *
 * Panes (DECIDED.md Layout "Panes are resizable, movable and addable", DZ-47): an ordered
 * list of panes, each with its width as a fraction of the row (the fractions sum to 1).
 * The main sections pane always stays; the sidebar, a second sections pane (another
 * message) and the Kanban edits board can be closed and added again, and any pane moves
 * left or right. Loaded on mount (app.vue), so server render and hydration use the defaults.
 */
export const LAYOUT_PREFS_KEY = 'promptool:layout'
const PREFS_VERSION = 2
const PREFS_DEBOUNCE_MS = 400

export type PaneKind = 'sidebar' | 'sections' | 'kanban'
/** The panes there can be. `sections` is the main one and follows the current message. */
export type PaneId = 'sidebar' | 'sections' | 'sections-2' | 'kanban'

export interface PaneSpec {
  id: PaneId
  kind: PaneKind
  /** Width as a fraction of the pane row (0..1). */
  size: number
  /** sections-2 only: the message it shows (null = the newest one that is not current). */
  docId: string | null
}

export const PANE_KIND: Readonly<Record<PaneId, PaneKind>> = {
  sidebar: 'sidebar',
  sections: 'sections',
  'sections-2': 'sections',
  kanban: 'kanban'
}

export const PANE_LABEL: Readonly<Record<PaneId, string>> = {
  sidebar: 'Sidebar',
  sections: 'Sections',
  'sections-2': 'Second sections',
  kanban: 'Edits board'
}

/** Default share of each pane; a layout with fewer panes divides by what is there. */
export const PANE_WEIGHT: Readonly<Record<PaneId, number>> = {
  sidebar: 0.18,
  sections: 0.42,
  'sections-2': 0.38,
  kanban: 0.4
}

/** Narrowest a pane may get, in CSS px (the divider stops there). */
export const PANE_MIN_PX: Readonly<Record<PaneKind, number>> = {
  sidebar: 192,
  sections: 288,
  kanban: 256
}

const PANE_IDS = Object.keys(PANE_KIND) as PaneId[]

export interface LayoutPrefs {
  version: number
  panes: PaneSpec[]
  sounds: { enabled: boolean; volume: number }
  timer: { enabled: boolean; workMinutes: number; breakMinutes: number }
}

/** Sizes back to the default shares for the panes present, in their current order. */
export function resetSizes(panes: readonly PaneSpec[]): PaneSpec[] {
  const total = panes.reduce((t, p) => t + PANE_WEIGHT[p.id], 0) || 1
  return panes.map(p => ({ ...p, size: PANE_WEIGHT[p.id] / total }))
}

/** Scale sizes so they sum to 1. */
const normalise = (panes: PaneSpec[]): PaneSpec[] => {
  const total = panes.reduce((t, p) => t + p.size, 0)
  return total > 0 ? panes.map(p => ({ ...p, size: p.size / total })) : resetSizes(panes)
}

export const defaultPanes = (): PaneSpec[] =>
  resetSizes((['sidebar', 'sections', 'kanban'] as PaneId[]).map(id => ({ id, kind: PANE_KIND[id], size: 0, docId: null })))

export function defaultLayoutPrefs(): LayoutPrefs {
  return {
    version: PREFS_VERSION,
    panes: defaultPanes(),
    sounds: { enabled: false, volume: 0.5 },
    timer: { enabled: false, workMinutes: 25, breakMinutes: 5 }
  }
}

const num = (v: unknown, fallback: number, min: number, max: number) =>
  typeof v === 'number' && Number.isFinite(v) && v >= min && v <= max ? v : fallback
const bool = (v: unknown, fallback: boolean) => (typeof v === 'boolean' ? v : fallback)

/** Unknown or repeated panes drop; the main sections pane is always there. */
export function normalizePanes(input: unknown): PaneSpec[] {
  if (!Array.isArray(input)) return defaultPanes()
  const seen = new Set<PaneId>()
  const panes: PaneSpec[] = []
  for (const raw of input as any[]) {
    const id = raw?.id as PaneId
    if (!PANE_IDS.includes(id) || seen.has(id)) continue
    seen.add(id)
    panes.push({
      id,
      kind: PANE_KIND[id],
      size: num(raw.size, PANE_WEIGHT[id], 0.01, 1),
      docId: id === 'sections-2' && typeof raw.docId === 'string' ? raw.docId : null
    })
  }
  if (!seen.has('sections')) panes.push({ id: 'sections', kind: 'sections', size: PANE_WEIGHT.sections, docId: null })
  return normalise(panes)
}

/** Field-by-field merge onto defaults: a bad field falls back alone, never the whole object. */
export function normalizeLayoutPrefs(input: unknown): LayoutPrefs {
  const d = defaultLayoutPrefs()
  const p = (input && typeof input === 'object' ? input : {}) as any
  return {
    version: PREFS_VERSION,
    panes: p.panes === undefined ? d.panes : normalizePanes(p.panes),
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
    if (import.meta.server) return
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

  /** Read saved preferences, once, on the client after mount. */
  const loadPrefs = () => {
    if (import.meta.server || loaded.value) return
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

  // ── panes ─────────────────────────────────────────────────────────────────

  const panes = computed(() => prefs.value.panes)
  const setPanes = (next: PaneSpec[]) => {
    prefs.value = { ...prefs.value, panes: next }
  }
  const hasPane = (id: PaneId) => prefs.value.panes.some(p => p.id === id)

  /** Two neighbouring panes' sizes, from a divider drag or arrow key. */
  const resizePair = (leftId: PaneId, leftSize: number, rightId: PaneId, rightSize: number) => {
    setPanes(prefs.value.panes.map(p => (p.id === leftId ? { ...p, size: leftSize } : p.id === rightId ? { ...p, size: rightSize } : p)))
  }

  const resetPaneSizes = () => setPanes(resetSizes(prefs.value.panes))

  const movePane = (id: PaneId, dir: -1 | 1) => {
    const list = [...prefs.value.panes]
    const i = list.findIndex(p => p.id === id)
    const j = i + dir
    if (i < 0 || j < 0 || j >= list.length) return
    const [pane] = list.splice(i, 1)
    if (pane) list.splice(j, 0, pane)
    setPanes(list)
  }

  /** Close a pane; its width goes to the neighbours. The main sections pane stays. */
  const closePane = (id: PaneId) => {
    if (id === 'sections' || !hasPane(id)) return
    setPanes(normalise(prefs.value.panes.filter(p => p.id !== id)))
  }

  /** Add a pane at the end (the sidebar at the start), at its default share. */
  const addPane = (id: PaneId, docId: string | null = null) => {
    if (hasPane(id)) return
    const share = PANE_WEIGHT[id]
    const rest = prefs.value.panes.map(p => ({ ...p, size: p.size * (1 - share) }))
    const pane: PaneSpec = { id, kind: PANE_KIND[id], size: share, docId: id === 'sections-2' ? docId : null }
    setPanes(id === 'sidebar' ? [pane, ...rest] : [...rest, pane])
  }

  const setPaneDoc = (id: PaneId, docId: string | null) => {
    setPanes(prefs.value.panes.map(p => (p.id === id ? { ...p, docId } : p)))
  }

  return {
    prefs,
    loadPrefs,
    flushPrefs,
    resetLayoutPrefs,
    panes,
    hasPane,
    resizePair,
    resetPaneSizes,
    movePane,
    closePane,
    addPane,
    setPaneDoc
  }
}
