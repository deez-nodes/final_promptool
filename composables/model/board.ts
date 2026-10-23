// The edits board: a Trello-style Kanban of cards in bordered columns. Pure: every function
// returns a new Board and leaves its input alone. No Vue, no I/O.
// Implements DECIDED.md Layout "Right pane: a Trello-style Kanban with bordered columns, cards
// coloured by meaning, and checkboxes inside. Edits from your replies land there as cards.",
// "Undo on every destructive action" (removals return what they took, and a restore puts it
// back), and "Words and tools" (work items are called edits).
//
// Edits from replies: every point of a reply's "Proposed Edits" section (read through
// points.ts) is one card, keyed by the message id and the point number, so reading the
// conversation again never makes a second card for the same point. A card removed by hand is
// remembered as dismissed, so it does not come back on the next read; undo forgets that.

import { isEmptyPoint, pad, parseBody } from './points'
import { isSectionType } from './skeletons'
import { makeId, type Doc, type Point, type SectionType } from './types'
import { tagOf } from './xml'

export interface CheckItem {
  id: string
  text: string
  done: boolean
}

/** One edit on the board. */
export interface EditCard {
  id: string
  /** `<docId>#<point>` for a card made from a reply's Proposed Edits point; null for one added by hand. */
  key: string | null
  text: string
  /** The meaning of the section it came from; sets the card's colour. null = neutral. */
  type: SectionType | null
  column: string
  checklist: CheckItem[]
  /** True once the text was changed on the board: the reply no longer rewrites it. */
  edited: boolean
}

export interface BoardColumn {
  id: string
  title: string
}

export interface Board {
  columns: BoardColumn[]
  /** Every card, in board order; a column shows its cards in this order. */
  cards: EditCard[]
  /** Keys of reply cards removed by hand. */
  dismissed: string[]
}

export const DEFAULT_COLUMNS: readonly string[] = ['To do', 'Doing', 'Done']

export const makeBoard = (): Board => ({
  columns: DEFAULT_COLUMNS.map((title) => ({ id: makeId(), title })),
  cards: [],
  dismissed: [],
})

// ---- edits from replies ----------------------------------------------------------------

/** A Proposed Edits section, by its tag (custom-typed or renamed sections with that title count). */
export const isProposedEdits = (title: string): boolean => tagOf(title) === 'proposed_edits'

export const pointKey = (docId: string, n: number): string => docId + '#' + pad(n)

/** A point as card text: the quoted line first (as a quote), then its lines, verbatim. */
export const pointText = (p: Point): string =>
  [...(p.quote !== undefined ? ['> ' + p.quote] : []), ...p.lines].join('\n').trim()

export interface ProposedEdit {
  key: string
  docId: string
  n: number
  text: string
  type: SectionType | null
}

/** Every non-empty Proposed Edits point of every reply, oldest message first. */
export function proposedEdits(conversation: readonly Doc[]): ProposedEdit[] {
  const out: ProposedEdit[] = []
  for (const doc of conversation) {
    if (doc.kind !== 'reply') continue
    let n = 0
    for (const s of doc.sections) {
      if (!isProposedEdits(s.title)) continue
      for (const p of parseBody(s.body).points) {
        n += 1
        if (isEmptyPoint(p)) continue
        out.push({ key: pointKey(doc.id, n), docId: doc.id, n, text: pointText(p), type: s.type })
      }
    }
  }
  return out
}

/**
 * Bring the board in line with the conversation: a card for every new Proposed Edits point
 * (in the first column), and the text and colour of an unedited reply card kept current.
 * Returns the same board when nothing changed.
 */
export function syncBoard(board: Board, conversation: readonly Doc[]): Board {
  const first = board.columns[0]
  if (!first) return board
  const byKey = new Map(board.cards.filter((c) => c.key).map((c) => [c.key as string, c]))
  const dismissed = new Set(board.dismissed)
  let changed = false
  let cards = board.cards
  const added: EditCard[] = []
  for (const e of proposedEdits(conversation)) {
    const card = byKey.get(e.key)
    if (card) {
      if (card.type !== e.type || (!card.edited && card.text !== e.text)) {
        changed = true
        cards = cards.map((c) => (c.id === card.id ? { ...c, type: e.type, text: c.edited ? c.text : e.text } : c))
      }
    } else if (!dismissed.has(e.key)) {
      changed = true
      added.push({ id: makeId(), key: e.key, text: e.text, type: e.type, column: first.id, checklist: [], edited: false })
    }
  }
  return changed ? { ...board, cards: [...cards, ...added] } : board
}

// ---- cards -----------------------------------------------------------------------------

export const cardsIn = (board: Board, columnId: string): EditCard[] => board.cards.filter((c) => c.column === columnId)

/** A card added by hand, at the end of a column. */
export function addCard(board: Board, columnId: string, text: string, type: SectionType | null = null): { board: Board; card: EditCard } {
  const card: EditCard = { id: makeId(), key: null, text, type, column: columnId, checklist: [], edited: true }
  return { board: { ...board, cards: [...board.cards, card] }, card }
}

export function updateCard(board: Board, id: string, patch: Partial<Pick<EditCard, 'text' | 'type'>>): Board {
  return {
    ...board,
    cards: board.cards.map((c) => (c.id === id ? { ...c, ...patch, edited: c.edited || patch.text !== undefined } : c)),
  }
}

/** Move a card into a column, before another card (or to the column's end when `beforeId` is null). */
export function moveCard(board: Board, id: string, columnId: string, beforeId: string | null = null): Board {
  const card = board.cards.find((c) => c.id === id)
  if (!card || !board.columns.some((col) => col.id === columnId) || beforeId === id) return board
  const rest = board.cards.filter((c) => c.id !== id)
  const moved = { ...card, column: columnId }
  let at = beforeId ? rest.findIndex((c) => c.id === beforeId) : -1
  if (at < 0) {
    // After the last card of that column, or at the very end.
    let last = -1
    rest.forEach((c, i) => {
      if (c.column === columnId) last = i
    })
    at = last < 0 ? rest.length : last + 1
  }
  rest.splice(at, 0, moved)
  return { ...board, cards: rest }
}

/** Move a card one step: dx across columns, dy within its column. */
export function stepCard(board: Board, id: string, dx: -1 | 0 | 1, dy: -1 | 0 | 1): Board {
  const card = board.cards.find((c) => c.id === id)
  if (!card) return board
  if (dx) {
    const i = board.columns.findIndex((col) => col.id === card.column)
    const target = board.columns[i + dx]
    return target ? moveCard(board, id, target.id) : board
  }
  const list = cardsIn(board, card.column)
  const i = list.findIndex((c) => c.id === id)
  const above = list[i - 1]
  if (dy < 0) return above ? moveCard(board, id, card.column, above.id) : board
  if (dy > 0) return i >= 0 && i < list.length - 1 ? moveCard(board, id, card.column, list[i + 2]?.id ?? null) : board
  return board
}

/** Destructive. Returns what it took, for undo. */
export function removeCard(board: Board, id: string): { board: Board; index: number; card: EditCard } | null {
  const index = board.cards.findIndex((c) => c.id === id)
  const card = board.cards[index]
  if (!card) return null
  const dismissed = card.key && !board.dismissed.includes(card.key) ? [...board.dismissed, card.key] : board.dismissed
  return { board: { ...board, cards: board.cards.filter((c) => c.id !== id), dismissed }, index, card }
}

/** Undo of removeCard. A card whose column is gone goes to the first column. */
export function restoreCard(board: Board, index: number, card: EditCard): Board {
  if (board.cards.some((c) => c.id === card.id)) return board
  const column = board.columns.some((col) => col.id === card.column) ? card.column : board.columns[0]?.id ?? card.column
  const cards = [...board.cards]
  cards.splice(Math.max(0, Math.min(index, cards.length)), 0, { ...card, column })
  return { ...board, cards, dismissed: board.dismissed.filter((k) => k !== card.key) }
}

// ---- checklists ------------------------------------------------------------------------

const withCard = (board: Board, id: string, fn: (c: EditCard) => EditCard): Board => ({
  ...board,
  cards: board.cards.map((c) => (c.id === id ? fn(c) : c)),
})

export const addCheck = (board: Board, cardId: string, text: string): Board =>
  withCard(board, cardId, (c) => ({ ...c, checklist: [...c.checklist, { id: makeId(), text, done: false }] }))

export const toggleCheck = (board: Board, cardId: string, checkId: string): Board =>
  withCard(board, cardId, (c) => ({ ...c, checklist: c.checklist.map((k) => (k.id === checkId ? { ...k, done: !k.done } : k)) }))

export const renameCheck = (board: Board, cardId: string, checkId: string, text: string): Board =>
  withCard(board, cardId, (c) => ({ ...c, checklist: c.checklist.map((k) => (k.id === checkId ? { ...k, text } : k)) }))

/** Destructive. */
export function removeCheck(board: Board, cardId: string, checkId: string): { board: Board; index: number; item: CheckItem } | null {
  const card = board.cards.find((c) => c.id === cardId)
  const index = card ? card.checklist.findIndex((k) => k.id === checkId) : -1
  const item = card?.checklist[index]
  if (!card || !item) return null
  return { board: withCard(board, cardId, (c) => ({ ...c, checklist: c.checklist.filter((k) => k.id !== checkId) })), index, item }
}

export function restoreCheck(board: Board, cardId: string, index: number, item: CheckItem): Board {
  return withCard(board, cardId, (c) => {
    if (c.checklist.some((k) => k.id === item.id)) return c
    const checklist = [...c.checklist]
    checklist.splice(Math.max(0, Math.min(index, checklist.length)), 0, item)
    return { ...c, checklist }
  })
}

// ---- columns ---------------------------------------------------------------------------

export function addColumn(board: Board, title: string): { board: Board; column: BoardColumn } {
  const column = { id: makeId(), title: title.trim() || 'New column' }
  return { board: { ...board, columns: [...board.columns, column] }, column }
}

export const renameColumn = (board: Board, id: string, title: string): Board => ({
  ...board,
  columns: board.columns.map((c) => (c.id === id ? { ...c, title } : c)),
})

export function moveColumn(board: Board, id: string, dir: -1 | 1): Board {
  const i = board.columns.findIndex((c) => c.id === id)
  const j = i + dir
  if (i < 0 || j < 0 || j >= board.columns.length) return board
  const columns = [...board.columns]
  const [col] = columns.splice(i, 1)
  if (col) columns.splice(j, 0, col)
  return { ...board, columns }
}

/** Destructive: the column and its cards. The last column stays. */
export function removeColumn(
  board: Board,
  id: string,
): { board: Board; index: number; column: BoardColumn; cards: { index: number; card: EditCard }[] } | null {
  const index = board.columns.findIndex((c) => c.id === id)
  const column = board.columns[index]
  if (!column || board.columns.length <= 1) return null
  const cards = board.cards.map((card, i) => ({ index: i, card })).filter((x) => x.card.column === id)
  const keys = cards.map((x) => x.card.key).filter((k): k is string => !!k && !board.dismissed.includes(k))
  return {
    board: {
      columns: board.columns.filter((c) => c.id !== id),
      cards: board.cards.filter((c) => c.column !== id),
      dismissed: [...board.dismissed, ...keys],
    },
    index,
    column,
    cards,
  }
}

export function restoreColumn(board: Board, index: number, column: BoardColumn, cards: readonly { index: number; card: EditCard }[]): Board {
  if (board.columns.some((c) => c.id === column.id)) return board
  const columns = [...board.columns]
  columns.splice(Math.max(0, Math.min(index, columns.length)), 0, column)
  let next: Board = { ...board, columns }
  for (const x of cards) next = restoreCard(next, x.index, x.card)
  return next
}

// ---- read ------------------------------------------------------------------------------

const isObj = (v: unknown): v is Record<string, unknown> => typeof v === 'object' && v !== null
const str = (v: unknown, d = ''): string => (typeof v === 'string' ? v : d)

/** A Board from untrusted JSON; anything unreadable gives a fresh board with the default columns. */
export function readBoard(v: unknown): Board {
  if (!isObj(v) || !Array.isArray(v.columns)) return makeBoard()
  const columns = v.columns
    .filter(isObj)
    .map((c) => ({ id: str(c.id) || makeId(), title: str(c.title, 'Column') }))
  if (!columns.length) return makeBoard()
  const ids = new Set(columns.map((c) => c.id))
  const firstId = columns[0]?.id ?? ''
  const cards: EditCard[] = (Array.isArray(v.cards) ? v.cards : []).filter(isObj).map((c) => ({
    id: str(c.id) || makeId(),
    key: typeof c.key === 'string' ? c.key : null,
    text: str(c.text),
    type: isSectionType(c.type) ? c.type : null,
    column: ids.has(str(c.column)) ? str(c.column) : firstId,
    checklist: (Array.isArray(c.checklist) ? c.checklist : [])
      .filter(isObj)
      .map((k) => ({ id: str(k.id) || makeId(), text: str(k.text), done: k.done === true })),
    edited: c.edited === true,
  }))
  const dismissed = Array.isArray(v.dismissed) ? v.dismissed.filter((k): k is string => typeof k === 'string') : []
  return { columns, cards, dismissed }
}
