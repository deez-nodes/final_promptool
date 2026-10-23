<template>
  <!--
    One edit (DECIDED.md "Words and tools": work items are called edits). Coloured by meaning:
    the hue of the section type it came from (a reply's Proposed Edits is "what to do").
    A checklist of checkboxes inside. Keys when the card is focused: Enter edits,
    Ctrl+Shift+← → moves it between columns, Ctrl+Shift+↑ ↓ within one, Delete removes it.
  -->
  <article
    :class="[$style.card, editing && $style.editing, !card.type && $style.untyped]"
    :data-type="token"
    :data-card-id="card.id"
    :data-card-key="card.key ?? undefined"
    data-edit-card
    tabindex="0"
    :draggable="!editing"
    :aria-label="'Edit: ' + firstLine"
    @dragstart="onDragStart"
    @dragend="emit('dragend')"
    @keydown="onKey"
  >
    <header :class="$style.head">
      <span :class="$style.meaning">{{ meaning }}</span>
      <span v-if="source" :class="$style.source" title="The reply and Proposed Edits point it came from">{{ source }}</span>
      <span :class="$style.spacer" />
      <UButton
        :class="$style.tool"
        :disabled="first"
        :aria-label="'Move edit ' + firstLine + ' to the column on the left'"
        :title="'Move left (' + keys.move + ')'"
        @click="ops.stepCard(card.id, -1, 0)"
      >
        ←
      </UButton>
      <UButton
        :class="$style.tool"
        :disabled="last"
        :aria-label="'Move edit ' + firstLine + ' to the column on the right'"
        :title="'Move right (' + keys.move + ')'"
        @click="ops.stepCard(card.id, 1, 0)"
      >
        →
      </UButton>
      <UButton
        :class="$style.tool"
        :aria-pressed="editing"
        :aria-label="(editing ? 'Done editing ' : 'Edit ') + firstLine"
        :title="editing ? 'Done (Escape)' : 'Edit (Enter)'"
        @click="toggleEdit"
      >
        ✎
      </UButton>
      <UButton
        :class="[$style.tool, $style.danger]"
        :aria-label="'Remove edit ' + firstLine"
        title="Remove (Delete; Alt+Z undoes it)"
        @click="ops.removeCard(card.id)"
      >
        ✕
      </UButton>
    </header>

    <p v-if="!editing" :class="$style.text" @dblclick="toggleEdit">{{ card.text || 'Empty edit' }}</p>
    <div v-else :class="$style.form" @keydown.esc.stop.prevent="finishEdit">
      <textarea
        ref="textField"
        :value="card.text"
        :class="$style.textField"
        rows="3"
        aria-label="Edit text"
        @input="ops.updateCard(card.id, { text: ($event.target as HTMLTextAreaElement).value })"
      />
      <select
        :value="card.type ?? ''"
        :class="$style.typePick"
        aria-label="Meaning (sets the colour)"
        @change="onType"
      >
        <option value="">no type</option>
        <option v-for="t in TYPES" :key="t" :value="t">{{ TYPE_MEANING[t] }}</option>
      </select>
      <UButton :class="$style.done" @click="finishEdit">Done</UButton>
    </div>

    <!-- Checkboxes inside: a checklist per card. -->
    <ul v-if="card.checklist.length" :class="$style.checklist" :aria-label="'Checklist of ' + firstLine">
      <li v-for="k in card.checklist" :key="k.id" :class="[$style.check, k.done && $style.checked]">
        <input
          type="checkbox"
          :checked="k.done"
          :class="$style.box"
          :aria-label="k.text || 'Checklist item'"
          @change="ops.toggleCheck(card.id, k.id)"
        />
        <input
          :value="k.text"
          :class="$style.checkText"
          aria-label="Checklist item"
          spellcheck="false"
          @change="ops.renameCheck(card.id, k.id, ($event.target as HTMLInputElement).value)"
          @keydown.enter.prevent="($event.target as HTMLInputElement).blur()"
        />
        <button
          type="button"
          :class="$style.checkRemove"
          :aria-label="'Remove checklist item ' + k.text"
          title="Remove (Alt+Z undoes it)"
          @click="ops.removeCheck(card.id, k.id)"
        >
          ✕
        </button>
      </li>
    </ul>
    <footer :class="$style.foot">
      <input
        :class="$style.addCheck"
        placeholder="Add a checklist item"
        :aria-label="'Add a checklist item to ' + firstLine"
        @keydown.enter.prevent="addCheck"
      />
      <code v-if="card.checklist.length" :class="$style.progress" :title="doneCount + ' of ' + card.checklist.length + ' done'">
        {{ doneCount }}/{{ card.checklist.length }}
      </code>
    </footer>
  </article>
</template>

<script setup lang="ts">
import { TYPES, TYPE_MEANING, type SectionType } from '~/composables/model'
import type { EditCard } from '~/composables/model/board'

const props = defineProps<{
  card: EditCard
  /** "Reply 3 · 02", or "" for a card added by hand. */
  source: string
  first: boolean
  last: boolean
}>()

const emit = defineEmits<{ dragstart: []; dragend: [] }>()

const store = useWorkspace()
const ops = store.boardOps
const editing = ref(false)
const textField = ref<HTMLTextAreaElement | null>(null)

const keys = { move: 'Ctrl+Shift+← →' }

const token = computed(() => typeToken(props.card.type))
const meaning = computed(() => (props.card.type ? TYPE_MEANING[props.card.type] : 'edit'))
const firstLine = computed(() => props.card.text.split('\n').find(l => l.trim())?.trim() || 'empty edit')
const doneCount = computed(() => props.card.checklist.filter(k => k.done).length)

const toggleEdit = () => {
  if (editing.value) return finishEdit()
  editing.value = true
  nextTick(() => textField.value?.focus())
}

const finishEdit = () => {
  editing.value = false
  nextTick(() => document.querySelector<HTMLElement>('[data-card-id="' + props.card.id + '"]')?.focus())
}

const onType = (e: Event) => {
  const v = (e.target as HTMLSelectElement).value
  ops.updateCard(props.card.id, { type: v ? (v as SectionType) : null })
}

const addCheck = (e: KeyboardEvent) => {
  const input = e.target as HTMLInputElement
  ops.addCheck(props.card.id, input.value)
  input.value = ''
}

const onDragStart = (e: DragEvent) => {
  if (!e.dataTransfer) return
  e.dataTransfer.setData('text/x-promptor-edit', props.card.id)
  e.dataTransfer.effectAllowed = 'move'
  emit('dragstart')
}

/** Keys act only when the card itself has focus, not a field inside it. */
const onKey = (e: KeyboardEvent) => {
  if (e.target !== e.currentTarget || editing.value) return
  const mod = (e.ctrlKey || e.metaKey) && e.shiftKey && !e.altKey
  let done = true
  if (mod && e.key === 'ArrowLeft') ops.stepCard(props.card.id, -1, 0)
  else if (mod && e.key === 'ArrowRight') ops.stepCard(props.card.id, 1, 0)
  else if (mod && e.key === 'ArrowUp') ops.stepCard(props.card.id, 0, -1)
  else if (mod && e.key === 'ArrowDown') ops.stepCard(props.card.id, 0, 1)
  else if (!mod && !e.ctrlKey && !e.altKey && (e.key === 'Delete' || e.key === 'Backspace')) ops.removeCard(props.card.id)
  else if (!mod && !e.ctrlKey && !e.altKey && e.key === 'Enter') toggleEdit()
  else done = false
  if (!done) return
  e.preventDefault()
  // The card moved in the DOM: keep the focus on it.
  if (mod) nextTick(() => document.querySelector<HTMLElement>('[data-card-id="' + props.card.id + '"]')?.focus())
}
</script>

<style module src="./KanbanCard.module.css"></style>
