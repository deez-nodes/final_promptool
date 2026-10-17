import * as React from "react"
import { Bold, Italic, Tag, X } from "lucide-react"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface PromptPointEditorProps {
  text: string
  onChange: (text: string) => void
  onDelete: () => void
  autoFocus?: boolean
}

export function PromptPointEditor({
  text,
  onChange,
  onDelete,
  autoFocus = false,
}: PromptPointEditorProps) {
  const ref = React.useRef<HTMLDivElement>(null)
  const focusedRef = React.useRef(false)

  React.useEffect(() => {
    const node = ref.current
    if (!node) return
    if (focusedRef.current) return
    if (node.innerText !== text) {
      node.innerText = text
    }
  }, [text])

  React.useEffect(() => {
    if (autoFocus) ref.current?.focus()
  }, [autoFocus])

  return (
    <div className="group/point relative flex items-start gap-2 rounded-lg px-3 py-2 transition-colors hover:bg-accent/40">
      <span className="mt-1.5 font-mono text-xs text-muted-foreground/60">·</span>
      <div
        ref={ref}
        role="textbox"
        aria-label="Prompt instruction"
        contentEditable
        suppressContentEditableWarning
        spellCheck={false}
        onFocus={() => {
          focusedRef.current = true
        }}
        onBlur={() => {
          focusedRef.current = false
          onChange(ref.current?.innerText.replace(/\n$/, "") ?? "")
        }}
        onInput={() => {
          const value = ref.current?.innerText.replace(/\n$/, "") ?? ""
          onChange(value)
        }}
        data-placeholder="Describe a single rule, constraint, or instruction…"
        className={cn(
          "min-h-6 flex-1 rounded-sm bg-transparent text-[13px] leading-6 text-foreground/90 outline-none",
          "empty:before:pointer-events-none empty:before:text-muted-foreground/50 empty:before:content-[attr(data-placeholder)]"
        )}
      />
      <div className="flex items-center gap-0.5 opacity-0 transition-opacity group-hover/point:opacity-100 focus-within:opacity-100">
        <Button
          variant="ghost"
          size="icon-xs"
          aria-label="Bold"
          onMouseDown={(event) => event.preventDefault()}
          onClick={() => {
            ref.current?.focus()
            document.execCommand("bold")
            onChange(ref.current?.innerText ?? "")
          }}
        >
          <Bold />
        </Button>
        <Button
          variant="ghost"
          size="icon-xs"
          aria-label="Italic"
          onMouseDown={(event) => event.preventDefault()}
          onClick={() => {
            ref.current?.focus()
            document.execCommand("italic")
            onChange(ref.current?.innerText ?? "")
          }}
        >
          <Italic />
        </Button>
        <Button
          variant="ghost"
          size="icon-xs"
          aria-label="Wrap as tag"
          onMouseDown={(event) => event.preventDefault()}
          onClick={() => {
            const current = ref.current?.innerText.trim() ?? ""
            if (current.startsWith("<")) return
            onChange(`<${current}>`)
          }}
        >
          <Tag />
        </Button>
        <Button
          variant="ghost"
          size="icon-xs"
          aria-label="Remove instruction"
          className="text-muted-foreground hover:text-destructive"
          onClick={onDelete}
        >
          <X />
        </Button>
      </div>
    </div>
  )
}
