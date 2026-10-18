import * as React from "react"
import { Braces, Copy, Plus, Search, Sparkles } from "lucide-react"
import { toast } from "sonner"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { splitRules, useLibrary } from "@/hooks/use-library"
import { copyToClipboard, estimateTokens } from "@/lib/prompt-format"
import { usePromptStore, type TabKey } from "@/store/prompt-store"
import { cn } from "@/lib/utils"

const GROUP_LABELS: Record<string, string> = {
  role: "Roles",
  context: "Context",
  instruction: "Instructions",
  constraint: "Constraints",
  midtask: "Mid-task playbooks",
}

const GROUP_ORDER = ["role", "context", "instruction", "constraint", "midtask"]

function LibraryList({
  tab,
  sectionId,
}: {
  tab: TabKey
  sectionId: string
}) {
  const [query, setQuery] = React.useState("")
  const { items, loading, error } = useLibrary(tab, query)
  const addPiece = usePromptStore((state) => state.addPiece)

  const grouped = GROUP_ORDER.map((category) => ({
    category,
    entries: items.filter((item) => item.category === category),
  })).filter((group) => group.entries.length > 0)

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="relative px-3 pt-3 pb-2">
        <Search className="pointer-events-none absolute top-1/2 left-5.5 size-3.5 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search rules…"
          className="h-9 pl-8"
        />
      </div>

      {error && (
        <p className="mx-3 mb-2 rounded-md border border-destructive/30 bg-destructive/10 px-2.5 py-2 text-xs text-destructive">
          Could not load the library.
        </p>
      )}

      <ScrollArea className="min-h-0 flex-1">
        <div className="space-y-3 px-3 pb-3">
          {loading &&
            Array.from({ length: 4 }).map((_, index) => (
              <div
                key={index}
                className="h-14 animate-pulse rounded-lg border border-border/60 bg-muted/40"
              />
            ))}

          {!loading && grouped.length === 0 && (
            <p className="rounded-lg border border-dashed border-border px-3 py-6 text-center text-xs text-muted-foreground">
              Nothing matches “{query}”.
            </p>
          )}

          {!loading &&
            grouped.map((group) => (
              <div key={group.category} className="space-y-1.5">
                <p className="px-1 text-[11px] font-semibold tracking-wider text-muted-foreground uppercase">
                  {GROUP_LABELS[group.category]}
                </p>
                {group.entries.map((item) => {
                  const rules = splitRules(item.content)
                  return (
                    <button
                      key={item.id}
                      type="button"
                      disabled={!sectionId}
                      onClick={() => {
                        if (!sectionId) return
                        rules.forEach((rule) => addPiece(tab, sectionId, rule))
                        toast.success(`Added ${item.title}`, {
                          description: `${rules.length} ${
                            rules.length === 1 ? "rule" : "rules"
                          } inserted.`,
                        })
                      }}
                      className={cn(
                        "group/item w-full rounded-lg border border-border/60 bg-card/50 p-2.5 text-left transition-colors",
                        "hover:border-border hover:bg-accent/50 disabled:cursor-not-allowed disabled:opacity-50"
                      )}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <span className="text-[13px] font-medium text-foreground">
                          {item.title}
                        </span>
                        <Plus className="mt-0.5 size-3.5 shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover/item:opacity-100" />
                      </div>
                      <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">
                        {rules[0]}
                      </p>
                      {rules.length > 1 && (
                        <Badge variant="secondary" className="mt-1.5">
                          +{rules.length - 1} more
                        </Badge>
                      )}
                    </button>
                  )
                })}
              </div>
            ))}
        </div>
      </ScrollArea>
    </div>
  )
}

function OutputPane({ text }: { text: string }) {
  const handleCopy = async () => {
    const ok = await copyToClipboard(text)
    if (ok) {
      toast.success("Prompt copied", {
        description: `${estimateTokens(text)} tokens ready to paste.`,
      })
    } else {
      toast.error("Nothing to copy yet")
    }
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="flex items-center justify-between px-3 py-2.5">
        <span className="font-mono text-[11px] text-muted-foreground">
          {text.length} chars · {estimateTokens(text)} tok
        </span>
        <Button
          size="xs"
          variant="outline"
          onClick={handleCopy}
          disabled={!text.trim()}
        >
          <Copy />
          Copy
        </Button>
      </div>
      <ScrollArea className="min-h-0 flex-1">
        {text.trim() ? (
          <pre className="px-3 pb-4 font-mono text-[12px] leading-6 whitespace-pre-wrap text-foreground/80">
            {text}
          </pre>
        ) : (
          <p className="mx-3 rounded-lg border border-dashed border-border px-3 py-6 text-center text-xs text-muted-foreground">
            Your composed prompt appears here as you write.
          </p>
        )}
      </ScrollArea>
    </div>
  )
}

export function RightRail({
  tab,
  sectionId,
  composed,
  embedded = false,
}: {
  tab: TabKey
  sectionId: string
  composed: string
  embedded?: boolean
}) {
  return (
    <aside
      className={cn(
        "min-h-0 flex-col border-border/60",
        embedded
          ? "flex flex-1 border-t"
          : "hidden w-80 shrink-0 border-l bg-muted/20 lg:flex"
      )}
    >
      <Tabs defaultValue="library" className="min-h-0 flex-1 gap-0">
        <div className="border-b border-border/60 px-3 py-2">
          <TabsList className="w-full">
            <TabsTrigger value="library">
              <Sparkles />
              Library
            </TabsTrigger>
            <TabsTrigger value="output">
              <Braces />
              Output
            </TabsTrigger>
          </TabsList>
        </div>
        <TabsContent
          value="library"
          className="flex min-h-0 flex-col data-[state=inactive]:hidden"
        >
          <LibraryList tab={tab} sectionId={sectionId} />
        </TabsContent>
        <TabsContent
          value="output"
          className="flex min-h-0 flex-col data-[state=inactive]:hidden"
        >
          <OutputPane text={composed} />
        </TabsContent>
      </Tabs>
    </aside>
  )
}
