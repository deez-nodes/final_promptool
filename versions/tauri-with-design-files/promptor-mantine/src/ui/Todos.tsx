import { Checkbox, CloseButton, Group, ScrollArea, Stack, Text, TextInput } from '@mantine/core'
import { useState } from 'react'
import { genId } from '../model/items'
import type { Todo } from '../model/types'

interface Props {
  todos: Todo[]
  onChange: (todos: Todo[]) => void
}

export function Todos({ todos, onChange }: Props) {
  const [draft, setDraft] = useState('')

  const add = () => {
    const text = draft.trim()
    if (!text) return
    onChange([...todos, { id: genId(), text, done: false }])
    setDraft('')
  }

  const setDone = (id: string, done: boolean) => onChange(todos.map((todo) => (todo.id === id ? { ...todo, done } : todo)))

  return (
    <Stack h="100%" gap={0}>
      <ScrollArea flex={1} mih={0} p="md">
        <Stack gap="xs">
          {todos.length === 0 && (
            <Text size="xs" c="dimmed">
              // nothing to do
            </Text>
          )}
          {todos.map((todo) => (
            <Group key={todo.id} gap="xs" wrap="nowrap" align="flex-start">
              <Checkbox
                flex={1}
                size="xs"
                checked={todo.done}
                onChange={(e) => setDone(todo.id, e.currentTarget.checked)}
                label={
                  <Text span inherit c={todo.done ? 'dimmed' : undefined} td={todo.done ? 'line-through' : undefined}>
                    {todo.text}
                  </Text>
                }
              />
              <CloseButton size="sm" aria-label="Remove" onClick={() => onChange(todos.filter((t) => t.id !== todo.id))} />
            </Group>
          ))}
        </Stack>
      </ScrollArea>
      <TextInput
        m="xs"
        size="xs"
        placeholder="add a to-do… (Enter)"
        value={draft}
        onChange={(e) => setDraft(e.currentTarget.value)}
        onKeyDown={(e) => e.key === 'Enter' && add()}
      />
    </Stack>
  )
}
