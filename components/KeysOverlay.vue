<template>
  <!-- Every key, opened with ? (or F1). A native modal dialog: Escape closes it, focus stays inside. -->
  <dialog
    ref="dialog"
    id="keys-overlay"
    :class="$style.dialog"
    aria-labelledby="keys-title"
    @close="open = false"
    @click.self="open = false"
  >
    <div :class="$style.inner">
      <header :class="$style.head">
        <h2 id="keys-title" :class="$style.title">Keys</h2>
        <UButton :class="$style.close" aria-label="Close" @click="open = false">✕</UButton>
      </header>
      <section v-for="g in groups" :key="g.name" :class="$style.group">
        <h3 :class="$style.groupTitle">{{ g.name }}</h3>
        <dl :class="$style.list">
          <div v-for="s in g.items" :key="s.id" :class="$style.row">
            <dt :class="$style.keys"><kbd :class="$style.kbd">{{ s.keys }}</kbd></dt>
            <dd :class="$style.label">{{ s.label }}</dd>
          </div>
        </dl>
      </section>
    </div>
  </dialog>
</template>

<script setup lang="ts">
const { open, shortcuts } = useShortcuts()
const dialog = ref<HTMLDialogElement | null>(null)

const groups = (['Message', 'Section', 'App'] as const).map(name => ({
  name,
  items: shortcuts.filter(s => s.group === name)
}))

watch(open, (on) => {
  const el = dialog.value
  if (!el) return
  if (on && !el.open) el.showModal()
  if (!on && el.open) el.close()
})
</script>

<style module src="./KeysOverlay.module.css"></style>
