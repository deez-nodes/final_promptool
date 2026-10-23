<template>
  <!-- Prompts pane header -->
  <div :class="$style.head">
    <span :class="$style.headTitle">Prompts</span>
    <select
      v-model="promptStore.promptKindFilter.value"
      :class="$style.select"
      aria-label="Prompt type filter"
    >
      <option value="">all types</option>
      <option value="filled">filled</option>
      <option value="template">templates</option>
    </select>
  </div>

  <div :class="$style.searchRow">
    <input
      v-model="promptStore.promptQuery.value"
      :class="$style.search"
      placeholder="Search prompts or content..."
      spellcheck="false"
      aria-label="Search prompts"
    />
  </div>

  <!-- Prompts list -->
  <div :class="[$style.list, $style.grow]">
    <div
      v-for="p in promptStore.filteredPrompts.value"
      :key="p.id"
      :class="[$style.row, promptStore.currentPromptId.value === p.id && $style.rowActive]"
      @click="promptStore.selectPrompt(p.id)"
    >
      <div :class="$style.rowTop">
        <span :class="$style.rowName">{{ p.name || 'untitled' }}</span>
        <code v-if="p.kind === 'template'" :class="$style.badge">tmpl</code>
        <code v-else :class="$style.badge">{{ p.sections.filter(s => s.include && s.body.trim()).length }} sec</code>
      </div>
      <div :class="$style.rowTags">
        <code v-for="s in p.sections.slice(0, 4)" :key="s.id" :class="$style.tag">{{ s.tag }}</code>
        <code v-if="p.sections.length > 4" :class="$style.count">+{{ p.sections.length - 4 }}</code>
      </div>
    </div>

    <div v-if="promptStore.filteredPrompts.value.length === 0" :class="$style.empty">
      No prompts match filter
    </div>
  </div>

  <!-- Section library header -->
  <div :class="[$style.head, $style.headSplit]">
    <span :class="$style.headTitle">Section Library</span>
    <select
      v-model="promptStore.sectionTagFilter.value"
      :class="[$style.select, $style.selectNarrow]"
      aria-label="Section tag filter"
    >
      <option value="">all tags</option>
      <option v-for="t in promptStore.distinctTags.value" :key="t" :value="t">{{ t }}</option>
    </select>
  </div>

  <div :class="$style.searchRow">
    <input
      v-model="promptStore.sectionQuery.value"
      :class="$style.search"
      placeholder="Filter library blocks..."
      spellcheck="false"
      aria-label="Filter section library"
    />
  </div>

  <!-- Section library list -->
  <div :class="[$style.list, $style.library]">
    <div
      v-for="(hit, idx) in promptStore.filteredSections.value"
      :key="hit.section.id + idx"
      :class="$style.row"
      title="Click to insert section block into active prompt"
      @click="promptStore.insertLibrarySection(hit.section)"
    >
      <div :class="$style.rowTop">
        <code :class="$style.tag">&lt;{{ hit.section.tag }}&gt;</code>
        <span :class="$style.from">from {{ hit.promptName }}</span>
      </div>
      <div :class="$style.snippet">{{ hit.section.body || '(empty)' }}</div>
    </div>

    <div v-if="promptStore.filteredSections.value.length === 0" :class="$style.empty">
      No matching blocks
    </div>
  </div>
</template>

<script setup lang="ts">
const promptStore = usePromptStore()
</script>

<style module src="./StudioSidebar.module.css"></style>
