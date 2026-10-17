import { useRef, type KeyboardEvent } from "react"
import {
  Box,
  Flex,
  HStack,
  Icon,
  Input,
  Textarea,
  Text,
  Badge,
} from "@chakra-ui/react"
import {
  LuGripVertical,
  LuChevronDown,
  LuChevronRight,
  LuTrash2,
  LuChevronUp,
  LuPlus,
  LuHash,
  LuCode,
} from "react-icons/lu"
import { MenuContent, MenuItem, MenuRoot, MenuTrigger } from "@/components/ui/menu"
import { Tooltip } from "@/components/ui/tooltip"
import { toaster } from "@/components/ui/toaster"
import { useStore } from "@/store"
import type { HeadingLevel, Section, SectionColor } from "@/store/types"
import { HEADING_LEVELS, SECTION_COLORS } from "@/store/types"
import { PointItem } from "./PointItem"

// Heading levels map to the same sizes the assembler emits (h1..h6), so the
// editor shows the shape of the exported outline.
const HEADING_FONT_SIZES: Record<HeadingLevel, string> = {
  1: "2xl",
  2: "xl",
  3: "lg",
  4: "md",
  5: "sm",
  6: "xs",
}

const COLOR_OPTIONS: SectionColor[] = ["slate", "green", "rose", "amber", "sky", "purple"]

interface SectionCardProps {
  section: Section
  index: number
  total: number
}

export function SectionCard({ section, index, total }: SectionCardProps) {
  const {
    moveSection,
    updateSectionName,
    updateSectionColor,
    updateSectionStyle,
    updateSectionHeadingLevel,
    toggleSectionCollapse,
    toggleSectionKept,
    updateSectionFreeText,
    removeSection,
    restoreSection,
    addPoint,
  } = useStore()

  const borderColor = SECTION_COLORS[section.color]
  const headingLevel = section.headingLevel ?? 1
  const nameRef = useRef<HTMLInputElement>(null)

  const handleRemove = () => {
    const removed = removeSection(section.id)
    const idx = index
    toaster.create({
      title: `"${removed.name}" removed`,
      type: "info",
      action: {
        label: "Undo",
        onClick: () => restoreSection(removed, idx),
      },
      duration: 5000,
    })
  }

  const handleFreeTextKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.altKey && e.key === "Enter") {
      e.preventDefault()
      addPoint(section.id)
      return
    }
    if (e.key === "Enter" && !e.shiftKey && !e.ctrlKey && !e.metaKey) {
      const ta = e.currentTarget
      const val = ta.value
      const pos = ta.selectionStart
      const lineStart = val.lastIndexOf("\n", pos - 1) + 1
      const line = val.slice(lineStart, pos)
      const listMatch = line.match(/^(\s*(?:[-*]\s|(\d+)\.\s))/)
      if (listMatch) {
        const prefix = listMatch[0]
        if (line.trim() === prefix.trim()) {
          e.preventDefault()
          const before = val.slice(0, lineStart)
          const after = val.slice(pos)
          updateSectionFreeText(section.id, before + after)
          return
        }
        e.preventDefault()
        let newPrefix = prefix
        if (listMatch[2]) {
          const num = parseInt(listMatch[2]) + 1
          newPrefix = prefix.replace(/\d+/, String(num))
        }
        const newVal = val.slice(0, pos) + "\n" + newPrefix + val.slice(pos)
        updateSectionFreeText(section.id, newVal)
        requestAnimationFrame(() => {
          ta.selectionStart = ta.selectionEnd = pos + 1 + newPrefix.length
        })
        return
      }
    }
  }

  return (
    <Box
      borderWidth="1px"
      borderColor={"app.border"}
      borderLeftWidth="3px"
      borderLeftColor={borderColor}
      rounded="md"
      bg={"app.surface"}
      overflow="hidden"
    >
      {/* Section header */}
      <Flex
        px="3"
        py="2"
        alignItems="center"
        gap="2"
        bg={"app.subtle"}
        borderBottomWidth={section.collapsed ? "0" : "1px"}
        borderColor={"app.border"}
      >
        <Icon color="app.fgMuted" cursor="grab" flexShrink={0}>
          <LuGripVertical />
        </Icon>

        <Box
          as="button"
          onClick={() => toggleSectionCollapse(section.id)}
          color="app.fgMuted"
          cursor="pointer"
          flexShrink={0}
        >
          <Icon boxSize="4">
            {section.collapsed ? <LuChevronRight /> : <LuChevronDown />}
          </Icon>
        </Box>

        {section.style === "xml" && (
          <Text
            fontSize="sm"
            fontFamily="mono"
            color="app.fgMuted"
            flexShrink={0}
          >
            {"<"}
          </Text>
        )}

        <Input
          ref={nameRef}
          value={section.name}
          onChange={(e) => updateSectionName(section.id, e.target.value)}
          variant="flushed"
          fontWeight="bold"
          fontSize={HEADING_FONT_SIZES[headingLevel]}
          lineHeight="short"
          px="1"
          h="9"
          flex="1"
          borderBottomWidth="0"
          _focus={{ borderBottomWidth: "1px", borderColor: borderColor }}
          color={borderColor}
        />

        {section.style === "xml" && (
          <Text
            fontSize="sm"
            fontFamily="mono"
            color="app.fgMuted"
            flexShrink={0}
          >
            {">"}
          </Text>
        )}

        {/* Color dots */}
        <HStack gap="1" flexShrink={0}>
          {COLOR_OPTIONS.map((c) => (
            <Box
              key={c}
              as="button"
              w="3"
              h="3"
              rounded="full"
              bg={SECTION_COLORS[c]}
              opacity={section.color === c ? 1 : 0.3}
              cursor="pointer"
              onClick={() => updateSectionColor(section.id, c)}
              _hover={{ opacity: 0.8 }}
              title={c}
            />
          ))}
        </HStack>

        {/* Heading level h1-h6 */}
        <MenuRoot size="sm">
          <MenuTrigger asChild>
            <Box
              as="button"
              px="1.5"
              py="0.5"
              rounded="sm"
              cursor="pointer"
              color={section.style === "heading" ? "app.fg" : "app.fgMuted"}
              bg={section.style === "heading" ? "app.hover" : "transparent"}
              _hover={{ bg: "app.hover" }}
              flexShrink={0}
            >
              <HStack gap="0.5">
                <Icon boxSize="3"><LuHash /></Icon>
                <Text fontSize="2xs" fontWeight="semibold" fontFamily="mono">
                  {headingLevel}
                </Text>
              </HStack>
            </Box>
          </MenuTrigger>
          <MenuContent minW="150px">
            {HEADING_LEVELS.map((level) => (
              <MenuItem
                key={level}
                value={String(level)}
                onClick={() => updateSectionHeadingLevel(section.id, level)}
                fontSize={HEADING_FONT_SIZES[level]}
                fontWeight="bold"
                gap="2"
              >
                <Text
                  fontSize="2xs"
                  fontFamily="mono"
                  color="app.fgMuted"
                  w="5"
                >
                  h{level}
                </Text>
                <Text>Heading</Text>
              </MenuItem>
            ))}
          </MenuContent>
        </MenuRoot>

        {/* Format toggle */}
        <Tooltip content={section.style === "heading" ? "Markdown heading" : "XML tag"}>
          <Box
            as="button"
            p="1"
            rounded="sm"
            cursor="pointer"
            color="app.fgMuted"
            _hover={{ bg: "app.hover" }}
            onClick={() =>
              updateSectionStyle(
                section.id,
                section.style === "heading" ? "xml" : "heading",
              )
            }
          >
            <Icon boxSize="3.5">
              {section.style === "heading" ? <LuHash /> : <LuCode />}
            </Icon>
          </Box>
        </Tooltip>

        {/* Keep toggle */}
        <Tooltip content={section.kept ? "Kept across replies" : "Cleared on next reply"}>
          <Box as="span">
            <Badge
              as="button"
              size="sm"
              variant={section.kept ? "solid" : "outline"}
              colorPalette={section.kept ? "green" : "gray"}
              cursor="pointer"
              onClick={() => toggleSectionKept(section.id)}
              fontSize="2xs"
              px="1.5"
            >
              {section.kept ? "Kept" : "Keep"}
            </Badge>
          </Box>
        </Tooltip>

        {/* Move up/down */}
        <HStack gap="0" flexShrink={0}>
          <Box
            as="button"
            p="1"
            cursor={index > 0 ? "pointer" : "not-allowed"}
            opacity={index > 0 ? 1 : 0.3}
            color="app.fgMuted"
            onClick={() => index > 0 && moveSection(section.id, "up")}
          >
            <Icon boxSize="3.5"><LuChevronUp /></Icon>
          </Box>
          <Box
            as="button"
            p="1"
            cursor={index < total - 1 ? "pointer" : "not-allowed"}
            opacity={index < total - 1 ? 1 : 0.3}
            color="app.fgMuted"
            onClick={() => index < total - 1 && moveSection(section.id, "down")}
          >
            <Icon boxSize="3.5"><LuChevronDown /></Icon>
          </Box>
        </HStack>

        {/* Delete */}
        <Box
          as="button"
          p="1"
          rounded="sm"
          cursor="pointer"
          color="app.fgMuted"
          _hover={{ color: "section.rose", bg: "app.hover" }}
          onClick={handleRemove}
        >
          <Icon boxSize="3.5"><LuTrash2 /></Icon>
        </Box>
      </Flex>

      {/* Section body */}
      {!section.collapsed && (
        <Box px="3" py="2">
          <Textarea
            value={section.freeText}
            onChange={(e) => updateSectionFreeText(section.id, e.target.value)}
            onKeyDown={handleFreeTextKeyDown}
            placeholder="Start typing..."
            minH="20"
            resize="vertical"
            fontSize="md"
            color="app.fg"
            fontFamily="mono"
            border="none"
            bg="transparent"
            px="1"
            _focus={{ outline: "none" }}
            _placeholder={{ color: "app.fgMuted", opacity: 0.5 }}
          />

          {/* Points */}
          {section.points.length > 0 && (
            <Box mt="2" borderTopWidth="1px" borderColor={"app.hover"} pt="2">
              {section.points.map((point, i) => (
                <PointItem
                  key={point.id}
                  point={point}
                  index={i}
                  sectionId={section.id}
                  sectionColor={borderColor}
                />
              ))}
            </Box>
          )}

          {/* Add point button */}
          <Flex mt="2" justifyContent="flex-start">
            <Box
              as="button"
              display="flex"
              alignItems="center"
              gap="1"
              fontSize="sm"
              color="app.fgMuted"
              cursor="pointer"
              _hover={{ color: "app.fg" }}
              onClick={() => addPoint(section.id)}
            >
              <Icon boxSize="3"><LuPlus /></Icon>
              <Text>Add point</Text>
            </Box>
          </Flex>
        </Box>
      )}

      {section.collapsed && (
        <Flex px="3" py="1.5" alignItems="center" gap="2">
          <Text fontSize="sm" color="app.fgMuted" truncate>
            {section.freeText
              ? section.freeText.slice(0, 80) + (section.freeText.length > 80 ? "..." : "")
              : `${section.points.length} point${section.points.length !== 1 ? "s" : ""}`}
          </Text>
        </Flex>
      )}
    </Box>
  )
}
