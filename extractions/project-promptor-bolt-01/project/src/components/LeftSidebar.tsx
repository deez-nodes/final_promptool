import { useState, useRef } from "react"
import {
  Box,
  Flex,
  HStack,
  Icon,
  Input,
  Text,
  VStack,
  Badge,
} from "@chakra-ui/react"
import {
  LuSearch,
  LuPlus,
  LuTrash2,
  LuDownload,
  LuUpload,
  LuLibrary,
  LuBookmark,
  LuCopy,
  LuPencil,
  LuLayers,
} from "react-icons/lu"
import { Tooltip } from "@/components/ui/tooltip"
import { useStore } from "@/store"
import { SECTION_COLORS, PIECE_CATEGORIES } from "@/store/types"
import type { PieceCategory } from "@/store/types"
import { toaster } from "@/components/ui/toaster"

const CATEGORY_COLORS_MAP: Record<PieceCategory, string> = {
  Role: SECTION_COLORS.purple,
  Persona: SECTION_COLORS.purple,
  Instructions: SECTION_COLORS.sky,
  Constraints: SECTION_COLORS.rose,
  Context: SECTION_COLORS.amber,
  Stack: SECTION_COLORS.slate,
  Custom: SECTION_COLORS.slate,
}

export function LeftSidebar() {
  const {
    libraryPieces,
    savedPrompts,
    copiedTurns,
    addLibraryPiece,
    removeLibraryPiece,
    updateLibraryPiece,
    insertPieceAsSection,
    loadSavedPrompt,
    removeSavedPrompt,
    exportBackup,
    importBackup,
  } = useStore()

  const [search, setSearch] = useState("")
  const [activeTab, setActiveTab] = useState<"pieces" | "saved" | "turns">("pieces")
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editContent, setEditContent] = useState("")
  const [addingCategory, setAddingCategory] = useState<PieceCategory | null>(null)
  const [newPieceName, setNewPieceName] = useState("")
  const fileRef = useRef<HTMLInputElement>(null)

  const filtered = libraryPieces.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.category.toLowerCase().includes(search.toLowerCase()),
  )

  const groupedPieces = PIECE_CATEGORIES.map((cat) => ({
    category: cat,
    pieces: filtered.filter((p) => p.category === cat),
  })).filter((g) => g.pieces.length > 0 || addingCategory === g.category)

  const handleBackup = () => {
    const json = exportBackup()
    const blob = new Blob([json], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `promptor-backup-${new Date().toISOString().slice(0, 10)}.json`
    a.click()
    URL.revokeObjectURL(url)
    toaster.create({ title: "Backup downloaded", type: "success", duration: 2000 })
  }

  const handleRestore = (merge: boolean) => {
    const input = fileRef.current
    if (!input?.files?.[0]) return
    const file = input.files[0]
    const reader = new FileReader()
    reader.onload = () => {
      importBackup(reader.result as string, merge)
      toaster.create({
        title: merge ? "Backup merged" : "Backup restored",
        type: "success",
        duration: 2000,
      })
    }
    reader.readAsText(file)
    input.value = ""
  }

  const handleAddPiece = (category: PieceCategory) => {
    if (!newPieceName.trim()) return
    addLibraryPiece({
      category,
      name: newPieceName.trim(),
      content: newPieceName.trim(),
    })
    setNewPieceName("")
    setAddingCategory(null)
  }

  const tabStyle = (tab: string) => ({
    px: "2" as const,
    py: "1" as const,
    fontSize: "xs" as const,
    fontWeight: "medium" as const,
    cursor: "pointer" as const,
    rounded: "md" as const,
    bg: activeTab === tab
      ? "app.borderStrong"
      : "transparent",
    color: activeTab === tab ? "app.fg" : "app.fgMuted",
    _hover: activeTab !== tab
      ? { bg: "app.hover" }
      : {},
  })

  return (
    <Flex direction="column" h="100%" overflow="hidden">
      {/* Search */}
      <Box px="3" pt="3" pb="2" flexShrink={0}>
        <Flex
          alignItems="center"
          gap="2"
          px="2"
          h="8"
          bg={"app.hover"}
          rounded="md"
        >
          <Icon boxSize="3.5" color="app.fgMuted"><LuSearch /></Icon>
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search library..."
            variant="flushed"
            fontSize="xs"
            h="full"
            borderBottomWidth="0"
            px="0"
          />
        </Flex>
      </Box>

      {/* Tabs */}
      <HStack px="3" pb="2" gap="1" flexShrink={0}>
        <Box as="button" onClick={() => setActiveTab("pieces")} {...tabStyle("pieces")}>
          <HStack gap="1">
            <Icon boxSize="3"><LuLibrary /></Icon>
            <Text>Pieces</Text>
          </HStack>
        </Box>
        <Box as="button" onClick={() => setActiveTab("saved")} {...tabStyle("saved")}>
          <HStack gap="1">
            <Icon boxSize="3"><LuBookmark /></Icon>
            <Text>Saved</Text>
          </HStack>
        </Box>
        <Box as="button" onClick={() => setActiveTab("turns")} {...tabStyle("turns")}>
          <HStack gap="1">
            <Icon boxSize="3"><LuLayers /></Icon>
            <Text>Turns</Text>
          </HStack>
        </Box>
      </HStack>

      {/* Content */}
      <Box flex="1" overflow="auto" px="3">
        {activeTab === "pieces" && (
          <VStack gap="3" align="stretch">
            {groupedPieces.map(({ category, pieces }) => (
              <Box key={category}>
                <Flex alignItems="center" gap="1.5" mb="1">
                  <Box w="2" h="2" rounded="full" bg={CATEGORY_COLORS_MAP[category]} />
                  <Text fontSize="xs" fontWeight="semibold" color="app.fgMuted" textTransform="uppercase" letterSpacing="wide">
                    {category}
                  </Text>
                  <Box flex="1" />
                  <Box
                    as="button"
                    p="0.5"
                    cursor="pointer"
                    color="app.fgMuted"
                    _hover={{ color: "app.fg" }}
                    onClick={() => {
                      setAddingCategory(addingCategory === category ? null : category)
                      setNewPieceName("")
                    }}
                  >
                    <Icon boxSize="3"><LuPlus /></Icon>
                  </Box>
                </Flex>

                {addingCategory === category && (
                  <Flex gap="1" mb="1.5">
                    <Input
                      value={newPieceName}
                      onChange={(e) => setNewPieceName(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleAddPiece(category)}
                      placeholder="New piece name..."
                      size="xs"
                      fontSize="xs"
                      autoFocus
                    />
                  </Flex>
                )}

                {pieces.map((piece) => (
                  <Box
                    key={piece.id}
                    px="2"
                    py="1.5"
                    mb="1"
                    rounded="sm"
                    bg={"app.subtle"}
                    _hover={{ bg: "app.hover" }}
                    position="relative"
                    role="group"
                  >
                    {editingId === piece.id ? (
                      <Input
                        value={editContent}
                        onChange={(e) => setEditContent(e.target.value)}
                        onBlur={() => {
                          updateLibraryPiece(piece.id, { content: editContent, name: editContent })
                          setEditingId(null)
                        }}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            updateLibraryPiece(piece.id, { content: editContent, name: editContent })
                            setEditingId(null)
                          }
                        }}
                        size="xs"
                        fontSize="xs"
                        autoFocus
                      />
                    ) : (
                      <Flex alignItems="center" gap="1">
                        <Text fontSize="xs" flex="1" truncate>
                          {piece.name}
                        </Text>
                        <HStack
                          gap="0"
                          opacity={0}
                          _groupHover={{ opacity: 1 }}
                          transition="opacity 0.15s"
                        >
                          <Tooltip content="Insert as section">
                            <Box
                              as="button"
                              p="1"
                              cursor="pointer"
                              color="app.fgMuted"
                              _hover={{ color: "app.fg" }}
                              onClick={() => insertPieceAsSection(piece.id)}
                            >
                              <Icon boxSize="3"><LuPlus /></Icon>
                            </Box>
                          </Tooltip>
                          <Tooltip content="Edit">
                            <Box
                              as="button"
                              p="1"
                              cursor="pointer"
                              color="app.fgMuted"
                              _hover={{ color: "app.fg" }}
                              onClick={() => {
                                setEditingId(piece.id)
                                setEditContent(piece.content)
                              }}
                            >
                              <Icon boxSize="3"><LuPencil /></Icon>
                            </Box>
                          </Tooltip>
                          <Tooltip content="Delete">
                            <Box
                              as="button"
                              p="1"
                              cursor="pointer"
                              color="app.fgMuted"
                              _hover={{ color: "section.rose" }}
                              onClick={() => removeLibraryPiece(piece.id)}
                            >
                              <Icon boxSize="3"><LuTrash2 /></Icon>
                            </Box>
                          </Tooltip>
                        </HStack>
                      </Flex>
                    )}
                  </Box>
                ))}
              </Box>
            ))}

            {groupedPieces.length === 0 && (
              <Text fontSize="xs" color="app.fgMuted" textAlign="center" py="4">
                {search ? "No matching pieces" : "Library is empty"}
              </Text>
            )}
          </VStack>
        )}

        {activeTab === "saved" && (
          <VStack gap="1" align="stretch">
            {savedPrompts.length === 0 && (
              <Text fontSize="xs" color="app.fgMuted" textAlign="center" py="4">
                No saved prompts yet
              </Text>
            )}
            {savedPrompts.map((prompt) => (
              <Flex
                key={prompt.id}
                alignItems="center"
                gap="2"
                px="2"
                py="1.5"
                rounded="sm"
                cursor="pointer"
                _hover={{ bg: "app.hover" }}
                role="group"
              >
                <Box flex="1" onClick={() => loadSavedPrompt(prompt.id)}>
                  <Text fontSize="xs" fontWeight="medium" truncate>
                    {prompt.title}
                  </Text>
                  <Text fontSize="2xs" color="app.fgMuted">
                    {prompt.sections.length} sections - {new Date(prompt.savedAt).toLocaleDateString()}
                  </Text>
                </Box>
                <Box
                  as="button"
                  p="1"
                  color="app.fgMuted"
                  opacity={0}
                  _groupHover={{ opacity: 1 }}
                  _hover={{ color: "section.rose" }}
                  onClick={() => removeSavedPrompt(prompt.id)}
                >
                  <Icon boxSize="3"><LuTrash2 /></Icon>
                </Box>
              </Flex>
            ))}
          </VStack>
        )}

        {activeTab === "turns" && (
          <VStack gap="1" align="stretch">
            {copiedTurns.length === 0 && (
              <Text fontSize="xs" color="app.fgMuted" textAlign="center" py="4">
                No turns copied yet
              </Text>
            )}
            {[...copiedTurns].reverse().map((turn) => (
              <Box
                key={turn.id}
                px="2"
                py="1.5"
                rounded="sm"
                _hover={{ bg: "app.hover" }}
              >
                <Flex alignItems="center" gap="1" mb="0.5">
                  <Text fontSize="xs" fontWeight="medium" truncate flex="1">
                    {turn.title}
                  </Text>
                  <Badge size="sm" fontSize="2xs" variant="outline">
                    {turn.format === "markdown" ? "MD" : turn.format === "xml" ? "XML" : "TXT"}
                  </Badge>
                </Flex>
                <Text fontSize="2xs" color="app.fgMuted" lineClamp={2}>
                  {turn.text.slice(0, 120)}
                </Text>
                <Flex mt="1" gap="1" alignItems="center">
                  <Text fontSize="2xs" color="app.fgMuted">
                    {new Date(turn.copiedAt).toLocaleTimeString()}
                  </Text>
                  <Box flex="1" />
                  <Tooltip content="Copy again">
                    <Box
                      as="button"
                      p="0.5"
                      cursor="pointer"
                      color="app.fgMuted"
                      _hover={{ color: "app.fg" }}
                      onClick={() => {
                        navigator.clipboard.writeText(turn.text)
                        toaster.create({ title: "Copied", type: "success", duration: 1500 })
                      }}
                    >
                      <Icon boxSize="3"><LuCopy /></Icon>
                    </Box>
                  </Tooltip>
                </Flex>
              </Box>
            ))}
          </VStack>
        )}
      </Box>

      {/* Bottom utilities */}
      <Box px="3" py="2" borderTopWidth="1px" borderColor={"app.border"} flexShrink={0}>
        <Flex gap="2">
          <Box
            as="button"
            display="flex"
            alignItems="center"
            gap="1"
            px="2"
            py="1"
            rounded="md"
            fontSize="xs"
            color="app.fgMuted"
            cursor="pointer"
            _hover={{ bg: "app.hover" }}
            onClick={handleBackup}
          >
            <Icon boxSize="3"><LuDownload /></Icon>
            <Text>Backup</Text>
          </Box>
          <Box
            as="button"
            display="flex"
            alignItems="center"
            gap="1"
            px="2"
            py="1"
            rounded="md"
            fontSize="xs"
            color="app.fgMuted"
            cursor="pointer"
            _hover={{ bg: "app.hover" }}
            onClick={() => fileRef.current?.click()}
          >
            <Icon boxSize="3"><LuUpload /></Icon>
            <Text>Restore</Text>
          </Box>
          <input
            ref={fileRef}
            type="file"
            accept=".json"
            style={{ display: "none" }}
            onChange={() => handleRestore(false)}
          />
        </Flex>
      </Box>
    </Flex>
  )
}
