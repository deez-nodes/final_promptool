import { AppShell, Button, Center, Group, SegmentedControl, Stack, Text, TextInput } from '@mantine/core'
import { useDisclosure, useLocalStorage } from '@mantine/hooks'
import { notifications } from '@mantine/notifications'
import { useRef, useState, type KeyboardEvent } from 'react'
import { useBridge } from './bridge'
import { downloadText } from './download'
import { buildOutput } from './model/build'
import type { Edit } from './model/edit'
import { createItem, withTemplate } from './model/items'
import { listKey } from './model/listKeys'
import type { Item, Items, Mode, OutputFormat, Todo } from './model/types'
import { createVim, REDO_KEY, VIM_OFF, vimKey, vimStatus } from './model/vim'
import { glow, LOGO_FONT } from './theme'
import { ActionBar } from './ui/ActionBar'
import { CheatSheet } from './ui/CheatSheet'
import { Editor } from './ui/Editor'
import { RightPane, type RightTab } from './ui/RightPane'
import { Sidebar } from './ui/Sidebar'

const MODIFIER_KEYS = ['Shift', 'Control', 'Alt', 'Meta']

const OPTIMIZE_PROMPT =
  '/promptor optimize this draft. Show the optimized prompt labeled SYSTEM: and USER: with XML-tagged sections, then a short "why, by rule ID" list.\n\n'
const RUN_PROMPT = 'Run this prompt as a fresh task and show the result under a "--- RUN OUTPUT ---" line:\n\n'

const stored = <T,>(key: string, defaultValue: T) => ({ key, defaultValue, getInitialValueInEffect: false })
const toast = (message: string, color = 'green') => notifications.show({ message, color })

export function App() {
  const [items, setItems] = useLocalStorage<Items>(stored('promptor_items', {}))
  const [todos, setTodos] = useLocalStorage<Todo[]>(stored('promptor_todos', []))
  const [baseDir, setBaseDir] = useLocalStorage(stored('promptor_basedir', '~/Projects/'))
  const [fmt, setFmt] = useLocalStorage<OutputFormat>(stored('promptor_fmt', 'xml'))
  const [vimOn, setVimOn] = useLocalStorage(stored('promptor_vim', false))

  const [mode, setMode] = useState<Mode>('prompt')
  const [activeId, setActiveId] = useState<string | null>(null)
  const [tab, setTab] = useState<RightTab>('todos')
  const [cheatOpen, cheat] = useDisclosure(false)
  const bridge = useBridge()

  const vim = useRef(createVim())
  const [vimState, setVimState] = useState(() => vimStatus(vim.current))

  const active = activeId ? items[activeId] : undefined
  const output = active ? buildOutput(active, fmt) : ''

  const update = (id: string, change: (item: Item) => Item) =>
    setItems((all) => ({ ...all, [id]: { ...change(all[id]), updated: Date.now() } }))

  const addItem = () => {
    const item = createItem(mode)
    setItems((all) => ({ ...all, [item.id]: item }))
    setActiveId(item.id)
  }

  const deleteItem = (id: string) => {
    setItems(({ [id]: _removed, ...rest }) => rest)
    if (id === activeId) setActiveId(null)
  }

  const switchMode = (next: Mode) => {
    setMode(next)
    setActiveId(null)
  }

  const enterNormal = () => {
    vim.current.mode = 'normal'
    vim.current.pending = ''
    setVimState(vimStatus(vim.current))
  }

  const toggleVim = (on: boolean) => {
    setVimOn(on)
    if (on) enterNormal()
  }

  const keyEdit = (e: KeyboardEvent<HTMLTextAreaElement>, edit: Edit) => {
    const typing = !vimOn || (vim.current.mode === 'insert' && e.key !== 'Escape')
    if (typing) return listKey(e.key, e.shiftKey, edit)
    const redo = e.ctrlKey && e.key === 'r'
    if (MODIFIER_KEYS.includes(e.key) || e.metaKey || e.altKey || (e.ctrlKey && !redo)) return null
    const next = vimKey(vim.current, redo ? REDO_KEY : e.key, edit)
    setVimState(vimStatus(vim.current))
    return next
  }

  const copy = () => navigator.clipboard.writeText(output).then(() => toast('✓ Copied'))

  const save = () => {
    const name = (active?.name || 'prompt').replace(/[^a-z0-9_-]/gi, '_').toLowerCase()
    downloadText(`${name}.${fmt}`, output)
    toast('✓ Saved')
  }

  const sendDraft = (prompt: string, shown: string, verb: string) => {
    if (!output) return toast(`Nothing to ${verb}`, 'amber')
    setTab('chat')
    bridge.send(prompt + output, shown).then((ok) => ok || toast(`! ${verb} failed`, 'red'))
  }

  return (
    <AppShell header={{ height: 50 }} navbar={{ width: 262, breakpoint: 0 }} aside={{ width: 400, breakpoint: 0 }}>
      <AppShell.Header>
        <Group h="100%" px="md">
          <Text ff={LOGO_FONT} fw={900} size="lg" lts="0.18em" c="acid" tt="uppercase" style={{ textShadow: glow('acid') }}>
            promp
            <Text span inherit c="miku" style={{ textShadow: glow('miku') }}>
              TOR
            </Text>
          </Text>
          <Text size="xs" lts="0.16em" c="dark.1">
            // rich prompt editor
          </Text>
          <SegmentedControl
            size="xs"
            data={[
              { value: 'prompt', label: 'Prompts' },
              { value: 'task', label: 'Tasks' },
            ]}
            value={mode}
            onChange={(value) => switchMode(value as Mode)}
          />
          <TextInput
            ml="auto"
            w={300}
            size="xs"
            aria-label="Base dir"
            leftSection={<Text size="xs">base dir</Text>}
            leftSectionWidth={80}
            placeholder="~/Projects/..."
            spellCheck={false}
            value={baseDir}
            onChange={(e) => setBaseDir(e.currentTarget.value)}
          />
        </Group>
      </AppShell.Header>

      <Sidebar
        items={Object.values(items)}
        mode={mode}
        activeId={activeId}
        onSelect={setActiveId}
        onDelete={deleteItem}
        onNew={addItem}
      />

      <AppShell.Main>
        <Stack gap={0} h="calc(100dvh - var(--app-shell-header-height))">
          {active ? (
            <>
              <Editor
                key={active.id}
                item={active}
                baseDir={baseDir}
                onPatch={(patch) => update(active.id, (item) => ({ ...item, ...patch }))}
                onTemplate={(template) => update(active.id, (item) => withTemplate(item, template))}
                keyEdit={keyEdit}
                onFieldFocus={() => vimOn && enterNormal()}
              />
              <ActionBar
                bridge={bridge}
                fmt={fmt}
                vimOn={vimOn}
                vim={vimOn ? vimState : VIM_OFF}
                onCopy={copy}
                onSave={save}
                onOptimize={() => sendDraft(OPTIMIZE_PROMPT, '✦ optimize this draft', 'optimize')}
                onDelete={() => deleteItem(active.id)}
                onRun={() => sendDraft(RUN_PROMPT, '▶ run this draft', 'run')}
                onFmt={setFmt}
                onVim={toggleVim}
                onHelp={cheat.open}
              />
            </>
          ) : (
            <Center flex={1}>
              <Stack align="center" gap="xl">
                <Text fz={40} lh={1} c="navy.3">
                  ⌖
                </Text>
                <Text size="sm" c="dimmed">
                  No {mode} selected
                </Text>
                <Button variant="default" style={{ borderStyle: 'dashed' }} onClick={addItem}>
                  + New
                </Button>
              </Stack>
            </Center>
          )}
        </Stack>
      </AppShell.Main>

      <RightPane tab={tab} onTab={setTab} todos={todos} onTodos={setTodos} bridge={bridge} />
      <CheatSheet opened={cheatOpen} onClose={cheat.close} />
    </AppShell>
  )
}
