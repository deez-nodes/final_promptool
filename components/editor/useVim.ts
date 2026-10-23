/**
 * Vim toggle for the section editors (DECIDED.md "Vim": a toggle button, off by default, on F3).
 *
 * One shared, reactive flag for the whole app. The layout mounts one button bound to
 * `enabled` / `toggle`, calls `bindHotkey()` once in its setup, and passes `enabled`
 * to every <EditorSectionEditor :vim="...">. Nothing is persisted.
 */
import { onBeforeUnmount, onMounted } from 'vue'
import { useState } from '#imports'

export const VIM_HOTKEY = 'F3'

export function useVim() {
  // useState, not a module-level ref: no state shared across SSR requests.
  const enabled = useState<boolean>('editor-vim-enabled', () => false)

  function toggle() {
    enabled.value = !enabled.value
  }

  function set(on: boolean) {
    enabled.value = on
  }

  /** F3 toggles Vim anywhere in the app. Call once, from a component's setup. */
  function bindHotkey() {
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== VIM_HOTKEY || event.repeat) return
      if (event.ctrlKey || event.metaKey || event.altKey || event.shiftKey) return
      event.preventDefault() // F3 is the browser's "find next"
      toggle()
    }
    onMounted(() => window.addEventListener('keydown', onKey))
    onBeforeUnmount(() => window.removeEventListener('keydown', onKey))
  }

  return { enabled, toggle, set, bindHotkey, hotkey: VIM_HOTKEY }
}
