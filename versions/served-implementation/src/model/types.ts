export type SectionType = 'who' | 'knows' | 'ends' | 'todo' | 'limits' | 'back' | 'custom'
export type DocKind = 'prompt' | 'reply'

export interface Section {
  id: string
  title: string
  type: SectionType
  /** Lead text plus points, as Markdown. List items and quotes become numbered points. */
  body: string
  included: boolean
  folded: boolean
}

export interface Doc {
  id: string
  kind: DocKind
  sections: Section[]
  createdAt: number
}

export interface LibraryItem {
  id: string
  section: Section
  savedAt: number
}

export type CardLane = 'todo' | 'doing' | 'done'
export interface Check {
  id: string
  text: string
  done: boolean
}
export interface Card {
  id: string
  title: string
  type: SectionType
  lane: CardLane
  checks: Check[]
  fromDoc?: string
}

/** Every section has one of these. 'custom' only survives in old saved state and reads as 'todo'. */
export const TYPES: SectionType[] = ['who', 'knows', 'ends', 'todo', 'limits', 'back']

export const TYPE_MEANING: Record<SectionType, string> = {
  who: 'who',
  knows: 'what it knows',
  ends: 'where it ends',
  todo: 'what to do',
  limits: 'limits',
  back: 'what comes back',
  custom: 'custom',
}

export const TYPE_DEFAULT_TITLE: Record<SectionType, string> = {
  who: 'Role',
  knows: 'Context',
  ends: 'Goal',
  todo: 'Task',
  limits: 'Constraints',
  back: 'Output Format',
  custom: 'Section',
}

export const PROMPT_SKELETON: [string, SectionType][] = [
  ['Role', 'who'],
  ['Context', 'knows'],
  ['Goal', 'ends'],
  ['Task', 'todo'],
  ['Constraints', 'limits'],
  ['Output Format', 'back'],
]

export const REPLY_SKELETON: [string, SectionType][] = [
  ['In Response To', 'knows'],
  ['Agreements', 'ends'],
  ['Corrections', 'limits'],
  ['Proposed Edits', 'todo'],
  ['Questions', 'back'],
]

export const uid = () => Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4)

export const newSection = (title: string, type: SectionType, body = ''): Section => ({
  id: uid(),
  title,
  type,
  body,
  included: true,
  folded: false,
})

export const newDoc = (kind: DocKind): Doc => ({
  id: uid(),
  kind,
  createdAt: Date.now(),
  sections: (kind === 'prompt' ? PROMPT_SKELETON : REPLY_SKELETON).map(([t, ty]) => newSection(t, ty)),
})

/** An inserted copy is independent of its source. */
export const cloneSection = (s: Section): Section => ({ ...s, id: uid() })
