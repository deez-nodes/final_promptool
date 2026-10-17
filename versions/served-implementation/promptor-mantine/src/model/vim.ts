import { cursor, lineEnd, lineStart, type Edit } from './edit'

export type VimMode = 'insert' | 'normal' | 'visual'

interface Snapshot {
  value: string
  pos: number
}

export interface Vim {
  mode: VimMode
  /** Operator (d / c / y) waiting for its motion. */
  pending: string
  register: string
  /** Fixed end of the visual selection. */
  anchor: number
  lastAction: string
  /** Time of an unpaired `g`, for `gg`. */
  lastG: number
  undo: Snapshot[]
  redo: Snapshot[]
}

export const createVim = (): Vim => ({ mode: 'insert', pending: '', register: '', anchor: 0, lastAction: '', lastG: 0, undo: [], redo: [] })

/** Key name the caller passes for Ctrl+R. */
export const REDO_KEY = '^r'

const UNDO_LIMIT = 100
const GG_WINDOW_MS = 400

const isWord = (c: string) => /\w/.test(c)
const isBlank = (c: string) => /\s/.test(c) && c !== '\n'
const isPunct = (c: string) => !/\w/.test(c) && !/\s/.test(c)

function wordForward(v: string, p: number) {
  const n = v.length
  while (p < n && isWord(v[p])) p++
  while (p < n && isBlank(v[p])) p++
  while (p < n && isPunct(v[p])) p++
  while (p < n && isBlank(v[p])) p++
  return p
}

function wordBack(v: string, p: number) {
  p--
  while (p > 0 && /\s/.test(v[p])) p--
  while (p > 0 && isWord(v[p - 1])) p--
  return Math.max(0, p)
}

function wordEnd(v: string, p: number) {
  const n = v.length
  p++
  while (p < n && /\s/.test(v[p])) p++
  while (p + 1 < n && isWord(v[p + 1])) p++
  return Math.min(n, p)
}

function firstNonBlank(v: string, p: number) {
  let s = lineStart(v, p)
  while (s < v.length && /[ \t]/.test(v[s])) s++
  return s
}

/**
 * Apply one key press. Returns the resulting text and selection, or null when
 * the key is left to the textarea (typing in insert mode). Mutates `vim`.
 */
export function vimKey(vim: Vim, key: string, edit: Edit, now = Date.now()): Edit | null {
  const { value: v, start, end } = edit

  const setMode = (mode: VimMode) => {
    vim.mode = mode
    vim.pending = ''
  }
  const remember = () => {
    vim.undo.push({ value: v, pos: start })
    if (vim.undo.length > UNDO_LIMIT) vim.undo.shift()
    vim.redo = []
  }

  if (vim.mode === 'insert') {
    if (key !== 'Escape') return null
    remember()
    setMode('normal')
    vim.lastAction = '→normal'
    return edit
  }

  const visual = vim.mode === 'visual'
  // The moving end of the selection; in normal mode, the cursor.
  const p = visual && start === vim.anchor ? end : start

  const move = (to: number): Edit => {
    if (!visual) return cursor(v, to)
    const head = Math.max(0, Math.min(v.length, to))
    return { value: v, start: Math.min(head, vim.anchor), end: Math.max(head, vim.anchor) }
  }
  const replace = (value: string, pos: number): Edit => {
    remember()
    return cursor(value, pos)
  }
  const remove = (a: number, b: number, thenInsert: boolean): Edit => {
    vim.register = v.slice(a, b)
    setMode(thenInsert ? 'insert' : 'normal')
    return replace(v.slice(0, a) + v.slice(b), a)
  }

  if (vim.pending) {
    const op = vim.pending
    vim.pending = ''
    let a = p
    let b = p
    if (key === op) {
      a = lineStart(v, p)
      b = Math.min(v.length, lineEnd(v, p) + 1)
    } else if (key === 'w') b = wordForward(v, p)
    else if (key === 'e') b = wordEnd(v, p) + 1
    else if (key === 'b') a = wordBack(v, p)
    else if (key === '$') b = lineEnd(v, p)
    else if (key === '0' || key === '^') a = lineStart(v, p)
    else return edit

    if (op === 'y') {
      vim.register = v.slice(a, b)
      vim.lastAction = 'yank'
      return edit
    }
    vim.lastAction = op === 'c' ? 'change' : 'delete'
    return remove(a, b, op === 'c')
  }

  switch (key) {
    case 'Escape':
      vim.lastAction = ''
      if (!visual) return edit
      setMode('normal')
      return cursor(v, p)

    // motions
    case 'h': return move(p > lineStart(v, p) ? p - 1 : p)
    case 'l': return move(p < lineEnd(v, p) ? p + 1 : p)
    case ' ': return move(p + 1)
    case 'j': {
      const le = lineEnd(v, p)
      if (le >= v.length) return edit
      return move(Math.min(le + 1 + (p - lineStart(v, p)), lineEnd(v, le + 1)))
    }
    case 'k': {
      const ls = lineStart(v, p)
      if (ls === 0) return edit
      const prev = lineStart(v, ls - 1)
      return move(Math.min(prev + (p - ls), ls - 1))
    }
    case 'w': return move(wordForward(v, p))
    case 'e': return move(wordEnd(v, p))
    case 'b': return move(wordBack(v, p))
    case '0': return move(lineStart(v, p))
    case '$': return move(lineEnd(v, p))
    case '^': return move(firstNonBlank(v, p))
    case 'G': return move(lineStart(v, v.length))
    case 'g': {
      const paired = now - vim.lastG < GG_WINDOW_MS
      vim.lastG = paired ? 0 : now
      return paired ? move(0) : edit
    }

    // edits
    case 'x':
      vim.lastAction = 'x'
      return remove(p, Math.min(v.length, p + 1), false)
    case 'D':
      vim.lastAction = 'D'
      return remove(p, lineEnd(v, p), false)
    case 'C':
      vim.lastAction = 'C'
      return remove(p, lineEnd(v, p), true)
    case 'd':
    case 'c':
      if (!visual) {
        vim.pending = key
        return edit
      }
      vim.lastAction = key === 'c' ? 'change' : 'delete'
      return remove(start, end, key === 'c')
    case 'y':
      if (!visual) {
        vim.pending = key
        return edit
      }
      vim.register = v.slice(start, end)
      vim.lastAction = 'yank'
      setMode('normal')
      return cursor(v, start)
    case 'p': {
      const at = p < v.length ? p + 1 : p
      vim.lastAction = 'paste'
      return replace(v.slice(0, at) + vim.register + v.slice(at), at + vim.register.length - 1)
    }
    case 'P':
      vim.lastAction = 'paste'
      return replace(v.slice(0, p) + vim.register + v.slice(p), p + vim.register.length - 1)
    case 'u': {
      const last = vim.undo.pop()
      if (!last) return edit
      vim.redo.push({ value: v, pos: start })
      vim.lastAction = 'undo'
      return cursor(last.value, last.pos)
    }
    case REDO_KEY: {
      const next = vim.redo.pop()
      if (!next) return edit
      vim.undo.push({ value: v, pos: start })
      vim.lastAction = 'redo'
      return cursor(next.value, next.pos)
    }

    // mode changes
    case 'i':
      setMode('insert')
      return cursor(v, p)
    case 'I':
      setMode('insert')
      return cursor(v, firstNonBlank(v, p))
    case 'a':
      setMode('insert')
      return cursor(v, p + 1)
    case 'A':
      setMode('insert')
      return cursor(v, lineEnd(v, p))
    case 'o': {
      const le = lineEnd(v, p)
      setMode('insert')
      return replace(`${v.slice(0, le)}\n${v.slice(le)}`, le + 1)
    }
    case 'O': {
      const ls = lineStart(v, p)
      setMode('insert')
      return replace(`${v.slice(0, ls)}\n${v.slice(ls)}`, ls)
    }
    case 'v':
      vim.anchor = p
      setMode('visual')
      return { value: v, start: p, end: Math.min(v.length, p + 1) }

    default:
      return edit
  }
}

const HINTS: Record<VimMode | 'off', string> = {
  off: 'vim editing is off — flip the VIM switch to drill modal editing',
  insert: 'INSERT — type freely · Esc back to NORMAL · Enter still inserts a newline here',
  normal: 'NORMAL — move hjkl w e b 0 $ ^ gg G · edit x dd dw cc cw D C yy p u · i a o insert · v visual',
  visual: 'VISUAL — extend with motions · d delete · y yank · c change · Esc cancel',
}

export interface VimStatus {
  mode: VimMode | 'off'
  hint: string
}

export const VIM_OFF: VimStatus = { mode: 'off', hint: HINTS.off }

export function vimStatus(vim: Vim): VimStatus {
  if (vim.pending) {
    const op = vim.pending
    return { mode: vim.mode, hint: `${op} pending — motion? w e b $ 0 ^ or ${op}${op} for whole line` }
  }
  return { mode: vim.mode, hint: (vim.lastAction ? `${vim.lastAction} · ` : '') + HINTS[vim.mode] }
}
