import type {
  Arrangement,
  LibraryPiece,
  Draft,
} from "./types"

function id(): string {
  return crypto.randomUUID()
}

function makeSection(
  name: string,
  color: "green" | "rose" | "amber" | "sky" | "purple" | "slate",
  kept = false,
) {
  return {
    id: id(),
    name,
    color,
    style: "heading" as const,
    headingLevel: 1 as const,
    collapsed: false,
    kept,
    points: [],
    freeText: "",
  }
}

export const SEED_ARRANGEMENTS: Arrangement[] = [
  {
    id: id(),
    name: "Base prompt",
    mode: "base",
    sectionTemplates: [
      { name: "Role", color: "purple", style: "heading", kept: false },
      { name: "Context", color: "amber", style: "heading", kept: false },
      { name: "Instructions", color: "sky", style: "heading", kept: false },
      { name: "Constraints", color: "rose", style: "heading", kept: false },
    ],
  },
  {
    id: id(),
    name: "Mid-task reply",
    mode: "reply",
    sectionTemplates: [
      { name: "Mode", color: "purple", style: "heading", kept: true },
      { name: "In response to", color: "slate", style: "heading", kept: false },
      { name: "Agreements", color: "green", style: "heading", kept: false },
      { name: "Proposed edits", color: "amber", style: "heading", kept: false },
      { name: "Questions", color: "sky", style: "heading", kept: false },
    ],
  },
]

export const SEED_PIECES: LibraryPiece[] = [
  {
    id: id(),
    category: "Role",
    name: "Thoughtful editor",
    content: "Thoughtful editor",
    createdAt: Date.now(),
  },
  {
    id: id(),
    category: "Instructions",
    name: "Ask only what matters",
    content: "Ask only what matters",
    createdAt: Date.now(),
  },
  {
    id: id(),
    category: "Instructions",
    name: "Stay within scope",
    content: "Stay within scope",
    createdAt: Date.now(),
  },
  {
    id: id(),
    category: "Constraints",
    name: "Preserve settled architecture",
    content: "Preserve settled architecture",
    createdAt: Date.now(),
  },
  {
    id: id(),
    category: "Constraints",
    name: "No unsolicited refactoring",
    content: "No unsolicited refactoring",
    createdAt: Date.now(),
  },
]

export function createBaseDraftFromArrangement(): Draft {
  const arr = SEED_ARRANGEMENTS[0]
  return {
    title: "Untitled prompt",
    sections: arr.sectionTemplates.map((t) => makeSection(t.name, t.color, t.kept)),
  }
}

export function createReplyDraftFromArrangement(): Draft {
  const arr = SEED_ARRANGEMENTS[1]
  return {
    title: "Untitled reply",
    sections: arr.sectionTemplates.map((t) => makeSection(t.name, t.color, t.kept)),
  }
}

export function createDraftFromArrangement(arr: Arrangement): Draft {
  return {
    title: arr.mode === "base" ? "Untitled prompt" : "Untitled reply",
    sections: arr.sectionTemplates.map((t) => makeSection(t.name, t.color, t.kept)),
  }
}
