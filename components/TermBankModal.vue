<template>
  <UModal
    v-model:open="promptStore.showBankModal.value"
    title="Term Bank"
    description="Curated terms and guardrails rank highest when Tab completes a word in any section."
    :close="false"
    :ui="{
      overlay: $style.overlay,
      content: $style.dialog,
      header: $style.header,
      title: $style.title,
      description: $style.description,
      body: $style.body,
      footer: $style.footer
    }"
  >
    <template #body>
      <!-- Quick add -->
      <div :class="$style.presets">
        <span :class="$style.label">Quick add</span>
        <UButton
          v-for="preset in PRESET_TERMS"
          :key="preset.text"
          :class="$style.preset"
          :title="preset.category"
          @click="addPreset(preset.text)"
        >
          + {{ preset.text }}
        </UButton>
      </div>

      <label :class="$style.label" for="term-bank-entries">One term per line</label>
      <textarea
        id="term-bank-entries"
        v-model="bankContent"
        :class="$style.editor"
        spellcheck="false"
        placeholder="Chain of Thought&#10;Negative Guardrails&#10;JSON Schema Validation&#10;Investigate Before Answering"
      ></textarea>
    </template>

    <template #footer>
      <code :class="$style.count">{{ parsedTermsCount }} terms</code>
      <div :class="$style.actions">
        <UButton :class="$style.btn" @click="promptStore.showBankModal.value = false">
          Cancel
        </UButton>
        <UButton :class="[$style.btn, $style.primary]" @click="saveBank">
          Save Term Bank
        </UButton>
      </div>
    </template>
  </UModal>
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

<style module src="./TermBankModal.module.css"></style>
