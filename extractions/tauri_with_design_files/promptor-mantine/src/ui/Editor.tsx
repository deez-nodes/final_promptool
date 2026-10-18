import { Chip, Group, ScrollArea, Select, Stack, Textarea, TextInput, Tooltip } from '@mantine/core'
import type { KeyboardEvent } from 'react'
import type { Edit } from '../model/edit'
import { templateOf } from '../model/items'
import { BLOCKS, STATUS_OPTIONS, TEMPLATE_OPTIONS } from '../model/templates'
import type { Item, Status } from '../model/types'
import { FilesSection } from './Files'
import { Section } from './Section'

interface Props {
  item: Item
  baseDir: string
  onPatch: (patch: Partial<Item>) => void
  onTemplate: (template: string) => void
  /** Maps a key press to the edit it makes, or null to leave it to the textarea. */
  keyEdit: (e: KeyboardEvent<HTMLTextAreaElement>, edit: Edit) => Edit | null
  onFieldFocus: () => void
}

export function Editor({ item, baseDir, onPatch, onTemplate, keyEdit, onFieldFocus }: Props) {
  const tpl = templateOf(item)

  const setField = (key: string, value: string) => onPatch({ fields: { ...item.fields, [key]: value } })

  const onKeyDown = (key: string) => (e: KeyboardEvent<HTMLTextAreaElement>) => {
    const ta = e.currentTarget
    const edit = keyEdit(e, { value: ta.value, start: ta.selectionStart, end: ta.selectionEnd })
    if (!edit) return
    e.preventDefault()
    if (edit.value !== ta.value) {
      // Write the DOM first so the selection below lands on the new text.
      ta.value = edit.value
      setField(key, edit.value)
    }
    ta.setSelectionRange(edit.start, edit.end)
  }

  return (
    <>
      <Group px="lg" py="xs" wrap="nowrap">
        <TextInput
          flex={1}
          variant="unstyled"
          size="lg"
          fw={700}
          placeholder="Untitled"
          maxLength={80}
          value={item.name}
          onChange={(e) => onPatch({ name: e.currentTarget.value })}
        />
        <Select
          size="xs"
          w={220}
          allowDeselect={false}
          data={TEMPLATE_OPTIONS}
          value={item.template}
          onChange={(value) => value && onTemplate(value)}
        />
        {tpl.isTask && (
          <Select
            size="xs"
            w={150}
            allowDeselect={false}
            data={STATUS_OPTIONS}
            value={item.status}
            onChange={(value) => value && onPatch({ status: value as Status })}
          />
        )}
      </Group>

      <ScrollArea flex={1} mih={0}>
        <Stack gap="sm" px="lg" py="md">
          {tpl.fields.map((f) =>
            f.hasFiles ? (
              <FilesSection
                key={f.key}
                label={f.label}
                hint={f.hint}
                paths={item.files[f.key] ?? []}
                baseDir={baseDir}
                onChange={(paths) => onPatch({ files: { ...item.files, [f.key]: paths } })}
              />
            ) : (
              <Section key={f.key} label={f.label} hint={f.hint}>
                <Textarea
                  variant="unstyled"
                  autosize
                  minRows={3}
                  spellCheck={false}
                  placeholder={f.placeholder}
                  styles={{ input: { color: 'var(--mantine-color-sand-filled)' } }}
                  value={item.fields[f.key] ?? ''}
                  onChange={(e) => setField(f.key, e.currentTarget.value)}
                  onKeyDown={onKeyDown(f.key)}
                  onFocus={onFieldFocus}
                />
              </Section>
            ),
          )}

          {tpl.blockOptions?.length ? (
            <Section label="Best-Practice Blocks" hint="click to include canned rules">
              <Chip.Group multiple value={item.blocks} onChange={(blocks) => onPatch({ blocks })}>
                <Group gap="xs">
                  {tpl.blockOptions.map((key) => (
                    <Tooltip key={key} label={BLOCKS[key]} multiline w={360} openDelay={400}>
                      <div>
                        <Chip value={key} size="xs" radius="sm" color="miku" variant="light">
                          {key}
                        </Chip>
                      </div>
                    </Tooltip>
                  ))}
                </Group>
              </Chip.Group>
            </Section>
          ) : null}
        </Stack>
      </ScrollArea>
    </>
  )
}
