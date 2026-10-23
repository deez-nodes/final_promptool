<template>
  <template v-if="promptStore.currentPrompt.value">
    <!-- Prompt Title & Metadata Header -->
    <div id="prompt-bar" class="flex flex-col gap-2 mb-4 pb-3 border-b border-border bg-surface/30 p-3 rounded-lg">
      <div class="flex items-center gap-3">
        <input
          :value="promptStore.currentPrompt.value.name"
          @input="promptStore.updatePromptName(($event.target as HTMLInputElement).value)"
          placeholder="Untitled Prompt"
          spellcheck="false"
          class="flex-1 text-base font-bold bg-transparent border-none text-text outline-none focus:text-acid transition-colors py-0.5 placeholder:text-muted"
        />
        <div class="flex items-center gap-2">
          <span class="text-[10px] font-mono px-2 py-0.5 rounded bg-surface3 border border-border text-muted">
            {{ promptStore.currentPrompt.value.kind }}
          </span>
          <span class="text-[11px] text-muted">
            Updated {{ new Date(promptStore.currentPrompt.value.updated).toLocaleTimeString() }}
          </span>
        </div>
      </div>

      <!-- Variable Matrix Drawer / Collapsible Banner -->
      <div
        v-if="promptStore.showVariableMatrix.value"
        class="mt-2 p-3 rounded-md bg-surface2/90 border border-miku/40 flex flex-col gap-2.5 transition-all"
      >
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2">
            <span class="text-miku font-bold text-xs">&#123;x&#125; Dynamic Variable Matrix</span>
            <span class="text-[10px] text-muted">Interpolated into &#123;&#123;var&#125;&#125; tokens at compile time</span>
          </div>
          <button
            @click="promptStore.showVariableMatrix.value = false"
            class="text-muted hover:text-text text-xs px-1"
          >
            ✕
          </button>
        </div>

        <!-- Variable Input Rows -->
        <div
          v-if="promptStore.currentPromptVariables.value.length > 0"
          class="grid grid-cols-1 md:grid-cols-2 gap-2"
        >
          <div
            v-for="varKey in promptStore.currentPromptVariables.value"
            :key="varKey"
            class="flex items-center gap-2 bg-surface p-1.5 rounded border border-border"
          >
            <span class="text-acid font-bold text-[11px] px-1.5 py-0.5 bg-surface3 rounded border border-border font-mono">
              &#123;&#123;{{ varKey }}&#125;&#125;
            </span>
            <input
              :value="promptStore.store.value.activeVariables?.[varKey] || ''"
              @input="promptStore.setPromptVariable(varKey, ($event.target as HTMLInputElement).value)"
              class="flex-1 bg-transparent border-none text-text text-xs font-mono outline-none px-1 py-0.5 placeholder:text-muted"
              :placeholder="`Value for ${varKey}...`"
              spellcheck="false"
            />
          </div>
        </div>

        <div v-else class="text-xs text-muted italic p-1">
          No variables found. Type <code class="text-acid font-mono">&#123;&#123;my_var&#125;&#125;</code> in any section to define dynamic variables.
        </div>
      </div>
    </div>

    <!-- Interactive Section Blocks -->
    <div id="sections" class="space-y-3.5">
      <div
        v-for="(s, index) in promptStore.currentPrompt.value.sections"
        :key="s.id"
        :class="[
          'section border rounded-lg transition-all duration-150 bg-surface shadow-xs',
          s.include ? 'border-border focus-within:border-border2' : 'border-border/40 opacity-55 bg-surface/40'
        ]"
        :data-id="s.id"
      >
        <!-- Section Header -->
        <div class="section-head flex items-center gap-2.5 px-3 py-2 border-b border-border/80 bg-surface2/50 select-none">
          <!-- Reorder Index Pill -->
          <span
            class="section-num bg-acid text-bg font-bold text-[11px] rounded px-1.5 py-0.5 cursor-grab active:cursor-grabbing hover:shadow-glow-acid font-mono"
            title="Section order index"
          >
            {{ index + 1 }}
          </span>

          <!-- Move Up/Down Controls -->
          <div class="flex items-center text-muted hover:text-text gap-0.5">
            <button
              v-if="index > 0"
              @click="promptStore.moveSectionInCurrent(index, index - 1)"
              class="hover:text-acid px-1 py-0.5 text-[10px] rounded hover:bg-surface3"
              title="Move section up"
            >
              ▲
            </button>
            <button
              v-if="index < promptStore.currentPrompt.value.sections.length - 1"
              @click="promptStore.moveSectionInCurrent(index, index + 1)"
              class="hover:text-acid px-1 py-0.5 text-[10px] rounded hover:bg-surface3"
              title="Move section down"
            >
              ▼
            </button>
          </div>

          <!-- Tag Slug Input -->
          <div class="flex items-center gap-1">
            <span class="text-miku font-bold font-mono">&lt;</span>
            <input
              :value="s.tag"
              @blur="promptStore.updateSectionInCurrent(s.id, { tag: ($event.target as HTMLInputElement).value })"
              @keydown.enter="($event.target as HTMLInputElement).blur()"
              class="bg-transparent border-none text-miku focus:text-acid font-bold outline-none py-0.5 w-36 tracking-wide font-mono"
              spellcheck="false"
              placeholder="tag_name"
            />
            <span class="text-miku font-bold font-mono">&gt;</span>
          </div>

          <!-- Section Role Chip / Selector -->
          <select
            :value="s.role || 'custom'"
            @change="promptStore.updateSectionInCurrent(s.id, { role: ($event.target as HTMLSelectElement).value as any })"
            class="bg-surface3 border border-border text-[10px] text-muted2 rounded px-1.5 py-0.5 focus:border-border2 outline-none cursor-pointer uppercase font-rajdhani font-bold tracking-wider"
          >
            <option value="system">System</option>
            <option value="instruction">Instruction</option>
            <option value="context">Context</option>
            <option value="constraint">Constraint</option>
            <option value="few-shot">Few-Shot</option>
            <option value="output-format">Output Format</option>
            <option value="custom">Custom</option>
          </select>

          <!-- Include Checkbox -->
          <label class="flex items-center gap-1.5 text-muted text-[11px] cursor-pointer hover:text-text ml-1">
            <input
              type="checkbox"
              :checked="s.include"
              @change="promptStore.updateSectionInCurrent(s.id, { include: ($event.target as HTMLInputElement).checked })"
              class="rounded bg-surface2 border-border accent-acid cursor-pointer"
            />
            <span>include</span>
          </label>

          <div class="flex-1"></div>

          <!-- Tokens estimation badge -->
          <span class="text-[10px] text-muted font-mono mr-1">
            ~{{ promptStore.estimateTokens(s.body) }} toks
          </span>

          <!-- Clone Section Button -->
          <button
            @click="promptStore.duplicateSectionInCurrent(s.id)"
            class="text-muted hover:text-text px-1.5 py-0.5 rounded text-xs transition-colors"
            title="Duplicate section"
          >
            clone
          </button>

          <!-- Delete Section Button -->
          <button
            @click="promptStore.removeSectionFromCurrent(s.id)"
            class="text-muted hover:text-pink px-1.5 py-0.5 rounded transition-colors text-sm font-bold"
            title="Delete section"
          >
            ×
          </button>
        </div>

        <!-- Section Body Textarea with Tab Autocomplete -->
        <div class="relative p-2.5">
          <textarea
            :value="s.body"
            @input="handleBodyInput(s.id, $event)"
            @keydown="handleTextareaKeydown(s.id, $event)"
            class="w-full min-h-[90px] bg-transparent border-none text-text font-mono text-xs p-1 outline-none leading-relaxed resize-y placeholder:text-muted focus:bg-surface/30 rounded"
            placeholder="Write prompt instructions, rules, XML schemas, or dynamic variables like {{my_var}} here... (Press Tab for autocomplete)"
            spellcheck="false"
          ></textarea>
        </div>
      </div>
    </div>

    <!-- Quick Add Section Block Bar -->
    <div class="mt-5 p-3 rounded-lg border border-dashed border-border flex flex-wrap items-center justify-center gap-2 bg-surface/20">
      <span class="text-xs text-muted mr-1 font-rajdhani font-bold uppercase tracking-wider">Add Block:</span>
      <button
        @click="promptStore.addSectionToCurrent('instructions', '', 'instruction')"
        class="px-2.5 py-1 rounded bg-surface2 hover:bg-surface3 border border-border hover:border-acid text-text hover:text-acid text-xs font-mono transition-colors"
      >
        + Instructions
      </button>
      <button
        @click="promptStore.addSectionToCurrent('constraints', '', 'constraint')"
        class="px-2.5 py-1 rounded bg-surface2 hover:bg-surface3 border border-border hover:border-pink text-text hover:text-pink text-xs font-mono transition-colors"
      >
        + Constraint
      </button>
      <button
        @click="promptStore.addSectionToCurrent('context', '', 'context')"
        class="px-2.5 py-1 rounded bg-surface2 hover:bg-surface3 border border-border hover:border-miku text-text hover:text-miku text-xs font-mono transition-colors"
      >
        + Context
      </button>
      <button
        @click="promptStore.addSectionToCurrent('few_shot', '', 'few-shot')"
        class="px-2.5 py-1 rounded bg-surface2 hover:bg-surface3 border border-border hover:border-amber text-text hover:text-amber text-xs font-mono transition-colors"
      >
        + Few-Shot
      </button>
      <button
        @click="promptStore.addSectionToCurrent('output_format', '', 'output-format')"
        class="px-2.5 py-1 rounded bg-surface2 hover:bg-surface3 border border-border hover:border-green text-text hover:text-green text-xs font-mono transition-colors"
      >
        + Output Format
      </button>
    </div>
  </template>

  <!-- Empty State -->
  <div v-else id="empty" class="text-center py-20 text-muted">
    <div class="text-4xl mb-3 text-brand-magenta font-orbitron font-bold">prompTOR</div>
    <p class="text-sm mb-4">No prompt selected</p>
    <button
      @click="promptStore.createPrompt('filled')"
      class="px-4 py-2 bg-acid hover:brightness-110 text-bg rounded font-bold transition-all shadow-glow-acid font-mono text-xs"
    >
      + Create New Prompt
    </button>
  </div>

  <!-- Autocomplete Dropdown Popup -->
  <div
    v-if="acVisible && acCandidates.length > 0"
    :style="{ top: acPos.top + 'px', left: acPos.left + 'px' }"
    class="fixed z-50 bg-surface2 border border-border2 rounded-md p-1 max-w-xs shadow-2xl overflow-hidden font-mono text-xs divide-y divide-border/40"
  >
    <div
      v-for="(cand, idx) in acCandidates.slice(0, 7)"
      :key="cand"
      @mousedown.prevent="selectCandidate(cand)"
      :class="[
        'px-2.5 py-1.5 rounded cursor-pointer truncate flex items-center justify-between gap-2',
        idx === acActiveIndex ? 'bg-surface3 text-acid font-bold' : 'text-text hover:bg-surface3/80'
      ]"
    >
      <span>{{ cand }}</span>
      <span v-if="promptStore.bankTermsList.value.includes(cand)" class="text-[9px] px-1 py-0.2 rounded bg-miku/20 text-miku">
        bank
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { harvest, getCandidates } from '~/composables/usePromptStore'

const promptStore = usePromptStore()

// ── Tab Autocomplete Engine ──────────────────────────────────────────────────
const acVisible = ref(false)
const acCandidates = ref<string[]>([])
const acActiveIndex = ref(0)
const acPos = ref({ top: 0, left: 0 })
const activeSectionId = ref<string | null>(null)
let activeTextarea: HTMLTextAreaElement | null = null

const getWordPrefixAtCursor = (el: HTMLTextAreaElement) => {
  const text = el.value.slice(0, el.selectionStart)
  const match = text.match(/[A-Za-z0-9_-]+$/)
  return match ? match[0] : ''
}

const handleBodyInput = (sectionId: string, e: Event) => {
  const target = e.target as HTMLTextAreaElement
  promptStore.updateSectionInCurrent(sectionId, { body: target.value })
  checkAutocomplete(target, sectionId)
}

const checkAutocomplete = (el: HTMLTextAreaElement, sectionId: string) => {
  const prefix = getWordPrefixAtCursor(el)
  if (!prefix || prefix.length < 2) {
    acVisible.value = false
    return
  }

  const docTerms = harvest(el.value)
  const bankTerms = promptStore.bankTermsList.value
  const candidates = getCandidates(prefix, docTerms, bankTerms)

  if (candidates.length > 0) {
    acCandidates.value = candidates
    acActiveIndex.value = 0
    activeSectionId.value = sectionId
    activeTextarea = el

    const rect = el.getBoundingClientRect()
    acPos.value = {
      top: rect.bottom + window.scrollY + 2,
      left: Math.min(rect.left + window.scrollX + 20, window.innerWidth - 220)
    }
    acVisible.value = true
  } else {
    acVisible.value = false
  }
}

const handleTextareaKeydown = (sectionId: string, e: KeyboardEvent) => {
  const el = e.target as HTMLTextAreaElement

  if (e.key === 'Tab') {
    e.preventDefault()
    const prefix = getWordPrefixAtCursor(el)
    if (!prefix) return

    const docTerms = harvest(el.value)
    const bankTerms = promptStore.bankTermsList.value
    const candidates = getCandidates(prefix, docTerms, bankTerms)

    if (candidates.length > 0) {
      if (acVisible.value) {
        acActiveIndex.value = (acActiveIndex.value + 1) % candidates.length
        selectCandidate(candidates[acActiveIndex.value])
      } else {
        acCandidates.value = candidates
        acActiveIndex.value = 0
        selectCandidate(candidates[0])
      }
    }
    return
  }

  if (acVisible.value) {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      acActiveIndex.value = (acActiveIndex.value + 1) % acCandidates.value.length
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      acActiveIndex.value = (acActiveIndex.value - 1 + acCandidates.value.length) % acCandidates.value.length
    } else if (e.key === 'Enter') {
      e.preventDefault()
      if (acCandidates.value[acActiveIndex.value]) {
        selectCandidate(acCandidates.value[acActiveIndex.value])
      }
    } else if (e.key === 'Escape') {
      acVisible.value = false
    }
  }
}

const selectCandidate = (cand: string) => {
  if (!activeTextarea || !activeSectionId.value) return
  const el = activeTextarea
  const selStart = el.selectionStart
  const textBefore = el.value.slice(0, selStart)
  const textAfter = el.value.slice(el.selectionEnd)
  const prefix = getWordPrefixAtCursor(el)

  const newTextBefore = textBefore.slice(0, textBefore.length - prefix.length) + cand
  const newFullText = newTextBefore + textAfter

  promptStore.updateSectionInCurrent(activeSectionId.value, { body: newFullText })
  el.value = newFullText

  nextTick(() => {
    el.selectionStart = el.selectionEnd = newTextBefore.length
    el.focus()
  })

  acVisible.value = false
}
</script>
