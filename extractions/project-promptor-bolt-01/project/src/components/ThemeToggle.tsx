"use client"

import { useEffect, useState } from "react"
import { Icon, VisuallyHidden } from "@chakra-ui/react"
import { LuMoon, LuSun, LuMonitor } from "react-icons/lu"
import { useTheme } from "next-themes"
import { SegmentedControl } from "@/components/ui/segmented-control"
import { withThemeTransition } from "@/lib/theme-transition"

const OPTIONS = [
  { value: "light", label: "Light", icon: <LuSun /> },
  { value: "dark", label: "Dark", icon: <LuMoon /> },
  { value: "system", label: "System", icon: <LuMonitor /> },
] as const

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => setMounted(true), [])

  // next-themes resolves the stored preference after mount. Rendering the
  // resolved value beforehand avoids a hydration mismatch and a jump in the
  // indicator position.
  const current = mounted ? (theme ?? "system") : "system"

  return (
    <SegmentedControl
      size="sm"
      value={current}
      onValueChange={({ value }) =>
        value && withThemeTransition(() => setTheme(value))
      }
      aria-label="Color theme"
      items={OPTIONS.map((option) => ({
        value: option.value,
        label: (
          <>
            <Icon boxSize="4">{option.icon}</Icon>
            <VisuallyHidden>{option.label}</VisuallyHidden>
          </>
        ),
      }))}
    />
  )
}
