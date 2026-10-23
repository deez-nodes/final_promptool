<template>
  <article
    :id="anchorId"
    :class="[$style.card, focused && $style.focused, !section.included && $style.excluded, !section.type && $style.untyped]"
    :data-type="token"
    :data-title="section.title"
    :data-focused="focused ? 'true' : undefined"
    data-section-card
    :aria-label="(section.title || 'Untitled') + ' section'"
    @focusin="onFocusIn"
    @focusout="onFocusOut"
  >
    <header :class="$style.head">
      <UButton
        :class="$style.fold"
        :aria-expanded="!section.folded"
        :aria-controls="bodyId"
        :aria-label="(section.folded ? 'Unfold ' : 'Fold ') + (section.title || 'section')"
        :title="(section.folded ? 'Unfold' : 'Fold') + ' (' + keys.fold + ')'"
        @click="store.toggleFold(section.id)"
      >
        {{ section.folded ? '▸' : '▾' }}
      </UButton>

      <!-- The section title is a clear heading (DZ-46); it becomes the XML tag. -->
      <h2 :class="$style.heading">
        <input
          :value="section.title"
          :class="$style.title"
          spellcheck="false"
          placeholder="Untitled"
          aria-label="Section title"
          @change="onTitle"
          @keydown.enter.prevent="($event.target as HTMLInputElement).blur()"
        />
      </h2>

      <code :class="$style.tag" title="The XML tag this section goes out as">&lt;{{ tag }}&gt;</code>

      <!-- The type sets the colour; the title stays (DZ-57). Untyped = no hue. -->
      <select
        :value="section.type ?? ''"
        :class="$style.meaning"
        aria-label="Section type (sets its colour)"
        title="Type: sets the colour"
        @change="onType"
      >
        <option value="">no type</option>
        <option v-for="t in TYPES" :key="t" :value="t">{{ TYPE_MEANING[t] }}</option>
      </select>

      <span v-if="corrections" :class="$style.optional" title="Corrections drops out of the copy when empty">optional</span>

      <span :class="$style.spacer" />

      <code :class="$style.count" :title="points + ' numbered point(s)'">{{ pointsLabel }}</code>

      <!-- Include is its own control, separate from folding (DZ-52). -->
      <UButton
        :class="[$style.include, section.included && $style.included]"
        :aria-pressed="section.included"
        :title="(section.included ? 'Included in the copy' : 'Left out of the copy') + ' (' + keys.include + ')'"
        @click="store.toggleInclude(section.id)"
      >
        {{ section.included ? 'Included' : 'Left out' }}
      </UButton>

      <div :class="$style.tools" role="group" :aria-label="(section.title || 'Section') + ' actions'">
        <UButton
          :class="$style.tool"
          :disabled="index === 0"
          :aria-label="'Move ' + (section.title || 'section') + ' up'"
          :title="'Move up (' + keys.up + ')'"
          @click="moveBy(-1)"
        >
          ↑
        </UButton>
        <UButton
          :class="$style.tool"
          :disabled="index === total - 1"
          :aria-label="'Move ' + (section.title || 'section') + ' down'"
          :title="'Move down (' + keys.down + ')'"
          @click="moveBy(1)"
        >
          ↓
        </UButton>
        <UButton
          :class="$style.tool"
          :disabled="index === total - 1"
          :aria-label="'Merge the section below into ' + (section.title || 'section')"
          :title="'Merge the section below into this one (' + keys.merge + ')'"
          @click="store.merge(section.id)"
        >
          ⤒
        </UButton>
        <UButton
          :class="$style.tool"
          :aria-label="'Save ' + (section.title || 'section') + ' to the library'"
          :title="'Save to the library (' + keys.library + ')'"
          @click="store.keepInLibrary(section.id)"
        >
          ☆
        </UButton>
        <UButton
          :class="[$style.tool, $style.danger]"
          :aria-label="'Remove ' + (section.title || 'section')"
          :title="'Remove (' + keys.remove + '; Alt+Z undoes it)'"
          @click="store.remove(section.id)"
        >
          ✕
        </UButton>
      </div>
    </header>

    <div v-show="!section.folded" :id="bodyId" :class="$style.body" @paste.capture="onPaste">
      <p v-if="hint" :class="$style.hint">{{ hint }}</p>
      <EditorSectionEditor
        ref="editor"
        :model-value="section.body"
        :role="token ?? 'custom'"
        :vim="vimOn"
        @update:model-value="store.patch(section.id, { body: $event })"
      />
    </div>

    <button
      v-if="section.folded"
      type="button"
      :class="$style.folded"
      :aria-label="'Unfold ' + (section.title || 'section')"
      @click="unfoldAndFocus"
    >
      {{ foldedPreview }}
    </button>
  </article>
</template>

<script setup lang="ts">
/**
 * One section of the current message (DECIDED.md "What it is": title + lead + numbered points).
 * Lead and points live in one Markdown body, edited in one SectionEditor; top-level list items
 * are the points (01, 02 …). A typed card carries its type's hue (`--section-hue`) and the
 * focused card takes it on the whole card (DZ-56); an untyped card (added by name alone)
 * stays neutral. Fold and include are separate (DZ-52).
 */
import { EditorView } from '@codemirror/view'
import {
  TYPES,
  TYPE_MEANING,
  isCorrections,
  parseBody,
  quoteLines,
  tagOf,
  type Section,
  type SectionType
} from '~/composables/model'

const props = defineProps<{
  section: Section
  index: number
  total: number
}>()

const store = useWorkspace()
const { enabled: vimOn } = useVim()

const keys = {
  fold: keysOf('fold'),
  include: keysOf('include'),
  up: keysOf('up'),
  down: keysOf('down'),
  merge: keysOf('merge'),
  library: keysOf('library'),
  remove: keysOf('remove')
}

const editor = ref<{ focus: () => void } | null>(null)
const focused = ref(false)

const anchorId = computed(() => 'section-' + props.section.id)
const bodyId = computed(() => 'section-body-' + props.section.id)
const token = computed(() => typeToken(props.section.type))
const tag = computed(() => tagOf(props.section.title))
const corrections = computed(() => isCorrections(props.section))
const inResponse = computed(() => tag.value === 'in_response_to')
const points = computed(() => parseBody(props.section.body).points.length)
const pointsLabel = computed(() => String(points.value).padStart(2, '0') + ' pts')

const hint = computed(() => {
  if (props.section.body.trim()) return ''
  if (inResponse.value) return 'Paste the reply here: each line becomes a quoted point (01, 02 …). Write your answer on the line under each quote.'
  if (corrections.value) return 'Optional: drops out of the copy when empty. Quote what it said (> …) and write what it is on the line under it; it goes out as “you said X; it is Y”.'
  return ''
})

const foldedPreview = computed(() => {
  const first = props.section.body.split('\n').find(l => l.trim())
  return first ? first.trim() : 'Empty'
})

const onType = (e: Event) => {
  const v = (e.target as HTMLSelectElement).value
  store.setType(props.section.id, v ? (v as SectionType) : null)
}

const onTitle = (e: Event) => {
  store.patch(props.section.id, { title: (e.target as HTMLInputElement).value })
}

const moveBy = (dir: -1 | 1) => {
  store.move(props.section.id, dir)
  store.focusRequest.value = props.section.id
}

const onFocusIn = () => {
  focused.value = true
  store.focusedId.value = props.section.id
}
const onFocusOut = (e: FocusEvent) => {
  const card = e.currentTarget as HTMLElement
  if (!card.contains(e.relatedTarget as Node | null)) focused.value = false
}

// A multi-line paste into In Response To splits into one quoted point per line (DZ-54),
// with a blank line under each quote for the answer.
const onPaste = (e: ClipboardEvent) => {
  if (!inResponse.value) return
  const text = e.clipboardData?.getData('text/plain') ?? ''
  if (text.split(/\r?\n/).filter(l => l.trim()).length < 2) return
  const view = EditorView.findFromDOM(e.currentTarget as HTMLElement)
  if (!view) return
  e.preventDefault()
  e.stopPropagation()
  view.dispatch(view.state.replaceSelection(quoteLines(text).split('\n').join('\n\n')))
  view.focus()
}

// Focus requests: outline clicks, new sections, Alt+J/K, after moves and undo.
const takeFocus = () => {
  if (store.focusRequest.value !== props.section.id) return
  if (props.section.folded) store.patch(props.section.id, { folded: false })
  nextTick(() => {
    const card = document.getElementById(anchorId.value)
    card?.scrollIntoView({ block: 'nearest' })
    editor.value?.focus()
    if (!card?.contains(document.activeElement)) card?.querySelector<HTMLElement>('input')?.focus()
    store.focusRequest.value = null
  })
}

const unfoldAndFocus = () => {
  store.focusRequest.value = props.section.id
  takeFocus()
}

watch(() => store.focusRequest.value, takeFocus)
onMounted(takeFocus)
</script>

<style module src="./SectionCard.module.css"></style>
