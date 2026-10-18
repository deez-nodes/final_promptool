<script setup lang="ts">
// Left pane: the conversation (every message) and the library (saved sections).
import { computed } from 'vue'
import { useApp } from '../store/app'
import { pickTextFiles } from '../lib/platform'
import { pointCount } from '../model/points'
import { useToast } from '@nuxt/ui/composables'
import s from './SidePane.module.css'

const app = useApp()
const toast = useToast()

const messages = computed(() =>
  app.conversation.map((d, i) => ({
    id: d.id,
    n: String(i + 1).padStart(2, '0'),
    kind: d.kind,
    filled: d.sections.filter((x) => x.body.trim()).length,
    total: d.sections.length,
  })),
)

const upload = async () => {
  const files = await pickTextFiles()
  for (const [name, text] of files) app.addSection(name, 'knows', text)
  if (files.length) {
    toast.add({ title: files.length === 1 ? '1 file added' : files.length + ' files added', description: 'As Context sections in this message.' })
  }
}
</script>

<template>
  <nav :class="s.pane" aria-label="Conversation and library">
    <section :class="s.group">
      <div :class="s.groupHead">
        <h2 :class="s.groupTitle">Conversation</h2>
        <UButton icon="i-lucide-plus" label="Prompt" color="neutral" variant="ghost" size="xs" @click="app.newMessage('prompt')" />
        <UButton icon="i-lucide-reply" label="Reply" color="neutral" variant="ghost" size="xs" @click="app.newMessage('reply')" />
      </div>
      <ul :class="s.list" role="list">
        <li v-for="m in messages" :key="m.id" :class="[s.item, m.id === app.currentId && s.active]">
          <button type="button" :class="s.open" :aria-current="m.id === app.currentId ? 'true' : undefined" @click="app.select(m.id)">
            <span :class="s.n">{{ m.n }}</span>
            <span :class="s.itemTitle">{{ m.kind === 'prompt' ? 'Prompt' : 'Reply' }}</span>
            <span :class="s.n">{{ m.filled }}/{{ m.total }}</span>
          </button>
          <UButton
            v-if="messages.length > 1"
            icon="i-lucide-x"
            color="neutral"
            variant="ghost"
            size="xs"
            :aria-label="'Delete message ' + m.n"
            @click="app.removeMessage(m.id)"
          />
        </li>
      </ul>
    </section>

    <section :class="s.group">
      <div :class="s.groupHead">
        <h2 :class="s.groupTitle">Library</h2>
        <UButton icon="i-lucide-file-up" label="Files" color="neutral" variant="ghost" size="xs" @click="upload" />
      </div>
      <p v-if="!app.library.length" :class="s.empty">Save a section from its menu. Inserting makes an independent copy.</p>
      <ul :class="s.list" role="list">
        <li v-for="item in app.library" :key="item.id" :class="s.item" :data-type="item.section.type">
          <button type="button" :class="s.open" @click="app.insertCopy(item.section)">
            <span :class="s.dot" aria-hidden="true" />
            <span :class="s.itemTitle">{{ item.section.title }}</span>
            <span :class="s.n">{{ pointCount(item.section.body) }}</span>
            <span :class="s.hidden">Insert a copy</span>
          </button>
          <UButton icon="i-lucide-x" color="neutral" variant="ghost" size="xs" :aria-label="'Remove ' + item.section.title + ' from library'" @click="app.removeFromLibrary(item.id)" />
        </li>
      </ul>
    </section>
  </nav>
</template>
