<template>
  <header id="header" :class="$style.bar">
    <!-- Brand -->
    <NuxtLink to="/" :class="$style.brand">
      <span>promp<strong>TOR</strong></span>
    </NuxtLink>

    <!-- Studio actions -->
    <div :class="$style.group">
      <UButton
        :class="[$style.btn, $style.primary]"
        title="Create new active prompt document"
        @click="promptStore.createPrompt('filled')"
      >
        + New Prompt
      </UButton>
      <UButton
        :class="$style.btn"
        title="Create modular template"
        @click="promptStore.createPrompt('template')"
      >
        + Template
      </UButton>
      <UButton
        :class="$style.btn"
        title="Add a new section to active prompt"
        @click="promptStore.addSectionToCurrent('instruction', '', 'instruction')"
      >
        + Section
      </UButton>
      <UButton
        v-if="promptStore.currentPrompt.value"
        :class="$style.btn"
        title="Clone active prompt"
        @click="promptStore.duplicatePrompt(promptStore.currentPrompt.value.id)"
      >
        Clone
      </UButton>
      <UButton
        v-if="promptStore.currentPrompt.value"
        :class="[$style.btn, $style.danger]"
        title="Delete current prompt"
        @click="confirmDeletePrompt"
      >
        Delete
      </UButton>
    </div>

    <!-- Model target -->
    <select
      :class="$style.select"
      aria-label="Model target"
      :value="promptStore.currentPrompt.value?.modelTarget || 'claude-3.7-sonnet'"
      @change="promptStore.updatePromptModel(($event.target as HTMLSelectElement).value as any)"
    >
      <option value="claude-3.7-sonnet">Claude 3.7 Sonnet</option>
      <option value="gpt-4o">OpenAI GPT-4o</option>
      <option value="gemini-2.5-flash">Gemini 2.5 Flash</option>
      <option value="gemini-2.5-pro">Gemini 2.5 Pro</option>
      <option value="deepseek-r1">DeepSeek R1</option>
    </select>

    <!-- Variable matrix toggle -->
    <UButton
      :class="[$style.btn, promptStore.showVariableMatrix.value && $style.on]"
      :aria-pressed="promptStore.showVariableMatrix.value"
      title="Toggle dynamic variable matrix"
      @click="promptStore.showVariableMatrix.value = !promptStore.showVariableMatrix.value"
    >
      Variables <code :class="$style.count">{{ promptStore.currentPromptVariables.value.length }}</code>
    </UButton>

    <div :class="$style.spacer" />

    <!-- Save state -->
    <span
      id="save-state"
      :class="$style.saveState"
      :data-state="saveState.status"
      :title="saveTitle"
      aria-live="polite"
    >
      <span :class="$style.dot" />
      <span>{{ saveState.status }}</span>
    </span>

    <!-- Token estimate -->
    <span
      :class="$style.metric"
      :title="`Estimated ~${promptStore.totalTokens.value} tokens across all active sections. Pricing: $${promptStore.estimatedCost.value.pricing.inputCostPerMillion}/MTok`"
    >
      <code :class="$style.count">~{{ promptStore.totalTokens.value }}</code> tokens
    </span>

    <!-- Term bank -->
    <UButton
      :class="$style.btn"
      title="Open Lexicon & Guardrails Bank"
      @click="promptStore.showBankModal.value = true"
    >
      Term Bank <kbd :class="$style.kbd">Tab</kbd>
    </UButton>

    <!-- Theme -->
    <UButton
      :class="$style.btn"
      title="Cycle theme"
      @click="cycleTheme"
    >
      Theme: {{ theme }}
    </UButton>
  </header>
</template>

<script setup lang="ts">
const promptStore = usePromptStore()
const { theme, cycleTheme } = useTheme()

const saveState = computed(() => promptStore.persist.value)
const saveTitle = computed(() => {
  const s = saveState.value
  const last = s.lastSavedAt ? `Last saved ${new Date(s.lastSavedAt).toLocaleTimeString()}` : 'Not saved yet this session'
  return s.status === 'failed' && s.error ? `${s.error} ${last}` : last
})

const confirmDeletePrompt = () => {
  if (!promptStore.currentPrompt.value) return
  if (confirm(`Delete prompt "${promptStore.currentPrompt.value.name || 'untitled'}"?`)) {
    promptStore.deletePrompt(promptStore.currentPrompt.value.id)
  }
}
</script>

<style module src="./Navbar.module.css"></style>
