<script setup lang="ts">
// Right pane: a Trello-style board. Proposed Edits from replies land here as cards.
import { computed, ref } from 'vue'
import type { Card, CardLane } from '../model/types'
import { useApp } from '../store/app'
import s from './KanbanPane.module.css'

const app = useApp()
const lanes: { id: CardLane; label: string }[] = [
  { id: 'todo', label: 'To do' },
  { id: 'doing', label: 'Doing' },
  { id: 'done', label: 'Done' },
]
const byLane = computed(() => {
  const m: Record<CardLane, Card[]> = { todo: [], doing: [], done: [] }
  for (const c of app.cards) m[c.lane].push(c)
  return m
})
const newTitle = ref('')
const addNew = () => {
  if (!newTitle.value.trim()) return
  app.addCard(newTitle.value.trim())
  newTitle.value = ''
}
const drafts = ref<Record<string, string>>({})
const addCheck = (id: string, e: KeyboardEvent) => {
  if (e.isComposing) return
  app.addCheck(id, drafts.value[id] ?? '')
  drafts.value[id] = ''
}
const next = (lane: CardLane): CardLane | null => (lane === 'todo' ? 'doing' : lane === 'doing' ? 'done' : null)
const prev = (lane: CardLane): CardLane | null => (lane === 'done' ? 'doing' : lane === 'doing' ? 'todo' : null)

let dragging: string | null = null
const onDragStart = (id: string) => {
  dragging = id
}
const onDrop = (lane: CardLane) => {
  if (dragging) app.moveCard(dragging, lane)
  dragging = null
}
</script>

<template>
  <div :class="s.board">
    <form :class="s.add" @submit.prevent="addNew">
      <label for="new-card" :class="s.hidden">New edit</label>
      <input id="new-card" v-model="newTitle" :class="s.addInput" placeholder="New edit, Enter to add" />
      <button type="submit" :class="s.hidden">Add</button>
    </form>
    <div :class="s.lanes">
      <section v-for="lane in lanes" :key="lane.id" :class="s.lane" @dragover.prevent @drop="onDrop(lane.id)">
        <h3 :class="s.laneHead">
          <span>{{ lane.label }}</span>
          <span :class="s.n">{{ byLane[lane.id].length }}</span>
        </h3>
        <ul :class="s.cards" role="list">
          <li
            v-for="c in byLane[lane.id]"
            :key="c.id"
            :class="[s.card, c.lane === 'done' && s.doneCard]"
            :data-type="c.type"
            draggable="true"
            @dragstart="onDragStart(c.id)"
          >
            <div :class="s.cardHead">
              <span :class="s.cardTitle">{{ c.title }}</span>
              <UButton icon="i-lucide-x" color="neutral" variant="ghost" size="xs" :aria-label="'Delete card ' + c.title" @click="app.removeCard(c.id)" />
            </div>
            <ul v-if="c.checks.length" :class="s.checks" role="list">
              <li v-for="k in c.checks" :key="k.id" :class="[s.check, k.done && s.checked]">
                <UCheckbox v-model="k.done" size="sm" :label="k.text" />
              </li>
            </ul>
            <input
              v-model="drafts[c.id]"
              :class="s.checkInput"
              :aria-label="'Add a checkbox to ' + c.title"
              placeholder="Add a checkbox"
              @keydown.enter.prevent="addCheck(c.id, $event)"
            />
            <div :class="s.cardFoot">
              <UButton v-if="prev(c.lane)" icon="i-lucide-arrow-left" color="neutral" variant="ghost" size="xs" :aria-label="'Move ' + c.title + ' left'" @click="app.moveCard(c.id, prev(c.lane)!)" />
              <span :class="s.spacer" />
              <UButton v-if="next(c.lane)" icon="i-lucide-arrow-right" color="neutral" variant="ghost" size="xs" :aria-label="'Move ' + c.title + ' right'" @click="app.moveCard(c.id, next(c.lane)!)" />
            </div>
          </li>
        </ul>
      </section>
    </div>
  </div>
</template>
