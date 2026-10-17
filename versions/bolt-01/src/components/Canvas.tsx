import { useCallback, useEffect, useMemo, useState } from "react"
import {
  Box,
  Flex,
  HStack,
  Icon,
  Input,
  Text,
  Button,
  Tabs,
} from "@chakra-ui/react"
import {
  LuClipboardCopy,
  LuPlus,
  LuSave,
  LuUndo2,
  LuRedo2,
  LuCornerDownLeft,
  LuFile,
  LuLayoutPanelLeft,
  LuColumns3,
  LuPencil,
  LuEye,
} from "react-icons/lu"
import { useStore } from "@/store"
import { assemblePrompt, countWords } from "@/lib/assembler"
import { SectionCard } from "./SectionCard"
import { OutputPreview } from "./OutputPreview"
import { toaster } from "@/components/ui/toaster"
import { Tooltip } from "@/components/ui/tooltip"

export function Canvas() {
  const {
    mode,
    setMode,
    baseDraft,
    replyDraft,
    exportFormat,
    setExportFormat,
    setDraftTitle,
    addSection,
    saveCurrentPrompt,
    addCopiedTurn,
    nextReply,
    newPrompt,
    undo,
    redo,
    undoStack,
    redoStack,
    toggleLeftSidebar,
    toggleRightSidebar,
    leftSidebarOpen,
    rightSidebarOpen,
    arrangements,
    loadArrangement,
  } = useStore()

  const draft = mode === "base" ? baseDraft : replyDraft
  const [canvasView, setCanvasView] = useState<"edit" | "preview">("edit")

  const assembled = useMemo(
    () => assemblePrompt(draft.sections, exportFormat),
    [draft.sections, exportFormat],
  )

  const wordCount = useMemo(() => countWords(assembled), [assembled])
  const charCount = assembled.length

  const copyToClipboard = useCallback(() => {
    navigator.clipboard.writeText(assembled).then(() => {
      addCopiedTurn(assembled, exportFormat)
      toaster.create({ title: "Copied to clipboard", type: "success", duration: 2000 })
    })
  }, [assembled, exportFormat, addCopiedTurn])

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
        e.preventDefault()
        copyToClipboard()
      }
      if ((e.ctrlKey || e.metaKey) && e.key === "z" && !e.shiftKey) {
        e.preventDefault()
        undo()
      }
      if ((e.ctrlKey || e.metaKey) && (e.key === "y" || (e.key === "z" && e.shiftKey))) {
        e.preventDefault()
        redo()
      }
    }
    window.addEventListener("keydown", handler)
    return () => window.removeEventListener("keydown", handler)
  }, [copyToClipboard, undo, redo])


  return (
    <Flex direction="column" h="100%" overflow="hidden">
      {/* Top controls */}
      <Box
        px="4"
        py="2"
        borderBottomWidth="1px"
        borderColor={"app.border"}
        bg={"app.surface"}
        flexShrink={0}
      >
        <Flex alignItems="center" gap="3" mb="2">
          {/* Sidebar toggles */}
          <Tooltip content="Toggle library">
            <Box
              as="button"
              p="1"
              rounded="sm"
              cursor="pointer"
              color={leftSidebarOpen ? "app.fg" : "app.fgMuted"}
              _hover={{ bg: "app.hover" }}
              onClick={toggleLeftSidebar}
            >
              <Icon boxSize="4"><LuLayoutPanelLeft /></Icon>
            </Box>
          </Tooltip>

          <Input
            value={draft.title}
            onChange={(e) => setDraftTitle(e.target.value)}
            variant="flushed"
            fontWeight="bold"
            fontSize="xl"
            px="1"
            flex="1"
            borderBottomWidth="0"
            _focus={{ borderBottomWidth: "1px" }}
          />

          <Tooltip content="Toggle reference pane">
            <Box
              as="button"
              p="1"
              rounded="sm"
              cursor="pointer"
              color={rightSidebarOpen ? "app.fg" : "app.fgMuted"}
              _hover={{ bg: "app.hover" }}
              onClick={toggleRightSidebar}
            >
              <Icon boxSize="4"><LuColumns3 /></Icon>
            </Box>
          </Tooltip>
        </Flex>

        {/* Mode tabs & arrangement */}
        <Flex alignItems="center" gap="3" flexWrap="wrap">
          <Tabs.Root
            value={mode}
            onValueChange={(e) => setMode(e.value as "base" | "reply")}
            size="sm"
            variant="line"
          >
            <Tabs.List borderBottomWidth="0" gap="0">
              <Tabs.Trigger value="base" px="3" py="1" fontSize="sm" fontWeight="medium">
                Base prompt
              </Tabs.Trigger>
              <Tabs.Trigger value="reply" px="3" py="1" fontSize="sm" fontWeight="medium">
                Mid-task reply
              </Tabs.Trigger>
            </Tabs.List>
          </Tabs.Root>

          <Text fontSize="xs" color="app.fgMuted">|</Text>

          {/* Edit / Preview toggle */}
          <HStack gap="1" bg="app.hover" rounded="md" p="0.5">
            <Box
              as="button"
              px="2"
              py="1"
              rounded="sm"
              cursor="pointer"
              fontSize="xs"
              fontWeight="medium"
              bg={canvasView === "edit" ? "app.surface" : "transparent"}
              color={canvasView === "edit" ? "app.fg" : "app.fgMuted"}
              onClick={() => setCanvasView("edit")}
            >
              <HStack gap="1">
                <Icon boxSize="3"><LuPencil /></Icon>
                <Text>Edit</Text>
              </HStack>
            </Box>
            <Box
              as="button"
              px="2"
              py="1"
              rounded="sm"
              cursor="pointer"
              fontSize="xs"
              fontWeight="medium"
              bg={canvasView === "preview" ? "app.surface" : "transparent"}
              color={canvasView === "preview" ? "app.fg" : "app.fgMuted"}
              onClick={() => setCanvasView("preview")}
            >
              <HStack gap="1">
                <Icon boxSize="3"><LuEye /></Icon>
                <Text>Preview</Text>
              </HStack>
            </Box>
          </HStack>

          {/* Arrangements dropdown */}
          <HStack gap="1">
            {arrangements.map((arr) => (
              <Box
                key={arr.id}
                as="button"
                fontSize="xs"
                px="2"
                py="1"
                rounded="full"
                bg={"app.hover"}
                color="app.fgMuted"
                cursor="pointer"
                _hover={{ bg: "app.borderStrong" }}
                onClick={() => loadArrangement(arr.id)}
              >
                {arr.name}
              </Box>
            ))}
          </HStack>
        </Flex>
      </Box>

      {/* Sections stack or in-place preview */}
      <Box flex="1" overflow="auto" px="4" py="3">
        {canvasView === "preview" ? (
          <OutputPreview
            sections={draft.sections}
            exportFormat={exportFormat}
            editable
          />
        ) : (
        <Flex direction="column" gap="3" w="full">
          {draft.sections.map((section, i) => (
            <SectionCard
              key={section.id}
              section={section}
              index={i}
              total={draft.sections.length}
            />
          ))}

          {/* Add section button */}
          <Box
            as="button"
            display="flex"
            alignItems="center"
            justifyContent="center"
            gap="2"
            py="3"
            border="2px dashed"
            borderColor={"app.border"}
            rounded="md"
            color="app.fgMuted"
            cursor="pointer"
            _hover={{
              borderColor: "app.borderStrong",
              bg: "app.subtle",
            }}
            onClick={() => addSection()}
          >
            <Icon boxSize="4"><LuPlus /></Icon>
            <Text fontSize="sm">New section</Text>
          </Box>
        </Flex>
        )}
      </Box>

      {/* Bottom action bar */}
      <Box
        px="4"
        py="2"
        borderTopWidth="1px"
        borderColor={"app.border"}
        bg={"app.surface"}
        flexShrink={0}
      >
        <Flex alignItems="center" gap="2" flexWrap="wrap">
          {/* Primary copy */}
          <Button
            size="sm"
            colorPalette="blue"
            onClick={copyToClipboard}
            gap="1.5"
          >
            <Icon boxSize="3.5"><LuClipboardCopy /></Icon>
            Copy prompt
          </Button>

          {/* Secondary actions */}
          <Tooltip content="Save prompt">
            <Button
              size="sm"
              variant="ghost"
              onClick={() => {
                saveCurrentPrompt()
                toaster.create({ title: "Prompt saved", type: "success", duration: 2000 })
              }}
            >
              <Icon boxSize="3.5"><LuSave /></Icon>
            </Button>
          </Tooltip>

          <Tooltip content="Next reply (clear non-kept)">
            <Button size="sm" variant="ghost" onClick={nextReply}>
              <Icon boxSize="3.5"><LuCornerDownLeft /></Icon>
            </Button>
          </Tooltip>

          <Tooltip content="New prompt">
            <Button size="sm" variant="ghost" onClick={newPrompt}>
              <Icon boxSize="3.5"><LuFile /></Icon>
            </Button>
          </Tooltip>

          <Tooltip content="Undo">
            <Button
              size="sm"
              variant="ghost"
              onClick={undo}
              disabled={undoStack.length === 0}
            >
              <Icon boxSize="3.5"><LuUndo2 /></Icon>
            </Button>
          </Tooltip>

          <Tooltip content="Redo">
            <Button
              size="sm"
              variant="ghost"
              onClick={redo}
              disabled={redoStack.length === 0}
            >
              <Icon boxSize="3.5"><LuRedo2 /></Icon>
            </Button>
          </Tooltip>

          <Box flex="1" />

          {/* Export format */}
          <HStack gap="0" borderWidth="1px" borderColor={"app.border"} rounded="md" overflow="hidden">
            {(["markdown", "xml", "plaintext"] as const).map((fmt) => (
              <Box
                key={fmt}
                as="button"
                px="2"
                py="1"
                fontSize="2xs"
                fontWeight="medium"
                cursor="pointer"
                bg={exportFormat === fmt
                  ? "app.fg"
                  : "transparent"
                }
                color={exportFormat === fmt
                  ? "app.surface"
                  : "app.fgMuted"
                }
                _hover={exportFormat !== fmt
                  ? { bg: "app.hover" }
                  : {}
                }
                onClick={() => setExportFormat(fmt)}
              >
                {fmt === "markdown" ? "MD" : fmt === "xml" ? "XML" : "TXT"}
              </Box>
            ))}
          </HStack>

          {/* Stats */}
          <Text fontSize="2xs" color="app.fgMuted" fontFamily="mono">
            {wordCount}w {charCount}c
          </Text>
        </Flex>
      </Box>
    </Flex>
  )
}
