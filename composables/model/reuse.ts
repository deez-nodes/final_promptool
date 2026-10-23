// Reuse at three levels: the library, the conversation, and the current message.
// Implements DECIDED.md "What it is" L12 (three reuse levels; an inserted copy is independent
// of its source), L9 (a reply is a message of its own in the conversation).
// Ported from cloneSection in versions/served-implementation/src/model/types.ts and the
// library/message actions in src/store/app.ts, made immutable. Copies are deep and get new
// ids, so editing a copy never reaches its source and vice versa.

import { makeDoc } from './skeletons'
import { addSection } from './doc'
import { makeId, type Doc, type DocKind, type LibraryItem, type Section, type Workspace } from './types'

/** An independent copy of a section: new id, nothing shared. Keeps included/folded as they were. */
export const copySection = (s: Section): Section => ({ ...s, id: makeId() })

/** An independent copy of a whole message, every section copied. */
export const copyDoc = (d: Doc, now: number = Date.now()): Doc => ({
  ...d,
  id: makeId(),
  createdAt: now,
  sections: d.sections.map(copySection),
})

// ---- the library -----------------------------------------------------------------------

/** Save a copy of a section to the front of the library. */
export const saveToLibrary = (library: readonly LibraryItem[], s: Section, now: number = Date.now()): LibraryItem[] => [
  { id: makeId(), section: copySection(s), savedAt: now },
  ...library,
]

/** Destructive. */
export const removeFromLibrary = (library: readonly LibraryItem[], id: string): LibraryItem[] =>
  library.filter((l) => l.id !== id)

// ---- the conversation ------------------------------------------------------------------

export const findDoc = (conversation: readonly Doc[], id: string): Doc | undefined => conversation.find((d) => d.id === id)

export const findSection = (conversation: readonly Doc[], docId: string, sectionId: string): Section | undefined =>
  findDoc(conversation, docId)?.sections.find((s) => s.id === sectionId)

/** Replace one message in the conversation. */
export const replaceDoc = (conversation: readonly Doc[], doc: Doc): Doc[] =>
  conversation.map((d) => (d.id === doc.id ? doc : d))

/** Start a new message on its skeleton and make it current. */
export function newMessage(ws: Workspace, kind: DocKind): Workspace {
  const doc = makeDoc(kind)
  return { ...ws, conversation: [...ws.conversation, doc], currentId: doc.id }
}

/** Start a new message as a copy of an earlier one and make it current. */
export function reuseMessage(ws: Workspace, docId: string): Workspace {
  const src = findDoc(ws.conversation, docId)
  if (!src) return ws
  const doc = copyDoc(src)
  return { ...ws, conversation: [...ws.conversation, doc], currentId: doc.id }
}

/** Destructive. The conversation always keeps one message. */
export function removeMessage(ws: Workspace, id: string): Workspace {
  if (ws.conversation.length <= 1 || !findDoc(ws.conversation, id)) return ws
  const conversation = ws.conversation.filter((d) => d.id !== id)
  const currentId = ws.currentId === id ? conversation[conversation.length - 1].id : ws.currentId
  return { ...ws, conversation, currentId }
}

export const currentDoc = (ws: Workspace): Doc => findDoc(ws.conversation, ws.currentId) ?? ws.conversation[0]

// ---- into the current message ----------------------------------------------------------

/**
 * Insert an independent copy of `source` (from the library, any message in the conversation,
 * or the current message itself) into the current message at `index` (end by default).
 */
export function insertCopy(ws: Workspace, source: Section, index?: number): { workspace: Workspace; section: Section } {
  const section = copySection(source)
  const doc = addSection(currentDoc(ws), section, index)
  return { workspace: { ...ws, conversation: replaceDoc(ws.conversation, doc) }, section }
}

/** Duplicate a section of the current message, right below it. */
export function duplicateSection(ws: Workspace, sectionId: string): { workspace: Workspace; section: Section } | null {
  const doc = currentDoc(ws)
  const i = doc.sections.findIndex((s) => s.id === sectionId)
  if (i < 0) return null
  return insertCopy(ws, doc.sections[i], i + 1)
}

/** Apply a Doc edit (see doc.ts) to the current message. */
export const editCurrent = (ws: Workspace, edit: (doc: Doc) => Doc): Workspace => ({
  ...ws,
  conversation: replaceDoc(ws.conversation, edit(currentDoc(ws))),
})
