<template>
  <!--
    The edits board (DECIDED.md Layout "Right pane: a Trello-style Kanban with bordered columns,
    cards coloured by meaning, and checkboxes inside. Edits from your replies land there as
    cards."). Every point of a reply's Proposed Edits section is a card in the first column.
    Cards drag between columns (or Ctrl+Shift+arrows when a card is focused); removing a card,
    a checklist item or a column is undone with Alt+Z.
  -->
  <section id="kanban" :class="$style.board" aria-label="Edits board">
    <div :class="$style.toolbar">
      <span :class="$style.summary">
        <code :class="$style.count">{{ board.cards.length }}</code> edits, from replies' Proposed Edits and by hand
      </span>
      <form :class="$style.addColumn" @submit.prevent="addColumn">
        <input
          v-model="newColumn"
          :class="$style.input"
          placeholder="New column"
          aria-label="New column name"
          spellcheck="false"
        />
        <UButton type="submit" :class="$style.btn" title="Add a column">+ Column</UButton>
      </form>
    </div>

    <div :class="$style.columns">
      <div
        v-for="(col, ci) in board.columns"
        :key="col.id"
        :class="[$style.column, dropColumn === col.id && $style.dropping]"
        :data-column="col.title"
        :data-column-id="col.id"
        role="group"
        :aria-label="(col.title || 'Untitled') + ' column'"
        @dragover="onDragOver($event, col.id)"
        @dragleave="onDragLeave($event, col.id)"
        @drop="onDrop($event, col.id)"
      >
        <header :class="$style.columnHead">
          <input
            :value="col.title"
            :class="$style.columnTitle"
            aria-label="Column name"
            spellcheck="false"
            @change="ops.renameColumn(col.id, ($event.target as HTMLInputElement).value)"
            @keydown.enter.prevent="($event.target as HTMLInputElement).blur()"
          />
          <code :class="$style.count" :title="inColumn(col.id).length + ' edit(s)'">{{ inColumn(col.id).length }}</code>
          <UButton
            :class="$style.tool"
            :disabled="ci === 0"
            :aria-label="'Move column ' + col.title + ' left'"
            title="Move column left"
            @click="moveColumn(col.id, -1)"
          >
            ←
          </UButton>
          <UButton
            :class="$style.tool"
            :disabled="ci === board.columns.length - 1"
            :aria-label="'Move column ' + col.title + ' right'"
            title="Move column right"
            @click="moveColumn(col.id, 1)"
          >
            →
          </UButton>
          <UButton
            :class="[$style.tool, $style.danger]"
            :disabled="board.columns.length <= 1"
            :aria-label="'Remove column ' + col.title"
            title="Remove the column and its edits (Alt+Z undoes it)"
            @click="ops.removeColumn(col.id)"
          >
            ✕
          </UButton>
        </header>

        <ol :class="$style.cards">
          <li v-for="card in inColumn(col.id)" :key="card.id" :class="$style.slot">
            <StudioKanbanCard
              :card="card"
              :source="sourceOf(card)"
              :first="ci === 0"
              :last="ci === board.columns.length - 1"
              @dragstart="dragging = card.id"
              @dragend="endDrag"
            />
          </li>
        </ol>

        <form :class="$style.addCard" @submit.prevent="addCard(col.id, $event)">
          <input
            name="text"
            :class="$style.input"
            placeholder="Add an edit"
            :aria-label="'Add an edit to ' + col.title"
          />
        </form>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { moveColumn as moveColumnPure, type EditCard } from '~/composables/model/board'

const store = useWorkspace()
const ops = store.boardOps
const board = computed(() => store.board.value)
const newColumn = ref('')
const dragging = ref<string | null>(null)
const dropColumn = ref<string | null>(null)

const inColumn = (id: string) => board.value.cards.filter(c => c.column === id)

/** "Reply 3 · 02" for a card from a reply's Proposed Edits point; "" for one added by hand. */
const sourceOf = (card: EditCard): string => {
  if (!card.key) return ''
  const [docId, n] = card.key.split('#')
  const i = store.ws.value.conversation.findIndex(d => d.id === docId)
  return (i >= 0 ? 'Reply ' + (i + 1) : 'Removed reply') + ' · ' + n
}

const addColumn = () => {
  ops.addColumn(newColumn.value)
  newColumn.value = ''
}

const moveColumn = (id: string, dir: -1 | 1) => {
  store.board.value = moveColumnPure(store.board.value, id, dir)
}

const addCard = (columnId: string, e: Event) => {
  const form = e.target as HTMLFormElement
  const input = form.elements.namedItem('text') as HTMLInputElement
  if (!input.value.trim()) return
  ops.addCard(columnId, input.value.trim())
  input.value = ''
}

// ── drag and drop between columns ─────────────────────────────────────────

const CARD_TYPE = 'text/x-promptor-edit'

const onDragOver = (e: DragEvent, columnId: string) => {
  if (!dragging.value && !e.dataTransfer?.types.includes(CARD_TYPE)) return
  e.preventDefault()
  if (e.dataTransfer) e.dataTransfer.dropEffect = 'move'
  dropColumn.value = columnId
}

const onDragLeave = (e: DragEvent, columnId: string) => {
  const to = e.relatedTarget as Node | null
  if (dropColumn.value === columnId && !(e.currentTarget as HTMLElement).contains(to)) dropColumn.value = null
}

/** Drop before the card under the pointer (after it, on its lower half), else at the column's end. */
const onDrop = (e: DragEvent, columnId: string) => {
  const id = e.dataTransfer?.getData(CARD_TYPE) || dragging.value
  dropColumn.value = null
  if (!id) return
  e.preventDefault()
  let beforeId: string | null = null
  const over = (e.target as HTMLElement).closest<HTMLElement>('[data-edit-card]')
  if (over && over.dataset.cardId && over.dataset.cardId !== id) {
    const rect = over.getBoundingClientRect()
    if (e.clientY < rect.top + rect.height / 2) beforeId = over.dataset.cardId
    else {
      const list = inColumn(columnId).filter(c => c.id !== id)
      const i = list.findIndex(c => c.id === over.dataset.cardId)
      beforeId = list[i + 1]?.id ?? null
    }
  }
  ops.moveCard(id, columnId, beforeId)
  dragging.value = null
}

const endDrag = () => {
  dragging.value = null
  dropColumn.value = null
}
</script>

<style module src="./KanbanPane.module.css"></style>
