<template>
  <div id="sections" :class="$style.list" :data-kind="doc.kind">
    <header :class="$style.docHead">
      <h1 :class="$style.docTitle">{{ docTitle }}</h1>
      <span :class="$style.meta">{{ docMeta }}</span>
    </header>

    <SectionCard
      v-for="(s, i) in doc.sections"
      :key="s.id"
      :section="s"
      :index="i"
      :total="doc.sections.length"
    />

    <p v-if="!doc.sections.length" :class="$style.empty">No sections. Add one below.</p>

    <!-- Add a section by chip or by typed name; the chip sets its type and colour (DZ-51, DZ-57). -->
    <div :class="$style.add" role="group" aria-label="Add a section">
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
 */
import { TYPES, TYPE_MEANING, type SectionType } from '~/composables/model'

const store = useWorkspace()
const doc = computed(() => store.current.value)
const name = ref('')
const addKeys = keysOf('add')

const position = computed(() => store.ws.value.conversation.findIndex(d => d.id === doc.value.id) + 1)
const docTitle = computed(() => (doc.value.kind === 'reply' ? 'Reply' : 'Prompt') + ' ' + position.value)
const docMeta = computed(() => {
  const n = store.ws.value.conversation.length
  return 'message ' + position.value + ' of ' + n + ' · ' + doc.value.sections.length + ' sections'
})

const chips = computed(() =>
  TYPES.map((type) => {
    const title = chipTitle(type, doc.value.kind)
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
