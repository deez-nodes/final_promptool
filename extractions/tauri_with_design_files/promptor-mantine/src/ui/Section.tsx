import { Card, Group, Text } from '@mantine/core'
import type { ReactNode } from 'react'

interface Props {
  label: string
  hint: string
  /** Controls shown after the hint, at the right of the header. */
  tools?: ReactNode
  children: ReactNode
}

export function Section({ label, hint, tools, children }: Props) {
  return (
    <Card withBorder padding="md" bg="dark.5">
      <Card.Section withBorder inheritPadding py={4}>
        <Group gap="sm" wrap="nowrap">
          <Text ff="heading" fz="h2" fw={700} c="acid">
            {label}
          </Text>
          <Text size="xs" c="dimmed" ml="auto" truncate>
            {hint}
          </Text>
          {tools}
        </Group>
      </Card.Section>
      <Card.Section inheritPadding py="xs">
        {children}
      </Card.Section>
    </Card>
  )
}
