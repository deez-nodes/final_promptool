<template>
  <div :class="$style.root">
    <!--
      1 and 2. The library (reusable sections) and the conversation (every message, prompt or reply,
      oldest first, each opening to its sections), as Nuxt UI's UTree (DECIDED.md Stack: "Nuxt UI
      already ships the ... tree library"). Picking a section (click, Enter or Space) inserts an
      independent copy into the current message; picking a message makes it current. The arrows
      move and open or close nodes; Delete removes a library item or a message (Alt+Z undoes it).
    -->
    <UTree
      id="sidebar-tree"
      v-model:expanded="expanded"
      :items="tree"
      :get-key="nodeKey"
      :model-value="currentNode"
      aria-label="Library and conversation"
      :ui="{
        root: $style.tree,
        item: $style.treeItem,
        itemWithChildren: $style.treeNested,
        listWithChildren: $style.treeChildren,
        link: $style.treeLink,
        linkLabel: $style.treeLabel,
        linkTrailing: $style.treeTrailing
      }"
      @keydown="onTreeKey"
    >
      <template #item-leading="{ item, expanded: open }">
        <span v-if="item.children?.length" :class="$style.twisty" aria-hidden="true">{{ open ? '▾' : '▸' }}</span>
        <span v-else-if="item.hue" :class="$style.hue" :data-type="item.hue" aria-hidden="true" />
      </template>

      <template #item-label="{ item }">
        <span :class="$style.node" :data-node="item.key" :data-kind="item.kind">
          <span :class="$style.rowTitle">
            {{ item.title }}
            <code v-if="item.count" :class="$style.count">{{ item.count }}</code>
          </span>
          <span v-if="item.snippet" :class="$style.snippet">{{ item.snippet }}</span>
        </span>
      </template>

      <template #item-trailing="{ item }">
        <span
          v-if="item.remove"
          role="button"
          :class="$style.remove"
          :aria-label="item.removeLabel"
          :title="item.removeLabel + ' (Delete; Alt+Z undoes it)'"
          @click.stop="item.remove()"
        >
          ✕
        </span>
        <!-- Something always renders here, so Nuxt UI's fallback chevron icon does not. -->
        <span v-else :class="$style.noRemove" aria-hidden="true" />
      </template>
    </UTree>

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
 * Inserting goes through the store (insertFromLibrary / insertFromMessage), which copies with
 * insertCopy from composables/model/reuse.ts: a new id, nothing shared with the source.
 */
import type { TreeItem } from '@nuxt/ui'
import { dropsOut, pointCount, type Doc, type DocKind, type Section } from '~/composables/model'

/** One node of the tree. Nuxt UI renders it; the slots above draw its row. */
interface Node extends TreeItem {
  key: string
  kind: 'group' | 'library' | 'message' | 'section' | 'note'
  title: string
  count?: string
  snippet?: string
  /** The section type's colour token (data-type), for the hue mark. */
  hue?: string
  remove?: () => void
  removeLabel?: string
  children?: Node[]
}

const store = useWorkspace()
const library = computed(() => store.ws.value.library)
const conversation = computed(() => store.ws.value.conversation)
const current = computed(() => store.current.value)
const libraryKeys = keysOf('library')

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

const nodeKey = (n: Node) => n.key

/** A pick that runs an action and leaves the tree's selection (the current message) alone. */
const act = (action: () => void) => (e: Event) => {
  e.preventDefault()
  action()
}

const libraryNode = computed<Node>(() => ({
  key: 'library',
  kind: 'group',
  title: 'Library',
  count: String(library.value.length),
  onSelect: act(() => {}),
  children: library.value.length
    ? library.value.map(item => ({
        key: 'library:' + item.id,
        kind: 'library',
        title: label(item.section),
        snippet: snippet(item.section.body),
        hue: typeToken(item.section.type),
        onSelect: act(() => store.insertFromLibrary(item.id)),
        remove: () => store.deleteLibraryItem(item.id),
        removeLabel: 'Remove ' + label(item.section) + ' from the library'
      }))
    : [{ key: 'library:empty', kind: 'note', title: 'Nothing saved yet. Save a section with ☆ or ' + libraryKeys + '.', disabled: true }]
}))

const messageNodes = computed<Node[]>(() =>
  conversation.value.map((d, i) => ({
    key: 'message:' + d.id,
    kind: 'message',
    title: kindLabel(d.kind) + ' ' + (i + 1),
    count: filled(d) + '/' + d.sections.length,
    snippet: firstLine(d),
    onSelect: () => store.setCurrent(d.id),
    remove: conversation.value.length > 1 ? () => store.deleteMessage(d.id) : undefined,
    removeLabel: 'Remove ' + kindLabel(d.kind) + ' ' + (i + 1),
    children: d.sections.map(s => ({
      key: 'section:' + d.id + ':' + s.id,
      kind: 'section',
      title: label(s),
      snippet: snippet(s.body),
      hue: typeToken(s.type),
      onSelect: act(() => store.insertFromMessage(d.id, s.id))
    }))
  }))
)

const tree = computed<Node[]>(() => [
  libraryNode.value,
  { key: 'conversation', kind: 'group', title: 'Conversation', count: String(conversation.value.length), onSelect: act(() => {}), children: messageNodes.value }
])

/** The current message shows as the tree's selected node. */
const currentNode = computed(() => messageNodes.value.find(n => n.key === 'message:' + store.ws.value.currentId))

/** Both groups start open; messages start closed (open one to insert one of its sections). */
const expanded = ref<string[]>(['library', 'conversation'])

const findNode = (nodes: readonly Node[], key: string): Node | undefined => {
  for (const n of nodes) {
    if (n.key === key) return n
    const hit = n.children && findNode(n.children, key)
    if (hit) return hit
  }
  return undefined
}

/** Keyboard first: Delete removes the focused library item or message (undo with Alt+Z). */
const onTreeKey = (e: KeyboardEvent) => {
  if (e.key !== 'Delete' || e.ctrlKey || e.metaKey || e.altKey) return
  const key = (e.target as HTMLElement | null)?.querySelector('[data-node]')?.getAttribute('data-node')
  const node = key ? findNode(tree.value, key) : undefined
  if (!node?.remove) return
  e.preventDefault()
  node.remove()
}
</script>

<style module src="./StudioSidebar.module.css"></style>
