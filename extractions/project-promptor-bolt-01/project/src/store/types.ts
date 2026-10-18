export type ExportFormat = "markdown" | "xml" | "plaintext"

export type SectionColor =
  | "green"
  | "rose"
  | "amber"
  | "sky"
  | "purple"
  | "slate"

export const SECTION_COLORS: Record<SectionColor, string> = {
  green: "section.green",
  rose: "section.rose",
  amber: "section.amber",
  sky: "section.sky",
  purple: "section.purple",
  slate: "section.slate",
}

export const SECTION_PILL_FG: Record<SectionColor, string> = {
  green: "sectionPillFg.green",
  rose: "sectionPillFg.rose",
  amber: "sectionPillFg.amber",
  sky: "sectionPillFg.sky",
  purple: "sectionPillFg.purple",
  slate: "sectionPillFg.slate",
}

export type SectionStyle = "heading" | "xml"

export type HeadingLevel = 1 | 2 | 3 | 4 | 5 | 6

export const HEADING_LEVELS: HeadingLevel[] = [1, 2, 3, 4, 5, 6]

export type PieceCategory =
  | "Role"
  | "Persona"
  | "Instructions"
  | "Constraints"
  | "Context"
  | "Stack"
  | "Custom"

export const PIECE_CATEGORIES: PieceCategory[] = [
  "Role",
  "Persona",
  "Instructions",
  "Constraints",
  "Context",
  "Stack",
  "Custom",
]

export const CATEGORY_COLORS: Record<PieceCategory, SectionColor> = {
  Role: "purple",
  Persona: "purple",
  Instructions: "sky",
  Constraints: "rose",
  Context: "amber",
  Stack: "slate",
  Custom: "slate",
}

export interface Point {
  id: string
  text: string
  quote?: string
  comment?: string
}

export interface Section {
  id: string
  name: string
  color: SectionColor
  style: SectionStyle
  headingLevel: HeadingLevel
  collapsed: boolean
  kept: boolean
  points: Point[]
  freeText: string
}

export interface LibraryPiece {
  id: string
  category: PieceCategory
  name: string
  content: string
  createdAt: number
}

export interface SavedPrompt {
  id: string
  title: string
  mode: DraftMode
  sections: Section[]
  savedAt: number
}

export interface Arrangement {
  id: string
  name: string
  mode: DraftMode
  sectionTemplates: Array<{
    name: string
    color: SectionColor
    style: SectionStyle
    kept: boolean
  }>
}

export type DraftMode = "base" | "reply"

export type RightPaneView = "reply" | "output"

export interface Draft {
  title: string
  sections: Section[]
}

export interface CopiedTurn {
  id: string
  title: string
  text: string
  format: ExportFormat
  copiedAt: number
}

export interface AppState {
  mode: DraftMode
  baseDraft: Draft
  replyDraft: Draft
  exportFormat: ExportFormat
  libraryPieces: LibraryPiece[]
  savedPrompts: SavedPrompt[]
  arrangements: Arrangement[]
  copiedTurns: CopiedTurn[]
  referenceText: string
  leftSidebarOpen: boolean
  rightSidebarOpen: boolean
  rightPaneView: RightPaneView
  undoStack: UndoEntry[]
  redoStack: UndoEntry[]
}

export interface UndoEntry {
  baseDraft: Draft
  replyDraft: Draft
  libraryPieces: LibraryPiece[]
}
