<template>
  <NuxtLayout name="default">
    <template #sidebar>
      <StudioSidebar />
    </template>

    <StudioEditor />

    <template #preview>
      <StudioPreview />
    </template>
  </NuxtLayout>
</template>

<script setup lang="ts">
// The page fills the layout's named slots itself, so the automatic layout is off.
definePageMeta({ layout: false })

useHead({ title: 'prompTOR' })

const promptStore = usePromptStore()

onMounted(() => {
  promptStore.initStore()
})
</script>
