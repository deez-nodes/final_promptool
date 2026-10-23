<template>
  <!--
    Show output (DECIDED.md Layout "The output stays hidden until asked for. No preview pane."):
    the current message's XML, read-only, only while asked for. Copy (Ctrl+Enter) stays the one
    primary action; this panel only shows what Copy would put on the clipboard.
  -->
  <dialog
    ref="dialog"
    id="output-dialog"
    :class="$style.dialog"
    aria-labelledby="output-title"
    @close="open = false"
    @click.self="open = false"
  >
    <div :class="$style.inner">
      <header :class="$style.head">
        <h2 id="output-title" :class="$style.title">Output <span :class="$style.sub">{{ docLabel }}, read-only</span></h2>
        <UButton :class="$style.close" aria-label="Close the output" @click="open = false">✕</UButton>
      </header>
      <pre v-if="xml" id="output-xml" :class="$style.xml" tabindex="0" aria-label="The message as XML, read-only">{{ xml }}</pre>
      <p v-else :class="$style.empty">Nothing goes out: every section is empty or left out.</p>
      <p :class="$style.help">Copy with <kbd :class="$style.kbd">{{ copyKeys }}</kbd>. Escape closes this.</p>
    </div>
  </dialog>
</template>

<script setup lang="ts">
import { docToXml } from '~/composables/model'

const store = useWorkspace()
const open = useOutputPanel()
const dialog = ref<HTMLDialogElement | null>(null)
const copyKeys = keysOf('copy')

const xml = computed(() => (open.value ? docToXml(store.current.value) : ''))
const docLabel = computed(() => {
  const doc = store.current.value
  const n = store.ws.value.conversation.findIndex(d => d.id === doc.id) + 1
  return (doc.kind === 'reply' ? 'Reply ' : 'Prompt ') + n
})

watch(open, (on) => {
  const el = dialog.value
  if (!el) return
  if (on && !el.open) el.showModal()
  if (!on && el.open) el.close()
})
</script>

<style module src="./OutputDialog.module.css"></style>
