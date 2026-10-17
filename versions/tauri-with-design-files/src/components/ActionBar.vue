<script setup lang="ts">
// Fixed action bar. Copy is the one primary action. Everything else is secondary.
import { computed } from 'vue'
import { useApp } from '../store/app'
import { useToast } from '@nuxt/ui/composables'
import s from './ActionBar.module.css'

const app = useApp()
const toast = useToast()

const sectionsOut = computed(() => app.current.sections.filter((x) => x.included && x.body.trim()).length)

const copy = async () => {
  try {
    const landed = await app.copy()
    const n = sectionsOut.value
    toast.add({
      title: 'Copied',
      description: (n === 1 ? '1 section' : n + ' sections') + (landed ? ', ' + landed + ' edits on the board' : ''),
      icon: 'i-lucide-clipboard-check',
      duration: 2500,
    })
  } catch (e) {
    toast.add({ title: 'Copy failed', description: String(e), color: 'error', icon: 'i-lucide-alert-triangle' })
  }
}
const undo = () => {
  const label = app.undo()
  toast.add({ title: label ? 'Undid: ' + label : 'Nothing to undo', duration: 2000 })
}
defineExpose({ copy, undo })
</script>

<template>
  <div :class="s.bar" role="toolbar" aria-label="Actions">
    <UButton color="neutral" variant="ghost" icon="i-lucide-undo-2" label="Undo" :aria-disabled="!app.undoStack.length" @click="undo">
      <template #trailing><UKbd value="ctrl" size="sm" /><UKbd value="Z" size="sm" /></template>
    </UButton>
    <UButton
      color="neutral"
      :variant="app.vim ? 'soft' : 'ghost'"
      icon="i-lucide-terminal"
      :label="app.vim ? 'Vim on' : 'Vim'"
      :aria-pressed="app.vim"
      @click="app.toggleVim"
    >
      <template #trailing><UKbd value="F3" size="sm" /></template>
    </UButton>
    <UButton color="neutral" variant="ghost" icon="i-lucide-palette" :label="'Theme: ' + app.theme" @click="app.cycleTheme" />
    <span :class="s.spacer" />
    <span :class="s.count">{{ sectionsOut }} out</span>
    <UButton color="neutral" variant="solid" icon="i-lucide-clipboard-copy" label="Copy" size="lg" :aria-disabled="!sectionsOut" @click="copy">
      <template #trailing><UKbd value="ctrl" size="sm" /><UKbd value="enter" size="sm" /></template>
    </UButton>
  </div>
</template>
