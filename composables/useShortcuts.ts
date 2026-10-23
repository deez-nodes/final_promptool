/**
 * Keyboard first (DECIDED.md Layout "Keyboard first"): every action in the action bar and on
 * a section card has a key. SHORTCUTS is the one list; the `?` overlay and the button
 * tooltips read it. F3 (Vim) is bound by useVim().bindHotkey().
 *
 * Bindings run from one window keydown listener and skip events an editor already handled
 * (defaultPrevented), so CodeMirror keeps its own keys. Letters match on `event.code`, so
 * Alt+letter works on layouts where Alt types a character.
 */
import { onBeforeUnmount, onMounted } from 'vue'

export interface Shortcut {
  id: ShortcutId
  keys: string
  label: string
  group: 'Message' | 'Section' | 'App'
}

export type ShortcutId =
  | 'copy' | 'newPrompt' | 'newReply' | 'undo' | 'vim' | 'theme' | 'help'
  | 'add' | 'next' | 'prev' | 'up' | 'down' | 'merge' | 'remove' | 'fold' | 'include' | 'library'

export const SHORTCUTS: readonly Shortcut[] = [
  { id: 'copy', keys: 'Ctrl+Enter', label: 'Copy the message (XML, to the clipboard)', group: 'Message' },
  { id: 'newPrompt', keys: 'Alt+N', label: 'New prompt', group: 'Message' },
  { id: 'newReply', keys: 'Alt+R', label: 'New reply', group: 'Message' },
  { id: 'undo', keys: 'Alt+Z', label: 'Undo the last removal or merge (Ctrl+Z outside a text field)', group: 'Message' },
  { id: 'add', keys: 'Alt+A', label: 'Add a section: type a name, then Enter or a meaning chip', group: 'Section' },
  { id: 'next', keys: 'Alt+J', label: 'Next section', group: 'Section' },
  { id: 'prev', keys: 'Alt+K', label: 'Previous section', group: 'Section' },
  { id: 'up', keys: 'Ctrl+Shift+↑', label: 'Move section up', group: 'Section' },
  { id: 'down', keys: 'Ctrl+Shift+↓', label: 'Move section down', group: 'Section' },
  { id: 'merge', keys: 'Alt+M', label: 'Merge the section below into this one', group: 'Section' },
  { id: 'remove', keys: 'Ctrl+Shift+Backspace', label: 'Remove section', group: 'Section' },
  { id: 'fold', keys: 'Alt+.', label: 'Fold or unfold section', group: 'Section' },
  { id: 'include', keys: 'Alt+I', label: 'Include or leave out of the copy', group: 'Section' },
  { id: 'library', keys: 'Alt+S', label: 'Save section to the library', group: 'Section' },
  { id: 'vim', keys: 'F3', label: 'Vim keys on or off', group: 'App' },
  { id: 'theme', keys: 'Alt+T', label: 'Next theme', group: 'App' },
  { id: 'help', keys: '?', label: 'This list (F1 anywhere)', group: 'App' }
]

export const keysOf = (id: ShortcutId): string => SHORTCUTS.find(s => s.id === id)?.keys ?? ''

const ALT_CODES: Partial<Record<string, ShortcutId>> = {
  KeyN: 'newPrompt',
  KeyR: 'newReply',
  KeyZ: 'undo',
  KeyT: 'theme',
  KeyA: 'add',
  KeyJ: 'next',
  KeyK: 'prev',
  KeyM: 'merge',
  Period: 'fold',
  KeyI: 'include',
  KeyS: 'library'
}

const isTextEntry = (el: EventTarget | null): boolean => {
  const node = el as HTMLElement | null
  if (!node || !node.tagName) return false
  return node.isContentEditable || node.tagName === 'INPUT' || node.tagName === 'TEXTAREA' || node.tagName === 'SELECT'
}

/** Which shortcut a keydown is, or null. */
export function matchShortcut(e: KeyboardEvent): ShortcutId | null {
  const mod = e.ctrlKey || e.metaKey
  if (mod && !e.altKey && !e.shiftKey && e.key === 'Enter') return 'copy'
  if (e.altKey && !mod && !e.shiftKey) return ALT_CODES[e.code] ?? null
  if (mod && e.shiftKey && !e.altKey) {
    if (e.key === 'ArrowUp') return 'up'
    if (e.key === 'ArrowDown') return 'down'
    if (e.key === 'Backspace') return 'remove'
  }
  if (mod && !e.shiftKey && !e.altKey && e.code === 'KeyZ' && !isTextEntry(e.target)) return 'undo'
  if (e.key === 'F1' && !mod && !e.altKey) return 'help'
  if (e.key === '?' && !mod && !e.altKey && !isTextEntry(e.target)) return 'help'
  return null
}

export function useShortcuts() {
  const open = useState<boolean>('promptor_keys_open', () => false)
  return { open, shortcuts: SHORTCUTS }
}

/** Bind every shortcut once, from the action bar's setup. */
export function bindShortcuts() {
  const store = useWorkspace()
  const { cycleTheme } = useTheme()
  const { open } = useShortcuts()

  const sectionIds = () => store.current.value.sections.map(s => s.id)
  const focusedSection = () => {
    const id = store.focusedId.value
    return id && sectionIds().includes(id) ? id : null
  }
  const step = (dir: -1 | 1) => {
    const ids = sectionIds()
    if (!ids.length) return
    const i = ids.indexOf(focusedSection() ?? '')
    const j = i < 0 ? (dir > 0 ? 0 : ids.length - 1) : Math.max(0, Math.min(ids.length - 1, i + dir))
    store.focusRequest.value = ids[j]
  }

  const run = (id: ShortcutId) => {
    const section = focusedSection()
    switch (id) {
      case 'copy': void store.copy(); return true
      case 'newPrompt': store.startMessage('prompt'); return true
      case 'newReply': store.startMessage('reply'); return true
      case 'undo': store.undo(); return true
      case 'theme': cycleTheme(); return true
      case 'help': open.value = !open.value; return true
      case 'add': document.getElementById('add-section-name')?.focus(); return true
      case 'next': step(1); return true
      case 'prev': step(-1); return true
      case 'vim': return false
    }
    if (!section) return false
    switch (id) {
      case 'up': store.move(section, -1); store.focusRequest.value = section; return true
      case 'down': store.move(section, 1); store.focusRequest.value = section; return true
      case 'merge': store.merge(section); return true
      case 'remove': store.remove(section); return true
      case 'fold': store.toggleFold(section); return true
      case 'include': store.toggleInclude(section); return true
      case 'library': store.keepInLibrary(section); return true
    }
    return false
  }

  const onKey = (e: KeyboardEvent) => {
    if (e.defaultPrevented || e.repeat) return
    const id = matchShortcut(e)
    if (id && run(id)) e.preventDefault()
  }

  onMounted(() => window.addEventListener('keydown', onKey))
  onBeforeUnmount(() => window.removeEventListener('keydown', onKey))
}
