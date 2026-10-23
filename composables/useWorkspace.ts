/**
 * The workspace store: the record's model (composables/model/) in the UI.
 *
 * State (DECIDED.md "Three reuse levels"): the library of reusable sections, the
 * conversation (ordered Docs, prompts and replies) and the current message. Undo on every
 * destructive action ("Undo on every destructive action") uses the stack in model/undo.ts.
 *
 * Persistence is the F2 machinery: one serializer, one debounced writer (~400ms after the
 * last change), flushed on blur / route change / pagehide (app.vue), a migration table,
 * unreadable data copied aside under `promptool:backup:<ISO>` before anything is written,
 * and a failed-write state the banner and `#save-state` read. Layout preferences live
 * separately in useLayoutPrefs.ts. Local only: nothing here leaves the browser storage.
 */
import type { EffectScope } from 'vue'
import {
  addSection,
  createHistory,
  currentDoc,
  docToXml,
  editCurrent,
  findDoc,
  findSection,
  insertCopy,
  isSectionType,
  makeSection,
  makeWorkspace,
  mergeDown,
  moveSection,
  newMessage,
  parseWorkspace,
  remember,
  removeFromLibrary,
  removeMessage,
  removeSection,
  replaceDoc,
  saveToLibrary,
  serializeWorkspace,
  SKELETON,
  TYPE_DEFAULT_TITLE,
  undo as undoStep,
  undoLabel,
  updateSection,
  type Doc,
  type DocKind,
  type History,
  type LibraryItem,
  type Section,
  type SectionType,
  type Workspace
} from './model'

export const WORKSPACE_KEY = 'promptor:workspace:v1'
export const BACKUP_KEY_PREFIX = 'promptool:backup:'
const WORKSPACE_VERSION = 1
const SAVE_DEBOUNCE_MS = 400
const NOTICE_MS = 2500

/** Section type -> the hue token name in assets/css/tokens.css (`--t-<name>`, `[data-type]`). */
const TYPE_TOKEN: Readonly<Record<SectionType, string>> = {
  who: 'role',
  knows: 'context',
  ends: 'goal',
  todo: 'task',
  limits: 'constraints',
  back: 'output'
}
/** The hue token for a typed section; undefined for an untyped one (no [data-type], no hue). */
export const typeToken = (type: SectionType | null): string | undefined => (type ? TYPE_TOKEN[type] : undefined)

/** The title a meaning chip gives: the message kind's skeleton title for that meaning, else the prompt's. */
export const chipTitle = (type: SectionType, kind: DocKind = 'prompt'): string =>
  SKELETON[kind].find(([, t]) => t === type)?.[0] ?? TYPE_DEFAULT_TITLE[type]

// ---- storage ---------------------------------------------------------------------------

/** Where serialized workspace strings go. localStorage today. */
export interface StorageSink {
  read(key: string): string | null
  write(key: string, value: string): void
  keys(): string[]
}

const localStorageSink: StorageSink = {
  read: key => localStorage.getItem(key),
  write: (key, value) => localStorage.setItem(key, value),
  keys: () => Array.from({ length: localStorage.length }, (_, i) => localStorage.key(i) || '').filter(Boolean)
}

/**
 * Migration table: MIGRATIONS[n] upgrades a version-n payload to version n+1.
 * `serializeWorkspace` writes the version as `v`; a payload without one is version 0.
 */
const MIGRATIONS: Record<number, (data: Record<string, unknown>) => Record<string, unknown>> = {
  0: data => ({ ...data, v: 1 })
}

/** Upgrade a parsed payload to the current version and read it, or throw with a readable reason. */
export function migrateWorkspace(input: unknown): Workspace {
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('not a JSON object')
  let data = input as Record<string, unknown>
  let from = data.v === undefined ? 0 : data.v
  if (typeof from !== 'number' || !Number.isInteger(from) || from < 0) {
    throw new Error(`unrecognised version ${JSON.stringify(data.v)}`)
  }
  if (from > WORKSPACE_VERSION) {
    throw new Error(`written by a newer build (version ${from}; this build reads up to ${WORKSPACE_VERSION})`)
  }
  while (from < WORKSPACE_VERSION) {
    const step = MIGRATIONS[from]
    if (!step) throw new Error(`no migration from version ${from}`)
    data = step(data)
    from += 1
  }
  if (!Array.isArray(data.conversation)) throw new Error('missing conversation array')
  const ws = parseWorkspace(JSON.stringify(data))
  if (!ws) throw new Error('unreadable')
  return ws
}

function describeWriteError(e: unknown): string {
  const err = e as { name?: string; code?: number; message?: string } | null
  if (err?.name === 'QuotaExceededError' || err?.name === 'NS_ERROR_DOM_QUOTA_REACHED' || err?.code === 22) {
    return 'Browser storage is full (QuotaExceededError).'
  }
  return `Browser storage refused the write (${err?.name || err?.message || String(e)}).`
}

export type SaveStatus = 'saved' | 'saving' | 'failed'

export interface PersistState {
  status: SaveStatus
  lastSavedAt: number | null
  /** Why the last write (or the initial read) failed. */
  error: string | null
  /** Set when unreadable saved data was copied aside on load. */
  backupKey: string | null
  backupReason: string | null
  /** True when writing would overwrite saved data we could neither read nor back up. */
  writesBlocked: boolean
}

// ---- undo records ----------------------------------------------------------------------

/**
 * What a destructive action took away, kept on the model/undo.ts stack. Undo puts back
 * exactly that, so typing done since the action survives the undo.
 */
type UndoRecord =
  | { kind: 'section'; docId: string; index: number; section: Section }
  | { kind: 'merge'; docId: string; index: number; upper: Section; lower: Section }
  | { kind: 'message'; index: number; doc: Doc }
  | { kind: 'library'; index: number; item: LibraryItem }

const insertAt = <T>(list: readonly T[], index: number, item: T): T[] => {
  const copy = [...list]
  copy.splice(Math.max(0, Math.min(index, copy.length)), 0, item)
  return copy
}

function restore(ws: Workspace, r: UndoRecord): Workspace {
  switch (r.kind) {
    case 'section': {
      const doc = findDoc(ws.conversation, r.docId)
      if (!doc || doc.sections.some(s => s.id === r.section.id)) return ws
      return { ...ws, currentId: doc.id, conversation: replaceDoc(ws.conversation, addSection(doc, r.section, r.index)) }
    }
    case 'merge': {
      const doc = findDoc(ws.conversation, r.docId)
      if (!doc) return ws
      const sections = doc.sections.filter(s => s.id !== r.lower.id)
      const i = sections.findIndex(s => s.id === r.upper.id)
      if (i >= 0) sections.splice(i, 1, r.upper, r.lower)
      else sections.splice(Math.min(r.index, sections.length), 0, r.upper, r.lower)
      return { ...ws, currentId: doc.id, conversation: replaceDoc(ws.conversation, { ...doc, sections }) }
    }
    case 'message':
      if (findDoc(ws.conversation, r.doc.id)) return ws
      return { ...ws, currentId: r.doc.id, conversation: insertAt(ws.conversation, r.index, r.doc) }
    case 'library':
      if (ws.library.some(l => l.id === r.item.id)) return ws
      return { ...ws, library: insertAt(ws.library, r.index, r.item) }
  }
}

// ---- the store -------------------------------------------------------------------------

// Client-only writer state (module scope: one writer per page).
let saveTimer: ReturnType<typeof setTimeout> | null = null
let noticeTimer: ReturnType<typeof setTimeout> | null = null
let dirty = false
let watchScope: EffectScope | null = null
const sink = localStorageSink

export function useWorkspace() {
  const ws = useState<Workspace>('promptor_workspace', () => makeWorkspace())
  const history = useState<History<UndoRecord>>('promptor_history', () => createHistory<UndoRecord>(50))
  const persist = useState<PersistState>('promptor_persist', () => ({
    status: 'saved',
    lastSavedAt: null,
    error: null,
    backupKey: null,
    backupReason: null,
    writesBlocked: false
  }))
  const initialized = useState<boolean>('promptor_initialized', () => false)
  /** The section the keyboard acts on: the last card that held focus. View state, not saved. */
  const focusedId = useState<string | null>('promptor_focused_section', () => null)
  /** A section a control asked to be focused (outline click, new section, Alt+J/K). */
  const focusRequest = useState<string | null>('promptor_focus_request', () => null)
  /** One short line about the last action (Copied, Undone: …), read by a live region. */
  const notice = useState<string>('promptor_notice', () => '')

  const current = computed<Doc>(() => currentDoc(ws.value))

  // ── persistence ──────────────────────────────────────────────────────────

  // The single write path: serialize the workspace and hand it to the sink.
  const flushSave = () => {
    if (import.meta.server) return
    if (saveTimer) {
      clearTimeout(saveTimer)
      saveTimer = null
    }
    if (!dirty || persist.value.writesBlocked) return
    try {
      sink.write(WORKSPACE_KEY, serializeWorkspace(ws.value))
      dirty = false
      persist.value.status = 'saved'
      persist.value.lastSavedAt = Date.now()
      persist.value.error = null
    } catch (e) {
      // Stay dirty: the next change or flush retries the write.
      persist.value.status = 'failed'
      persist.value.error = describeWriteError(e)
    }
  }

  // Mark the workspace dirty and write it ~400ms after the last change.
  const scheduleSave = () => {
    if (import.meta.server) return
    dirty = true
    if (persist.value.writesBlocked) return
    // A failure stays visible until a write actually succeeds.
    if (persist.value.status !== 'failed') persist.value.status = 'saving'
    if (saveTimer) clearTimeout(saveTimer)
    saveTimer = setTimeout(flushSave, SAVE_DEBOUNCE_MS)
  }

  // Copy unreadable saved data aside, reusing an identical existing backup.
  const backupRaw = (raw: string): string => {
    const existing = sink.keys().find(k => k.startsWith(BACKUP_KEY_PREFIX) && sink.read(k) === raw)
    if (existing) return existing
    const key = BACKUP_KEY_PREFIX + new Date().toISOString()
    sink.write(key, raw)
    return key
  }

  /** Load from storage on the client. Never writes over saved data it could not read and back up. */
  const initWorkspace = () => {
    if (import.meta.server || initialized.value) return
    initialized.value = true

    let raw: string | null = null
    let readable = true
    try {
      raw = sink.read(WORKSPACE_KEY)
    } catch (e) {
      readable = false
      persist.value.status = 'failed'
      persist.value.writesBlocked = true
      persist.value.error = `Browser storage is unavailable (${(e as Error)?.name || 'read failed'}). Nothing will be saved this session.`
    }

    if (readable && raw === null) {
      // First run: one empty prompt on the prompt skeleton, nothing seeded.
      ws.value = makeWorkspace()
      dirty = true
      flushSave()
    } else if (readable && raw !== null) {
      try {
        const parsed = JSON.parse(raw)
        const fromVersion = parsed?.v
        ws.value = migrateWorkspace(parsed)
        if (fromVersion !== WORKSPACE_VERSION) {
          // Keep the pre-migration original (best effort), then persist the migrated shape.
          try {
            backupRaw(raw)
          } catch {
            /* migration succeeded; the migrated data is still written below */
          }
          scheduleSave()
        }
      } catch (e) {
        const reason = e instanceof SyntaxError ? 'not valid JSON' : (e as Error)?.message || 'unreadable'
        ws.value = makeWorkspace()
        try {
          persist.value.backupKey = backupRaw(raw)
          persist.value.backupReason = reason
        } catch (we) {
          // Could not copy it aside: never overwrite the original.
          persist.value.writesBlocked = true
          persist.value.status = 'failed'
          persist.value.error =
            `Saved workspace could not be loaded (${reason}) and could not be backed up: ${describeWriteError(we)} ` +
            'Saving is paused so the original data stays untouched.'
        }
      }
    }

    // Any change to the workspace schedules a write.
    if (!watchScope) {
      watchScope = effectScope(true)
      watchScope.run(() => watch(ws, scheduleSave, { deep: true }))
    }
  }

  // ── small helpers ────────────────────────────────────────────────────────

  const say = (text: string) => {
    notice.value = text
    if (noticeTimer) clearTimeout(noticeTimer)
    if (import.meta.client) noticeTimer = setTimeout(() => { notice.value = '' }, NOTICE_MS)
  }

  /** Record what a destructive action takes away, then apply it. */
  const destroy = (label: string, record: UndoRecord, next: Workspace) => {
    history.value = remember(history.value, label, record)
    ws.value = next
    say(label + ': Alt+Z undoes it')
  }

  const edit = (fn: (doc: Doc) => Doc) => {
    ws.value = editCurrent(ws.value, fn)
  }

  const indexOf = (id: string) => current.value.sections.findIndex(s => s.id === id)

  // ── messages ─────────────────────────────────────────────────────────────

  const startMessage = (kind: DocKind) => {
    ws.value = newMessage(ws.value, kind)
    focusRequest.value = current.value.sections[0]?.id ?? null
    say(kind === 'reply' ? 'New reply' : 'New prompt')
  }

  const setCurrent = (id: string) => {
    if (findDoc(ws.value.conversation, id)) ws.value = { ...ws.value, currentId: id }
  }

  const deleteMessage = (id: string) => {
    const index = ws.value.conversation.findIndex(d => d.id === id)
    const doc = ws.value.conversation[index]
    if (!doc || ws.value.conversation.length <= 1) return
    destroy('Removed ' + doc.kind, { kind: 'message', index, doc }, removeMessage(ws.value, id))
  }

  // ── sections of the current message ─────────────────────────────────────

  const patch = (id: string, fields: Partial<Omit<Section, 'id'>>) => edit(doc => updateSection(doc, id, fields))

  const add = (section: Section) => {
    edit(doc => addSection(doc, section))
    focusRequest.value = section.id
  }

  /**
   * A chip add. The chip is one of the six meanings and sets type and colour (DZ-51, DZ-57).
   * A chip alone adds the skeleton-titled section (the reply's title in a reply, when it has
   * one of that meaning); a typed name plus a chip adds a custom-titled section of that meaning.
   */
  const addByChip = (type: SectionType, name = '') => add(makeSection(name.trim() || chipTitle(type, current.value.kind), type))

  /** Give a section a type, change it, or clear it (null = untyped); the title stays. */
  const setType = (id: string, type: SectionType | null) => {
    if (type === null || isSectionType(type)) patch(id, { type })
  }

  /** A typed-name add with no chip: the section is untyped (no type, no hue) until one is chosen. */
  const addByName = (name: string) => {
    const title = name.trim()
    if (title) add(makeSection(title))
  }

  const remove = (id: string) => {
    const index = indexOf(id)
    const section = current.value.sections[index]
    if (!section) return
    const docId = current.value.id
    const neighbour = current.value.sections[index + 1] ?? current.value.sections[index - 1]
    destroy('Removed ' + (section.title || 'section'), { kind: 'section', docId, index, section },
      editCurrent(ws.value, doc => removeSection(doc, id)))
    if (focusedId.value === id) focusRequest.value = neighbour?.id ?? null
  }

  const move = (id: string, dir: -1 | 1) => edit(doc => moveSection(doc, id, dir))

  const merge = (id: string) => {
    const index = indexOf(id)
    const upper = current.value.sections[index]
    const lower = current.value.sections[index + 1]
    if (!upper || !lower) return
    destroy('Merged ' + (lower.title || 'section') + ' into ' + (upper.title || 'section'),
      { kind: 'merge', docId: current.value.id, index, upper, lower },
      editCurrent(ws.value, doc => mergeDown(doc, id)))
    focusRequest.value = id
  }

  const toggleFold = (id: string) => {
    const s = current.value.sections.find(x => x.id === id)
    if (s) patch(id, { folded: !s.folded })
  }

  const toggleInclude = (id: string) => {
    const s = current.value.sections.find(x => x.id === id)
    if (s) patch(id, { included: !s.included })
  }

  // ── reuse: library and other messages (independent copies) ───────────────

  const keepInLibrary = (id: string) => {
    const s = current.value.sections.find(x => x.id === id)
    if (!s) return
    ws.value = { ...ws.value, library: saveToLibrary(ws.value.library, s) }
    say('Saved ' + (s.title || 'section') + ' to the library')
  }

  const insertFromLibrary = (itemId: string) => {
    const item = ws.value.library.find(l => l.id === itemId)
    if (!item) return
    const { workspace, section } = insertCopy(ws.value, item.section)
    ws.value = workspace
    focusRequest.value = section.id
  }

  const insertFromMessage = (docId: string, sectionId: string) => {
    const source = findSection(ws.value.conversation, docId, sectionId)
    if (!source) return
    const { workspace, section } = insertCopy(ws.value, source)
    ws.value = workspace
    focusRequest.value = section.id
  }

  const deleteLibraryItem = (itemId: string) => {
    const index = ws.value.library.findIndex(l => l.id === itemId)
    const item = ws.value.library[index]
    if (!item) return
    destroy('Removed ' + (item.section.title || 'section') + ' from the library', { kind: 'library', index, item },
      { ...ws.value, library: removeFromLibrary(ws.value.library, itemId) })
  }

  // ── undo ─────────────────────────────────────────────────────────────────

  const canUndo = computed(() => history.value.past.length > 0)
  const nextUndo = computed(() => undoLabel(history.value))

  const undo = () => {
    // The record itself is what redo would keep; this store offers undo only.
    const record = history.value.past[history.value.past.length - 1]?.state
    const step = record ? undoStep(history.value, record) : null
    if (!step) {
      say('Nothing to undo')
      return
    }
    history.value = step.history
    ws.value = restore(ws.value, step.state)
    say('Undone: ' + step.label)
    if (step.state.kind === 'section') focusRequest.value = step.state.section.id
    if (step.state.kind === 'merge') focusRequest.value = step.state.upper.id
  }

  // ── copy: the one primary action ─────────────────────────────────────────

  /** The current message as XML on the clipboard. The XML is never shown. */
  const copy = async (): Promise<boolean> => {
    const xml = docToXml(current.value)
    if (!xml) {
      say('Nothing to copy: every section is empty or left out')
      return false
    }
    try {
      await navigator.clipboard.writeText(xml)
    } catch {
      // Fallback for contexts without the async clipboard: an off-screen, read-only field.
      const field = document.createElement('textarea')
      field.value = xml
      field.setAttribute('readonly', '')
      field.setAttribute('aria-hidden', 'true')
      field.style.position = 'fixed'
      field.style.left = '-9999px'
      document.body.appendChild(field)
      field.select()
      const ok = document.execCommand('copy')
      field.remove()
      if (!ok) {
        say('Copy failed: the clipboard is not available')
        return false
      }
    }
    say('Copied')
    return true
  }

  return {
    ws,
    current,
    persist,
    focusedId,
    focusRequest,
    notice,
    initWorkspace,
    flushSave,
    // messages
    startMessage,
    setCurrent,
    deleteMessage,
    // sections
    patch,
    addByChip,
    addByName,
    setType,
    remove,
    move,
    merge,
    toggleFold,
    toggleInclude,
    // reuse
    keepInLibrary,
    insertFromLibrary,
    insertFromMessage,
    deleteLibraryItem,
    // undo, copy
    canUndo,
    nextUndo,
    undo,
    copy
  }
}
