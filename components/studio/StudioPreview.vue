<template>
  <!-- Target Selector Tabs -->
  <div class="pane-head flex items-center gap-1.5 p-2 border-b border-border bg-surface flex-shrink-0 select-none overflow-x-auto">
    <button
      v-for="target in TARGET_TABS"
      :key="target.id"
      @click="activeTarget = target.id"
      :class="[
        'px-2 py-1 rounded text-[11px] font-mono transition-all',
        activeTarget === target.id
          ? 'bg-surface3 text-acid font-bold border border-border2 shadow-xs'
          : 'text-muted hover:text-text hover:bg-surface2'
      ]"
    >
      {{ target.label }}
    </button>
  </div>

  <!-- Preview Subheader Controls -->
  <div class="flex items-center gap-2 px-3 py-1.5 border-b border-border bg-surface2/40 text-xs select-none">
    <!-- Interpolate Toggle -->
    <label class="flex items-center gap-1.5 text-muted hover:text-text cursor-pointer text-[11px] font-mono">
      <input
        type="checkbox"
        v-model="interpolateMode"
        class="rounded bg-surface border-border accent-acid cursor-pointer"
      />
      <span>Interpolate &#123;&#123;vars&#125;&#125;</span>
    </label>

    <div class="flex-1"></div>

    <!-- Token count metric -->
    <span class="text-[11px] text-muted font-mono">{{ compiledOutput.length }} chars</span>

    <!-- Copy Action Button -->
    <button
      @click="copyOutput"
      class="px-2.5 py-1 bg-surface2 hover:bg-surface3 border border-border hover:border-acid text-text hover:text-acid rounded transition-colors text-xs font-mono"
    >
      {{ copied ? 'Copied!' : 'Copy' }}
    </button>

    <!-- Save File Action Button -->
    <button
      @click="saveFile"
      class="px-2.5 py-1 bg-surface2 hover:bg-surface3 border border-border hover:border-acid text-text hover:text-acid rounded transition-colors text-xs font-mono"
    >
      Save {{ currentFileExt }}
    </button>
  </div>

  <!-- Compiled Code View -->
  <pre
    id="preview"
    class="flex-1 overflow-auto p-3.5 whitespace-pre-wrap break-words font-mono text-[12px] leading-relaxed text-muted2 selection:bg-acid/20"
    v-html="formattedOutput"
  ></pre>
</template>

<script setup lang="ts">
import {
  toXml,
  toOpenAiMessages,
  toGeminiAst,
  toRawMarkdown,
  toPythonSdk,
  toTypeScriptSdk
} from '~/composables/usePromptStore'
import type { CompilerTarget } from '~/types'

const promptStore = usePromptStore()

const TARGET_TABS = [
  { id: 'anthropic-xml' as CompilerTarget, label: 'XML (Claude)' },
  { id: 'openai-messages' as CompilerTarget, label: 'JSON (OpenAI)' },
  { id: 'gemini-ast' as CompilerTarget, label: 'Gemini AST' },
  { id: 'raw-markdown' as CompilerTarget, label: 'Markdown' },
  { id: 'sdk-python' as CompilerTarget, label: 'Python SDK' },
  { id: 'sdk-typescript' as CompilerTarget, label: 'TypeScript' }
]

const activeTarget = ref<CompilerTarget>('anthropic-xml')
const interpolateMode = ref(true)
const copied = ref(false)

// Active variable map
const activeVars = computed(() => {
  if (!interpolateMode.value) return undefined
  return promptStore.store.value.activeVariables || {}
})

const compiledOutput = computed(() => {
  const p = promptStore.currentPrompt.value
  if (!p) return ''
  const vars = activeVars.value

  switch (activeTarget.value) {
    case 'anthropic-xml':
      return toXml(p, vars)
    case 'openai-messages':
      return JSON.stringify(toOpenAiMessages(p, vars), null, 2)
    case 'gemini-ast':
      return JSON.stringify(toGeminiAst(p, vars), null, 2)
    case 'raw-markdown':
      return toRawMarkdown(p, vars)
    case 'sdk-python':
      return toPythonSdk(p, vars)
    case 'sdk-typescript':
      return toTypeScriptSdk(p, vars)
    default:
      return toXml(p, vars)
  }
})

const currentFileExt = computed(() => {
  switch (activeTarget.value) {
    case 'anthropic-xml':
      return '.xml'
    case 'openai-messages':
    case 'gemini-ast':
      return '.json'
    case 'raw-markdown':
      return '.md'
    case 'sdk-python':
      return '.py'
    case 'sdk-typescript':
      return '.ts'
    default:
      return '.txt'
  }
})

const formattedOutput = computed(() => {
  const text = compiledOutput.value
  if (!text) return '<span class="text-muted italic">No active prompt sections included.</span>'

  // Syntax highlight XML tags or JSON syntax
  const escapeHtml = (str: string) =>
    str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')

  let escaped = escapeHtml(text)

  if (activeTarget.value === 'anthropic-xml') {
    escaped = escaped.replace(/(&lt;\/?[a-zA-Z0-9_-]+&gt;)/g, '<span class="text-miku font-bold">$1</span>')
  }

  // Highlight {{variables}} in cyan/acid
  escaped = escaped.replace(/(\{\{[a-zA-Z0-9_-]+\}\})/g, '<span class="text-acid font-bold bg-surface3/80 px-1 py-0.2 rounded border border-border2">$1</span>')

  return escaped
})

const copyOutput = async () => {
  if (!compiledOutput.value) return
  try {
    await navigator.clipboard.writeText(compiledOutput.value)
    copied.value = true
    setTimeout(() => {
      copied.value = false
    }, 1800)
  } catch (e) {
    console.error('Failed to copy', e)
  }
}

const saveFile = () => {
  const text = compiledOutput.value
  if (!text) return
  const blob = new Blob([text], { type: 'text/plain;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  const promptName = promptStore.currentPrompt.value?.name || 'prompt'
  const cleanName = promptName.toLowerCase().replace(/[^a-z0-9_-]+/g, '_')
  a.download = `${cleanName}${currentFileExt.value}`
  a.click()
  URL.revokeObjectURL(url)
}
</script>
