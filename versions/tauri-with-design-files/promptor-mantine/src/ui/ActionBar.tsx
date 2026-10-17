import { ActionIcon, Badge, Box, Button, Group, Select, Text } from '@mantine/core'
import { EFFORTS, MODELS, type Bridge } from '../bridge'
import type { OutputFormat } from '../model/types'
import type { VimStatus } from '../model/vim'
import { Segmented } from './Segmented'

const MODE_COLOR: Record<VimStatus['mode'], string> = { off: 'gray', insert: 'miku', normal: 'acid', visual: 'hot' }

interface Props {
  bridge: Bridge
  fmt: OutputFormat
  vimOn: boolean
  vim: VimStatus
  onCopy: () => void
  onSave: () => void
  onOptimize: () => void
  onDelete: () => void
  onRun: () => void
  onFmt: (fmt: OutputFormat) => void
  onVim: (on: boolean) => void
  onHelp: () => void
}

export function ActionBar({ bridge, fmt, vimOn, vim, onCopy, onSave, onOptimize, onDelete, onRun, onFmt, onVim, onHelp }: Props) {
  const offline = !bridge.up

  return (
    <Group gap="xs" px="lg" py="xs">
      <Button size="xs" onClick={onCopy}>
        Copy
      </Button>
      <Button size="xs" color="green" onClick={onSave}>
        Save
      </Button>
      <Button size="xs" color="green" disabled={offline} onClick={onOptimize}>
        ✦ Optimize
      </Button>
      <Button size="xs" color="hot" onClick={onDelete}>
        Delete
      </Button>
      <Button size="xs" disabled={offline} onClick={onRun}>
        ▶ Run
      </Button>
      <Select
        size="xs"
        w={100}
        aria-label="Engine model (restarts session)"
        allowDeselect={false}
        disabled={offline}
        data={MODELS}
        value={bridge.model}
        onChange={(model) => model && bridge.restart({ model })}
      />
      <Select
        size="xs"
        w={100}
        aria-label="Engine effort (restarts session)"
        allowDeselect={false}
        disabled={offline}
        data={EFFORTS}
        value={bridge.effort}
        onChange={(effort) => effort && bridge.restart({ effort })}
      />
      <Group gap={8} wrap="nowrap">
        <Box w={8} h={8} bg={offline ? 'amber' : 'miku'} style={{ borderRadius: '50%' }} />
        <Text size="xs">bridge {offline ? 'offline' : 'online'}</Text>
      </Group>
      <Segmented
        color="amber"
        data={[
          { value: 'xml', label: '<XML>' },
          { value: 'md', label: 'MD' },
        ]}
        value={fmt}
        onChange={onFmt}
      />
      <Segmented
        color="hot"
        data={[
          { value: 'on', label: 'VIM' },
          { value: 'off', label: 'OFF' },
        ]}
        value={vimOn ? 'on' : 'off'}
        onChange={(value) => onVim(value === 'on')}
      />

      <Group gap="xs" ml="auto" wrap="nowrap">
        <Badge color={MODE_COLOR[vim.mode]}>{vim.mode === 'off' ? 'VIM OFF' : vim.mode}</Badge>
        <Text size="xs" c="dimmed" maw={430} truncate>
          {vim.hint}
        </Text>
        <ActionIcon size="sm" variant="default" aria-label="Vim cheatsheet" onClick={onHelp}>
          ?
        </ActionIcon>
      </Group>
    </Group>
  )
}
