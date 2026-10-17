<script setup lang="ts">
// Add a section by chip or by typed name. The chip sets its type and colour.
import { ref } from 'vue'
import type { SectionType } from '../model/types'
import { TYPES, TYPE_DEFAULT_TITLE, TYPE_MEANING } from '../model/types'
import { useApp } from '../store/app'
import s from './AddSection.module.css'

const app = useApp()
const name = ref('')
const firstChip = ref<HTMLButtonElement[] | null>(null)

const add = (type: SectionType) => {
  app.addSection(name.value.trim() || TYPE_DEFAULT_TITLE[type], type)
  name.value = ''
}
// Enter on the name moves to the colours: a section always has a type.
const toChips = (e: KeyboardEvent) => {
  if (e.isComposing) return
  firstChip.value?.[0]?.focus()
}
</script>

<template>
  <div :class="s.row">
    <label for="new-section-name" :class="s.label">Add section</label>
    <input
      id="new-section-name"
      v-model="name"
      :class="s.name"
      placeholder="Name it, then pick what it is"
      @keydown.enter.prevent="toChips"
    />
    <button
      v-for="t in TYPES"
      :key="t"
      ref="firstChip"
      type="button"
      :class="s.chip"
      :data-type="t"
      :title="TYPE_DEFAULT_TITLE[t]"
      @click="add(t)"
    >
      <span :class="s.dot" aria-hidden="true" />
      {{ TYPE_MEANING[t] }}
    </button>
  </div>
</template>
