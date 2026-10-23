<template>
  <div :class="$style.root">
    <!-- 1. The library: reusable sections. Inserting makes an independent copy. -->
    <section :class="$style.group" aria-labelledby="sidebar-library">
      <h2 id="sidebar-library" :class="$style.head">
        Library <code :class="$style.count">{{ library.length }}</code>
      </h2>
      <ul v-if="library.length" :class="$style.list">
        <li v-for="item in library" :key="item.id" :class="$style.item" :data-type="typeToken(item.section.type)">
          <button
            type="button"
            :class="$style.row"
            :title="'Insert a copy of ' + label(item.section) + ' into the current message'"
            @click="store.insertFromLibrary(item.id)"
          >
            <span :class="$style.rowTitle">{{ label(item.section) }}</span>
            <span :class="$style.snippet">{{ snippet(item.section.body) }}</span>
          </button>
          <button
            type="button"
            :class="$style.remove"
            :aria-label="'Remove ' + label(item.section) + ' from the library'"
            title="Remove from the library (Alt+Z undoes it)"
            @click="store.deleteLibraryItem(item.id)"
          >
            ✕
          </button>
        </li>
      </ul>
      <p v-else :class="$style.empty">Nothing saved yet. Save a section with ☆ or {{ libraryKeys }}.</p>
    </section>

    <!-- 2. The conversation: every message, prompt or reply, oldest first. -->
    <section :class="$style.group" aria-labelledby="sidebar-conversation">
      <h2 id="sidebar-conversation" :class="$style.head">
        Conversation <code :class="$style.count">{{ conversation.length }}</code>
      </h2>
      <ul :class="$style.list">
        <li v-for="(d, i) in conversation" :key="d.id" :class="$style.message">
          <div :class="$style.item">
            <button
              type="button"
              :class="$style.toggle"
              :aria-expanded="isOpen(d.id)"
              :aria-label="(isOpen(d.id) ? 'Hide' : 'Show') + ' the sections of ' + kindLabel(d.kind) + ' ' + (i + 1)"
              @click="toggleOpen(d.id)"
            >
              {{ isOpen(d.id) ? '▾' : '▸' }}
            </button>
            <button
              type="button"
              :class="[$style.row, d.id === currentId && $style.rowActive]"
              :aria-current="d.id === currentId ? 'true' : undefined"
              :data-kind="d.kind"
              :title="'Make ' + kindLabel(d.kind) + ' ' + (i + 1) + ' the current message'"
              @click="store.setCurrent(d.id)"
            >
              <span :class="$style.rowTitle">
                {{ kindLabel(d.kind) }} {{ i + 1 }}
                <code :class="$style.count">{{ filled(d) }}/{{ d.sections.length }}</code>
              </span>
              <span :class="$style.snippet">{{ firstLine(d) }}</span>
            </button>
            <button
              v-if="conversation.length > 1"
              type="button"
              :class="$style.remove"
              :aria-label="'Remove ' + kindLabel(d.kind) + ' ' + (i + 1)"
              title="Remove this message (Alt+Z undoes it)"
              @click="store.deleteMessage(d.id)"
            >
              ✕
            </button>
          </div>
          <ul v-if="isOpen(d.id)" :class="$style.sublist">
            <li v-for="s in d.sections" :key="s.id" :class="$style.item" :data-type="typeToken(s.type)">
              <button
                type="button"
                :class="$style.row"
                :title="'Insert a copy of ' + label(s) + ' into the current message'"
                @click="store.insertFromMessage(d.id, s.id)"
              >
                <span :class="$style.rowTitle">{{ label(s) }}</span>
                <span :class="$style.snippet">{{ snippet(s.body) }}</span>
              </button>
            </li>
          </ul>
        </li>
      </ul>
    </section>

    <!-- 3. The current message: its sections, as an outline. -->
    <section :class="[$style.group, $style.grow]" aria-labelledby="sidebar-outline">
      <h2 id="sidebar-outline" :class="$style.head">
        This {{ current.kind }} <code :class="$style.count">{{ current.sections.length }}</code>
      </h2>
      <ol :class="$style.list">
        <li v-for="s in current.sections" :key="s.id" :class="$style.item" :data-type="typeToken(s.type)">
          <button
            type="button"
            :class="[$style.row, $style.outlineRow, s.id === store.focusedId.value && $style.rowActive]"
            :title="'Go to ' + label(s)"
            @click="store.focusRequest.value = s.id"
          >
            <span :class="$style.rowTitle">{{ label(s) }}</span>
            <span :class="$style.state">
              <template v-if="!s.included">left out</template>
              <template v-else-if="dropsOut(s)">empty</template>
              <code v-else :class="$style.count">{{ pointCount(s.body) }} pts</code>
            </span>
          </button>
        </li>
      </ol>
    </section>
  </div>
</template>

<script setup lang="ts">
/**
 * The sidebar's three reuse levels (DECIDED.md "Three reuse levels: the library, the
 * conversation and the current message. An inserted copy is independent of its source.").
 */
import { dropsOut, pointCount, type Doc, type DocKind, type Section } from '~/composables/model'

const store = useWorkspace()
const library = computed(() => store.ws.value.library)
const conversation = computed(() => store.ws.value.conversation)
const currentId = computed(() => store.ws.value.currentId)
const current = computed(() => store.current.value)
const libraryKeys = keysOf('library')

const open = ref<Set<string>>(new Set())
const isOpen = (id: string) => open.value.has(id)
const toggleOpen = (id: string) => {
  const next = new Set(open.value)
  if (next.has(id)) next.delete(id)
  else next.add(id)
  open.value = next
}

const kindLabel = (kind: DocKind) => (kind === 'reply' ? 'Reply' : 'Prompt')
const label = (s: Section) => s.title.trim() || 'Untitled'
const snippet = (body: string) => body.split('\n').find(l => l.trim())?.trim() || 'Empty'
const filled = (d: Doc) => d.sections.filter(s => !dropsOut(s)).length
const firstLine = (d: Doc) => {
  for (const s of d.sections) {
    const line = s.body.split('\n').find(l => l.trim())
    if (line) return line.trim()
  }
  return 'Empty'
}
</script>

<style module src="./StudioSidebar.module.css"></style>
