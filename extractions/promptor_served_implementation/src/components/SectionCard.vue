<script setup lang="ts">
import { computed, ref } from 'vue'
import type { Section } from '../model/types'
import { TYPES, TYPE_MEANING } from '../model/types'
import { pointCount } from '../model/points'
import { useApp } from '../store/app'
import Writing from './Writing.vue'
import s from './SectionCard.module.css'

const props = defineProps<{ section: Section; index: number; total: number }>()
const app = useApp()
const editingTitle = ref(false)
const titleInput = ref<HTMLInputElement | null>(null)

const focused = computed(() => app.focusedSection === props.section.id)
const count = computed(() => pointCount(props.section.body))
const HINTS: Record<string, string> = {
  'in response to': 'Paste what it said. Lines that start with > are quotes; write your answer under each.',
  agreements: 'What it got right. One point per line.',
  corrections: '> what it said, then what is true on the next line.',
  'proposed edits': 'Changes to make. Each point becomes a card on the board.',
  questions: 'What you still need to know.',
  role: 'Who the model is for this job.',
  context: 'What it needs to know before it starts.',
  goal: 'What done looks like.',
  task: 'The steps, one per line. Enter adds the next.',
  constraints: 'What it must not do.',
  'output format': 'The shape of the answer you want back.',
}
const hint = computed(() => HINTS[props.section.title.trim().toLowerCase()] ?? 'Lead text, then points one per line.')

const startTitle = async () => {
  editingTitle.value = true
  await Promise.resolve()
  titleInput.value?.focus()
  titleInput.value?.select()
}
const onKeydown = (e: KeyboardEvent) => {
  if (e.altKey && e.key === 'ArrowUp') { e.preventDefault(); app.moveSection(props.section.id, -1) }
  if (e.altKey && e.key === 'ArrowDown') { e.preventDefault(); app.moveSection(props.section.id, 1) }
}
</script>

<template>
  <section
    :class="[s.card, focused && s.focused, section.folded && s.folded, !section.included && s.excluded]"
    :data-type="section.type"
    @keydown="onKeydown"
    @focusin="app.focusedSection = section.id"
  >
    <header :class="s.head">
      <button :class="s.fold" type="button" :title="section.folded ? 'Unfold' : 'Fold'" @click="section.folded = !section.folded">
        <UIcon :name="section.folded ? 'i-lucide-chevron-right' : 'i-lucide-chevron-down'" :class="s.icon" />
      </button>
      <input
        v-if="editingTitle"
        ref="titleInput"
        v-model="section.title"
        :class="s.titleInput"
        @blur="editingTitle = false"
        @keydown.enter.prevent="editingTitle = false"
        @keydown.esc.prevent="editingTitle = false"
      />
      <h2 v-else :class="s.title" @dblclick="startTitle">
        {{ section.title }}
      </h2>
      <span :class="s.meta">{{ TYPE_MEANING[section.type] }}</span>
      <span v-if="count" :class="s.count"><span :class="s.hidden">points: </span>{{ count }}</span>
      <span :class="s.spacer" />
      <label :class="s.include" title="Include in output">
        <UCheckbox v-model="section.included" size="sm" />
      </label>
      <UDropdownMenu
        :items="[
          [
            { label: 'Rename', icon: 'i-lucide-pencil', onSelect: startTitle },
            { label: 'Save to library', icon: 'i-lucide-bookmark', onSelect: () => app.saveToLibrary(section) },
            { label: 'Duplicate below', icon: 'i-lucide-copy', onSelect: () => app.insertCopy(section, index + 1) },
          ],
          TYPES.map((t) => ({
            label: TYPE_MEANING[t],
            icon: section.type === t ? 'i-lucide-check' : 'i-lucide-circle',
            onSelect: () => { section.type = t },
          })),
          [
            { label: 'Move up', icon: 'i-lucide-arrow-up', kbds: ['alt', 'arrowup'], disabled: index === 0, onSelect: () => app.moveSection(section.id, -1) },
            { label: 'Move down', icon: 'i-lucide-arrow-down', kbds: ['alt', 'arrowdown'], disabled: index === total - 1, onSelect: () => app.moveSection(section.id, 1) },
            { label: 'Merge with below', icon: 'i-lucide-merge', disabled: index === total - 1, onSelect: () => app.mergeDown(section.id) },
          ],
          [
            { label: 'Clear text', icon: 'i-lucide-eraser', onSelect: () => app.clearSection(section.id) },
            { label: 'Delete section', icon: 'i-lucide-trash-2', color: 'error', onSelect: () => app.removeSection(section.id) },
          ],
        ]"
      >
        <UButton icon="i-lucide-ellipsis" color="neutral" variant="ghost" size="sm" aria-label="Section menu" />
      </UDropdownMenu>
    </header>
    <div v-show="!section.folded" :class="s.body">
      <Writing v-model="section.body" :label="section.title" :hint="hint" :vim="app.vim" />
    </div>
  </section>
</template>
