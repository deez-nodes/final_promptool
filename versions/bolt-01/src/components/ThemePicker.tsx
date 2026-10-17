"use client"

import { useEffect, useMemo, useState } from "react"
import {
  Box,
  Button,
  HStack,
  Icon,
  Input,
  Text,
  VStack,
} from "@chakra-ui/react"
import { LuPalette, LuSearch, LuCheck } from "react-icons/lu"
import {
  MenuContent,
  MenuRoot,
  MenuTrigger,
} from "@/components/ui/menu"
import { withThemeTransition } from "@/lib/theme-transition"
import {
  PALETTES,
  PALETTE_GROUPS,
  applyPalette,
  readStoredPalette,
  type Palette,
} from "@/lib/palettes"

// Three-swatch preview: background, surface and accent.
function PaletteSwatch({ palette, size = "3" }: { palette: Palette; size?: string }) {
  const colors = [
    palette.dark.bg,
    palette.dark.surface,
    palette.dark.accent,
  ]
  return (
    <HStack gap="0" rounded="sm" overflow="hidden" borderWidth="1px" borderColor="app.border" flexShrink={0}>
      {colors.map((c, i) => (
        <Box key={i} boxSize={size} bg={c} />
      ))}
    </HStack>
  )
}

export function ThemePicker() {
  const [paletteId, setPaletteId] = useState<string>("default")
  const [mounted, setMounted] = useState(false)
  const [search, setSearch] = useState("")

  useEffect(() => {
    setPaletteId(readStoredPalette())
    setMounted(true)
  }, [])

  const select = (id: string) => {
    withThemeTransition(() => {
      applyPalette(id)
      setPaletteId(id)
    })
  }

  const grouped = useMemo(() => {
    const q = search.trim().toLowerCase()
    const matches = q
      ? PALETTES.filter((p) => p.name.toLowerCase().includes(q))
      : PALETTES
    return PALETTE_GROUPS.map((group) => ({
      group,
      palettes: matches.filter((p) => p.group === group),
    })).filter((g) => g.palettes.length > 0)
  }, [search])

  return (
    <MenuRoot size="sm" closeOnSelect={false}>
      <MenuTrigger asChild>
        <Button size="sm" variant="ghost" gap="1.5">
          <Icon boxSize="4"><LuPalette /></Icon>
          <Text display={{ base: "none", md: "inline" }}>Theme</Text>
        </Button>
      </MenuTrigger>
      <MenuContent minW="260px" p="0">
        <Box px="2" pt="2" pb="1.5" borderBottomWidth="1px" borderColor="app.border">
          <HStack gap="2" px="2" h="8" bg="app.hover" rounded="md">
            <Icon boxSize="3.5" color="app.fgMuted"><LuSearch /></Icon>
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search themes..."
              variant="flushed"
              fontSize="xs"
              h="full"
              borderBottomWidth="0"
              px="0"
              autoFocus
            />
          </HStack>
        </Box>

        <Box maxH="340px" overflow="auto" py="1">
          {grouped.map(({ group, palettes }) => (
            <Box key={group} px="1">
              <Text
                px="2"
                pt="2"
                pb="1"
                fontSize="2xs"
                fontWeight="semibold"
                color="app.fgMuted"
                textTransform="uppercase"
                letterSpacing="wide"
              >
                {group}
              </Text>
              <VStack gap="0" align="stretch">
                {palettes.map((palette) => {
                  const active = mounted && palette.id === paletteId
                  return (
                    <Box
                      key={palette.id}
                      as="button"
                      display="flex"
                      alignItems="center"
                      gap="2"
                      px="2"
                      py="1.5"
                      rounded="sm"
                      cursor="pointer"
                      fontSize="sm"
                      bg={active ? "app.hover" : "transparent"}
                      _hover={{ bg: "app.hover" }}
                      onClick={() => select(palette.id)}
                    >
                      <PaletteSwatch palette={palette} />
                      <Text flex="1" textAlign="left" truncate>
                        {palette.name}
                      </Text>
                      {active && (
                        <Icon boxSize="3.5" color="app.accent"><LuCheck /></Icon>
                      )}
                    </Box>
                  )
                })}
              </VStack>
            </Box>
          ))}

          {grouped.length === 0 && (
            <Text fontSize="xs" color="app.fgMuted" textAlign="center" py="4">
              No matching themes
            </Text>
          )}
        </Box>
      </MenuContent>
    </MenuRoot>
  )
}
