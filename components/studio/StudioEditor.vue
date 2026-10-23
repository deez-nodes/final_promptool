<template>
  <template v-if="promptStore.currentPrompt.value">
    <!-- Prompt title and metadata -->
    <div id="prompt-bar" :class="$style.promptBar">
      <div :class="$style.titleRow">
        <input
          :value="promptStore.currentPrompt.value.name"
          :class="$style.title"
          placeholder="Untitled Prompt"
          spellcheck="false"
          aria-label="Prompt name"
          @input="promptStore.updatePromptName(($event.target as HTMLInputElement).value)"
        />
        <code :class="$style.badge">{{ promptStore.currentPrompt.value.kind }}</code>
        <span :class="$style.meta">
          Updated {{ new Date(promptStore.currentPrompt.value.updated).toLocaleTimeString() }}
        </span>
      </div>

      <!-- Variable matrix -->
      <div v-if="promptStore.showVariableMatrix.value" :class="$style.matrix">
        <div :class="$style.matrixHead">
          <span :class="$style.matrixTitle">Variables</span>
          <span :class="$style.meta">Filled into <code :class="$style.tag">&#123;&#123;var&#125;&#125;</code> tags when the prompt is built</span>
          <UButton
            :class="$style.iconBtn"
            aria-label="Close variables"
            @click="promptStore.showVariableMatrix.value = false"
          >
            ×
          </UButton>
        </div>

        <div v-if="promptStore.currentPromptVariables.value.length > 0" :class="$style.matrixGrid">
          <label
            v-for="varKey in promptStore.currentPromptVariables.value"
            :key="varKey"
            :class="$style.varRow"
          >
            <code :class="$style.tag">&#123;&#123;{{ varKey }}&#125;&#125;</code>
            <input
              :value="promptStore.store.value.activeVariables?.[varKey] || ''"
              :class="$style.varInput"
              :placeholder="`Value for ${varKey}...`"
              spellcheck="false"
              @input="promptStore.setPromptVariable(varKey, ($event.target as HTMLInputElement).value)"
            />
          </label>
        </div>

        <p v-else :class="$style.meta">
          No variables found. Type <code :class="$style.tag">&#123;&#123;my_var&#125;&#125;</code> in any section to define one.
        </p>
      </div>
    </div>

    <!-- Section cards -->
    <div id="sections" :class="$style.sections">
      <div
        v-for="(s, index) in promptStore.currentPrompt.value.sections"
        :key="s.id"
        :class="[$style.card, !s.include && $style.cardExcluded]"
        :data-id="s.id"
        :data-type="typeOf(s.role)"
      >
        <div :class="$style.cardHead">
          <code :class="$style.num" title="Section order index">{{ index + 1 }}</code>

          <div :class="$style.moves">
            <UButton
              v-if="index > 0"
              :class="$style.iconBtn"
              title="Move section up"
              @click="promptStore.moveSectionInCurrent(index, index - 1)"
            >
              ▲
            </UButton>
            <UButton
              v-if="index < promptStore.currentPrompt.value.sections.length - 1"
              :class="$style.iconBtn"
              title="Move section down"
              @click="promptStore.moveSectionInCurrent(index, index + 1)"
            >
              ▼
            </UButton>
          </div>

          <!-- Tag: the section heading -->
          <input
            :value="s.tag"
            :class="$style.tagInput"
            spellcheck="false"
            placeholder="tag_name"
            aria-label="Section tag"
            @blur="promptStore.updateSectionInCurrent(s.id, { tag: ($event.target as HTMLInputElement).value })"
            @keydown.enter="($event.target as HTMLInputElement).blur()"
          />

          <select
            :value="s.role || 'custom'"
            :class="$style.select"
            aria-label="Section type"
            @change="promptStore.updateSectionInCurrent(s.id, { role: ($event.target as HTMLSelectElement).value as any })"
          >
            <option value="system">System</option>
            <option value="instruction">Instruction</option>
            <option value="context">Context</option>
            <option value="constraint">Constraint</option>
            <option value="few-shot">Few-Shot</option>
            <option value="output-format">Output Format</option>
            <option value="custom">Custom</option>
          </select>

          <label :class="$style.include">
            <input
              type="checkbox"
              :checked="s.include"
              @change="promptStore.updateSectionInCurrent(s.id, { include: ($event.target as HTMLInputElement).checked })"
            />
            <span>include</span>
          </label>

          <span :class="$style.spacer" />

          <code :class="$style.count">~{{ promptStore.estimateTokens(s.body) }} tokens</code>

          <UButton
            :class="$style.textBtn"
            title="Duplicate section"
            @click="promptStore.duplicateSectionInCurrent(s.id)"
          >
            clone
          </UButton>
          <UButton
            :class="[$style.iconBtn, $style.danger]"
            title="Delete section"
            @click="promptStore.removeSectionFromCurrent(s.id)"
          >
            ×
          </UButton>
        </div>

        <div :class="$style.cardBody">
          <textarea
            :value="s.body"
            :class="$style.body"
            placeholder="Write the section here. Use {{my_var}} for variables. Tab completes terms."
            spellcheck="false"
            aria-label="Section body"
            @input="handleBodyInput(s.id, $event)"
            @keydown="handleTextareaKeydown(s.id, $event)"
          ></textarea>
        </div>
      </div>
    </div>

    <!-- Add a section by chip: the chip sets its type and colour -->
    <div :class="$style.addBar">
      <span :class="$style.meta">Add section</span>
      <UButton
        v-for="chip in CHIPS"
        :key="chip.tag"
        :class="$style.chip"
        :data-type="typeOf(chip.role)"
        @click="promptStore.addSectionToCurrent(chip.tag, '', chip.role)"
      >
        + {{ chip.label }}
      </UButton>
    </div>
  </template>

  <!-- Empty state -->
  <div v-else id="empty" :class="$style.empty">
    <p :class="$style.emptyTitle">No prompt selected</p>
    <UButton :class="$style.action" @click="promptStore.createPrompt('filled')">
      + Create New Prompt
    </UButton>
  </div>

  <!-- Autocomplete popup -->
  <div
    v-if="acVisible && acCandidates.length > 0"
    :class="$style.ac"
    :style="{ top: acPos.top + 'px', left: acPos.left + 'px' }"
  >
    <div
      v-for="(cand, idx) in acCandidates.slice(0, 7)"
      :key="cand"
      :class="[$style.acRow, idx === acActiveIndex && $style.acActive]"
      @mousedown.prevent="selectCandidate(cand)"
    >
      <span>{{ cand }}</span>
      <code v-if="promptStore.bankTermsList.value.includes(cand)" :class="$style.count">bank</code>
    </div>
  </div>
</template>

<script setup lang="ts">
import { harvest, getCandidates } from '~/composables/usePromptStore'

const promptStore = usePromptStore()

// Section role -> colour type (assets/css/tokens.css [data-type]). Rebuilt with the model in a later package.
const ROLE_TYPE: Record<string, string> = {
  system: 'role',
  context: 'context',
  'few-shot': 'context',
  instruction: 'task',
  constraint: 'constraints',
  'output-format': 'output',
  custom: 'task'
}
const typeOf = (role?: string) => ROLE_TYPE[role || 'custom'] || 'task'

const CHIPS = [
  { tag: 'instructions', role: 'instruction', label: 'Instructions' },
  { tag: 'constraints', role: 'constraint', label: 'Constraint' },
  { tag: 'context', role: 'context', label: 'Context' },
  { tag: 'few_shot', role: 'few-shot', label: 'Few-Shot' },
  { tag: 'output_format', role: 'output-format', label: 'Output Format' }
] as const

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

<style module src="./StudioEditor.module.css"></style>
