import { Button, Group, Paper, ScrollArea, Stack, Text, Textarea } from '@mantine/core'
import { useEffect, useRef, useState } from 'react'
import type { Bridge, ChatMessage } from '../bridge'

function Message({ role, text }: ChatMessage) {
  if (role === 'sys' || role === 'cost') {
    return (
      <Text size="xs" c="dimmed" ta={role === 'sys' ? 'center' : 'left'}>
        {text}
      </Text>
    )
  }
  const mine = role === 'you'
  return (
    <Paper withBorder p="xs" maw="92%" style={{ alignSelf: mine ? 'flex-end' : 'flex-start' }}>
      <Text size="xs" c={mine ? 'acid' : undefined} style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
        {text}
      </Text>
    </Paper>
  )
}

export function Chat({ bridge }: { bridge: Bridge }) {
  const [draft, setDraft] = useState('')
  const viewport = useRef<HTMLDivElement>(null)

  useEffect(() => {
    viewport.current?.scrollTo({ top: viewport.current.scrollHeight })
  }, [bridge.messages.length])

  const send = () => {
    const text = draft.trim()
    if (!text) return
    bridge.send(text)
    setDraft('')
  }

  return (
    <Stack h="100%" gap={0}>
      <ScrollArea flex={1} mih={0} p="md" viewportRef={viewport}>
        <Stack gap="xs">
          {bridge.messages.map((message, i) => (
            <Message key={i} {...message} />
          ))}
        </Stack>
      </ScrollArea>
      <Group gap="xs" p="xs" align="flex-end" wrap="nowrap">
        <Textarea
          flex={1}
          size="xs"
          autosize
          minRows={1}
          maxRows={5}
          placeholder="message the session… (Enter to send)"
          disabled={!bridge.up}
          value={draft}
          onChange={(e) => setDraft(e.currentTarget.value)}
          onKeyDown={(e) => {
            if (e.key !== 'Enter' || e.shiftKey) return
            e.preventDefault()
            send()
          }}
        />
        <Button size="xs" disabled={!bridge.up} onClick={send}>
          Send
        </Button>
      </Group>
    </Stack>
  )
}
