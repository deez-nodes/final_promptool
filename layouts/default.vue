<template>
  <div id="studio-shell" :class="$style.shell">
    <Navbar />

    <!--
      Panes (DECIDED.md Layout "Panes are resizable, movable and addable", DZ-47): sidebar,
      sections (and a second sections pane for another message), the Kanban edits board. Each
      divider drags (pointer) or moves with ← → when focused; double-click or Enter resets the
      sizes. Sizes, order and which panes are open persist through useLayoutPrefs. No preview
      pane: the output stays hidden until asked for.
    -->
    <div ref="row" :class="$style.body" :data-dragging="dragging ? 'true' : undefined">
      <template v-for="(p, i) in panes" :key="p.id">
        <div
          v-if="i > 0"
          role="separator"
          tabindex="0"
          aria-orientation="vertical"
          aria-valuemin="0"
          aria-valuemax="100"
          :aria-valuenow="shareOf(i)"
          :aria-label="'Resize ' + PANE_LABEL[panes[i - 1].id] + ' and ' + PANE_LABEL[p.id]"
          title="Drag to resize, or focus and press ← →. Double-click or Enter resets the sizes."
          :class="$style.divider"
          :data-divider="panes[i - 1].id + '|' + p.id"
          @pointerdown="startDrag($event, i)"
          @keydown="onDividerKey($event, i)"
          @dblclick="resetPaneSizes()"
        />
        <section
          :id="DOM_ID[p.id]"
          :class="$style.pane"
          :data-pane="p.id"
          :data-kind="p.kind"
          :style="{ flexGrow: p.size }"
          :aria-label="PANE_LABEL[p.id] + ' pane'"
        >
          <header :class="$style.paneHead">
            <span :class="$style.paneTitle">{{ PANE_LABEL[p.id] }}</span>
            <UDropdownMenu :items="paneMenu(p, i)" :content="{ align: 'end' }" :ui="{ content: $style.menu, item: $style.menuItem }">
              <UButton
                :class="$style.paneMenu"
                :aria-label="PANE_LABEL[p.id] + ' pane menu'"
                title="Move or close this pane"
              >
                ⋯
              </UButton>
            </UDropdownMenu>
          </header>
          <div :class="$style.paneBody">
            <slot :name="p.kind" :pane="p" />
          </div>
        </section>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { DropdownMenuItem } from '@nuxt/ui'
import { PANE_LABEL, PANE_MIN_PX, type PaneId, type PaneSpec } from '~/composables/useLayoutPrefs'

const { panes, resizePair, resetPaneSizes, movePane, closePane } = useLayoutPrefs()
const { pasteFromFile } = useFilePaste()

/** Stable element ids (the old shell's ids kept for the first three). */
const DOM_ID: Readonly<Record<PaneId, string>> = {
  sidebar: 'sidebar',
  sections: 'editor',
  'sections-2': 'editor-2',
  kanban: 'board-pane'
}

const row = ref<HTMLElement | null>(null)
const dragging = ref(false)

/** Width the panes share: the row minus the dividers. */
const usableWidth = (): number => {
  const el = row.value
  if (!el) return 1
  let w = el.clientWidth
  el.querySelectorAll<HTMLElement>('[role="separator"]').forEach((d) => {
    w -= d.offsetWidth
  })
  return Math.max(1, w)
}

/** The left pane's share of the pair a divider sits between, 0..100. */
const shareOf = (i: number): number => {
  const a = panes.value[i - 1]
  const b = panes.value[i]
  return a && b ? Math.round((a.size / (a.size + b.size)) * 100) : 50
}

/** New sizes for the pair either side of divider i, kept above both panes' minimum widths. */
const setPair = (i: number, leftSize: number, sum: number) => {
  const a = panes.value[i - 1]
  const b = panes.value[i]
  if (!a || !b) return
  const w = usableWidth()
  const minA = PANE_MIN_PX[a.kind] / w
  const minB = PANE_MIN_PX[b.kind] / w
  const left = minA > sum - minB ? sum / 2 : Math.min(Math.max(leftSize, minA), sum - minB)
  resizePair(a.id, left, b.id, sum - left)
}

const startDrag = (e: PointerEvent, i: number) => {
  if (e.button !== 0) return
  const a = panes.value[i - 1]
  const b = panes.value[i]
  if (!a || !b) return
  e.preventDefault()
  const handle = e.currentTarget as HTMLElement
  handle.focus()
  handle.setPointerCapture(e.pointerId)
  const startX = e.clientX
  const startLeft = a.size
  const sum = a.size + b.size
  const w = usableWidth()
  dragging.value = true
  const onMove = (ev: PointerEvent) => setPair(i, startLeft + (ev.clientX - startX) / w, sum)
  const onUp = () => {
    dragging.value = false
    handle.removeEventListener('pointermove', onMove)
    handle.removeEventListener('pointerup', onUp)
    handle.removeEventListener('pointercancel', onUp)
    if (handle.hasPointerCapture(e.pointerId)) handle.releasePointerCapture(e.pointerId)
  }
  handle.addEventListener('pointermove', onMove)
  handle.addEventListener('pointerup', onUp)
  handle.addEventListener('pointercancel', onUp)
}

/** Keyboard first: ← → move the divider (Shift for bigger steps), Home/End go to the limits. */
const onDividerKey = (e: KeyboardEvent, i: number) => {
  const a = panes.value[i - 1]
  const b = panes.value[i]
  if (!a || !b || e.ctrlKey || e.metaKey || e.altKey) return
  const sum = a.size + b.size
  const step = e.shiftKey ? 0.1 : 0.02
  if (e.key === 'ArrowLeft') setPair(i, a.size - step, sum)
  else if (e.key === 'ArrowRight') setPair(i, a.size + step, sum)
  else if (e.key === 'Home') setPair(i, 0, sum)
  else if (e.key === 'End') setPair(i, sum, sum)
  else if (e.key === 'Enter') resetPaneSizes()
  else return
  e.preventDefault()
}

const paneMenu = (p: PaneSpec, i: number): DropdownMenuItem[][] => {
  const groups: DropdownMenuItem[][] = [[
    { label: 'Move left', disabled: i === 0, onSelect: () => movePane(p.id, -1) },
    { label: 'Move right', disabled: i === panes.value.length - 1, onSelect: () => movePane(p.id, 1) }
  ]]
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
