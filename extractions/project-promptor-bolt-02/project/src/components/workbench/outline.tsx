import { FileText, Hash, Layers, ListChecks } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { usePromptStore, type TabKey } from "@/store/prompt-store"
import { SECTION_COLORS } from "@/lib/types"
import { cn } from "@/lib/utils"

interface OutlineProps {
  tab: TabKey
  onJump: (sectionId: string) => void
}

export function Outline({ tab, onJump }: OutlineProps) {
  const doc = usePromptStore((state) => {
    const found = state.docs.find((d) => d.id === state.activeDocId)
    return found ?? null
  })
  const store = usePromptStore()

  if (!doc) {
    return (
      <aside className="hidden w-56 shrink-0 border-r border-border/60 px-3 py-4 xl:block">
        <div className="h-4 w-24 animate-pulse rounded bg-muted" />
      </aside>
    )
  }

  const sections = tab === "base" ? doc.baseSections : doc.midtaskSections
  const totalInstructions = sections.reduce(
    (sum, section) => sum + section.points.filter((p) => p.text.trim()).length,
    0
  )

  return (
    <aside className="hidden w-56 shrink-0 flex-col gap-4 border-r border-border/60 px-3 py-4 xl:flex">
      <div className="space-y-2 px-1">
        <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
          <FileText className="size-3.5" />
          Document
        </div>
        <p className="truncate text-sm font-medium tracking-tight text-foreground">
          {doc.title}
        </p>
        <div className="flex flex-wrap gap-1.5">
          <Badge variant="secondary" className="gap-1">
            <Layers />
            {sections.length} sections
          </Badge>
          <Badge variant="secondary" className="gap-1">
            <ListChecks />
            {totalInstructions} rules
          </Badge>
        </div>
      </div>

      <Separator />

      <div className="flex min-h-0 flex-1 flex-col gap-1.5">
        <span className="px-1 text-xs font-medium text-muted-foreground">Outline</span>
        <div className="min-h-0 flex-1 space-y-0.5 overflow-y-auto">
          {sections.length === 0 && (
            <p className="px-1 text-xs text-muted-foreground/70">
              No sections yet. Add one to get started.
            </p>
          )}
          {sections.map((section) => {
            const colors = SECTION_COLORS[section.colorKey]
            const count = section.points.filter((p) => p.text.trim()).length
            return (
              <button
                key={section.id}
                type="button"
                onClick={() => onJump(section.id)}
                className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-[13px] text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
              >
                <span className={cn("size-1.5 shrink-0 rounded-full", colors.dot)} />
                <span className="min-w-0 flex-1 truncate">{section.name}</span>
                {count > 0 && (
                  <span className="font-mono text-[11px] text-muted-foreground/60">
                    {count}
                  </span>
                )}
              </button>
            )
          })}
        </div>
      </div>

      <Separator />

      <div className="space-y-1 px-1">
        <p className="text-xs text-muted-foreground">Quick actions</p>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-start text-muted-foreground"
              onClick={() => store.addSection(tab)}
            >
              <Hash />
              New section
            </Button>
          </TooltipTrigger>
          <TooltipContent side="right">Append a custom section</TooltipContent>
        </Tooltip>
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-start text-muted-foreground"
          onClick={() => store.resetToSample()}
        >
          <ListChecks />
          Load sample rules
        </Button>
      </div>
    </aside>
  )
}
