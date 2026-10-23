<template>
  <NuxtLayout name="default">
    <template #sidebar>
      <StudioSidebar />
    </template>

    <!-- The main sections pane follows the current message; a second one shows another message. -->
    <template #sections="{ pane }">
      <SectionList :secondary="pane.id === 'sections-2'" :doc-id="pane.docId" />
    </template>

    <template #kanban>
      <StudioKanbanPane />
    </template>
  </NuxtLayout>
</template>

<script setup lang="ts">
// The page fills the layout's pane slots itself, so the automatic layout is off.
// The workspace loads in app.vue (useWorkspace().initWorkspace on mount).
definePageMeta({ layout: false })

useHead({ title: 'prompTOR' })
</script>
