import { create } from "zustand"

import { supabase } from "@/lib/supabase"
import { composeDocument, totalPoints } from "@/lib/prompt-format"
import {
  COLOR_KEYS,
  DEFAULT_SECTIONS,
  STARTER_PIECES,
  type ColorKey,
  type PromptDoc,
  type PromptPoint,
  type PromptSection,
} from "@/lib/types"

export type SaveStatus = "idle" | "loading" | "saving" | "saved" | "error"

interface PromptRow {
  id: string
  title: string
  base_sections: PromptSection[]
  midtask_sections: PromptSection[]
  created_at: string
  updated_at: string
}

interface PromptState {
  docs: PromptDoc[]
  activeDocId: string | null
  status: SaveStatus
  error: string | null
  loadDocs: () => Promise<void>
  createDoc: () => Promise<void>
  selectDoc: (id: string) => void
  renameDoc: (title: string) => void
  deleteDoc: (id: string) => Promise<void>
  addSection: (tab: TabKey) => void
  setRole: (tab: TabKey, text: string) => void
  renameSection: (tab: TabKey, sectionId: string, name: string) => void
  cycleSectionColor: (tab: TabKey, sectionId: string) => void
  toggleSection: (tab: TabKey, sectionId: string) => void
  deleteSection: (tab: TabKey, sectionId: string) => void
  addPiece: (tab: TabKey, sectionId: string, text?: string, title?: string) => void
  updatePiece: (tab: TabKey, sectionId: string, pointId: string, text: string) => void
  deletePiece: (tab: TabKey, sectionId: string, pointId: string) => void
  movePiece: (tab: TabKey, sectionId: string, from: number, to: number) => void
  resetToSample: () => void
}

export type TabKey = "base" | "midtask"

const uid = () => crypto.randomUUID()

export const SECTION_COLOR_ORDER = COLOR_KEYS

function rowToDoc(row: PromptRow): PromptDoc {
  return {
    id: row.id,
    title: row.title,
    baseSections: Array.isArray(row.base_sections) ? row.base_sections : [],
    midtaskSections: Array.isArray(row.midtask_sections) ? row.midtask_sections : [],
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

function buildStarterDoc(sections: PromptSection[]): PromptSection[] {
  return sections.map((section) => {
    const matches = STARTER_PIECES.filter((piece) => piece.sectionName === section.name)
    return {
      ...section,
      points: matches.map((piece) => ({ id: uid(), text: piece.text })),
    }
  })
}

export function starterSections(): { baseSections: PromptSection[]; midtaskSections: PromptSection[] } {
  return {
    baseSections: buildStarterDoc(DEFAULT_SECTIONS),
    midtaskSections: [
      {
        id: uid(),
        name: "Follow-ups",
        colorKey: "sky" as ColorKey,
        collapsed: false,
        points: [
          { id: uid(), text: "When I say 'next', continue to the following step without re-explaining" },
        ],
      },
    ],
  }
}

let saveTimer: ReturnType<typeof setTimeout> | null = null

export const usePromptStore = create<PromptState>((set, get) => {
  const patchActive = (
    updater: (doc: PromptDoc) => PromptDoc,
    markDirty = true
  ) => {
    const { activeDocId } = get()
    if (!activeDocId) return
    set((state) => ({
      docs: state.docs.map((doc) =>
        doc.id === activeDocId
          ? { ...updater(doc), updatedAt: new Date().toISOString() }
          : doc
      ),
      status: markDirty ? "saving" : state.status,
    }))
    if (markDirty) scheduleSave()
  }

  const patchSections = (
    tab: TabKey,
    updater: (sections: PromptSection[]) => PromptSection[]
  ) => {
    patchActive((doc) =>
      tab === "base"
        ? { ...doc, baseSections: updater(doc.baseSections) }
        : { ...doc, midtaskSections: updater(doc.midtaskSections) }
    )
  }

  const scheduleSave = () => {
    if (saveTimer) clearTimeout(saveTimer)
    saveTimer = setTimeout(() => {
      void persistActive()
    }, 700)
  }

  const persistActive = async () => {
    const { activeDocId, docs } = get()
    const doc = docs.find((d) => d.id === activeDocId)
    if (!doc) return
    const { error } = await supabase
      .from("prompts")
      .update({
        title: doc.title,
        base_sections: doc.baseSections,
        midtask_sections: doc.midtaskSections,
        updated_at: new Date().toISOString(),
      })
      .eq("id", doc.id)

    if (error) {
      set({ status: "error", error: error.message })
      return
    }
    set({ status: "saved", error: null })
  }

  return {
    docs: [],
    activeDocId: null,
    status: "loading",
    error: null,

    loadDocs: async () => {
      set({ status: "loading", error: null })
      const { data, error } = await supabase
        .from("prompts")
        .select("*")
        .order("updated_at", { ascending: false })

      if (error) {
        set({ status: "error", error: error.message })
        return
      }

      let rows = (data ?? []) as PromptRow[]

      if (rows.length === 0) {
        const starter = starterSections()
        const { data: created, error: createError } = await supabase
          .from("prompts")
          .insert({
            title: "Untitled prompt",
            base_sections: starter.baseSections,
            midtask_sections: starter.midtaskSections,
          })
          .select()
          .single()

        if (createError || !created) {
          set({ status: "error", error: createError?.message ?? "Could not create workspace" })
          return
        }
        rows = [created as PromptRow]
      }

      const docs = rows.map(rowToDoc)
      set({ docs, activeDocId: docs[0].id, status: "saved", error: null })
    },

    createDoc: async () => {
      const starter = starterSections()
      const { data, error } = await supabase
        .from("prompts")
        .insert({
          title: "Untitled prompt",
          base_sections: starter.baseSections,
          midtask_sections: starter.midtaskSections,
        })
        .select()
        .single()

      if (error || !data) {
        set({ status: "error", error: error?.message ?? "Could not create prompt" })
        return
      }
      const doc = rowToDoc(data as PromptRow)
      set((state) => ({ docs: [doc, ...state.docs], activeDocId: doc.id, status: "saved" }))
    },

    selectDoc: (id) => set({ activeDocId: id }),

    renameDoc: (title) => patchActive((doc) => ({ ...doc, title })),

    deleteDoc: async (id) => {
      const { error } = await supabase.from("prompts").delete().eq("id", id)
      if (error) {
        set({ status: "error", error: error.message })
        return
      }
      set((state) => {
        const docs = state.docs.filter((doc) => doc.id !== id)
        const activeDocId =
          state.activeDocId === id ? (docs[0]?.id ?? null) : state.activeDocId
        return { docs, activeDocId }
      })
      if (get().docs.length === 0) await get().createDoc()
    },

    setRole: (tab, text) =>
      patchSections(tab, (sections) => {
        const index = sections.findIndex(
          (s) => s.name.trim().toLowerCase() === "role"
        )
        if (index === -1) {
          return [
            {
              id: uid(),
              name: "Role",
              colorKey: "amber" as ColorKey,
              collapsed: false,
              points: [{ id: uid(), text }],
            },
            ...sections,
          ]
        }
        return sections.map((s, i) => {
          if (i !== index) return s
          if (s.points.length === 0) {
            return { ...s, points: [{ id: uid(), text }] }
          }
          return {
            ...s,
            points: s.points.map((p, pi) => (pi === 0 ? { ...p, text } : p)),
          }
        })
      }),

    addSection: (tab) =>
      patchSections(tab, (sections) => [
        ...sections,
        {
          id: uid(),
          name: `Section ${sections.length + 1}`,
          colorKey: SECTION_COLOR_ORDER[sections.length % SECTION_COLOR_ORDER.length],
          collapsed: false,
          points: [{ id: uid(), text: "" }],
        },
      ]),

    renameSection: (tab, sectionId, name) =>
      patchSections(tab, (sections) =>
        sections.map((s) => (s.id === sectionId ? { ...s, name } : s))
      ),

    cycleSectionColor: (tab, sectionId) =>
      patchSections(tab, (sections) =>
        sections.map((s) => {
          if (s.id !== sectionId) return s
          const next =
            SECTION_COLOR_ORDER[
              (SECTION_COLOR_ORDER.indexOf(s.colorKey) + 1) % SECTION_COLOR_ORDER.length
            ]
          return { ...s, colorKey: next }
        })
      ),

    toggleSection: (tab, sectionId) =>
      patchSections(tab, (sections) =>
        sections.map((s) => (s.id === sectionId ? { ...s, collapsed: !s.collapsed } : s))
      ),

    deleteSection: (tab, sectionId) =>
      patchSections(tab, (sections) => sections.filter((s) => s.id !== sectionId)),

    addPiece: (tab, sectionId, text = "", title = "") =>
      patchSections(tab, (sections) =>
        sections.map((s) =>
          s.id === sectionId
            ? {
                ...s,
                collapsed: false,
                points: [...s.points, { id: uid(), text: text || `# ${title}\n` }],
              }
            : s
        )
      ),

    updatePiece: (tab, sectionId, pointId, text) =>
      patchSections(tab, (sections) =>
        sections.map((s) =>
          s.id === sectionId
            ? {
                ...s,
                points: s.points.map((p: PromptPoint) =>
                  p.id === pointId ? { ...p, text } : p
                ),
              }
            : s
        )
      ),

    deletePiece: (tab, sectionId, pointId) =>
      patchSections(tab, (sections) =>
        sections.map((s) =>
          s.id === sectionId
            ? { ...s, points: s.points.filter((p) => p.id !== pointId) }
            : s
        )
      ),

    movePiece: (tab, sectionId, from, to) =>
      patchSections(tab, (sections) =>
        sections.map((s) => {
          if (s.id !== sectionId) return s
          if (to < 0 || to >= s.points.length) return s
          const points = [...s.points]
          const [moved] = points.splice(from, 1)
          points.splice(to, 0, moved)
          return { ...s, points }
        })
      ),

    resetToSample: () => {
      const starter = starterSections()
      patchActive((doc) => ({
        ...doc,
        baseSections: starter.baseSections,
        midtaskSections: starter.midtaskSections,
      }))
    },
  }
})

export function useActiveDoc(): PromptDoc | null {
  return usePromptStore((state) => {
    if (!state.activeDocId) return null
    return state.docs.find((doc) => doc.id === state.activeDocId) ?? null
  })
}

export function useComposedText(): string {
  const doc = useActiveDoc()
  if (!doc) return ""
  return composeDocument(doc)
}

export { composeDocument, totalPoints }
