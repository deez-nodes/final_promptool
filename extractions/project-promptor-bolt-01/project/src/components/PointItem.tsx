import { type KeyboardEvent, useRef, useEffect } from "react"
import { Box, Flex, Icon, Textarea, Text } from "@chakra-ui/react"
import { LuX, LuTextQuote } from "react-icons/lu"
import { useStore } from "@/store"
import type { Point } from "@/store/types"

interface PointItemProps {
  point: Point
  index: number
  sectionId: string
  sectionColor: string
}

export function PointItem({ point, index, sectionId, sectionColor }: PointItemProps) {
  const { updatePointText, updatePointQuote, updatePointComment, removePoint, addPoint } = useStore()
  const textRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    if (point.text === "" && !point.quote) {
      textRef.current?.focus()
    }
  }, [point.text, point.quote])

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.altKey && e.key === "Enter") {
      e.preventDefault()
      addPoint(sectionId)
      return
    }
    if (e.key === "Backspace" && point.text === "" && !point.quote) {
      e.preventDefault()
      removePoint(sectionId, point.id)
    }
  }

  const num = String(index + 1).padStart(2, "0")

  return (
    <Box
      mb="2"
      pl="2"
      borderLeftWidth="2px"
      borderLeftColor={sectionColor}
      _last={{ mb: 0 }}
    >
      <Flex alignItems="flex-start" gap="2">
        <Text
          fontSize="sm"
          fontFamily="mono"
          color="app.fgMuted"
          mt="2"
          flexShrink={0}
          w="6"
          textAlign="right"
        >
          {num}
        </Text>

        <Box flex="1">
          {point.quote && (
            <Box
              mb="1.5"
              px="2"
              py="1.5"
              bg="app.subtle"
              borderLeftWidth="2px"
              borderLeftColor="app.fgMuted"
              rounded="sm"
              position="relative"
            >
              <Icon
                position="absolute"
                top="1"
                right="1"
                boxSize="3"
                color="app.fgMuted"
                opacity={0.5}
              >
                <LuTextQuote />
              </Icon>
              <Text fontSize="sm" color="app.fgMuted" whiteSpace="pre-wrap" fontStyle="italic">
                {point.quote}
              </Text>
              <Box
                as="button"
                position="absolute"
                top="1"
                right="5"
                p="0.5"
                cursor="pointer"
                color="app.fgMuted"
                opacity={0.5}
                _hover={{ opacity: 1, color: "section.rose" }}
                onClick={() => updatePointQuote(sectionId, point.id, "")}
              >
                <Icon boxSize="3"><LuX /></Icon>
              </Box>
            </Box>
          )}

          <Textarea
            ref={textRef}
            value={point.text}
            onChange={(e) => updatePointText(sectionId, point.id, e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Your response..."
            fontSize="md"
            color="app.fg"
            fontFamily="mono"
            minH="8"
            rows={1}
            resize="none"
            border="none"
            bg="transparent"
            px="1"
            py="0.5"
            _focus={{ outline: "none" }}
            _placeholder={{ color: "app.fgMuted", opacity: 0.4 }}
          />

          {point.comment !== undefined && point.comment !== "" ? (
            <Textarea
              value={point.comment ?? ""}
              onChange={(e) => updatePointComment(sectionId, point.id, e.target.value)}
              placeholder="Optional note..."
              fontSize="sm"
              color="app.fgMuted"
              minH="6"
              rows={1}
              resize="none"
              border="none"
              bg="transparent"
              px="1"
              py="0"
              _focus={{ outline: "none" }}
              _placeholder={{ color: "app.fgMuted", opacity: 0.3 }}
            />
          ) : null}
        </Box>

        <Box
          as="button"
          mt="1.5"
          p="0.5"
          cursor="pointer"
          color="app.fgMuted"
          opacity={0.4}
          _hover={{ opacity: 1, color: "section.rose" }}
          onClick={() => removePoint(sectionId, point.id)}
          flexShrink={0}
        >
          <Icon boxSize="3"><LuX /></Icon>
        </Box>
      </Flex>
    </Box>
  )
}
