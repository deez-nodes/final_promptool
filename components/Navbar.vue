<template>
  <header id="header" :class="$style.bar">
    <!-- Wordmark -->
    <NuxtLink to="/" :class="$style.brand">
      <span>promp<strong>TOR</strong></span>
    </NuxtLink>

    <ActionBar />

    <div :class="$style.spacer" />

    <!-- Save state -->
    <span
      id="save-state"
      :class="$style.saveState"
      :data-state="saveState.status"
      :title="saveTitle"
      aria-live="polite"
    >
      <span :class="$style.dot" />
      <span>{{ saveState.status }}</span>
    </span>
  </header>
</template>

<script setup lang="ts">
const store = useWorkspace()

const saveState = computed(() => store.persist.value)
const saveTitle = computed(() => {
  const s = saveState.value
  const last = s.lastSavedAt ? 'Last saved ' + new Date(s.lastSavedAt).toLocaleTimeString() : 'Not saved yet this session'
  return s.status === 'failed' && s.error ? s.error + ' ' + last : last
})
</script>

<style module src="./Navbar.module.css"></style>
