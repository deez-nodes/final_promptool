import { Flex, Heading, HStack, Text } from "@chakra-ui/react"
import { ThemeToggle } from "@/components/ThemeToggle"
import { ThemePicker } from "@/components/ThemePicker"
import { TemplateGallery } from "@/components/TemplateGallery"

export function TopBar() {
  return (
    <Flex
      as="header"
      h="12"
      px="4"
      alignItems="center"
      justifyContent="space-between"
      borderBottomWidth="1px"
      borderColor="app.border"
      bg="app.surface"
      flexShrink={0}
    >
      <HStack gap="2">
        <Heading size="md" fontWeight="bold" letterSpacing="tight" color="app.fg">
          PrompTOR
        </Heading>
        <Text fontSize="xs" color="app.fgMuted" mt="0.5">
          Prompt Workbench
        </Text>
      </HStack>

      <HStack gap="1">
        <TemplateGallery />
        <ThemePicker />
        <ThemeToggle />
      </HStack>
    </Flex>
  )
}
