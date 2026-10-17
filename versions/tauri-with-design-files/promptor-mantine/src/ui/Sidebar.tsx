import { AppShell, Badge, Button, CloseButton, Group, NavLink, ScrollArea, Text } from '@mantine/core'
import { lastTouched, templateOf } from '../model/items'
import type { Item, Mode } from '../model/types'

/** Where it stands. Ready and in progress carry no badge. */
const STATUS_BADGE: Partial<Record<Item['status'], { color: string; label: string }>> = {
  done: { color: 'green', label: '✓ Done' },
  blocked: { color: 'amber', label: '✗ Blocked' },
  failed: { color: 'red', label: '! Failed' },
}

/** What it is. */
function kindBadge(item: Item) {
  if (templateOf(item).isTask) return { color: 'sky', label: 'Task' }
  return { color: 'acid', label: item.template.startsWith('pe_') ? 'Best practice' : 'Prompt' }
}

const formatDate = (ms: number) =>
  new Date(ms).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })

interface Props {
  items: Item[]
  mode: Mode
  activeId: string | null
  onSelect: (id: string) => void
  onDelete: (id: string) => void
  onNew: () => void
}

export function Sidebar({ items, mode, activeId, onSelect, onDelete, onNew }: Props) {
  const listed = items.filter((item) => item.mode === mode).sort((a, b) => lastTouched(b) - lastTouched(a))

  return (
    <AppShell.Navbar>
      <AppShell.Section>
        <Group justify="space-between" px="sm" py="xs">
          <Text size="xs" fw={700} tt="uppercase" c="miku">
            {mode === 'task' ? 'tasks' : 'prompts'}
          </Text>
          <Text size="xs" c="dimmed">
            {listed.length}
          </Text>
        </Group>
      </AppShell.Section>

      <AppShell.Section grow component={ScrollArea} p="xs">
        {listed.map((item) => {
          const kind = kindBadge(item)
          const status = STATUS_BADGE[item.status]
          return (
            <NavLink
              key={item.id}
              component="div"
              variant="light"
              color="gray"
              active={item.id === activeId}
              onClick={() => onSelect(item.id)}
              label={
                <Text ff="heading" size="lg" fw={700} c="orange" truncate>
                  {item.name || 'Untitled'}
                </Text>
              }
              description={
                <Group gap={6}>
                  <Badge size="xs" color={kind.color}>
                    {kind.label}
                  </Badge>
                  {status && (
                    <Badge size="xs" color={status.color}>
                      {status.label}
                    </Badge>
                  )}
                  {formatDate(lastTouched(item))}
                </Group>
              }
              rightSection={
                <CloseButton
                  size="sm"
                  aria-label="Delete"
                  onClick={(e) => {
                    e.stopPropagation()
                    onDelete(item.id)
                  }}
                />
              }
            />
          )
        })}
      </AppShell.Section>

      <AppShell.Section p="xs">
        <Button fullWidth variant="default" style={{ borderStyle: 'dashed' }} onClick={onNew}>
          + New
        </Button>
      </AppShell.Section>
    </AppShell.Navbar>
  )
}
