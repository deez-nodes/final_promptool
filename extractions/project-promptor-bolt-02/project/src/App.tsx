import * as React from "react"
import { ClipboardCopy, Layers, Lightbulb, Sparkles } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarRail,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { TooltipProvider } from "@/components/ui/tooltip"
import { Toaster } from "@/components/ui/sonner"
import { EditorPanel } from "@/components/workbench/editor-panel"
import { DocSwitcher } from "@/components/workbench/doc-switcher"
import { TopBar } from "@/components/workbench/top-bar"
import { usePromptStore, type TabKey } from "@/store/prompt-store"
import { composeDocument, copyToClipboard, estimateTokens } from "@/lib/prompt-format"

function NavSidebar() {
  return (
    <Sidebar collapsible="offcanvas">
      <SidebarHeader className="gap-3 px-3 py-4">
        <div className="flex items-center gap-2.5">
          <div className="grid size-8 place-items-center rounded-lg bg-foreground text-background">
            <span className="text-sm font-bold tracking-tighter">PO</span>
          </div>
          <div className="leading-none">
            <p className="text-sm font-semibold tracking-tight text-sidebar-foreground">
              PromptOR
            </p>
            <p className="mt-1 text-[11px] text-muted-foreground">
              compose, reuse, ship
            </p>
          </div>
        </div>
      </SidebarHeader>

      <Separator />

      <SidebarContent className="px-1">
        <SidebarGroup>
          <SidebarGroupLabel>Workspace</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton isActive tooltip="Composer">
                  <Layers />
                  <span>Composer</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton tooltip="Library">
                  <Sparkles />
                  <span>Library</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton tooltip="Tips">
                  <Lightbulb />
                  <span>Prompt tips</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <DocSwitcher />
      </SidebarContent>

      <SidebarFooter className="px-3 py-3 text-[11px] text-muted-foreground">
        Every edit saves automatically.
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}

export function App() {
  const loadDocs = usePromptStore((state) => state.loadDocs)
  const docs = usePromptStore((state) => state.docs)
  const activeDocId = usePromptStore((state) => state.activeDocId)
  const status = usePromptStore((state) => state.status)
  const [tab, setTab] = React.useState<TabKey>("base")

  React.useEffect(() => {
    void loadDocs()
  }, [loadDocs])

  const activeDoc = docs.find((doc) => doc.id === activeDocId) ?? null
  const composed = activeDoc ? composeDocument(activeDoc) : ""

  const copyAll = async () => {
    const ok = await copyToClipboard(composed)
    if (ok) {
      toast.success("Full prompt copied", {
        description: `${estimateTokens(composed)} tokens written to your clipboard.`,
      })
    } else {
      toast.error("Could not copy", {
        description: "Nothing to copy yet, or clipboard access was blocked.",
      })
    }
  }

  return (
    <TooltipProvider delayDuration={300}>
      <SidebarProvider>
        <NavSidebar />
        <SidebarInset className="flex min-h-svh flex-col overflow-hidden">
          <div className="flex h-10 shrink-0 items-center gap-2 border-b border-border/60 bg-muted/30 px-2 text-xs text-muted-foreground md:hidden">
            <SidebarTrigger />
            <span className="font-medium">PromptOR</span>
          </div>

          <TopBar docTitle={activeDoc?.title ?? ""} composed={composed} />

          <div className="flex min-h-0 flex-1 flex-col">
            {status === "error" && !activeDoc && (
              <div className="flex flex-1 flex-col items-center justify-center gap-3 p-8 text-center">
                <p className="text-sm font-medium text-foreground">
                  We could not reach your workspace
                </p>
                <Button size="sm" onClick={() => void loadDocs()}>
                  Try again
                </Button>
              </div>
            )}
            <EditorPanel tab={tab} onTabChange={setTab} composed={composed} />
          </div>

          <div className="hidden items-center justify-end gap-2 border-t border-border/60 px-4 py-2 md:flex">
            <span className="text-[11px] text-muted-foreground">
              Ready to use
            </span>
            <Button size="sm" variant="outline" onClick={copyAll}>
              <ClipboardCopy />
              Copy everything
            </Button>
          </div>
        </SidebarInset>
      </SidebarProvider>
      <Toaster position="bottom-right" />
    </TooltipProvider>
  )
}

export default App
