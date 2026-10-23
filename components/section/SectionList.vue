<template>
  <p v-if="!doc" id="sections-2" :class="$style.empty">
    Only one message so far. Start another (New prompt or New reply) and it shows here beside the current one.
  </p>
  <div v-else :id="secondary ? 'sections-2' : 'sections'" :class="$style.list" :data-kind="doc.kind">
    <header :class="$style.docHead">
      <h1 :class="$style.docTitle">{{ docTitle }}</h1>
      <span :class="$style.meta">{{ docMeta }}</span>
      <!-- A second sections pane shows another message; pick which. -->
      <select
        v-if="secondary"
        :value="doc.id"
        :class="$style.pick"
        aria-label="Message shown in this pane"
        @change="pick"
      >
        <option v-for="o in others" :key="o.id" :value="o.id">{{ o.label }}</option>
      </select>
    </header>

    <SectionCard
      v-for="(s, i) in doc.sections"
      :key="s.id"
      :section="s"
      :index="i"
      :total="doc.sections.length"
    />

    <p v-if="!doc.sections.length" :class="$style.empty">No sections.{{ secondary ? '' : ' Add one below.' }}</p>

    <!-- Add a section by chip or by typed name; the chip sets its type and colour (DZ-51, DZ-57). -->
    <div v-if="!secondary" :class="$style.add" role="group" aria-label="Add a section">
      <label :class="$style.nameRow">
        <span :class="$style.label">Add section <kbd :class="$style.kbd">{{ addKeys }}</kbd></span>
        <input
          id="add-section-name"
          v-model="name"
          :class="$style.name"
          placeholder="Section name: Enter adds it, or pick a type"
          spellcheck="false"
          aria-describedby="add-section-help"
          @keydown.enter.prevent="addNamed"
        />
      </label>
      <div :class="$style.chips">
        <UButton
          v-for="c in chips"
          :key="c.type"
          :class="$style.chip"
          :data-type="c.token"
          :data-chip="c.type"
          :title="c.hint"
          @click="addChip(c.type)"
        >
          <span :class="$style.chipMeaning">{{ c.meaning }}</span>
          <span :class="$style.chipTitle">{{ name.trim() || c.title }}</span>
        </UButton>
      </div>
      <p id="add-section-help" :class="$style.help">
        A type alone adds its skeleton section. A name plus a type adds a custom section of that type.
        Enter adds the name alone, untyped and uncoloured; give it a type later on the card. Press <kbd :class="$style.kbd">?</kbd> for every key.
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
/**
 * The current message's sections as cards, and the add control (DECIDED.md Layout L23).
 * The six chips are the six types (meanings), each in its _MINTY hue.
 *
 * `secondary`: a second sections pane (DZ-47, panes are addable) showing another message,
 * never the current one (so no card is on screen twice). Its cards edit their own message.
 */
import { TYPES, TYPE_MEANING, type Doc, type SectionType } from '~/composables/model'

const props = withDefaults(defineProps<{ secondary?: boolean; docId?: string | null }>(), {
  secondary: false,
  docId: null
})

const store = useWorkspace()
const { setPaneDoc } = useLayoutPrefs()
const conversation = computed(() => store.ws.value.conversation)
const kindLabel = (d: Doc) => (d.kind === 'reply' ? 'Reply' : 'Prompt')

/** Messages a second pane can show: every one but the current. */
const others = computed(() =>
  conversation.value
    .map((d, i) => ({ id: d.id, label: kindLabel(d) + ' ' + (i + 1), doc: d }))
    .filter(o => o.id !== store.ws.value.currentId)
)

const doc = computed<Doc | null>(() => {
  if (!props.secondary) return store.current.value
  const list = others.value
  return list.find(o => o.id === props.docId)?.doc ?? list[list.length - 1]?.doc ?? null
})

const pick = (e: Event) => setPaneDoc('sections-2', (e.target as HTMLSelectElement).value || null)

const name = ref('')
const addKeys = keysOf('add')

const position = computed(() => (doc.value ? conversation.value.findIndex(d => d.id === doc.value!.id) + 1 : 0))
const docTitle = computed(() => (doc.value ? kindLabel(doc.value) + ' ' + position.value : ''))
const docMeta = computed(() => {
  const n = conversation.value.length
  const sections = doc.value?.sections.length ?? 0
  return 'message ' + position.value + ' of ' + n + ' · ' + sections + ' sections' + (props.secondary ? ' · not the current message' : '')
})

const chips = computed(() =>
  TYPES.map((type) => {
    const title = chipTitle(type, doc.value?.kind ?? 'prompt')
    return {
      type,
      title,
      meaning: TYPE_MEANING[type],
      token: typeToken(type),
      hint: name.value.trim()
        ? 'Add “' + name.value.trim() + '” as ' + TYPE_MEANING[type]
        : 'Add ' + title + ' (' + TYPE_MEANING[type] + ')'
    }
  })
)

const addChip = (type: SectionType) => {
  store.addByChip(type, name.value)
  name.value = ''
}

const addNamed = () => {
  if (!name.value.trim()) return
  store.addByName(name.value)
  name.value = ''
}
</script>

<style module src="./SectionList.module.css"></style>
