<template>
  <!-- Prompts Pane Header -->
  <div class="pane-head flex items-center gap-2 p-2 border-b border-border bg-surface flex-shrink-0">
    <span class="font-rajdhani font-bold text-xs tracking-widest uppercase text-muted2">Prompts</span>
    <div class="flex-1"></div>
    <select
      v-model="promptStore.promptKindFilter.value"
      class="bg-surface2 border border-border text-[11px] text-text rounded px-2 py-0.5 focus:border-border2 outline-none cursor-pointer"
    >
      <option value="">all types</option>
      <option value="filled">filled</option>
      <option value="template">templates</option>
    </select>
  </div>

  <!-- Search Input -->
  <div class="p-2 border-b border-border bg-surface/30">
    <input
      v-model="promptStore.promptQuery.value"
      class="w-full bg-surface2 border border-border focus:border-border2 text-text text-xs rounded px-2.5 py-1.5 outline-none placeholder:text-muted"
      placeholder="Search prompts or content..."
      spellcheck="false"
    />
  </div>

  <!-- Prompts List -->
  <div class="flex-1 overflow-y-auto min-h-0 divide-y divide-border/50">
    <div
      v-for="p in promptStore.filteredPrompts.value"
      :key="p.id"
      @click="promptStore.selectPrompt(p.id)"
      :class="[
        'p-2.5 cursor-pointer transition-all duration-100 relative group',
        promptStore.currentPromptId.value === p.id
          ? 'bg-surface3 border-l-2 border-acid text-text shadow-inner'
          : 'hover:bg-surface2/60 text-muted2 hover:text-text'
      ]"
    >
      <div class="flex items-center gap-1.5 mb-1">
        <span class="font-bold truncate flex-1 text-xs text-text">
          {{ p.name || 'untitled' }}
        </span>
        <span
          v-if="p.kind === 'template'"
          class="text-[9px] font-bold tracking-wider px-1.5 py-0.2 rounded bg-miku text-bg font-rajdhani uppercase"
        >
          TMPL
        </span>
        <span
          v-else
          class="text-[9px] font-bold tracking-wider px-1.5 py-0.2 rounded bg-surface4 text-muted2"
        >
          {{ p.sections.filter(s => s.include && s.body.trim()).length }} sec
        </span>
      </div>
      <div class="text-[11px] text-muted truncate flex items-center gap-1">
        <span v-for="(s, idx) in p.sections.slice(0, 4)" :key="s.id" class="truncate">
          {{ s.tag }}<span v-if="idx < Math.min(p.sections.length - 1, 3)" class="text-border2">·</span>
        </span>
        <span v-if="p.sections.length > 4" class="text-muted text-[10px]">+{{ p.sections.length - 4 }}</span>
      </div>
    </div>

    <div
      v-if="promptStore.filteredPrompts.value.length === 0"
      class="p-5 text-center text-muted text-xs italic"
    >
      No prompts match filter
    </div>
  </div>

  <!-- Section Library Pane Header -->
  <div class="pane-head flex items-center gap-2 p-2 border-t border-b border-border bg-surface flex-shrink-0">
    <span class="font-rajdhani font-bold text-xs tracking-widest uppercase text-muted2">Section Library</span>
    <div class="flex-1"></div>
    <select
      v-model="promptStore.sectionTagFilter.value"
      class="bg-surface2 border border-border text-[11px] text-text rounded px-2 py-0.5 focus:border-border2 outline-none cursor-pointer max-w-[110px] truncate"
    >
      <option value="">all tags</option>
      <option v-for="t in promptStore.distinctTags.value" :key="t" :value="t">{{ t }}</option>
    </select>
  </div>

  <div class="p-2 border-b border-border bg-surface/30">
    <input
      v-model="promptStore.sectionQuery.value"
      class="w-full bg-surface2 border border-border focus:border-border2 text-text text-xs rounded px-2.5 py-1.5 outline-none placeholder:text-muted"
      placeholder="Filter library blocks..."
      spellcheck="false"
    />
  </div>

  <!-- Section Library List -->
  <div class="h-48 overflow-y-auto min-h-0 divide-y divide-border/50">
    <div
      v-for="(hit, idx) in promptStore.filteredSections.value"
      :key="hit.section.id + idx"
      @click="promptStore.insertLibrarySection(hit.section)"
      class="p-2.5 cursor-pointer hover:bg-surface2/80 transition-colors group"
      title="Click to insert section block into active prompt"
    >
      <div class="flex items-center gap-1.5">
        <span class="text-miku font-bold text-xs">&lt;{{ hit.section.tag }}&gt;</span>
        <span class="text-[10px] text-muted truncate">from {{ hit.promptName }}</span>
        <div class="flex-1"></div>
        <span class="text-[10px] text-acid opacity-0 group-hover:opacity-100 transition-opacity font-bold font-mono">
          + insert
        </span>
      </div>
      <div class="text-[11px] text-muted2 line-clamp-1 mt-0.5 font-mono">
        {{ hit.section.body || '(empty)' }}
      </div>
    </div>

    <div
      v-if="promptStore.filteredSections.value.length === 0"
      class="p-4 text-center text-muted text-xs italic"
    >
      No matching blocks
    </div>
  </div>
</template>

<script setup lang="ts">
const promptStore = usePromptStore()
</script>
