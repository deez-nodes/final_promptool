// Data model: plain, serialisable objects. No Vue, no Pinia, no I/O.
// Implements DECIDED.md "What it is" L7 (section = title + lead + numbered points),
// L10 (a point holds a quoted line and the answer, DZ-54), L12 (library / conversation /
// current message), and "Colour and type" L34-42 (six types, _MINTY hues, DZ-57),
// plus Layout L24 (fold and include are separate, DZ-52).
// Ported from versions/served-implementation/src/model/types.ts.

/** A section's type. It sets the colour; custom sections pick one too (DZ-57). */
export type SectionType = 'who' | 'knows' | 'ends' | 'todo' | 'limits' | 'back'

/** The `_MINTY` hues, one per type. */
export type Hue = 'green' | 'violet' | 'blue' | 'cyan' | 'red' | 'amber'

export type DocKind = 'prompt' | 'reply'

export interface Section {
  id: string
  /** Becomes the XML tag through `tagOf`. */
  title: string
  type: SectionType
  /**
   * What the editor holds: lead text, then points, as Markdown, verbatim.
   * A list item (`- `, `* `, `+ `, `1. `, `1) `) or a quote line (`> `) starts a point;
   * the lines under it, up to the next one, belong to it.
   */
  body: string
  /** Include is its own control: an excluded section never goes out. */
  included: boolean
  /** Folding is view state only; it never affects output. */
  folded: boolean
}

/** One numbered point, as read from a section body. */
export interface Point {
  /** 1-based position; `pad(n)` gives the address "01", "02" … */
  n: number
  /** The quoted line, when the point starts with `> `. */
  quote?: string
  /** The point's text (or, under a quote, the answer), verbatim line by line. */
  lines: string[]
  /** 0-based body line the point starts on, and the line after its last non-blank line. */
  line: number
  end: number
}

/** One message: a prompt you write or a reply you answer. */
export interface Doc {
  id: string
  kind: DocKind
  sections: Section[]
  createdAt: number
}

/** A section saved to the library. The stored section is a copy, never the original. */
export interface LibraryItem {
  id: string
  section: Section
  savedAt: number
}

/** Everything this package owns, ready for the store to persist. */
export interface Workspace {
  /** Every message, oldest first. */
  conversation: Doc[]
  /** The current message. */
  currentId: string
  library: LibraryItem[]
}

const fallbackId = () => Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4)

/** A fresh id. Uses crypto.randomUUID where available. */
export const makeId = (): string => {
  const c = (globalThis as { crypto?: { randomUUID?: () => string } }).crypto
  return c?.randomUUID ? c.randomUUID() : fallbackId()
}
