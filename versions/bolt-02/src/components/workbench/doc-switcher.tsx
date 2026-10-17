import { FilePlus2, FileText, MoreHorizontal } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { usePromptStore } from "@/store/prompt-store"

export function DocSwitcher() {
  const docs = usePromptStore((state) => state.docs)
  const activeDocId = usePromptStore((state) => state.activeDocId)
  const selectDoc = usePromptStore((state) => state.selectDoc)
  const createDoc = usePromptStore((state) => state.createDoc)
  const deleteDoc = usePromptStore((state) => state.deleteDoc)

  return (
    <SidebarGroup>
      <SidebarGroupLabel className="justify-between">
        Saved prompts
        <Button
          variant="ghost"
          size="icon-xs"
          aria-label="New prompt"
          onClick={() => void createDoc()}
        >
          <FilePlus2 />
        </Button>
      </SidebarGroupLabel>
      <SidebarMenu>
        {docs.length === 0 && (
          <SidebarMenuItem>
            <SidebarMenuButton disabled>
              <FileText />
              <span>No prompts yet</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        )}
        {docs.map((doc) => (
          <SidebarMenuItem key={doc.id}>
            <SidebarMenuButton
              isActive={doc.id === activeDocId}
              onClick={() => selectDoc(doc.id)}
              className="pr-7"
            >
              <FileText />
              <span className="truncate">{doc.title || "Untitled prompt"}</span>
            </SidebarMenuButton>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuAction showOnHover aria-label="Prompt options">
                  <MoreHorizontal />
                </SidebarMenuAction>
              </DropdownMenuTrigger>
              <DropdownMenuContent side="right" align="start">
                <DropdownMenuItem onClick={() => void createDoc()}>
                  Duplicate a blank prompt
                </DropdownMenuItem>
                <DropdownMenuItem
                  variant="destructive"
                  onClick={() => void deleteDoc(doc.id)}
                >
                  Delete prompt
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        ))}
      </SidebarMenu>
    </SidebarGroup>
  )
}
