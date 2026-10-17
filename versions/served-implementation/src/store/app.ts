import { defineStore } from 'pinia'
import { computed, ref, watch } from 'vue'
import type { Card, CardLane, Doc, DocKind, LibraryItem, Section, SectionType } from '../model/types'
import { cloneSection, newDoc, newSection, uid } from '../model/types'
import { parseBody } from '../model/points'
import { serializeDoc } from '../model/serialize'
import { copyText, loadState, saveState } from '../lib/platform'

const THEMES = ['system', 'light', 'dark', 'paper'] as const
export type Theme = (typeof THEMES)[number]

interface Snapshot {
  label: string
  conversation: Doc[]
  currentId: string
  library: LibraryItem[]
  cards: Card[]
}

const deep = <T>(v: T): T => JSON.parse(JSON.stringify(v))

export const useApp = defineStore('app', () => {
  const conversation = ref<Doc[]>([newDoc('prompt')])
  const currentId = ref(conversation.value[0].id)
  const library = ref<LibraryItem[]>([])
  const cards = ref<Card[]>([])
  const theme = ref<Theme>('system')
  const vim = ref(false)
  const focusedSection = ref<string | null>(null)
  const showLibrary = ref(true)
  const showKanban = ref(true)
  const undoStack = ref<Snapshot[]>([])

  const current = computed(() => conversation.value.find((d) => d.id === currentId.value) ?? conversation.value[0])

  const snapshot = (label: string): Snapshot => ({
    label,
    conversation: deep(conversation.value),
    currentId: currentId.value,
    library: deep(library.value),
    cards: deep(cards.value),
  })
  /** Call before anything destructive. Undo restores this exact state. */
  const remember = (label: string) => {
    undoStack.value.push(snapshot(label))
    if (undoStack.value.length > 50) undoStack.value.shift()
  }
  const undo = (): string | null => {
    const s = undoStack.value.pop()
    if (!s) return null
    conversation.value = s.conversation
    currentId.value = s.currentId
    library.value = s.library
    cards.value = s.cards
    return s.label
  }

  // Documents
  const newMessage = (kind: DocKind) => {
    const d = newDoc(kind)
    conversation.value.push(d)
    currentId.value = d.id
    focusedSection.value = d.sections[0]?.id ?? null
  }
  const select = (id: string) => {
    currentId.value = id
  }
  const removeMessage = (id: string) => {
    if (conversation.value.length <= 1) return
    remember('Delete message')
    conversation.value = conversation.value.filter((d) => d.id !== id)
    if (currentId.value === id) currentId.value = conversation.value[conversation.value.length - 1].id
  }

  // Sections
  const sectionOf = (id: string) => current.value.sections.find((s) => s.id === id)
  const addSection = (title: string, type: SectionType, body = '', at?: number) => {
    const s = newSection(title, type, body)
    const list = current.value.sections
    list.splice(at ?? list.length, 0, s)
    focusedSection.value = s.id
    return s
  }
  const insertCopy = (s: Section, at?: number) => {
    const c = cloneSection(s)
    const list = current.value.sections
    list.splice(at ?? list.length, 0, c)
    focusedSection.value = c.id
    return c
  }
  const removeSection = (id: string) => {
    remember('Delete section')
    current.value.sections = current.value.sections.filter((s) => s.id !== id)
    if (focusedSection.value === id) focusedSection.value = null
  }
  const moveSection = (id: string, dir: -1 | 1) => {
    const list = current.value.sections
    const i = list.findIndex((s) => s.id === id)
    const j = i + dir
    if (i < 0 || j < 0 || j >= list.length) return
    const a = list[i]
    list[i] = list[j]
    list[j] = a
  }
  /** Merge the section below into this one. */
  const mergeDown = (id: string) => {
    const list = current.value.sections
    const i = list.findIndex((s) => s.id === id)
    if (i < 0 || i + 1 >= list.length) return
    remember('Merge sections')
    const a = list[i]
    const b = list[i + 1]
    a.body = [a.body.trimEnd(), b.body.trimStart()].filter(Boolean).join('\n')
    list.splice(i + 1, 1)
  }
  const clearSection = (id: string) => {
    const s = sectionOf(id)
    if (!s || !s.body) return
    remember('Clear section')
    s.body = ''
  }

  // Library
  const saveToLibrary = (s: Section) => {
    library.value.unshift({ id: uid(), section: cloneSection(s), savedAt: Date.now() })
  }
  const removeFromLibrary = (id: string) => {
    remember('Remove from library')
    library.value = library.value.filter((l) => l.id !== id)
  }

  // Kanban
  const addCard = (title: string, type: SectionType = 'todo', lane: CardLane = 'todo', fromDoc?: string) => {
    cards.value.push({ id: uid(), title, type, lane, checks: [], fromDoc })
  }
  const removeCard = (id: string) => {
    remember('Delete card')
    cards.value = cards.value.filter((c) => c.id !== id)
  }
  const moveCard = (id: string, lane: CardLane) => {
    const c = cards.value.find((x) => x.id === id)
    if (c) c.lane = lane
  }
  const addCheck = (cardId: string, text: string) => {
    const c = cards.value.find((x) => x.id === cardId)
    if (c && text.trim()) c.checks.push({ id: uid(), text, done: false })
  }
  /** Proposed Edits from a reply land on the board as cards. */
  const landEdits = (doc: Doc) => {
    if (doc.kind !== 'reply') return 0
    const edits = doc.sections.find((s) => s.title.trim().toLowerCase() === 'proposed edits')
    if (!edits) return 0
    const { points } = parseBody(edits.body)
    let n = 0
    for (const p of points) {
      const title = p.quote !== undefined ? [p.quote, ...p.lines].join(' ') : p.lines.join(' ')
      if (!title.trim()) continue
      if (cards.value.some((c) => c.fromDoc === doc.id && c.title === title)) continue
      addCard(title, 'todo', 'todo', doc.id)
      n++
    }
    return n
  }

  // Output
  const output = computed(() => serializeDoc(current.value))
  const copy = async () => {
    await copyText(output.value)
    return landEdits(current.value)
  }

  // Theme / Vim
  const systemDark = window.matchMedia('(prefers-color-scheme: dark)')
  const applyTheme = () => {
    const root = document.documentElement
    const meta = document.querySelector<HTMLMetaElement>('meta[name="color-scheme"]')
    const dark = theme.value === 'dark' || (theme.value === 'system' && systemDark.matches)
    if (theme.value === 'system') {
      root.removeAttribute('data-theme')
      if (meta) meta.content = 'light dark'
    } else {
      root.setAttribute('data-theme', theme.value)
      if (meta) meta.content = dark ? 'dark' : 'light'
    }
    // Nuxt UI keys its dark variants off this class.
    root.classList.toggle('dark', dark)
  }
  systemDark.addEventListener('change', applyTheme)
  const cycleTheme = () => {
    theme.value = THEMES[(THEMES.indexOf(theme.value) + 1) % THEMES.length]
    applyTheme()
  }
  const toggleVim = () => {
    vim.value = !vim.value
  }

  // Persistence
  let ready = false
  const load = async () => {
    const raw = await loadState()
    if (raw) {
      try {
        const s = JSON.parse(raw)
        if (Array.isArray(s.conversation) && s.conversation.length) conversation.value = s.conversation
        currentId.value = s.currentId ?? conversation.value[0].id
        if (!conversation.value.some((d) => d.id === currentId.value)) currentId.value = conversation.value[0].id
        library.value = s.library ?? []
        cards.value = s.cards ?? []
        theme.value = THEMES.includes(s.theme) ? s.theme : 'system'
        vim.value = !!s.vim
        showLibrary.value = s.showLibrary ?? true
        showKanban.value = s.showKanban ?? true
      } catch (e) {
        console.warn('state unreadable', e)
      }
    }
    applyTheme()
    ready = true
  }
  let timer: number | undefined
  watch(
    () => [conversation.value, currentId.value, library.value, cards.value, theme.value, vim.value, showLibrary.value, showKanban.value],
    () => {
      if (!ready) return
      clearTimeout(timer)
      timer = window.setTimeout(() => {
        saveState(
          JSON.stringify({
            conversation: conversation.value,
            currentId: currentId.value,
            library: library.value,
            cards: cards.value,
            theme: theme.value,
            vim: vim.value,
            showLibrary: showLibrary.value,
            showKanban: showKanban.value,
          }),
        )
      }, 300)
    },
    { deep: true },
  )

  return {
    conversation, currentId, current, library, cards, theme, vim, focusedSection, showLibrary, showKanban,
    undoStack, remember, undo,
    newMessage, select, removeMessage,
    sectionOf, addSection, insertCopy, removeSection, moveSection, mergeDown, clearSection,
    saveToLibrary, removeFromLibrary,
    addCard, removeCard, moveCard, addCheck, landEdits,
    output, copy, cycleTheme, toggleVim, load,
  }
})
