"use client"

import { useState } from "react"
import {
  Box,
  Button,
  Flex,
  HStack,
  Icon,
  Input,
  Text,
} from "@chakra-ui/react"
import {
  LuLayoutTemplate,
  LuSearch,
  LuFilePlus2,
  LuCornerDownLeft,
} from "react-icons/lu"
import {
  DialogContent,
  DialogRoot,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { useStore } from "@/store"
import {
  TEMPLATES,
  TEMPLATE_GROUPS,
  type PromptTemplate,
} from "@/lib/templates"
import { SECTION_COLORS } from "@/store/types"
import { toaster } from "@/components/ui/toaster"

const GROUP_COLORS: Record<string, string> = {
  Engineering: SECTION_COLORS.sky,
  Product: SECTION_COLORS.purple,
  Analysis: SECTION_COLORS.amber,
  Writing: SECTION_COLORS.green,
  Replies: SECTION_COLORS.rose,
}

function TemplateCard({
  template,
  onSelect,
}: {
  template: PromptTemplate
  onSelect: (t: PromptTemplate) => void
}) {
  return (
    <Box
      as="button"
      textAlign="left"
      p="3"
      rounded="md"
      borderWidth="1px"
      borderColor="app.border"
      bg="app.surface"
      cursor="pointer"
      transition="border-color 0.15s, background-color 0.15s"
      _hover={{ borderColor: "app.borderStrong", bg: "app.subtle" }}
      onClick={() => onSelect(template)}
    >
      <HStack gap="1.5" mb="1">
        <Box boxSize="2" rounded="full" bg={GROUP_COLORS[template.group]} flexShrink={0} />
        <Text fontSize="xs" fontWeight="semibold" color="app.fgMuted" textTransform="uppercase" letterSpacing="wide">
          {template.group}
        </Text>
        {template.mode === "reply" && (
          <Text fontSize="2xs" color="app.fgMuted">· reply</Text>
        )}
      </HStack>
      <Text fontSize="sm" fontWeight="semibold" color="app.fg" mb="0.5">
        {template.name}
      </Text>
      <Text fontSize="xs" color="app.fgMuted" lineClamp={2} mb="2">
        {template.description}
      </Text>
      <HStack gap="1" flexWrap="wrap">
        {template.sections.slice(0, 5).map((s, i) => (
          <HStack key={i} gap="1" px="1.5" py="0.5" rounded="full" bg="app.hover">
            <Box boxSize="1.5" rounded="full" bg={SECTION_COLORS[s.color]} />
            <Text fontSize="2xs" color="app.fgMuted">{s.name}</Text>
          </HStack>
        ))}
        {template.sections.length > 5 && (
          <Text fontSize="2xs" color="app.fgMuted">+{template.sections.length - 5}</Text>
        )}
      </HStack>
    </Box>
  )
}

export function TemplateGallery() {
  const { applyTemplate, applyBlankTemplate } = useStore()
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState("")

  const q = search.trim().toLowerCase()
  const filtered = q
    ? TEMPLATES.filter(
        (t) =>
          t.name.toLowerCase().includes(q) ||
          t.group.toLowerCase().includes(q) ||
          t.description.toLowerCase().includes(q),
      )
    : TEMPLATES

  const choose = (template: PromptTemplate) => {
    applyTemplate(template)
    setOpen(false)
    setSearch("")
    toaster.create({
      title: `${template.name} template loaded`,
      type: "success",
      duration: 2000,
    })
  }

  const chooseBlank = (mode: "base" | "reply") => {
    applyBlankTemplate(mode)
    setOpen(false)
    setSearch("")
    toaster.create({ title: "Blank template loaded", type: "success", duration: 2000 })
  }

  return (
    <DialogRoot
      open={open}
      onOpenChange={(e) => setOpen(e.open)}
      size="xl"
      scrollBehavior="inside"
    >
      <DialogTrigger asChild>
        <Button size="sm" variant="ghost" gap="1.5">
          <Icon boxSize="4"><LuLayoutTemplate /></Icon>
          <Text display={{ base: "none", md: "inline" }}>Templates</Text>
        </Button>
      </DialogTrigger>

      <DialogContent rounded="lg" bg="app.surface" maxH="80vh">
        <Box px="5" pt="5" pb="3" borderBottomWidth="1px" borderColor="app.border">
          <DialogTitle fontSize="md" fontWeight="semibold" color="app.fg" mb="3">
            Start from a template
          </DialogTitle>
          <HStack gap="2" px="3" h="9" bg="app.hover" rounded="md" alignItems="center">
            <Icon boxSize="4" color="app.fgMuted"><LuSearch /></Icon>
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search templates..."
              variant="flushed"
              fontSize="sm"
              h="full"
              borderBottomWidth="0"
              px="0"
              autoFocus
            />
          </HStack>
        </Box>

        <Box px="5" py="4" flex="1">
          {filtered.length === 0 ? (
            <Text fontSize="sm" color="app.fgMuted" textAlign="center" py="8">
              No matching templates
            </Text>
          ) : (
            TEMPLATE_GROUPS.map((group) => {
              const items = filtered.filter((t) => t.group === group)
              if (items.length === 0) return null
              return (
                <Box key={group} mb="5">
                  <HStack gap="2" mb="2">
                    <Box boxSize="2.5" rounded="full" bg={GROUP_COLORS[group]} />
                    <Text fontSize="sm" fontWeight="semibold" color="app.fg">
                      {group}
                    </Text>
                    <Text fontSize="xs" color="app.fgMuted">{items.length}</Text>
                  </HStack>
                  <Box
                    display="grid"
                    gridTemplateColumns={{ base: "1fr", md: "1fr 1fr" }}
                    gap="3"
                  >
                    {items.map((template) => (
                      <TemplateCard
                        key={template.id}
                        template={template}
                        onSelect={choose}
                      />
                    ))}
                  </Box>
                </Box>
              )
            })
          )}
        </Box>

        <Flex
          px="5"
          py="3"
          borderTopWidth="1px"
          borderColor="app.border"
          alignItems="center"
          gap="2"
        >
          <Text fontSize="xs" color="app.fgMuted">Start blank:</Text>
          <Button size="xs" variant="outline" gap="1.5" onClick={() => chooseBlank("base")}>
            <Icon boxSize="3"><LuFilePlus2 /></Icon>
            Base prompt
          </Button>
          <Button size="xs" variant="outline" gap="1.5" onClick={() => chooseBlank("reply")}>
            <Icon boxSize="3"><LuCornerDownLeft /></Icon>
            Mid-task reply
          </Button>
          <Box flex="1" />
          <Text fontSize="2xs" color="app.fgMuted">
            Replaces the current draft (undoable)
          </Text>
        </Flex>
      </DialogContent>
    </DialogRoot>
  )
}
