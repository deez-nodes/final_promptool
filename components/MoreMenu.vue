<template>
  <!--
    The secondary menu beside the fixed action bar (DECIDED.md Layout "Fixed action bar: remove
    or merge controls before adding any"): Show output and Paste from file live here, not in the
    bar, and so do the panes (DZ-47: add a pane, reset the sizes). Each action also has a key (?).
  -->
  <UDropdownMenu :items="items" :content="{ align: 'start' }" :ui="{ content: $style.menu, item: $style.item }">
    <UButton id="more-menu" :class="$style.btn" aria-label="More: output, paste from file, panes" title="More: Show output, Paste from file, panes">
      More ▾
    </UButton>
  </UDropdownMenu>
  <OutputDialog />
</template>

<script setup lang="ts">
import type { DropdownMenuItem } from '@nuxt/ui'
import { PANE_LABEL } from '~/composables/useLayoutPrefs'

const output = useOutputPanel()
const { pasteFromFile } = useFilePaste()
const { hasPane, addPane, resetPaneSizes } = useLayoutPrefs()

const addItem = (id: 'sidebar' | 'sections-2' | 'kanban'): DropdownMenuItem => ({
  label: hasPane(id) ? PANE_LABEL[id] + ' pane is open' : 'Add ' + PANE_LABEL[id].toLowerCase() + ' pane',
  disabled: hasPane(id),
  onSelect: () => addPane(id)
})

const items = computed<DropdownMenuItem[][]>(() => [
  [
    { label: 'Show output (' + keysOf('output') + ')', onSelect: () => { output.value = true } },
    { label: 'Paste from file (' + keysOf('pasteFile') + ')', onSelect: () => void pasteFromFile() }
  ],
  [addItem('sidebar'), addItem('sections-2'), addItem('kanban')],
  [{ label: 'Reset pane sizes', onSelect: () => resetPaneSizes() }]
])
</script>

<style module src="./MoreMenu.module.css"></style>
