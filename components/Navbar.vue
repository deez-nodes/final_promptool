<template>
  <header id="header" class="h-12 flex-shrink-0 flex items-center gap-2.5 px-3.5 bg-gradient-to-b from-surface to-bg border-b border-border text-xs z-30 select-none">
    <!-- Logo & Branding -->
    <div class="flex items-center gap-2.5 mr-2">
      <NuxtLink to="/" class="flex items-center gap-2 group">
        <div class="w-6 h-6 rounded bg-brand-magenta flex items-center justify-center font-orbitron font-black text-white text-[11px] shadow-glow-magenta transition-transform group-hover:scale-105">
          P
        </div>
        <div class="font-orbitron font-black text-sm tracking-wider text-acid drop-shadow-sm flex items-center">
          <span>promp<i class="not-italic text-brand-magenta">TOR</i></span>
          <span class="ml-1.5 text-[9px] font-mono tracking-normal px-1.5 py-0.5 rounded bg-surface3 text-miku border border-border">
            STUDIO
          </span>
        </div>
      </NuxtLink>
    </div>

    <!-- Quick Studio Actions -->
    <div class="flex items-center gap-1.5 bg-surface2/60 p-0.5 rounded border border-border">
      <button
        @click="promptStore.createPrompt('filled')"
        class="flex items-center gap-1 px-2.5 py-1 bg-surface3 hover:bg-surface4 border border-acid/50 hover:border-acid text-acid rounded transition-all font-mono text-[11px] font-bold"
        title="Create new active prompt document"
      >
        <span class="text-xs">+</span>
        <span>New Prompt</span>
      </button>

      <button
        @click="promptStore.createPrompt('template')"
        class="flex items-center gap-1 px-2 py-1 bg-surface hover:bg-surface3 border border-border hover:border-text text-text rounded transition-all font-mono text-[11px]"
        title="Create modular template"
      >
        <span>+ Template</span>
      </button>

      <button
        @click="promptStore.addSectionToCurrent('instruction', '', 'instruction')"
        class="flex items-center gap-1 px-2 py-1 bg-surface hover:bg-surface3 border border-border hover:border-text text-text rounded transition-all font-mono text-[11px]"
        title="Add a new section to active prompt"
      >
        <span>+ Section</span>
      </button>

      <button
        v-if="promptStore.currentPrompt.value"
        @click="promptStore.duplicatePrompt(promptStore.currentPrompt.value.id)"
        class="flex items-center gap-1 px-2 py-1 bg-surface hover:bg-surface3 border border-border hover:border-text text-muted2 hover:text-text rounded transition-all font-mono text-[11px]"
        title="Clone active prompt"
      >
        <span>Clone</span>
      </button>

      <button
        v-if="promptStore.currentPrompt.value"
        @click="confirmDeletePrompt"
        class="flex items-center gap-1 px-2 py-1 bg-surface hover:bg-surface3 border border-border hover:border-pink hover:text-pink text-muted rounded transition-all font-mono text-[11px]"
        title="Delete current prompt"
      >
        <span>Delete</span>
      </button>
    </div>

    <!-- Model Target Selector -->
    <div class="flex items-center gap-1.5 bg-surface2 border border-border px-2 py-0.5 rounded ml-1">
      <span class="w-1.5 h-1.5 rounded-full bg-miku animate-pulse"></span>
      <select
        :value="promptStore.currentPrompt.value?.modelTarget || 'claude-3.7-sonnet'"
        @change="promptStore.updatePromptModel(($event.target as HTMLSelectElement).value as any)"
        class="bg-transparent border-none text-[11px] text-text font-mono focus:outline-none cursor-pointer py-0.5"
      >
        <option value="claude-3.7-sonnet" class="bg-surface2 text-text">Claude 3.7 Sonnet</option>
        <option value="gpt-4o" class="bg-surface2 text-text">OpenAI GPT-4o</option>
        <option value="gemini-2.5-flash" class="bg-surface2 text-text">Gemini 2.5 Flash</option>
        <option value="gemini-2.5-pro" class="bg-surface2 text-text">Gemini 2.5 Pro</option>
        <option value="deepseek-r1" class="bg-surface2 text-text">DeepSeek R1</option>
      </select>
    </div>

    <!-- Dynamic Variable Matrix Switcher -->
    <button
      @click="promptStore.showVariableMatrix.value = !promptStore.showVariableMatrix.value"
      :class="[
        'flex items-center gap-1.5 px-2.5 py-1 rounded font-mono text-[11px] transition-all border',
        promptStore.showVariableMatrix.value
          ? 'bg-miku/20 border-miku text-miku font-bold shadow-glow-miku'
          : 'bg-surface2 hover:bg-surface3 border-border text-muted hover:text-text'
      ]"
      title="Toggle dynamic variable matrix playground"
    >
      <span class="font-bold text-acid">{'{x}'}</span>
      <span>Variables ({{ promptStore.currentPromptVariables.value.length }})</span>
    </button>

    <div class="flex-1"></div>

    <!-- Right Controls: Token Metrics, Term Bank & IO -->
    <div class="flex items-center gap-2">
      <!-- Token & Cost Counter -->
      <div
        class="hidden lg:flex items-center gap-2 px-2.5 py-1 bg-surface3 border border-border rounded font-mono text-[11px]"
        :title="`Estimated ~${promptStore.totalTokens.value} tokens across all active sections. Pricing: $${promptStore.estimatedCost.value.pricing.inputCostPerMillion}/MTok`"
      >
        <span class="text-muted">Est:</span>
        <span class="text-acid font-bold">~{{ promptStore.totalTokens.value }} toks</span>
        <span class="text-border2">|</span>
        <span class="text-green font-bold">${{ promptStore.estimatedCost.value.per1kRunsUsd.toFixed(4) }} / 1k runs</span>
      </div>

      <!-- Term Bank Palette Trigger -->
      <button
        @click="promptStore.showBankModal.value = true"
        class="flex items-center gap-1 px-2.5 py-1 bg-surface2 hover:bg-surface3 border border-border hover:border-miku text-text hover:text-miku rounded transition-colors text-[11px] font-mono"
        title="Open Lexicon & Guardrails Bank (Ctrl+K or Tab in editor)"
      >
        <span class="text-miku">◆</span>
        <span>Term Bank</span>
        <kbd class="hidden sm:inline text-[9px] px-1 py-0.2 rounded bg-surface3 text-muted2 border border-border">Tab</kbd>
      </button>

      <!-- Export & Import Controls -->
      <button
        @click="handleExport"
        class="px-2 py-1 bg-surface2 hover:bg-surface3 border border-border hover:border-acid text-text hover:text-acid rounded transition-colors text-[11px] font-mono"
        title="Export entire studio workspace as JSON"
      >
        Export
      </button>

      <button
        @click="triggerImport"
        class="px-2 py-1 bg-surface2 hover:bg-surface3 border border-border hover:border-acid text-text hover:text-acid rounded transition-colors text-[11px] font-mono"
        title="Import workspace JSON"
      >
        Import
      </button>
      <input ref="fileInput" type="file" accept="application/json" class="hidden" @change="handleFileSelected" />
    </div>
  </header>
</template>

<script setup lang="ts">
const promptStore = usePromptStore()
const fileInput = ref<HTMLInputElement | null>(null)

const confirmDeletePrompt = () => {
  if (!promptStore.currentPrompt.value) return
  if (confirm(`Delete prompt "${promptStore.currentPrompt.value.name || 'untitled'}"?`)) {
    promptStore.deletePrompt(promptStore.currentPrompt.value.id)
  }
}

const handleExport = () => {
  const json = promptStore.exportStoreJson()
  const blob = new Blob([json], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `promptor_workspace_${new Date().toISOString().slice(0, 10)}.json`
  a.click()
  URL.revokeObjectURL(url)
}

const triggerImport = () => {
  fileInput.value?.click()
}

const handleFileSelected = (e: Event) => {
  const target = e.target as HTMLInputElement
  const file = target.files?.[0]
  if (!file) return

  const reader = new FileReader()
  reader.onload = () => {
    const content = reader.result as string
    const res = promptStore.importStoreJson(content)
    if (res.ok) {
      alert('prompTOR workspace imported successfully!')
    } else {
      alert('Import failed: ' + res.error)
    }
  }
  reader.readAsText(file)
  target.value = ''
}
</script>

