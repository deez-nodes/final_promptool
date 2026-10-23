<template>
  <UApp>
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
    <StudioSaveBanner />
  </UApp>
</template>

<script setup lang="ts">
// The workspace store (the record's model) loads from storage on mount.
const workspace = useWorkspace()
const layoutPrefs = useLayoutPrefs()
const { loadTheme } = useTheme()

// Flush pending debounced writes whenever the user might be leaving.
const flushAll = () => {
  workspace.flushSave()
  layoutPrefs.flushPrefs()
}
const onVisibility = () => {
  if (document.visibilityState === 'hidden') flushAll()
}

useRouter().beforeEach(() => {
  flushAll()
})

onMounted(() => {
  loadTheme()
  workspace.initWorkspace()
  layoutPrefs.loadPrefs()
  window.addEventListener('blur', flushAll)
  window.addEventListener('pagehide', flushAll)
  document.addEventListener('visibilitychange', onVisibility)
})

onBeforeUnmount(() => {
  window.removeEventListener('blur', flushAll)
  window.removeEventListener('pagehide', flushAll)
  document.removeEventListener('visibilitychange', onVisibility)
})
</script>
