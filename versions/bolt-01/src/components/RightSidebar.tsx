import { useState, useCallback } from "react"
import { Box, Flex, Icon, Text, Textarea, Badge, HStack, Button } from "@chakra-ui/react"
import { LuTrash2, LuClipboardCopy } from "react-icons/lu"
import { useStore } from "@/store"
import { SECTION_COLORS, SECTION_PILL_FG } from "@/store/types"
import { toaster } from "@/components/ui/toaster"
import { assemblePrompt } from "@/lib/assembler"
import { CodeOutput } from "./CodeOutput"

const QUICK_ROUTES = [
  { name: "Agreements", color: "green" as const },
  { name: "Corrections", color: "rose" as const },
  { name: "Proposed edits", color: "amber" as const },
  { name: "Questions", color: "sky" as const },
] as const

export function RightSidebar() {
  const {
    referenceText,
    setReferenceText,
    mode,
    baseDraft,
    replyDraft,
    addPoint,
    addSection,
    rightPaneView,
    setRightPaneView,
    exportFormat,
    addCopiedTurn,
  } = useStore()
  const draft = mode === "base" ? baseDraft : replyDraft
  const [selectedText, setSelectedText] = useState("")

  const assembled = assemblePrompt(draft.sections, exportFormat)

  const copyOutput = useCallback(() => {
    navigator.clipboard.writeText(assembled).then(() => {
      addCopiedTurn(assembled, exportFormat)
      toaster.create({ title: "Copied to clipboard", type: "success", duration: 2000 })
    })
  }, [assembled, exportFormat, addCopiedTurn])

  const handleTextSelect = useCallback(() => {
    const selection = window.getSelection()
    const text = selection?.toString().trim()
    if (text && text.length > 0) {
      setSelectedText(text)
    }
  }, [])

  const routeQuote = (sectionName: string, color: "green" | "rose" | "amber" | "sky") => {
    if (!selectedText) return

    const existing = draft.sections.find(
      (s) => s.name.toLowerCase() === sectionName.toLowerCase(),
    )

    if (existing) {
      addPoint(existing.id, selectedText)
    } else {
      addSection(sectionName, color)
      const updatedDraft = mode === "base"
        ? useStore.getState().baseDraft
        : useStore.getState().replyDraft
      const newSec = updatedDraft.sections[updatedDraft.sections.length - 1]
      if (newSec) {
        addPoint(newSec.id, selectedText)
      }
    }

    toaster.create({
      title: `Quote added to "${sectionName}"`,
      type: "success",
      duration: 2000,
    })
    setSelectedText("")
    window.getSelection()?.removeAllRanges()
  }

  const routeToNewSection = () => {
    if (!selectedText) return
    addSection("Quoted", "slate")
    const updatedDraft = mode === "base"
      ? useStore.getState().baseDraft
      : useStore.getState().replyDraft
    const newSec = updatedDraft.sections[updatedDraft.sections.length - 1]
    if (newSec) {
      addPoint(newSec.id, selectedText)
    }
    toaster.create({
      title: "Quote added to new section",
      type: "success",
      duration: 2000,
    })
    setSelectedText("")
    window.getSelection()?.removeAllRanges()
  }

  return (
    <Flex direction="column" h="100%" overflow="hidden">
      {/* Header with view switcher */}
      <Flex
        px="3"
        py="2"
        alignItems="center"
        gap="2"
        borderBottomWidth="1px"
        borderColor={"app.border"}
        flexShrink={0}
      >
        <HStack gap="1" bg="app.hover" rounded="md" p="0.5">
          <Box
            as="button"
            px="2"
            py="1"
            rounded="sm"
            cursor="pointer"
            fontSize="xs"
            fontWeight="medium"
            bg={rightPaneView === "reply" ? "app.surface" : "transparent"}
            color={rightPaneView === "reply" ? "app.fg" : "app.fgMuted"}
            onClick={() => setRightPaneView("reply")}
          >
            Their reply
          </Box>
          <Box
            as="button"
            px="2"
            py="1"
            rounded="sm"
            cursor="pointer"
            fontSize="xs"
            fontWeight="medium"
            bg={rightPaneView === "output" ? "app.surface" : "transparent"}
            color={rightPaneView === "output" ? "app.fg" : "app.fgMuted"}
            onClick={() => setRightPaneView("output")}
          >
            Output
          </Box>
        </HStack>

        <Box flex="1" />

        {rightPaneView === "reply" && referenceText && (
          <Box
            as="button"
            p="1"
            cursor="pointer"
            color="app.fgMuted"
            _hover={{ color: "section.rose" }}
            onClick={() => setReferenceText("")}
          >
            <Icon boxSize="3.5"><LuTrash2 /></Icon>
          </Box>
        )}

        {rightPaneView === "output" && (
          <Button size="xs" variant="ghost" gap="1.5" onClick={copyOutput}>
            <Icon boxSize="3"><LuClipboardCopy /></Icon>
            Copy
          </Button>
        )}
      </Flex>

      {rightPaneView === "reply" ? (
        <>
          <Box flex="1" overflow="auto" px="3" py="2">
            <Textarea
              value={referenceText}
              onChange={(e) => setReferenceText(e.target.value)}
              onMouseUp={handleTextSelect}
              onKeyUp={handleTextSelect}
              placeholder="Paste the AI agent's response here, then select text to route quotes to your sections..."
              minH="100%"
              resize="none"
              fontSize="xs"
              fontFamily="mono"
              lineHeight="tall"
              bg={"app.subtle"}
              borderWidth="1px"
              borderColor={"app.border"}
              rounded="md"
              p="3"
              _focus={{ borderColor: "app.borderStrong" }}
              _placeholder={{ color: "app.fgMuted", opacity: 0.5 }}
            />
          </Box>

          {/* Quote routing pills */}
          {selectedText && (
            <Box
              px="3"
              py="2"
              borderTopWidth="1px"
              borderColor={"app.border"}
              flexShrink={0}
            >
              <Text fontSize="2xs" color="app.fgMuted" mb="1.5">
                Route selected text to:
              </Text>
              <Flex gap="1.5" flexWrap="wrap">
                {QUICK_ROUTES.map((route) => (
                  <Badge
                    key={route.name}
                    as="button"
                    size="sm"
                    cursor="pointer"
                    px="2"
                    py="0.5"
                    rounded="full"
                    bg={SECTION_COLORS[route.color]}
                    color={SECTION_PILL_FG[route.color]}
                    fontWeight="medium"
                    _hover={{ opacity: 0.85 }}
                    onClick={() => routeQuote(route.name, route.color)}
                  >
                    {route.name}
                  </Badge>
                ))}
                <Badge
                  as="button"
                  size="sm"
                  cursor="pointer"
                  px="2"
                  py="0.5"
                  rounded="full"
                  variant="outline"
                  _hover={{ bg: "app.hover" }}
                  onClick={routeToNewSection}
                >
                  + Section
                </Badge>
              </Flex>
              <Text fontSize="2xs" color="app.fgMuted" mt="1.5" fontStyle="italic" lineClamp={2}>
                "{selectedText.slice(0, 80)}{selectedText.length > 80 ? "..." : ""}"
              </Text>
            </Box>
          )}
        </>
      ) : (
        <Box flex="1" overflow="auto">
          <CodeOutput value={assembled} format={exportFormat} />
        </Box>
      )}
    </Flex>
  )
}
