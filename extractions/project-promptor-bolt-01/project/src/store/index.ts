import { create } from "zustand"
import type {
  AppState,
  Section,
  Point,
  LibraryPiece,
  SavedPrompt,
  Arrangement,
  DraftMode,
  ExportFormat,
  SectionColor,
  SectionStyle,
  HeadingLevel,
  RightPaneView,
  Draft,
  CopiedTurn,
  UndoEntry,
} from "./types"
import {
  SEED_ARRANGEMENTS,
  SEED_PIECES,
  createBaseDraftFromArrangement,
  createReplyDraftFromArrangement,
  createDraftFromArrangement,
} from "./seed"
import { createDraftFromTemplate, type PromptTemplate } from "@/lib/templates"

const STORAGE_KEY = "promptor-workbench-v1"
const MAX_UNDO = 50

function uid(): string {
  return crypto.randomUUID()
}

function loadFromStorage(): Partial<AppState> | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    return JSON.parse(raw)
  } catch {
    return null
  }
}

function saveToStorage(state: AppState) {
  try {
    const { undoStack, redoStack, ...rest } = state
    void undoStack
    void redoStack
    localStorage.setItem(STORAGE_KEY, JSON.stringify(rest))
  } catch {
    // quota exceeded, silently fail
  }
}

let saveTimer: ReturnType<typeof setTimeout> | null = null
function debouncedSave(state: AppState) {
  if (saveTimer) clearTimeout(saveTimer)
  saveTimer = setTimeout(() => saveToStorage(state), 500)
}

function getInitialState(): AppState {
  const stored = loadFromStorage()
  if (stored && stored.baseDraft && stored.replyDraft) {
    return {
      mode: stored.mode ?? "base",
      baseDraft: stored.baseDraft,
      replyDraft: stored.replyDraft,
      exportFormat: stored.exportFormat ?? "markdown",
      libraryPieces: stored.libraryPieces ?? SEED_PIECES,
      savedPrompts: stored.savedPrompts ?? [],
      arrangements: stored.arrangements ?? SEED_ARRANGEMENTS,
      copiedTurns: stored.copiedTurns ?? [],
      referenceText: stored.referenceText ?? "",
      leftSidebarOpen: stored.leftSidebarOpen ?? true,
      rightSidebarOpen: stored.rightSidebarOpen ?? false,
      rightPaneView: stored.rightPaneView ?? "reply",
      undoStack: [],
      redoStack: [],
    }
  }
  return {
    mode: "base",
    baseDraft: createBaseDraftFromArrangement(),
    replyDraft: createReplyDraftFromArrangement(),
    exportFormat: "markdown",
    libraryPieces: SEED_PIECES,
    savedPrompts: [],
    arrangements: SEED_ARRANGEMENTS,
    copiedTurns: [],
    referenceText: "",
    leftSidebarOpen: true,
    rightSidebarOpen: false,
    rightPaneView: "reply",
    undoStack: [],
    redoStack: [],
  }
}

interface Actions {
  activeDraft: () => Draft
  setMode: (mode: DraftMode) => void
  setExportFormat: (format: ExportFormat) => void
  toggleLeftSidebar: () => void
  toggleRightSidebar: () => void

  // Draft actions
  setDraftTitle: (title: string) => void
  addSection: (name?: string, color?: SectionColor) => void
  removeSection: (sectionId: string) => Section
  restoreSection: (section: Section, index: number) => void
  moveSection: (sectionId: string, direction: "up" | "down") => void
  updateSectionName: (sectionId: string, name: string) => void
  updateSectionColor: (sectionId: string, color: SectionColor) => void
  updateSectionStyle: (sectionId: string, style: SectionStyle) => void
  updateSectionHeadingLevel: (sectionId: string, level: HeadingLevel) => void
  toggleSectionCollapse: (sectionId: string) => void
  toggleSectionKept: (sectionId: string) => void
  updateSectionFreeText: (sectionId: string, text: string) => void

  // Points
  addPoint: (sectionId: string, quote?: string) => void
  removePoint: (sectionId: string, pointId: string) => void
  updatePointText: (sectionId: string, pointId: string, text: string) => void
  updatePointQuote: (sectionId: string, pointId: string, quote: string) => void
  updatePointComment: (sectionId: string, pointId: string, comment: string) => void

  // Library
  addLibraryPiece: (piece: Omit<LibraryPiece, "id" | "createdAt">) => void
  updateLibraryPiece: (id: string, updates: Partial<LibraryPiece>) => void
  removeLibraryPiece: (id: string) => void
  insertPieceAsSection: (pieceId: string) => void
  insertPieceIntoSection: (pieceId: string, sectionId: string) => void

  // Saved prompts
  saveCurrentPrompt: () => void
  loadSavedPrompt: (promptId: string) => void
  removeSavedPrompt: (id: string) => void

  // Arrangements
  loadArrangement: (arrangementId: string) => void
  saveArrangement: (name: string) => void
  // Templates
  applyTemplate: (template: PromptTemplate) => void
  applyBlankTemplate: (mode: DraftMode) => void

  // Turns
  addCopiedTurn: (text: string, format: ExportFormat) => void

  // Reference pane
  setReferenceText: (text: string) => void
  setRightPaneView: (view: RightPaneView) => void

  // Next reply / new prompt
  nextReply: () => void
  newPrompt: () => void

  // Undo/redo
  pushUndo: () => void
  undo: () => void
  redo: () => void

  // Backup
  exportBackup: () => string
  importBackup: (json: string, merge: boolean) => void
}

export const useStore = create<AppState & Actions>((set, get) => ({
  ...getInitialState(),

  activeDraft: () => {
    const s = get()
    return s.mode === "base" ? s.baseDraft : s.replyDraft
  },

  setMode: (mode) => {
    set({ mode })
    debouncedSave(get())
  },

  setExportFormat: (format) => {
    set({ exportFormat: format })
    debouncedSave(get())
  },

  toggleLeftSidebar: () => {
    set((s) => ({ leftSidebarOpen: !s.leftSidebarOpen }))
    debouncedSave(get())
  },

  toggleRightSidebar: () => {
    set((s) => ({ rightSidebarOpen: !s.rightSidebarOpen }))
    debouncedSave(get())
  },

  setDraftTitle: (title) => {
    set((s) => {
      const key = s.mode === "base" ? "baseDraft" : "replyDraft"
      return { [key]: { ...s[key], title } }
    })
    debouncedSave(get())
  },

  addSection: (name, color) => {
    get().pushUndo()
    const newSection: Section = {
      id: uid(),
      name: name ?? "New section",
      color: color ?? "slate",
      style: "heading",
      headingLevel: 1,
      collapsed: false,
      kept: false,
      points: [],
      freeText: "",
    }
    set((s) => {
      const key = s.mode === "base" ? "baseDraft" : "replyDraft"
      const draft = s[key]
      return { [key]: { ...draft, sections: [...draft.sections, newSection] } }
    })
    debouncedSave(get())
  },

  removeSection: (sectionId) => {
    get().pushUndo()
    const draft = get().activeDraft()
    const section = draft.sections.find((s) => s.id === sectionId)!
    set((s) => {
      const key = s.mode === "base" ? "baseDraft" : "replyDraft"
      const d = s[key]
      return {
        [key]: {
          ...d,
          sections: d.sections.filter((sec) => sec.id !== sectionId),
        },
      }
    })
    debouncedSave(get())
    return section
  },

  restoreSection: (section, index) => {
    set((s) => {
      const key = s.mode === "base" ? "baseDraft" : "replyDraft"
      const d = s[key]
      const sections = [...d.sections]
      sections.splice(Math.min(index, sections.length), 0, section)
      return { [key]: { ...d, sections } }
    })
    debouncedSave(get())
  },

  moveSection: (sectionId, direction) => {
    get().pushUndo()
    set((s) => {
      const key = s.mode === "base" ? "baseDraft" : "replyDraft"
      const d = s[key]
      const sections = [...d.sections]
      const idx = sections.findIndex((sec) => sec.id === sectionId)
      if (idx < 0) return s
      const target = direction === "up" ? idx - 1 : idx + 1
      if (target < 0 || target >= sections.length) return s
      ;[sections[idx], sections[target]] = [sections[target], sections[idx]]
      return { [key]: { ...d, sections } }
    })
    debouncedSave(get())
  },

  updateSectionName: (sectionId, name) => {
    set((s) => {
      const key = s.mode === "base" ? "baseDraft" : "replyDraft"
      const d = s[key]
      return {
        [key]: {
          ...d,
          sections: d.sections.map((sec) =>
            sec.id === sectionId ? { ...sec, name } : sec
          ),
        },
      }
    })
    debouncedSave(get())
  },

  updateSectionColor: (sectionId, color) => {
    set((s) => {
      const key = s.mode === "base" ? "baseDraft" : "replyDraft"
      const d = s[key]
      return {
        [key]: {
          ...d,
          sections: d.sections.map((sec) =>
            sec.id === sectionId ? { ...sec, color } : sec
          ),
        },
      }
    })
    debouncedSave(get())
  },

  updateSectionStyle: (sectionId, style) => {
    set((s) => {
      const key = s.mode === "base" ? "baseDraft" : "replyDraft"
      const d = s[key]
      return {
        [key]: {
          ...d,
          sections: d.sections.map((sec) =>
            sec.id === sectionId ? { ...sec, style } : sec
          ),
        },
      }
    })
    debouncedSave(get())
  },

  updateSectionHeadingLevel: (sectionId, level) => {
    set((s) => {
      const key = s.mode === "base" ? "baseDraft" : "replyDraft"
      const d = s[key]
      return {
        [key]: {
          ...d,
          sections: d.sections.map((sec) =>
            sec.id === sectionId
              ? { ...sec, headingLevel: level, style: "heading" }
              : sec,
          ),
        },
      }
    })
    debouncedSave(get())
  },

  toggleSectionCollapse: (sectionId) => {
    set((s) => {
      const key = s.mode === "base" ? "baseDraft" : "replyDraft"
      const d = s[key]
      return {
        [key]: {
          ...d,
          sections: d.sections.map((sec) =>
            sec.id === sectionId ? { ...sec, collapsed: !sec.collapsed } : sec
          ),
        },
      }
    })
    debouncedSave(get())
  },

  toggleSectionKept: (sectionId) => {
    set((s) => {
      const key = s.mode === "base" ? "baseDraft" : "replyDraft"
      const d = s[key]
      return {
        [key]: {
          ...d,
          sections: d.sections.map((sec) =>
            sec.id === sectionId ? { ...sec, kept: !sec.kept } : sec
          ),
        },
      }
    })
    debouncedSave(get())
  },

  updateSectionFreeText: (sectionId, text) => {
    set((s) => {
      const key = s.mode === "base" ? "baseDraft" : "replyDraft"
      const d = s[key]
      return {
        [key]: {
          ...d,
          sections: d.sections.map((sec) =>
            sec.id === sectionId ? { ...sec, freeText: text } : sec
          ),
        },
      }
    })
    debouncedSave(get())
  },

  addPoint: (sectionId, quote) => {
    const newPoint: Point = { id: uid(), text: "", quote: quote ?? undefined }
    set((s) => {
      const key = s.mode === "base" ? "baseDraft" : "replyDraft"
      const d = s[key]
      return {
        [key]: {
          ...d,
          sections: d.sections.map((sec) =>
            sec.id === sectionId
              ? { ...sec, points: [...sec.points, newPoint] }
              : sec
          ),
        },
      }
    })
    debouncedSave(get())
  },

  removePoint: (sectionId, pointId) => {
    set((s) => {
      const key = s.mode === "base" ? "baseDraft" : "replyDraft"
      const d = s[key]
      return {
        [key]: {
          ...d,
          sections: d.sections.map((sec) =>
            sec.id === sectionId
              ? { ...sec, points: sec.points.filter((p) => p.id !== pointId) }
              : sec
          ),
        },
      }
    })
    debouncedSave(get())
  },

  updatePointText: (sectionId, pointId, text) => {
    set((s) => {
      const key = s.mode === "base" ? "baseDraft" : "replyDraft"
      const d = s[key]
      return {
        [key]: {
          ...d,
          sections: d.sections.map((sec) =>
            sec.id === sectionId
              ? {
                  ...sec,
                  points: sec.points.map((p) =>
                    p.id === pointId ? { ...p, text } : p
                  ),
                }
              : sec
          ),
        },
      }
    })
    debouncedSave(get())
  },

  updatePointQuote: (sectionId, pointId, quote) => {
    set((s) => {
      const key = s.mode === "base" ? "baseDraft" : "replyDraft"
      const d = s[key]
      return {
        [key]: {
          ...d,
          sections: d.sections.map((sec) =>
            sec.id === sectionId
              ? {
                  ...sec,
                  points: sec.points.map((p) =>
                    p.id === pointId ? { ...p, quote } : p
                  ),
                }
              : sec
          ),
        },
      }
    })
    debouncedSave(get())
  },

  updatePointComment: (sectionId, pointId, comment) => {
    set((s) => {
      const key = s.mode === "base" ? "baseDraft" : "replyDraft"
      const d = s[key]
      return {
        [key]: {
          ...d,
          sections: d.sections.map((sec) =>
            sec.id === sectionId
              ? {
                  ...sec,
                  points: sec.points.map((p) =>
                    p.id === pointId ? { ...p, comment } : p
                  ),
                }
              : sec
          ),
        },
      }
    })
    debouncedSave(get())
  },

  // Library
  addLibraryPiece: (piece) => {
    set((s) => ({
      libraryPieces: [
        ...s.libraryPieces,
        { ...piece, id: uid(), createdAt: Date.now() },
      ],
    }))
    debouncedSave(get())
  },

  updateLibraryPiece: (id, updates) => {
    set((s) => ({
      libraryPieces: s.libraryPieces.map((p) =>
        p.id === id ? { ...p, ...updates } : p
      ),
    }))
    debouncedSave(get())
  },

  removeLibraryPiece: (id) => {
    set((s) => ({
      libraryPieces: s.libraryPieces.filter((p) => p.id !== id),
    }))
    debouncedSave(get())
  },

  insertPieceAsSection: (pieceId) => {
    const piece = get().libraryPieces.find((p) => p.id === pieceId)
    if (!piece) return
    const colorMap: Record<string, SectionColor> = {
      Role: "purple",
      Persona: "purple",
      Instructions: "sky",
      Constraints: "rose",
      Context: "amber",
      Stack: "slate",
      Custom: "slate",
    }
    const newSection: Section = {
      id: uid(),
      name: piece.category,
      color: colorMap[piece.category] ?? "slate",
      style: "heading",
      headingLevel: 1,
      collapsed: false,
      kept: false,
      points: [],
      freeText: piece.content,
    }
    set((s) => {
      const key = s.mode === "base" ? "baseDraft" : "replyDraft"
      const d = s[key]
      return { [key]: { ...d, sections: [...d.sections, newSection] } }
    })
    debouncedSave(get())
  },

  insertPieceIntoSection: (pieceId, sectionId) => {
    const piece = get().libraryPieces.find((p) => p.id === pieceId)
    if (!piece) return
    set((s) => {
      const key = s.mode === "base" ? "baseDraft" : "replyDraft"
      const d = s[key]
      return {
        [key]: {
          ...d,
          sections: d.sections.map((sec) =>
            sec.id === sectionId
              ? {
                  ...sec,
                  freeText: sec.freeText
                    ? sec.freeText + "\n" + piece.content
                    : piece.content,
                }
              : sec
          ),
        },
      }
    })
    debouncedSave(get())
  },

  // Saved prompts
  saveCurrentPrompt: () => {
    const s = get()
    const draft = s.activeDraft()
    const saved: SavedPrompt = {
      id: uid(),
      title: draft.title,
      mode: s.mode,
      sections: structuredClone(draft.sections),
      savedAt: Date.now(),
    }
    set({ savedPrompts: [...s.savedPrompts, saved] })
    debouncedSave(get())
  },

  loadSavedPrompt: (promptId) => {
    get().pushUndo()
    const prompt = get().savedPrompts.find((p) => p.id === promptId)
    if (!prompt) return
    const draft: Draft = {
      title: prompt.title,
      sections: structuredClone(prompt.sections),
    }
    const key = prompt.mode === "base" ? "baseDraft" : "replyDraft"
    set({ mode: prompt.mode, [key]: draft })
    debouncedSave(get())
  },

  removeSavedPrompt: (id) => {
    set((s) => ({
      savedPrompts: s.savedPrompts.filter((p) => p.id !== id),
    }))
    debouncedSave(get())
  },

  // Arrangements
  loadArrangement: (arrangementId) => {
    get().pushUndo()
    const arr = get().arrangements.find((a) => a.id === arrangementId)
    if (!arr) return
    const draft = createDraftFromArrangement(arr)
    const key = arr.mode === "base" ? "baseDraft" : "replyDraft"
    set({ mode: arr.mode, [key]: draft })
    debouncedSave(get())
  },

  saveArrangement: (name) => {
    const s = get()
    const draft = s.activeDraft()
    const arr: Arrangement = {
      id: uid(),
      name,
      mode: s.mode,
      sectionTemplates: draft.sections.map((sec) => ({
        name: sec.name,
        color: sec.color,
        style: sec.style,
        kept: sec.kept,
      })),
    }
    set({ arrangements: [...s.arrangements, arr] })
    debouncedSave(get())
  },

  applyTemplate: (template) => {
    get().pushUndo()
    const draft = createDraftFromTemplate(template)
    const key = template.mode === "base" ? "baseDraft" : "replyDraft"
    set({ mode: template.mode, [key]: draft })
    debouncedSave(get())
  },

  applyBlankTemplate: (mode) => {
    get().pushUndo()
    const key = mode === "base" ? "baseDraft" : "replyDraft"
    set({
      mode,
      [key]: {
        title: mode === "base" ? "Untitled prompt" : "Untitled reply",
        sections: [],
      },
    })
    debouncedSave(get())
  },

  addCopiedTurn: (text, format) => {
    const s = get()
    const draft = s.activeDraft()
    const turn: CopiedTurn = {
      id: uid(),
      title: draft.title,
      text,
      format,
      copiedAt: Date.now(),
    }
    set({ copiedTurns: [...s.copiedTurns, turn] })
    debouncedSave(get())
  },

  setReferenceText: (text) => {
    set({ referenceText: text })
    debouncedSave(get())
  },

  setRightPaneView: (view) => {
    set({ rightPaneView: view })
    debouncedSave(get())
  },

  nextReply: () => {
    get().pushUndo()
    set((s) => {
      const key = s.mode === "base" ? "baseDraft" : "replyDraft"
      const d = s[key]
      return {
        [key]: {
          ...d,
          title: s.mode === "base" ? "Untitled prompt" : "Untitled reply",
          sections: d.sections
            .filter((sec) => sec.kept)
            .map((sec) => ({ ...sec })),
        },
      }
    })
    debouncedSave(get())
  },

  newPrompt: () => {
    get().pushUndo()
    set((s) => {
      const key = s.mode === "base" ? "baseDraft" : "replyDraft"
      return {
        [key]: {
          title: s.mode === "base" ? "Untitled prompt" : "Untitled reply",
          sections: [],
        },
      }
    })
    debouncedSave(get())
  },

  pushUndo: () => {
    set((s) => {
      const entry: UndoEntry = {
        baseDraft: structuredClone(s.baseDraft),
        replyDraft: structuredClone(s.replyDraft),
        libraryPieces: structuredClone(s.libraryPieces),
      }
      const stack = [...s.undoStack, entry].slice(-MAX_UNDO)
      return { undoStack: stack, redoStack: [] }
    })
  },

  undo: () => {
    set((s) => {
      if (s.undoStack.length === 0) return s
      const stack = [...s.undoStack]
      const entry = stack.pop()!
      const redoEntry: UndoEntry = {
        baseDraft: structuredClone(s.baseDraft),
        replyDraft: structuredClone(s.replyDraft),
        libraryPieces: structuredClone(s.libraryPieces),
      }
      return {
        undoStack: stack,
        redoStack: [...s.redoStack, redoEntry],
        baseDraft: entry.baseDraft,
        replyDraft: entry.replyDraft,
        libraryPieces: entry.libraryPieces,
      }
    })
    debouncedSave(get())
  },

  redo: () => {
    set((s) => {
      if (s.redoStack.length === 0) return s
      const stack = [...s.redoStack]
      const entry = stack.pop()!
      const undoEntry: UndoEntry = {
        baseDraft: structuredClone(s.baseDraft),
        replyDraft: structuredClone(s.replyDraft),
        libraryPieces: structuredClone(s.libraryPieces),
      }
      return {
        redoStack: stack,
        undoStack: [...s.undoStack, undoEntry],
        baseDraft: entry.baseDraft,
        replyDraft: entry.replyDraft,
        libraryPieces: entry.libraryPieces,
      }
    })
    debouncedSave(get())
  },

  exportBackup: () => {
    const s = get()
    return JSON.stringify({
      version: 1,
      baseDraft: s.baseDraft,
      replyDraft: s.replyDraft,
      libraryPieces: s.libraryPieces,
      savedPrompts: s.savedPrompts,
      arrangements: s.arrangements,
      copiedTurns: s.copiedTurns,
    })
  },

  importBackup: (json, merge) => {
    try {
      const data = JSON.parse(json)
      get().pushUndo()
      if (merge) {
        set((s) => ({
          libraryPieces: [
            ...s.libraryPieces,
            ...(data.libraryPieces ?? []),
          ],
          savedPrompts: [
            ...s.savedPrompts,
            ...(data.savedPrompts ?? []),
          ],
          arrangements: [
            ...s.arrangements,
            ...(data.arrangements ?? []),
          ],
        }))
      } else {
        set({
          baseDraft: data.baseDraft ?? get().baseDraft,
          replyDraft: data.replyDraft ?? get().replyDraft,
          libraryPieces: data.libraryPieces ?? get().libraryPieces,
          savedPrompts: data.savedPrompts ?? get().savedPrompts,
          arrangements: data.arrangements ?? get().arrangements,
        })
      }
      debouncedSave(get())
    } catch {
      // invalid JSON, ignore
    }
  },
}))
