import { Badge, Button, CloseButton, Group, Text, TextInput } from '@mantine/core'
import { useRef, useState } from 'react'
import { resolvePath } from '../model/items'
import { Section } from './Section'

const EXT_COLOR: Record<string, string> = { ts: 'sky', tsx: 'sky', js: 'sky', jsx: 'sky', md: 'amber', json: 'mint' }

const extOf = (path: string) => /\.([a-z0-9]+)$/i.exec(path)?.[1].toLowerCase() ?? ''

interface PillProps {
  path: string
  baseDir: string
  onRemove: () => void
}

function FilePill({ path, baseDir, onRemove }: PillProps) {
  const shown = path.startsWith(baseDir) ? path.slice(baseDir.length).replace(/^\//, '') : path
  const ext = extOf(path)
  const color = EXT_COLOR[ext] ?? 'dark.1'

  return (
    <Group gap={6} wrap="nowrap">
      <Text size="sm" fw={700} td="underline" c={color}>
        {shown}
      </Text>
      {ext && (
        <Badge size="xs" color={color}>
          {ext}
        </Badge>
      )}
      <CloseButton size="xs" aria-label={`Remove ${shown}`} onClick={onRemove} />
    </Group>
  )
}

interface Props {
  label: string
  hint: string
  paths: string[]
  baseDir: string
  onChange: (paths: string[]) => void
}

export function FilesSection({ label, hint, paths, baseDir, onChange }: Props) {
  const [draft, setDraft] = useState('')
  const input = useRef<HTMLInputElement>(null)

  const add = () => {
    const raw = draft.trim().replace(/,$/, '')
    if (raw) onChange([...new Set([...paths, resolvePath(raw, baseDir)])])
    setDraft('')
  }

  return (
    <Section
      label={label}
      hint={hint}
      tools={
        <>
          <Badge flex="none" color="gray">
            Paths
          </Badge>
          <Button flex="none" size="compact-xs" variant="white" color="hot" onClick={() => input.current?.focus()}>
            + File
          </Button>
        </>
      }
    >
      <Group gap="md">
        {paths.map((path) => (
          <FilePill key={path} path={path} baseDir={baseDir} onRemove={() => onChange(paths.filter((p) => p !== path))} />
        ))}
        <TextInput
          ref={input}
          flex={1}
          miw={220}
          variant="unstyled"
          size="xs"
          placeholder="path/to/file  (Enter to add)"
          spellCheck={false}
          value={draft}
          onChange={(e) => setDraft(e.currentTarget.value)}
          onKeyDown={(e) => {
            if (e.key !== 'Enter' && e.key !== ',') return
            e.preventDefault()
            add()
          }}
        />
      </Group>
    </Section>
  )
}
