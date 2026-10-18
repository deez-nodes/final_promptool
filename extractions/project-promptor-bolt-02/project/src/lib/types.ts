export type ColorKey = "amber" | "rose" | "violet" | "emerald" | "sky"

export interface PromptPoint {
  id: string
  text: string
}

export interface PromptSection {
  id: string
  name: string
  colorKey: ColorKey
  collapsed: boolean
  points: PromptPoint[]
}

export interface PromptDoc {
  id: string
  title: string
  baseSections: PromptSection[]
  midtaskSections: PromptSection[]
  createdAt: string
  updatedAt: string
}

export const SECTION_COLORS: Record<
  ColorKey,
  { dot: string; glow: string; accent: string; border: string }
> = {
  amber: {
    dot: "bg-amber-400",
    glow: "bg-amber-400/60",
    accent: "text-amber-400",
    border: "border-l-amber-400",
  },
  rose: {
    dot: "bg-rose-400",
    glow: "bg-rose-400/60",
    accent: "text-rose-400",
    border: "border-l-rose-400",
  },
  violet: {
    dot: "bg-violet-400",
    glow: "bg-violet-400/60",
    accent: "text-violet-400",
    border: "border-l-violet-400",
  },
  emerald: {
    dot: "bg-emerald-400",
    glow: "bg-emerald-400/60",
    accent: "text-emerald-400",
    border: "border-l-emerald-400",
  },
  sky: {
    dot: "bg-sky-400",
    glow: "bg-sky-400/60",
    accent: "text-sky-400",
    border: "border-l-sky-400",
  },
}

export const COLOR_KEYS: ColorKey[] = ["amber", "rose", "violet", "emerald", "sky"]

export const DEFAULT_SECTIONS: PromptSection[] = [
  { id: "sec-role", name: "Role", colorKey: "amber", collapsed: false, points: [] },
  { id: "sec-context", name: "Context", colorKey: "emerald", collapsed: false, points: [] },
  { id: "sec-instructions", name: "Instructions", colorKey: "violet", collapsed: false, points: [] },
  { id: "sec-constraints", name: "Constraints", colorKey: "rose", collapsed: false, points: [] },
]

export const STARTER_PIECES: { title: string; sectionName: string; text: string }[] = [
  { title: "Thoughtful editor", sectionName: "Role", text: "Act as a thoughtful editor with 10 years of experience in technical writing" },
  { title: "Ask only what matters", sectionName: "Instructions", text: "If any requirement is ambiguous, ask one focused clarifying question before starting" },
  { title: "Stay within scope", sectionName: "Instructions", text: "Only address the exact request — do not expand the task beyond what was asked" },
  { title: "Preserve settled architecture", sectionName: "Constraints", text: "Do not propose changes to decisions that are already finalized" },
  { title: "No unsolicited refactoring", sectionName: "Constraints", text: "Never refactor code that is not directly related to the current request" },
  { title: "Concise output", sectionName: "Constraints", text: "Keep responses under 300 words unless depth is explicitly requested" },
]
