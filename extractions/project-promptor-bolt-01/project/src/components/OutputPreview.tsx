import { Box, Flex, Input, Text, Textarea } from "@chakra-ui/react"
import { useEffect, useRef } from "react"
import { LuPlus, LuX } from "react-icons/lu"
import { useStore } from "@/store"
import type { ExportFormat, Section, SectionColor } from "@/store/types"

const editableArea = {
  as: "textarea" as const,
  resize: "none" as const,
  overflow: "hidden" as const,
  minH: "unset",
  w: "full",
  px: "1",
  rounded: "sm",
  borderWidth: "0",
  bg: "transparent",
  _hover: { bg: "app.hover" },
  _focus: { bg: "app.hover", outline: "none", boxShadow: "none" },
}

// Grows the textarea to fit its content so the document never scrolls inside
// a block — each block is exactly as tall as its text.
function AutoTextarea(props: React.ComponentProps<typeof Textarea>) {
  const ref = useRef<HTMLTextAreaElement>(null)
  const { value } = props
  useEffect(() => {
    const el = ref.current
    if (el) {
      el.style.height = "auto"
      el.style.height = `${el.scrollHeight}px`
    }
  }, [value])
  return <Textarea ref={ref} rows={1} {...props} />
}

function AddPointButton({
  onClick,
  label = "Add point",
}: {
  onClick: () => void
  label?: string
}) {
  return (
    <Box
      as="button"
      onClick={onClick}
      aria-label={label}
      p="0.5"
      rounded="sm"
      color="app.fgMuted"
      opacity="0.55"
      cursor="pointer"
      flexShrink={0}
      _hover={{ opacity: 1, bg: "app.hover", color: "app.fg" }}
    >
      <LuPlus size="11" />
    </Box>
  )
}

function RemoveRowButton({
  onClick,
  label,
}: {
  onClick: () => void
  label: string
}) {
  return (
    <Box
      as="button"
      onClick={onClick}
      aria-label={label}
      p="0.5"
      rounded="sm"
      color="app.fgMuted"
      opacity="0"
      cursor="pointer"
      flexShrink={0}
      _groupHover={{ opacity: 0.7 }}
      _hover={{ bg: "app.hover", color: "app.fg", opacity: 1 }}
    >
      <LuX size="11" />
    </Box>
  )
}

// WYSIWYG view of the assembled prompt: the document looks exactly like what
// gets copied, and every block is directly editable in place — points can be
// added and removed, Enter on a point starts the next one, and comments are
// editable inline. Structure changes stay in Edit mode; here you refine words.
function SectionPreview({ section }: { section: Section }) {
  const {
    updateSectionName,
    updateSectionFreeText,
    updatePointText,
    updatePointQuote,
    updatePointComment,
    addPoint,
    removePoint,
    removeSection,
    moveSection,
  } = useStore()
  const level = section.headingLevel ?? 1

  const headingSizes: Record<number, string> = {
    1: "xl",
    2: "lg",
    3: "md",
    4: "sm",
    5: "xs",
    6: "2xs",
  }

  const handlePointKeyDown = (
    e: React.KeyboardEvent<HTMLTextAreaElement>,
    pointId: string,
  ) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      addPoint(section.id)
    } else if (
      (e.key === "Backspace" || e.key === "Delete") &&
      (e.currentTarget as HTMLTextAreaElement).value === ""
    ) {
      e.preventDefault()
      removePoint(section.id, pointId)
    }
  }

  if (section.style === "xml") {
    return (
      <Box mb="4" className="group">
        <Flex alignItems="center" gap="1">
          <Text fontFamily="mono" fontSize="xs" color="app.fgMuted" lineHeight="tall" flex="1">
            {`<${section.name}>`}
          </Text>
          <RemoveRowButton onClick={() => removeSection(section.id)} label={`Remove ${section.name}`} />
        </Flex>
        <AutoTextarea
          {...editableArea}
          fontFamily="mono"
          fontSize="sm"
          color="app.fg"
          whiteSpace="pre-wrap"
          lineHeight="tall"
          pl="3"
          ml="1"
          my="1"
          borderLeftWidth="1px"
          borderColor="app.border"
          value={section.freeText}
          onChange={(e) => updateSectionFreeText(section.id, e.target.value)}
          placeholder="Section text…"
          _placeholder={{ color: "app.fgMuted", opacity: 0.5 }}
        />
        <Flex direction="column" pl="4" gap="0.5">
          {section.points.map((p, i) => (
            <Flex key={p.id} gap="2" className="group">
              <Text fontFamily="mono" fontSize="2xs" color="app.fgMuted" flexShrink={0} mt="1" w="5" textAlign="right">
                {String(i + 1).padStart(2, "0")}
              </Text>
              <Box flex="1">
                {p.quote && (
                  <AutoTextarea
                    {...editableArea}
                    fontFamily="mono"
                    fontSize="sm"
                    fontStyle="italic"
                    color="app.fgMuted"
                    whiteSpace="pre-wrap"
                    value={p.quote}
                    onChange={(e) => updatePointQuote(section.id, p.id, e.target.value)}
                  />
                )}
                <AutoTextarea
                  {...editableArea}
                  fontFamily="mono"
                  fontSize="sm"
                  color="app.fg"
                  whiteSpace="pre-wrap"
                  value={p.text}
                  onChange={(e) => updatePointText(section.id, p.id, e.target.value)}
                  onKeyDown={(e) => handlePointKeyDown(e, p.id)}
                  placeholder="Point text…"
                  _placeholder={{ color: "app.fgMuted", opacity: 0.5 }}
                />
              </Box>
              <RemoveRowButton onClick={() => removePoint(section.id, p.id)} label="Remove point" />
            </Flex>
          ))}
          <Flex gap="2">
            <Box w="5" flexShrink={0} />
            <AddPointButton onClick={() => addPoint(section.id)} />
          </Flex>
        </Flex>
        <Text fontFamily="mono" fontSize="xs" color="app.fgMuted" lineHeight="tall">
          {`</${section.name}>`}
        </Text>
      </Box>
    )
  }

  return (
    <Box mb="4" className="group">
      <Flex alignItems="center" gap="1" mb="1">
        <Text
          fontSize="2xs"
          fontFamily="mono"
          color="app.fgMuted"
          opacity={0.6}
          flexShrink={0}
          w="5"
        >
          h{level}
        </Text>
        <Box flex="1">
          <Input
            value={section.name}
            onChange={(e) => updateSectionName(section.id, e.target.value)}
            fontWeight="bold"
            fontSize={headingSizes[level]}
            lineHeight="short"
            px="1"
            h="auto"
            py="0.5"
            rounded="sm"
            borderWidth="0"
            bg="transparent"
            _hover={{ bg: "app.hover" }}
            _focus={{ bg: "app.hover", outline: "none", boxShadow: "none" }}
          />
        </Box>
        <Box
          as="button"
          onClick={() => moveSection(section.id, "up")}
          aria-label="Move section up"
          fontSize="2xs"
          fontFamily="mono"
          color="app.fgMuted"
          opacity="0"
          px="1"
          cursor="pointer"
          _groupHover={{ opacity: 0.7 }}
          _hover={{ bg: "app.hover" }}
        >
          ↑
        </Box>
        <Box
          as="button"
          onClick={() => moveSection(section.id, "down")}
          aria-label="Move section down"
          fontSize="2xs"
          fontFamily="mono"
          color="app.fgMuted"
          opacity="0"
          px="1"
          cursor="pointer"
          _groupHover={{ opacity: 0.7 }}
          _hover={{ bg: "app.hover" }}
        >
          ↓
        </Box>
        <RemoveRowButton onClick={() => removeSection(section.id)} label="Remove section" />
      </Flex>

      <AutoTextarea
        {...editableArea}
        fontSize="sm"
        color="app.fg"
        whiteSpace="pre-wrap"
        lineHeight="tall"
        mb="2"
        value={section.freeText}
        onChange={(e) => updateSectionFreeText(section.id, e.target.value)}
        placeholder="Section text…"
        _placeholder={{ color: "app.fgMuted", opacity: 0.5 }}
      />

      <Flex direction="column" gap="1.5">
        {section.points.map((p, i) => (
          <Flex key={p.id} gap="2" className="group">
            <Text
              fontFamily="mono"
              fontSize="2xs"
              color="app.fgMuted"
              flexShrink={0}
              mt="1"
              w="5"
              textAlign="right"
            >
              {String(i + 1).padStart(2, "0")}
            </Text>
            <Box flex="1">
              {p.quote && (
                <Box
                  borderLeftWidth="2px"
                  borderColor="app.borderStrong"
                  pl="2"
                  mb="1"
                >
                  <AutoTextarea
                    {...editableArea}
                    fontSize="xs"
                    color="app.fgMuted"
                    fontStyle="italic"
                    whiteSpace="pre-wrap"
                    value={p.quote}
                    onChange={(e) => updatePointQuote(section.id, p.id, e.target.value)}
                  />
                </Box>
              )}
              <AutoTextarea
                {...editableArea}
                fontSize="sm"
                color="app.fg"
                whiteSpace="pre-wrap"
                value={p.text}
                onChange={(e) => updatePointText(section.id, p.id, e.target.value)}
                onKeyDown={(e) => handlePointKeyDown(e, p.id)}
                placeholder="Point text…"
                _placeholder={{ color: "app.fgMuted", opacity: 0.5 }}
              />
              <AutoTextarea
                {...editableArea}
                fontSize="xs"
                color="app.fgMuted"
                fontStyle="italic"
                whiteSpace="pre-wrap"
                mt="0.5"
                value={p.comment ?? ""}
                onChange={(e) => updatePointComment(section.id, p.id, e.target.value)}
                placeholder="Comment…"
                _placeholder={{ color: "app.fgMuted", opacity: 0.4 }}
              />
            </Box>
            <RemoveRowButton onClick={() => removePoint(section.id, p.id)} label="Remove point" />
          </Flex>
        ))}
        <Flex gap="2">
          <Text
            fontFamily="mono"
            fontSize="2xs"
            color="app.fgMuted"
            flexShrink={0}
            w="5"
            textAlign="center"
            opacity={section.points.length > 0 ? 1 : 0}
          >
            +
          </Text>
          <AddPointButton onClick={() => addPoint(section.id)} />
        </Flex>
      </Flex>
    </Box>
  )
}

const NEW_SECTION_COLORS: SectionColor[] = ["slate", "purple", "sky", "rose", "amber"]

export function OutputPreview({
  sections,
  exportFormat,
  editable = false,
}: {
  sections: Section[]
  exportFormat: ExportFormat
  editable?: boolean
}) {
  const { addSection } = useStore()
  const visible = editable
    ? sections
    : sections.filter(
        (s) => s.name.trim() || s.freeText.trim() || s.points.length > 0,
      )

  if (visible.length === 0) {
    return (
      <Flex h="100%" alignItems="center" justifyContent="center" px="4">
        <Text fontSize="sm" color="app.fgMuted" textAlign="center">
          Nothing to preview yet. Add a section to see the formatted output.
        </Text>
      </Flex>
    )
  }

  return (
    <Box px="4" py="3">
      <Text
        fontSize="2xs"
        fontWeight="semibold"
        color="app.fgMuted"
        textTransform="uppercase"
        letterSpacing="wide"
        mb="3"
      >
        {editable ? "WYSIWYG · editing" : "Formatted output"}
        {exportFormat !== "markdown" && ` · ${exportFormat}`}
      </Text>
      {visible.map((section) => (
        <SectionPreview key={section.id} section={section} />
      ))}
      {editable && (
        <Box
          as="button"
          display="flex"
          alignItems="center"
          justifyContent="center"
          gap="2"
          py="2"
          mb="2"
          border="2px dashed"
          borderColor={"app.border"}
          rounded="md"
          color="app.fgMuted"
          cursor="pointer"
          width="full"
          _hover={{
            borderColor: "app.borderStrong",
            bg: "app.subtle",
          }}
          onClick={() => addSection("New section", NEW_SECTION_COLORS[visible.length % NEW_SECTION_COLORS.length])}
        >
          <LuPlus size="12" />
          <Text fontSize="xs">New section</Text>
        </Box>
      )}
    </Box>
  )
}
