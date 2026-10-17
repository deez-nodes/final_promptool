import { useEffect, useMemo, useState } from "react"
import { Box, Flex, Text } from "@chakra-ui/react"
import CodeMirror, { type Extension } from "@uiw/react-codemirror"
import { markdown } from "@codemirror/lang-markdown"
import { xml } from "@codemirror/lang-xml"
import { useColorMode } from "@/components/ui/color-mode"
import { readStoredPalette } from "@/lib/palettes"
import { cmThemeFor } from "@/lib/cm-themes"
import type { ExportFormat } from "@/store/types"

function languageFor(format: ExportFormat): Extension[] {
  if (format === "xml") return [xml()]
  if (format === "markdown") return [markdown()]
  return []
}

// The Output tab, rendered as a real code editor. The syntax theme is the
// genuine CodeMirror port matching the active app theme — Dracula, Monokai,
// Nord, Gruvbox and so on.
export function CodeOutput({ value, format }: { value: string; format: ExportFormat }) {
  const { colorMode } = useColorMode()
  const [paletteId, setPaletteId] = useState(() => readStoredPalette())
  useEffect(() => {
    const onChange = () => setPaletteId(readStoredPalette())
    document.addEventListener("palette-change", onChange)
    return () => document.removeEventListener("palette-change", onChange)
  }, [])
  const theme = useMemo(
    () => cmThemeFor(paletteId, colorMode),
    [paletteId, colorMode],
  )
  const extensions = useMemo(() => languageFor(format), [format])

  return (
    <Flex direction="column" h="full" overflow="hidden">
      <Box
        px="3"
        pt="2"
        pb="1.5"
        flexShrink={0}
        borderBottomWidth="1px"
        borderColor="app.border"
      >
        <Text fontSize="2xs" fontWeight="semibold" color="app.fgMuted" textTransform="uppercase" letterSpacing="wide">
          Assembled prompt · {format}
        </Text>
      </Box>
      <Box flex="1" overflow="hidden">
        <CodeMirror
          value={value}
          theme={theme}
          extensions={extensions}
          editable={false}
          basicSetup={false}
          height="100%"
          style={{ height: "100%", fontSize: "12.5px" }}
        />
      </Box>
    </Flex>
  )
}
