import { Button, Divider, Group, Kbd, Modal, SimpleGrid, Stack, Text } from '@mantine/core'
import { CHEATSHEET } from '../model/cheatsheet'

export function CheatSheet({ opened, onClose }: { opened: boolean; onClose: () => void }) {
  return (
    <Modal.Root opened={opened} onClose={onClose} size="xl" radius="lg" centered>
      <Modal.Overlay />
      <Modal.Content>
        <Modal.Header px="xl">
          <Modal.Title>VIM CHEATSHEET</Modal.Title>
          <Button color="miku" size="compact-sm" onClick={onClose}>
            Esc
          </Button>
        </Modal.Header>
        <Modal.Body px="xl" pb="xl">
          <Text size="sm" c="navy.1" my="lg">
            prompTOR implements the same modal subset as the Claude Code editor.
          </Text>
          <SimpleGrid cols={2} spacing={48}>
            {CHEATSHEET.map((group) => (
              <Stack key={group.title} gap="sm">
                <Text size="xs" fw={700} tt="uppercase" lts="0.12em" c="amber">
                  {group.title}
                </Text>
                <Divider color="navy.5" />
                {group.rows.map((row) => (
                  <Group key={row.label} justify="space-between" wrap="nowrap">
                    <Text ff="heading" size="lg" fw={600} c="amber">
                      {row.label}
                    </Text>
                    <Group gap={6} wrap="nowrap">
                      {row.keys.map((key) => (
                        <Kbd key={key} size="md" miw={44} ta="center">
                          {key}
                        </Kbd>
                      ))}
                    </Group>
                  </Group>
                ))}
              </Stack>
            ))}
          </SimpleGrid>
        </Modal.Body>
      </Modal.Content>
    </Modal.Root>
  )
}
