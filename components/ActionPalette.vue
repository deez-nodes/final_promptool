<template>
  <!--
    The command palette (DECIDED.md Stack: "Nuxt UI already ships ... command palette"; Layout
    "Keyboard first"): every action with its key, opened with ? (or F1). Type to filter, the
    arrows move, Enter runs the action; Escape closes it. Nuxt UI's UModal + UCommandPalette.
  -->
  <UModal
    v-model:open="open"
    title="Command palette"
    description="Every action and its key. Type to filter, Enter runs the action, Escape closes."
    :close="false"
    :ui="{ overlay: $style.overlay, content: $style.content }"
    @after:leave="runPending"
  >
    <template #content>
      <UCommandPalette
        id="command-palette"
        :groups="groups"
        :fuse="fuse"
        :icon="false"
        :model-value="null"
        placeholder="Type an action, or a key such as Alt+N"
        :ui="{
          root: $style.root,
          input: $style.input,
          viewport: $style.viewport,
          group: $style.group,
          label: $style.label,
          item: $style.item,
          itemLabel: $style.itemLabel,
          itemLabelBase: $style.itemLabelBase,
          itemLabelSuffix: $style.itemLabelSuffix,
          itemDescription: $style.itemDescription,
          empty: $style.empty
        }"
      >
        <template #item-trailing="{ item }">
          <kbd v-if="item.keys" :class="$style.kbd">{{ item.keys }}</kbd>
        </template>
      </UCommandPalette>
    </template>
  </UModal>
</template>

<script setup lang="ts">
import type { CommandPaletteGroup, CommandPaletteItem } from '@nuxt/ui'
import { PANE_LABEL, type PaneId } from '~/composables/useLayoutPrefs'

const { open, shortcuts } = useShortcuts()
const run = useShortcutRunner()
const { hasPane, addPane, closePane, resetPaneSizes, sidebarCollapsed } = useLayoutPrefs()

/** Every action is listed (Nuxt UI's palette shows 12 per group unless told otherwise). */
const fuse = { resultLimit: 100 }

/** The action picked, run once the palette has closed and given focus back. */
let pending: (() => void) | null = null
const pick = (action: () => void) => {
  pending = action
  open.value = false
}
const runPending = () => {
  const action = pending
  pending = null
  action?.()
}

type Item = CommandPaletteItem & { keys?: string }

const keyItems = (group: 'Message' | 'Section' | 'App'): Item[] =>
  shortcuts
    .filter(s => s.group === group)
    // The binding is the suffix too, so typing a key (Alt+N) finds its action; the kbd shows it.
    // `?` itself only closes the palette again.
    .map(s => ({ id: s.id, label: s.label, keys: s.keys, suffix: s.keys, onSelect: () => pick(s.id === 'help' ? () => {} : () => void run(s.id)) }))

const paneItem = (id: Exclude<PaneId, 'sections'>): Item =>
  hasPane(id)
    ? { id: 'close-' + id, label: 'Close the ' + PANE_LABEL[id].toLowerCase() + ' pane', onSelect: () => pick(() => closePane(id)) }
    : { id: 'add-' + id, label: 'Add the ' + PANE_LABEL[id].toLowerCase() + ' pane', onSelect: () => pick(() => addPane(id)) }

const groups = computed<CommandPaletteGroup<Item>[]>(() => [
  { id: 'message', label: 'Message', items: keyItems('Message') },
  { id: 'section', label: 'Section (the focused one)', items: keyItems('Section') },
  { id: 'app', label: 'App', items: keyItems('App') },
  {
    id: 'panes',
    label: 'Panes (also in the More menu and each pane’s ⋯ menu)',
    items: [
      paneItem('sidebar'),
      paneItem('sections-2'),
      paneItem('kanban'),
      ...(hasPane('sidebar')
        ? [{ id: 'collapse-sidebar', label: sidebarCollapsed.value ? 'Expand the sidebar' : 'Collapse the sidebar', onSelect: () => pick(() => { sidebarCollapsed.value = !sidebarCollapsed.value }) }]
        : []),
      { id: 'reset-sizes', label: 'Reset pane sizes', onSelect: () => pick(resetPaneSizes) }
    ]
  }
])
</script>

<style module src="./ActionPalette.module.css"></style>
