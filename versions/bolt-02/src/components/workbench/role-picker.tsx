import * as React from "react"
import { Check, UserRound, UserRoundPlus } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { splitRules, useLibrary } from "@/hooks/use-library"
import { SECTION_COLORS } from "@/lib/types"
import { cn } from "@/lib/utils"

interface RolePickerProps {
  activeRoleText: string
  onApply: (text: string) => void
}

export function RolePicker({ activeRoleText, onApply }: RolePickerProps) {
  const [open, setOpen] = React.useState(false)
  const [query, setQuery] = React.useState("")
  const { roles, loading } = useLibrary("base", query)
  const colors = SECTION_COLORS.amber

  const current = activeRoleText.trim()

  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-2 border-b border-border/60 bg-muted/20 px-4 py-3">
      <span className={cn("size-2 shrink-0 rounded-full", colors.dot)} />

      <span className="text-[11px] font-semibold tracking-wider text-muted-foreground uppercase">
        Acting as
      </span>

      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            role="combobox"
            aria-expanded={open}
            aria-label="Choose the role for this prompt"
            className="h-8 max-w-full justify-start gap-2 font-normal"
          >
            <UserRound className="text-muted-foreground" />
            <span className="max-w-[26rem] truncate text-left">
              {current || "Choose a role for this prompt"}
            </span>
          </Button>
        </PopoverTrigger>
        <PopoverContent align="start" className="w-[26rem] p-0">
          <Command>
            <CommandInput
              placeholder="Search roles…"
              value={query}
              onValueChange={setQuery}
            />
            <CommandList>
              <CommandEmpty>
                <div className="flex flex-col items-center gap-2 py-6 text-center">
                  <p className="text-sm text-muted-foreground">
                    No role matches “{query}”
                  </p>
                  <Button
                    size="xs"
                    variant="outline"
                    onClick={() => {
                      onApply(`Act as a ${query.trim() || "helpful expert"}`)
                      setOpen(false)
                      setQuery("")
                    }}
                  >
                    Use “{query.trim() || "helpful expert"}” as a custom role
                  </Button>
                </div>
              </CommandEmpty>
              <CommandGroup heading="Role presets">
                {loading && (
                  <CommandItem disabled value="loading">
                    Loading roles…
                  </CommandItem>
                )}
                {roles.map((role) => {
                  const label = splitRules(role.content)[0] ?? role.title
                  const isCurrent = current === label
                  return (
                    <CommandItem
                      key={role.id}
                      value={`${role.title} ${role.topic} ${role.content}`}
                      onSelect={() => {
                        onApply(label)
                        setOpen(false)
                        setQuery("")
                      }}
                    >
                      <UserRoundPlus />
                      <div className="min-w-0">
                        <p className="truncate text-[13px] font-medium text-foreground">
                          {role.title}
                        </p>
                        <p className="truncate text-xs text-muted-foreground">
                          {label}
                        </p>
                      </div>
                      {isCurrent && <Check className="ml-auto" />}
                    </CommandItem>
                  )
                })}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      {current && (
        <Button
          variant="ghost"
          size="xs"
          className="text-muted-foreground"
          onClick={() => onApply("")}
        >
          Clear role
        </Button>
      )}
    </div>
  )
}
