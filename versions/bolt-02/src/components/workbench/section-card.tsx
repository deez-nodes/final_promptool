import { ChevronDown, GripVertical, Plus, Trash2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { PromptPointEditor } from "@/components/workbench/prompt-point-editor"
import { usePromptStore, type TabKey } from "@/store/prompt-store"
import { SECTION_COLORS, type PromptSection } from "@/lib/types"
import { cn } from "@/lib/utils"

interface SectionCardProps {
  section: PromptSection
  tab: TabKey
}

export function SectionCard({ section, tab }: SectionCardProps) {
  const colors = SECTION_COLORS[section.colorKey]
  const store = usePromptStore()

  return (
    <section
      className={cn(
        "group/card rounded-xl border border-border/70 bg-card/60 transition-colors",
        "hover:border-border focus-within:border-ring/40"
      )}
    >
      <header className="flex items-center gap-2 px-3 py-2.5">
        <GripVertical className="size-3.5 shrink-0 cursor-grab text-muted-foreground/40" />
        <button
          type="button"
          aria-label={`Change colour of ${section.name}`}
          onClick={() => store.cycleSectionColor(tab, section.id)}
          className="relative grid size-4 shrink-0 place-items-center"
        >
          <span className={cn("absolute size-4 rounded-full opacity-70", colors.glow)} />
          <span className={cn("relative size-2 rounded-full", colors.dot)} />
        </button>
        <input
          aria-label="Section name"
          value={section.name}
          onChange={(event) => store.renameSection(tab, section.id, event.target.value)}
          className="min-w-0 flex-1 truncate bg-transparent text-[13px] font-medium tracking-tight text-foreground outline-none placeholder:text-muted-foreground placeholder:font-normal"
          placeholder="Section name"
        />
        <Button
          variant="ghost"
          size="icon-xs"
          aria-label="Delete section"
          className="opacity-0 transition-opacity group-hover/card:opacity-100 focus-visible:opacity-100"
          onClick={() => store.deleteSection(tab, section.id)}
        >
          <Trash2 />
        </Button>
        <Button
          variant="ghost"
          size="icon-xs"
          aria-label={section.collapsed ? "Expand section" : "Collapse section"}
          onClick={() => store.toggleSection(tab, section.id)}
        >
          <ChevronDown
            className={cn("transition-transform", section.collapsed && "-rotate-90")}
          />
        </Button>
      </header>

      {!section.collapsed && (
        <div className="space-y-0.5 px-1 pb-2">
          {section.points.map((point) => (
            <PromptPointEditor
              key={point.id}
              text={point.text}
              autoFocus={point.text === ""}
              onChange={(text) => store.updatePiece(tab, section.id, point.id, text)}
              onDelete={() => store.deletePiece(tab, section.id, point.id)}
            />
          ))}
          <Button
            variant="ghost"
            size="sm"
            className="ml-2 text-muted-foreground hover:text-foreground"
            onClick={() => store.addPiece(tab, section.id)}
          >
            <Plus />
            Add instruction
          </Button>
        </div>
      )}
    </section>
  )
}
