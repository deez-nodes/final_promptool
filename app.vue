<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>

<script setup lang="ts">
// Ensure prompt store is ready on app mount
const promptStore = usePromptStore()

onMounted(() => {
  promptStore.initStore()
})
</script>
