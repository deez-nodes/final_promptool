<template>
  <div
    v-if="promptStore.showBankModal.value"
    class="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-4 select-none"
  >
    <div class="bg-surface border border-border2 rounded-lg p-5 w-full max-w-2xl shadow-2xl flex flex-col max-h-[85vh]">
      <!-- Modal Header -->
      <div class="flex items-center justify-between pb-3 border-b border-border mb-3">
        <div class="flex items-center gap-2">
          <span class="w-2.5 h-2.5 rounded-full bg-miku shadow-glow-miku"></span>
          <span class="font-rajdhani font-bold text-sm tracking-widest uppercase text-text">
            prompTOR Term Bank & Guardrails
          </span>
          <span class="text-[10px] font-mono px-1.5 py-0.5 rounded bg-surface3 text-muted2 border border-border">
            Tab Autocomplete Engine
          </span>
        </div>
        <button
          @click="promptStore.showBankModal.value = false"
          class="text-muted hover:text-pink text-lg font-bold px-2 py-0.5 transition-colors"
        >
          ×
        </button>
      </div>

      <p class="text-xs text-muted mb-3 leading-relaxed">
        Curated terms and guardrails rank highest during <kbd class="px-1.5 py-0.5 bg-surface3 text-acid rounded border border-border font-mono text-[10px]">Tab</kbd> autocomplete in any section.
      </p>

      <!-- Quick Category Pills -->
      <div class="flex flex-wrap gap-1.5 mb-3">
        <span class="text-[11px] text-muted2 py-1 mr-1">Quick Add:</span>
        <button
          v-for="preset in PRESET_TERMS"
          :key="preset.text"
          @click="addPreset(preset.text)"
          class="px-2 py-0.5 rounded bg-surface2 hover:bg-surface3 border border-border hover:border-miku text-text hover:text-miku text-[11px] font-mono transition-colors"
          :title="preset.category"
        >
          + {{ preset.text }}
        </button>
      </div>

      <!-- Term Editor Textarea -->
      <div class="flex-1 flex flex-col min-h-0 mb-4">
        <label class="text-[11px] font-rajdhani font-bold uppercase text-muted2 mb-1">
          Lexicon Entries (One per line):
        </label>
        <textarea
          v-model="bankContent"
          spellcheck="false"
          class="w-full flex-1 min-h-[200px] bg-surface2 border border-border focus:border-acid text-text font-mono text-xs p-3 rounded outline-none leading-relaxed resize-none"
          placeholder="Chain of Thought&#10;Negative Guardrails&#10;JSON Schema Validation&#10;Anthropic Claude&#10;Investigate Before Answering"
        ></textarea>
      </div>

      <!-- Modal Footer -->
      <div class="flex items-center justify-between pt-2 border-t border-border">
        <span class="text-[11px] text-muted font-mono">
          {{ parsedTermsCount }} terms defined
        </span>
        <div class="flex items-center gap-2.5">
          <button
            @click="promptStore.showBankModal.value = false"
            class="px-3.5 py-1.5 rounded bg-surface2 hover:bg-surface3 border border-border text-text font-mono text-xs transition-colors"
          >
            Cancel
          </button>
          <button
            @click="saveBank"
            class="px-4 py-1.5 rounded bg-acid hover:brightness-110 text-bg font-mono text-xs font-bold transition-all shadow-glow-acid"
          >
            Save Term Bank
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const promptStore = usePromptStore()

const PRESET_TERMS = [
  { text: 'Chain of Thought', category: 'reasoning' },
  { text: 'Investigate Before Answering', category: 'guardrail' },
  { text: 'Avoid Overengineering', category: 'guardrail' },
  { text: 'JSON Schema Validation', category: 'format' },
  { text: 'Few-Shot Exemplars', category: 'reasoning' },
  { text: 'Zero-Shot CoT', category: 'reasoning' },
  { text: 'Anti-Hallucination Grounding', category: 'guardrail' },
  { text: 'Anthropic Claude 3.7', category: 'role' },
  { text: 'OpenAI GPT-4o', category: 'role' },
  { text: 'Gemini 2.5 Flash', category: 'role' },
  { text: 'Preamble Elimination', category: 'guardrail' }
]

const bankContent = ref('')

watch(
  () => promptStore.showBankModal.value,
  isOpen => {
    if (isOpen) {
      bankContent.value = promptStore.bankTermsList.value.join('\n')
    }
  },
  { immediate: true }
)

const parsedTermsCount = computed(() => {
  return bankContent.value
    .split('\n')
    .map(s => s.trim())
    .filter(Boolean).length
})

const addPreset = (term: string) => {
  const current = bankContent.value
    .split('\n')
    .map(s => s.trim())
    .filter(Boolean)
  if (!current.includes(term)) {
    current.push(term)
    bankContent.value = current.join('\n')
  }
}

const saveBank = () => {
  const lines = bankContent.value
    .split('\n')
    .map(s => s.trim())
    .filter(Boolean)
  promptStore.saveBankTerms(lines)
  promptStore.showBankModal.value = false
}
</script>

