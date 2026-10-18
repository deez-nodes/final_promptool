import * as React from "react"
import { Hash, Lightbulb, Sparkles } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { Outline } from "@/components/workbench/outline"
import { RightRail } from "@/components/workbench/right-rail"
import { RolePicker } from "@/components/workbench/role-picker"
import { SectionCard } from "@/components/workbench/section-card"
import { usePromptStore, type TabKey } from "@/store/prompt-store"

function findRoleSectionId(
  sections: { id: string; name: string }[]
): string {
  const role = sections.find(
    (section) => section.name.trim().toLowerCase() === "role"
  )
  return role?.id ?? sections[0]?.id ?? ""
}

export function EditorPanel({
  tab,
  onTabChange,
  composed,
}: {
  tab: TabKey
  onTabChange: (tab: TabKey) => void
  composed: string
}) {
  const doc = usePromptStore((state) =>
    state.docs.find((d) => d.id === state.activeDocId)
  )
  const error = usePromptStore((state) => state.error)
  const addSection = usePromptStore((state) => state.addSection)
  const setRole = usePromptStore((state) => state.setRole)
  const sectionRefs = React.useRef<Record<string, HTMLDivElement | null>>({})

  const sections = doc
    ? tab === "base"
      ? doc.baseSections
      : doc.midtaskSections
    : []
  const midtaskCount = doc?.midtaskSections.length ?? 0

  const roleSection = doc?.baseSections.find(
    (section) => section.name.trim().toLowerCase() === "role"
  )
  const activeRoleText = roleSection?.points[0]?.text ?? ""

  const targetSectionId =
    tab === "base"
      ? findRoleSectionId(sections)
      : (sections[0]?.id ?? "")

  const jump = (sectionId: string) => {
    sectionRefs.current[sectionId]?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    })
  }

  if (!doc) {
    return (
      <div className="flex min-h-0 flex-1 flex-col gap-3 p-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={index}
            className="h-24 animate-pulse rounded-xl border border-border/60 bg-muted/40"
          />
        ))}
      </div>
    )
  }

  return (
    <div className="flex min-h-0 flex-1">
      <Outline tab={tab} onJump={jump} />

      <main className="flex min-w-0 flex-1 flex-col">
        <div className="flex flex-wrap items-center gap-3 border-b border-border/60 px-4 py-3">
          <Tabs value={tab} onValueChange={(value) => onTabChange(value as TabKey)}>
            <TabsList>
              <TabsTrigger value="base">Base prompt</TabsTrigger>
              <TabsTrigger value="midtask">
                Mid-task
                {midtaskCount > 0 && (
                  <span className="ml-1.5 font-mono text-[10px] text-muted-foreground">
                    {midtaskCount}
                  </span>
                )}
              </TabsTrigger>
            </TabsList>
          </Tabs>

          <p className="hidden text-xs text-muted-foreground xl:block">
            {tab === "base"
              ? "The standing brief the model reads before every task."
              : "Playbooks injected while work is already in progress."}
          </p>

          <div className="ml-auto flex items-center gap-2">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" size="sm" className="lg:hidden">
                  <Sparkles />
                  Library
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="flex w-full flex-col p-0 sm:max-w-md">
                <SheetHeader className="border-b border-border/60 px-4 py-3">
                  <SheetTitle className="text-sm">Rule library</SheetTitle>
                  <SheetDescription className="text-xs">
                    Tap any rule to add it to your prompt.
                  </SheetDescription>
                </SheetHeader>
                <RightRail
                  tab={tab}
                  sectionId={targetSectionId}
                  composed={composed}
                  embedded
                />
              </SheetContent>
            </Sheet>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" size="sm" onClick={() => addSection(tab)}>
                  <Hash />
                  Add section
                </Button>
              </TooltipTrigger>
              <TooltipContent>Append an empty section to this tab</TooltipContent>
            </Tooltip>
          </div>
        </div>

        {tab === "base" && (
          <RolePicker
            activeRoleText={activeRoleText}
            onApply={(text) => setRole("base", text)}
          />
        )}

        {error && (
          <div className="border-b border-destructive/30 bg-destructive/10 px-4 py-2 text-xs text-destructive">
            Your changes could not be saved: {error}. We will retry as you keep
            typing.
          </div>
        )}

        <div className="min-h-0 flex-1 overflow-y-auto">
          <div className="mx-auto flex w-full max-w-3xl flex-col gap-3 p-4">
            {sections.length === 0 ? (
              <div className="flex flex-col items-center gap-4 rounded-xl border border-dashed border-border px-6 py-14 text-center">
                <Lightbulb className="size-6 text-muted-foreground" />
                <div className="space-y-1">
                  <p className="text-sm font-medium text-foreground">
                    This tab is empty
                  </p>
                  <p className="max-w-sm text-xs text-muted-foreground">
                    Add a section to start composing, or pull ready-made rules
                    from the library.
                  </p>
                </div>
                <Button size="sm" onClick={() => addSection(tab)}>
                  <Hash />
                  Add your first section
                </Button>
              </div>
            ) : (
              sections.map((section) => (
                <div
                  key={section.id}
                  ref={(node) => {
                    sectionRefs.current[section.id] = node
                  }}
                  className="scroll-mt-4"
                >
                  <SectionCard section={section} tab={tab} />
                </div>
              ))
            )}
          </div>
        </div>
      </main>

      <RightRail tab={tab} sectionId={targetSectionId} composed={composed} />
    </div>
  )
}
