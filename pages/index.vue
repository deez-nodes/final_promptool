<template>
  <NuxtLayout name="default">
    <template #sidebar>
      <StudioSidebar />
    </template>

    <SectionList />

    <template #board>
      <StudioKanbanPane />
    </template>
  </NuxtLayout>
</template>

<script setup lang="ts">
// The page fills the layout's named slots itself, so the automatic layout is off.
// The workspace loads in app.vue (useWorkspace().initWorkspace on mount).
definePageMeta({ layout: false })

useHead({ title: 'prompTOR' })
</script>
