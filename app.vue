<template>
  <UApp>
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
    <StudioSaveBanner />
  </UApp>
</template>

<script setup lang="ts">
// Ensure prompt store is ready on app mount
const promptStore = usePromptStore()
const layoutPrefs = useLayoutPrefs()
const { loadTheme } = useTheme()

// Flush pending debounced writes whenever the user might be leaving.
const flushAll = () => {
  promptStore.flushSave()
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
  promptStore.initStore()
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
