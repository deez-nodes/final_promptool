// Pure edits on one message, and the serialize/parse pair the store persists with.
// Implements DECIDED.md "What it is" L7 (section is the unit), L17 (local only, no import
// or export: this file never touches storage, files or network; it only turns objects into
// a string and back); Layout L23 (add by chip or typed name, DZ-51), L24 (fold and include
// are separate, DZ-52), L27 (remove and merge controls).
// Ported from the section actions in versions/served-implementation/src/store/app.ts, made
// immutable: every function returns a new Doc and leaves its input alone. Destructive ones
// (remove, merge, clear) are marked; the caller records an undo snapshot first (see undo.ts).

import { isSectionType, makeDoc } from './skeletons'
import { makeId, type Doc, type DocKind, type LibraryItem, type Section, type Workspace } from './types'

const at = <T>(list: readonly T[], i: number | undefined, item: T): T[] => {
  const copy = [...list]
  copy.splice(i === undefined ? copy.length : Math.max(0, Math.min(i, copy.length)), 0, item)
  return copy
}

/** Put a section into a message at index `index` (end by default). The section is used as given. */
export const addSection = (doc: Doc, section: Section, index?: number): Doc => ({
  ...doc,
  sections: at(doc.sections, index, section),
})

/** Change fields of one section: title, type, body, included, folded. */
export const updateSection = (doc: Doc, id: string, patch: Partial<Omit<Section, 'id'>>): Doc => ({
  ...doc,
  sections: doc.sections.map((s) => (s.id === id ? { ...s, ...patch } : s)),
})

/** Destructive. */
export const removeSection = (doc: Doc, id: string): Doc => ({
  ...doc,
  sections: doc.sections.filter((s) => s.id !== id),
})

export function moveSection(doc: Doc, id: string, dir: -1 | 1): Doc {
  const i = doc.sections.findIndex((s) => s.id === id)
  const j = i + dir
  if (i < 0 || j < 0 || j >= doc.sections.length) return doc
  const sections = [...doc.sections]
  ;[sections[i], sections[j]] = [sections[j], sections[i]]
  return { ...doc, sections }
}

/** Destructive. Merge the section below into this one; its body follows on the next line. */
export function mergeDown(doc: Doc, id: string): Doc {
  const i = doc.sections.findIndex((s) => s.id === id)
  if (i < 0 || i + 1 >= doc.sections.length) return doc
  const a = doc.sections[i]
  const b = doc.sections[i + 1]
  const body = [a.body.replace(/\s+$/, ''), b.body.replace(/^\s*\n/, '')].filter((t) => t.trim()).join('\n')
  const sections = [...doc.sections]
  sections.splice(i, 2, { ...a, body })
  return { ...doc, sections }
}

/** Destructive. */
export const clearSection = (doc: Doc, id: string): Doc => updateSection(doc, id, { body: '' })

// ---- serialize / parse ---------------------------------------------------------------

const isObj = (v: unknown): v is Record<string, unknown> => typeof v === 'object' && v !== null
const str = (v: unknown, d = ''): string => (typeof v === 'string' ? v : d)

/** Read a section from untrusted JSON. Missing pieces are filled; a missing or unknown type reads as untyped. */
export function readSection(v: unknown): Section | null {
  if (!isObj(v)) return null
  const title = str(v.title, 'Section')
  return {
    id: str(v.id) || makeId(),
    title,
    type: isSectionType(v.type) ? v.type : null,
    body: str(v.body),
    included: v.included !== false,
    folded: v.folded === true,
  }
}

export function readDoc(v: unknown): Doc | null {
  if (!isObj(v) || !Array.isArray(v.sections)) return null
  const kind: DocKind = v.kind === 'reply' ? 'reply' : 'prompt'
  return {
    id: str(v.id) || makeId(),
    kind,
    createdAt: typeof v.createdAt === 'number' ? v.createdAt : Date.now(),
    sections: v.sections.map(readSection).filter((s): s is Section => s !== null),
  }
}

const readLibraryItem = (v: unknown): LibraryItem | null => {
  if (!isObj(v)) return null
  const section = readSection(v.section)
  if (!section) return null
  return { id: str(v.id) || makeId(), section, savedAt: typeof v.savedAt === 'number' ? v.savedAt : Date.now() }
}

export const serializeDoc = (doc: Doc): string => JSON.stringify(doc)

/** A Doc from `serializeDoc` output, or null when the text is not one. */
export function parseDoc(raw: string): Doc | null {
  try {
    return readDoc(JSON.parse(raw))
  } catch {
    return null
  }
}

/** A workspace with one empty prompt. */
export function makeWorkspace(): Workspace {
  const doc = makeDoc('prompt')
  return { conversation: [doc], currentId: doc.id, library: [] }
}

export const serializeWorkspace = (ws: Workspace): string => JSON.stringify({ v: 1, ...ws })

/** A Workspace from `serializeWorkspace` output. Unreadable text gives null; the caller keeps its state. */
export function parseWorkspace(raw: string): Workspace | null {
  let v: unknown
  try {
    v = JSON.parse(raw)
  } catch {
    return null
  }
  if (!isObj(v)) return null
  const conversation = Array.isArray(v.conversation) ? v.conversation.map(readDoc).filter((d): d is Doc => d !== null) : []
  if (!conversation.length) conversation.push(makeDoc('prompt'))
  const id = str(v.currentId)
  const currentId = conversation.some((d) => d.id === id) ? id : conversation[conversation.length - 1].id
  const library = Array.isArray(v.library) ? v.library.map(readLibraryItem).filter((l): l is LibraryItem => l !== null) : []
  return { conversation, currentId, library }
}
