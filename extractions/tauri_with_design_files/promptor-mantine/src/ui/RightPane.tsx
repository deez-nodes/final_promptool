import { AppShell, Stack, Tabs } from '@mantine/core'
import type { Bridge } from '../bridge'
import type { Todo } from '../model/types'
import { Chat } from './Chat'
import { Todos } from './Todos'

export type RightTab = 'todos' | 'chat'

interface Props {
  tab: RightTab
  onTab: (tab: RightTab) => void
  todos: Todo[]
  onTodos: (todos: Todo[]) => void
  bridge: Bridge
}

export function RightPane({ tab, onTab, todos, onTodos, bridge }: Props) {
  return (
    <AppShell.Aside>
      <Tabs value={tab} onChange={(value) => value && onTab(value as RightTab)} h="100%">
        <Stack h="100%" gap={0}>
          <Tabs.List>
            <Tabs.Tab value="todos">ToDos</Tabs.Tab>
            <Tabs.Tab value="chat">Chat</Tabs.Tab>
          </Tabs.List>
          <Tabs.Panel value="todos" flex={1} mih={0}>
            <Todos todos={todos} onChange={onTodos} />
          </Tabs.Panel>
          <Tabs.Panel value="chat" flex={1} mih={0}>
            <Chat bridge={bridge} />
          </Tabs.Panel>
        </Stack>
      </Tabs>
    </AppShell.Aside>
  )
}
