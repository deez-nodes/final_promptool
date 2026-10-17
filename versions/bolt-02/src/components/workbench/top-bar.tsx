import { Check, CloudOff, Copy, Loader2, Menu, Trash2 } from "lucide-react"
import { toast } from "sonner"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { ModeToggle } from "@/components/mode-toggle"
import { usePromptStore } from "@/store/prompt-store"
import { copyToClipboard, estimateTokens } from "@/lib/prompt-format"
import { useSidebar } from "@/components/ui/sidebar"

function StatusPill() {
  const status = usePromptStore((state) => state.status)
  const error = usePromptStore((state) => state.error)

  if (status === "error") {
    return (
      <Badge variant="destructive" className="gap-1.5">
        <CloudOff />
        {error ? "Connection failed" : "Save failed"}
      </Badge>
    )
  }

  const map = {
    loading: { icon: <Loader2 className="animate-spin" />, label: "Loading" },
    saving: { icon: <Loader2 className="animate-spin" />, label: "Saving" },
    saved: { icon: <Check />, label: "Saved" },
    idle: { icon: <Check />, label: "Ready" },
  } as const

  const current = map[status as keyof typeof map] ?? map.idle
  return (
    <Badge variant="secondary" className="gap-1.5">
      {current.icon}
      {current.label}
    </Badge>
  )
}

interface TopBarProps {
  docTitle: string
  composed: string
}

export function TopBar({ docTitle, composed }: TopBarProps) {
  const renameDoc = usePromptStore((state) => state.renameDoc)
  const deleteDoc = usePromptStore((state) => state.deleteDoc)
  const activeDocId = usePromptStore((state) => state.activeDocId)
  const docCount = usePromptStore((state) => state.docs.length)
  const { toggleSidebar } = useSidebar()

  const handleCopy = async () => {
    if (!composed.trim()) {
      toast.error("Nothing to copy yet", {
        description: "Add at least one instruction to a section first.",
      })
      return
    }
    const ok = await copyToClipboard(composed)
    if (ok) {
      toast.success("Prompt copied", {
        description: `${estimateTokens(composed)} tokens ready to paste.`,
      })
    } else {
      toast.error("Could not copy", {
        description: "Your browser blocked clipboard access.",
      })
    }
  }

  return (
    <header className="sticky top-0 z-30 flex h-14 shrink-0 items-center gap-3 border-b border-border/60 bg-background/80 px-3 backdrop-blur-xl sm:px-4">
      <Button
        variant="ghost"
        size="icon-sm"
        className="md:hidden"
        aria-label="Toggle prompt list"
        onClick={toggleSidebar}
      >
        <Menu />
      </Button>

      <div className="flex items-center gap-2.5">
        <div className="grid size-7 place-items-center rounded-md bg-foreground text-background">
          <span className="text-xs font-bold tracking-tighter">PO</span>
        </div>
        <div className="hidden leading-none sm:block">
          <p className="text-[13px] font-semibold tracking-tight text-foreground">
            PromptOR
          </p>
          <p className="mt-0.5 text-[10px] text-muted-foreground">
            prompt composition desk
          </p>
        </div>
      </div>

      <div className="mx-1 hidden h-6 w-px bg-border sm:block" />

      <input
        aria-label="Prompt name"
        value={docTitle}
        onChange={(event) => renameDoc(event.target.value)}
        placeholder="Untitled prompt"
        className="min-w-0 max-w-[9rem] flex-1 truncate rounded-md bg-transparent px-1.5 py-1 text-sm font-medium tracking-tight text-foreground outline-none transition-colors placeholder:text-muted-foreground focus-visible:bg-muted sm:max-w-xs"
      />

      <div className="ml-auto flex items-center gap-2">
        <span className="hidden sm:inline-flex">
          <StatusPill />
        </span>
        <span className="hidden font-mono text-[11px] text-muted-foreground lg:inline">
          {composed.length} chars · {estimateTokens(composed)} tok
        </span>
        <ModeToggle />
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              variant="ghost"
              size="icon-sm"
              aria-label="Delete prompt"
              className="text-muted-foreground hover:text-destructive"
              disabled={!activeDocId}
            >
              <Trash2 />
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent size="sm">
            <AlertDialogHeader>
              <AlertDialogTitle>Delete this prompt?</AlertDialogTitle>
              <AlertDialogDescription>
                “{docTitle || "Untitled prompt"}” and its instructions will be
                removed permanently.{" "}
                {docCount <= 1
                  ? "A fresh empty prompt will take its place."
                  : "This cannot be undone."}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Keep it</AlertDialogCancel>
              <AlertDialogAction
                variant="destructive"
                onClick={() => activeDocId && void deleteDoc(activeDocId)}
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
        <Button onClick={handleCopy} className="gap-1.5">
          <Copy />
          <span className="hidden sm:inline">Copy prompt</span>
        </Button>
      </div>
    </header>
  )
}
