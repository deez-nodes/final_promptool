// Skeletons, section/doc factories, and type -> colour.
// Implements DECIDED.md "What it is" L8 (prompt skeleton: Role, Context, Goal, Task,
// Constraints, Output Format), L9 (reply skeleton: In Response To, Agreements, Corrections,
// Proposed Edits, Questions); Layout L23 (add by chip or typed name, DZ-51);
// "Colour and type" L34-40 (_MINTY palette) and L42 (colour follows type, custom too, DZ-57).
// Ported from versions/served-implementation/src/model/types.ts.

import { makeId, type Doc, type DocKind, type Hue, type Section, type SectionType } from './types'
import { tagOf } from './xml'

/** Every type, in palette order. */
export const TYPES: readonly SectionType[] = ['who', 'knows', 'ends', 'todo', 'limits', 'back']

/** _MINTY: green = who, violet = what it knows, blue = where it ends, cyan = what to do, red = limits, amber = what comes back. */
export const TYPE_HUE: Readonly<Record<SectionType, Hue>> = {
  who: 'green',
  knows: 'violet',
  ends: 'blue',
  todo: 'cyan',
  limits: 'red',
  back: 'amber',
}

export const TYPE_MEANING: Readonly<Record<SectionType, string>> = {
  who: 'who',
  knows: 'what it knows',
  ends: 'where it ends',
  todo: 'what to do',
  limits: 'limits',
  back: 'what comes back',
}

/** The title a chip gives a new section of that type. */
export const TYPE_DEFAULT_TITLE: Readonly<Record<SectionType, string>> = {
  who: 'Role',
  knows: 'Context',
  ends: 'Goal',
  todo: 'Task',
  limits: 'Constraints',
  back: 'Output Format',
}

export const PROMPT_SKELETON: readonly (readonly [string, SectionType])[] = [
  ['Role', 'who'],
  ['Context', 'knows'],
  ['Goal', 'ends'],
  ['Task', 'todo'],
  ['Constraints', 'limits'],
  ['Output Format', 'back'],
]

export const REPLY_SKELETON: readonly (readonly [string, SectionType])[] = [
  ['In Response To', 'knows'],
  ['Agreements', 'ends'],
  ['Corrections', 'limits'],
  ['Proposed Edits', 'todo'],
  ['Questions', 'back'],
]

export const SKELETON: Readonly<Record<DocKind, readonly (readonly [string, SectionType])[]>> = {
  prompt: PROMPT_SKELETON,
  reply: REPLY_SKELETON,
}

const KNOWN: ReadonlyMap<string, SectionType> = new Map(
  [...PROMPT_SKELETON, ...REPLY_SKELETON].map(([title, type]) => [tagOf(title), type] as const),
)

export const isSectionType = (v: unknown): v is SectionType => typeof v === 'string' && (TYPES as readonly string[]).includes(v)

/** The skeleton type a title names (Task -> todo, Corrections -> limits …), or null when it names none. */
export const typeForTitle = (title: string): SectionType | null => KNOWN.get(tagOf(title)) ?? null

/** What the UI needs to colour a card. */
export interface TypeColour {
  type: SectionType
  hue: Hue
  meaning: string
}

/** The colour of a typed section, or null for an untyped one (neutral, no hue). */
export const roleOf = (section: Pick<Section, 'type'>): TypeColour | null => {
  const type = section.type
  return isSectionType(type) ? { type, hue: TYPE_HUE[type], meaning: TYPE_MEANING[type] } : null
}

export const hueOf = (section: Pick<Section, 'type'>): Hue | null => roleOf(section)?.hue ?? null

/** A new section. A chip or skeleton passes its type; a typed-name add passes none and stays untyped. */
export const makeSection = (title: string, type: SectionType | null = null, body = ''): Section => ({
  id: makeId(),
  title,
  type,
  body,
  included: true,
  folded: false,
})

/** A chip add: the chip sets type, colour and default title. */
export const sectionFromChip = (type: SectionType): Section => makeSection(TYPE_DEFAULT_TITLE[type], type)

/** A new message laid out on its skeleton, every section empty. */
export const makeDoc = (kind: DocKind, now: number = Date.now()): Doc => ({
  id: makeId(),
  kind,
  createdAt: now,
  sections: SKELETON[kind].map(([title, type]) => makeSection(title, type)),
})
