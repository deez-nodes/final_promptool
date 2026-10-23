import type { EffectScope } from 'vue'

/**
 * Layout preferences, stored under their own key so that clearing or corrupting
 * them never touches workspace data (`promptor:workspace:v1`), and vice versa.
 *
 * Panes (DECIDED.md Layout "Panes are resizable, movable and addable", DZ-47; Stack: "Nuxt UI
 * already ships the resizable panels, sidebar ..."): the panes are Nuxt UI's UDashboardSidebar
 * and UDashboardPanel inside a UDashboardGroup (layouts/default.vue). Nuxt UI resizes them and
 * persists each pane's size (and the sidebar's collapsed state) itself, in cookies under
 * PANE_STORAGE_KEY. What Nuxt UI does not do is kept here: the order of the panes (movable)
 * and which are open (addable). The main sections pane always stays; the sidebar, a second
 * sections pane (another message) and the Kanban edits board can be closed and added again,
 * and any pane moves left or right. Loaded on mount (app.vue), so server render and
 * hydration use the defaults.
 */
export const LAYOUT_PREFS_KEY = 'promptool:layout'
const PREFS_VERSION = 3
const PREFS_DEBOUNCE_MS = 400

export type PaneKind = 'sidebar' | 'sections' | 'kanban'
/** The panes there can be. `sections` is the main one and follows the current message. */
export type PaneId = 'sidebar' | 'sections' | 'sections-2' | 'kanban'

export interface PaneSpec {
  id: PaneId
  kind: PaneKind
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

/**
 * The UDashboardGroup storage key: Nuxt UI keeps each pane's size in a cookie named
 * `<key>-panel-<id>` (the sidebar: `<key>-sidebar-<id>`).
 */
export const PANE_STORAGE_KEY = 'promptool-panes'

/** The cookie Nuxt UI keeps a pane's size in (see useResizable in @nuxt/ui). */
export const paneStorageName = (id: PaneId): string =>
  PANE_STORAGE_KEY + (PANE_KIND[id] === 'sidebar' ? '-sidebar-' : '-panel-') + id

/**
 * Nuxt UI size props per pane, in % of the pane row: default-size, min-size, max-size.
 * The last pane that is not the sidebar takes the rest of the row (no size of its own).
 */
export const PANE_SIZE: Readonly<Record<PaneId, { default: number; min: number; max: number }>> = {
  sidebar: { default: 18, min: 10, max: 40 },
  sections: { default: 42, min: 15, max: 75 },
  'sections-2': { default: 38, min: 15, max: 75 },
  kanban: { default: 40, min: 15, max: 75 }
}

const PANE_IDS = Object.keys(PANE_KIND) as PaneId[]

export interface LayoutPrefs {
  version: number
  panes: PaneSpec[]
  sounds: { enabled: boolean; volume: number }
  timer: { enabled: boolean; workMinutes: number; breakMinutes: number }
}

export const defaultPanes = (): PaneSpec[] =>
  (['sidebar', 'sections', 'kanban'] as PaneId[]).map(id => ({ id, kind: PANE_KIND[id], docId: null }))

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
      docId: id === 'sections-2' && typeof raw.docId === 'string' ? raw.docId : null
    })
  }
  if (!seen.has('sections')) panes.push({ id: 'sections', kind: 'sections', docId: null })
  return panes
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
  /** Bumped by resetPaneSizes: the layout keys its Nuxt UI panes on it, so they re-read their storage. */
  const paneEpoch = useState<number>('promptool_pane_epoch', () => 0)
  /** The sidebar's collapsed state, v-model of UDashboardSidebar (Nuxt UI persists it). */
  const sidebarCollapsed = useState<boolean>('promptool_sidebar_collapsed', () => false)

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

  /**
   * Every pane back to its Nuxt UI default-size: drop the cookies Nuxt UI keeps the sizes in,
   * then remount the panes (paneEpoch) so they read their defaults again.
   */
  const resetPaneSizes = () => {
    if (import.meta.server) return
    for (const id of PANE_IDS) document.cookie = paneStorageName(id) + '=; Path=/; Max-Age=0; SameSite=Lax'
    paneEpoch.value++
    // After the remount, so the old sidebar does not write its size back while expanding.
    if (sidebarCollapsed.value) void nextTick(() => { sidebarCollapsed.value = false })
  }

  const movePane = (id: PaneId, dir: -1 | 1) => {
    const list = [...prefs.value.panes]
    const i = list.findIndex(p => p.id === id)
    const j = i + dir
    if (i < 0 || j < 0 || j >= list.length) return
    const [pane] = list.splice(i, 1)
    if (pane) list.splice(j, 0, pane)
    setPanes(list)
  }

  /** Close a pane (Nuxt UI keeps its size for when it comes back). The main sections pane stays. */
  const closePane = (id: PaneId) => {
    if (id === 'sections' || !hasPane(id)) return
    setPanes(prefs.value.panes.filter(p => p.id !== id))
  }

  /** Add a pane at the end (the sidebar at the start). */
  const addPane = (id: PaneId, docId: string | null = null) => {
    if (hasPane(id)) return
    const pane: PaneSpec = { id, kind: PANE_KIND[id], docId: id === 'sections-2' ? docId : null }
    setPanes(id === 'sidebar' ? [pane, ...prefs.value.panes] : [...prefs.value.panes, pane])
  }

  const setPaneDoc = (id: PaneId, docId: string | null) => {
    setPanes(prefs.value.panes.map(p => (p.id === id ? { ...p, docId } : p)))
  }

  return {
    prefs,
    loadPrefs,
    flushPrefs,
    resetLayoutPrefs,
    loaded,
    panes,
    paneEpoch,
    sidebarCollapsed,
    hasPane,
    resetPaneSizes,
    movePane,
    closePane,
    addPane,
    setPaneDoc
  }
}
