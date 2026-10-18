<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useApp } from './store/app'
import SectionCard from './components/SectionCard.vue'
import AddSection from './components/AddSection.vue'
import SidePane from './components/SidePane.vue'
import KanbanPane from './components/KanbanPane.vue'
import ActionBar from './components/ActionBar.vue'
import s from './App.module.css'

const app = useApp()
const bar = ref<InstanceType<typeof ActionBar> | null>(null)
const loaded = ref(false)

onMounted(async () => {
  await app.load()
  loaded.value = true
  if (import.meta.env.DEV) (window as unknown as { __promptor: unknown }).__promptor = app
})

// Keyboard first. Ctrl+Enter copies from anywhere, F3 toggles Vim, Ctrl+Z outside an editor undoes.
const onKey = (e: KeyboardEvent) => {
  if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
    e.preventDefault()
    bar.value?.copy()
  } else if (e.key === 'F3') {
    e.preventDefault()
    app.toggleVim()
  } else if (e.key === 'z' && (e.ctrlKey || e.metaKey) && !e.shiftKey) {
    const inEditor = (e.target as HTMLElement | null)?.closest?.('.cm-editor, input, textarea')
    if (inEditor) return
    e.preventDefault()
    bar.value?.undo()
  } else if (e.key === 'n' && e.altKey) {
    e.preventDefault()
    app.newMessage(e.shiftKey ? 'reply' : 'prompt')
  }
}
</script>

<template>
  <UApp>
    <div :class="s.root" @keydown="onKey">
      <UDashboardGroup storage="localStorage" storage-key="promptor-panes">
        <UDashboardSidebar id="library" resizable collapsible :min-size="14" :default-size="20">
          <template #header>
            <h1 :class="s.brand">PromptTOR</h1>
          </template>
          <SidePane />
        </UDashboardSidebar>

        <UDashboardPanel id="message">
          <template #header>
            <UDashboardNavbar :title="app.current.kind === 'prompt' ? 'Prompt' : 'Reply'">
              <template #leading><UDashboardSidebarCollapse /></template>
              <template #right>
                <UButton icon="i-lucide-plus" label="Prompt" color="neutral" variant="outline" size="sm" @click="app.newMessage('prompt')" />
                <UButton icon="i-lucide-reply" label="Reply" color="neutral" variant="outline" size="sm" @click="app.newMessage('reply')" />
                <UButton
                  :icon="app.showKanban ? 'i-lucide-panel-right-close' : 'i-lucide-panel-right-open'"
                  color="neutral"
                  variant="ghost"
                  size="sm"
                  :aria-label="app.showKanban ? 'Hide board' : 'Show board'"
                  :aria-pressed="app.showKanban"
                  @click="app.showKanban = !app.showKanban"
                />
              </template>
            </UDashboardNavbar>
          </template>
          <template #body>
            <main v-if="loaded" :class="s.stack" tabindex="-1">
              <SectionCard
                v-for="(sec, i) in app.current.sections"
                :key="sec.id"
                :section="sec"
                :index="i"
                :total="app.current.sections.length"
              />
              <AddSection />
            </main>
          </template>
          <template #footer>
            <ActionBar ref="bar" />
          </template>
        </UDashboardPanel>

        <UDashboardSidebar v-if="app.showKanban" id="board" side="right" resizable :min-size="22" :default-size="30">
          <template #header>
            <h2 :class="s.paneTitle">Edits</h2>
          </template>
          <KanbanPane />
        </UDashboardSidebar>
      </UDashboardGroup>
    </div>
  </UApp>
</template>
