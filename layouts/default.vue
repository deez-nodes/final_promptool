<template>
  <div id="studio-shell" :class="$style.shell">
    <Navbar />

    <!--
      Panes (DECIDED.md Layout "Panes are resizable, movable and addable", DZ-47; Stack: "Nuxt UI
      already ships the resizable panels, sidebar ..."): Nuxt UI's UDashboardGroup holds the
      sidebar (UDashboardSidebar, resizable and collapsible) and each other pane (UDashboardPanel:
      sections, a second sections pane, the Kanban edits board). Nuxt UI resizes them with its
      UDashboardResizeHandle (double-click resets that pane) and keeps their sizes in cookies.
      Movable and addable are layered on top: the panes render from the ordered list in
      useLayoutPrefs (Move left/right in each pane's menu), and only the open ones render
      (add from the More menu, close from the pane menu). The last pane that is not the
      sidebar fills the rest of the row. No preview pane: the output stays hidden until asked for.
    -->
    <UDashboardGroup storage="cookie" :storage-key="PANE_STORAGE_KEY" :ui="{ base: $style.group }">
      <template v-for="(p, i) in panes" :key="paneKey(p)">
        <UDashboardSidebar
          v-if="p.kind === 'sidebar'"
          :id="p.id"
          v-model:collapsed="sidebarCollapsed"
          :side="sidebarSide(i)"
          resizable
          collapsible
          :default-size="PANE_SIZE[p.id].default"
          :min-size="PANE_SIZE[p.id].min"
          :max-size="PANE_SIZE[p.id].max"
          :toggle="false"
          :data-pane="p.id"
          :data-kind="p.kind"
          role="region"
          :aria-label="PANE_LABEL[p.id] + ' pane'"
          :ui="{ root: $style.sidebar, header: $style.sidebarHead, body: $style.sidebarBody, handle: $style.handle }"
        >
          <template #header="{ collapsed }">
            <UButton
              v-if="collapsed"
              :class="$style.paneMenu"
              aria-label="Expand the sidebar"
              title="Expand the sidebar (or drag its edge)"
              @click="sidebarCollapsed = false"
            >
              »
            </UButton>
            <template v-else>
              <span :class="$style.paneTitle">{{ PANE_LABEL[p.id] }}</span>
              <UDropdownMenu :items="paneMenu(p, i)" :content="{ align: 'end' }" :ui="{ content: $style.menu, item: $style.menuItem }">
                <UButton :class="$style.paneMenu" :aria-label="PANE_LABEL[p.id] + ' pane menu'" title="Move, collapse or close this pane">
                  ⋯
                </UButton>
              </UDropdownMenu>
            </template>
          </template>
          <template #default="{ collapsed }">
            <slot v-if="!collapsed" :name="p.kind" :pane="p" />
          </template>
        </UDashboardSidebar>

        <UDashboardPanel
          v-else
          :id="p.id"
          :resizable="!isFill(p)"
          :default-size="isFill(p) ? undefined : PANE_SIZE[p.id].default"
          :min-size="PANE_SIZE[p.id].min"
          :max-size="PANE_SIZE[p.id].max"
          :data-pane="p.id"
          :data-kind="p.kind"
          :data-fill="isFill(p) ? 'true' : undefined"
          role="region"
          :aria-label="PANE_LABEL[p.id] + ' pane'"
          :ui="panelUi(p)"
        >
          <template #header>
            <header :class="$style.paneHead">
              <span :class="$style.paneTitle">{{ PANE_LABEL[p.id] }}</span>
              <UDropdownMenu :items="paneMenu(p, i)" :content="{ align: 'end' }" :ui="{ content: $style.menu, item: $style.menuItem }">
                <UButton :class="$style.paneMenu" :aria-label="PANE_LABEL[p.id] + ' pane menu'" title="Move or close this pane">
                  ⋯
                </UButton>
              </UDropdownMenu>
            </header>
          </template>
          <template #body>
            <slot :name="p.kind" :pane="p" />
          </template>
        </UDashboardPanel>
      </template>
    </UDashboardGroup>
  </div>
</template>

<script setup lang="ts">
import type { DropdownMenuItem } from '@nuxt/ui'
import { PANE_LABEL, PANE_SIZE, PANE_STORAGE_KEY, type PaneSpec } from '~/composables/useLayoutPrefs'

const style = useCssModule()
const { panes, loaded, paneEpoch, sidebarCollapsed, movePane, closePane } = useLayoutPrefs()
const { pasteFromFile } = useFilePaste()

/** The pane that takes the rest of the row: the last one that is not the sidebar. */
const fillId = computed(() => [...panes.value].reverse().find(p => p.kind !== 'sidebar')?.id)
const isFill = (p: PaneSpec) => p.id === fillId.value

/** The sidebar's handle goes on its inner side: after it, or before it when it is the last pane. */
const sidebarSide = (i: number) => (i === panes.value.length - 1 ? 'right' : 'left')

/**
 * A prerendered page (nuxt generate, the Tauri build) has no cookies at render time, so its
 * panes are re-made once the client has loaded, to pick up the sizes Nuxt UI saved.
 */
const prerendered = !!useNuxtApp().payload.prerenderedAt

/**
 * Nuxt UI picks a pane's storage when the pane is made, so a pane is re-made when it starts or
 * stops filling the row (it only has a saved size while it does not), and on Reset pane sizes.
 */
const paneKey = (p: PaneSpec) =>
  p.id + (isFill(p) ? ':fill:' : ':sized:') + paneEpoch.value + (prerendered && !loaded.value ? ':prerendered' : '')

const panelUi = (p: PaneSpec) => ({
  root: isFill(p) ? style.pane + ' ' + style.fill : style.pane,
  body: p.kind === 'sections' ? style.sectionsBody : style.paneBody,
  handle: style.handle
})

const paneMenu = (p: PaneSpec, i: number): DropdownMenuItem[][] => {
  const groups: DropdownMenuItem[][] = [[
    { label: 'Move left', disabled: i === 0, onSelect: () => movePane(p.id, -1) },
    { label: 'Move right', disabled: i === panes.value.length - 1, onSelect: () => movePane(p.id, 1) }
  ]]
  if (p.kind === 'sidebar') {
    groups.push([{ label: 'Collapse the sidebar', onSelect: () => { sidebarCollapsed.value = true } }])
  }
  if (p.kind === 'sections') {
    groups.push([{ label: 'Paste from file (' + keysOf('pasteFile') + ')', onSelect: () => void pasteFromFile() }])
  }
  groups.push([
    p.id === 'sections'
      ? { label: 'Close pane (the main sections pane stays)', disabled: true }
      : { label: 'Close pane', onSelect: () => closePane(p.id) }
  ])
  return groups
}
</script>

<style module src="./default.module.css"></style>
