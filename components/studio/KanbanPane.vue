<template>
  <!-- Placeholder for package D4: the Kanban board where edits from replies land as cards. -->
  <section :class="$style.pane" aria-label="Edits board">
    <header :class="$style.head">
      <span :class="$style.title">Edits</span>
    </header>
    <div :class="$style.columns">
      <div v-for="col in columns" :key="col" :class="$style.column">
        <h3 :class="$style.columnTitle">{{ col }}</h3>
        <div :class="$style.columnBody" />
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
const columns = ['To do', 'Doing', 'Done']
</script>

<style module src="./KanbanPane.module.css"></style>
