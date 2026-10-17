import type {
  Prompt,
  Section,
  PromptStoreData,
  PromptKind,
  SectionSearchResult,
  BankTerm,
  CompilerTarget,
  ModelTarget,
  SectionRole,
  ModelPricing
} from '~/types'

const STORAGE_KEY = 'promptool_v1'
const VERSION = 1
const DEFAULT_TAGS = ['system', 'instructions', 'context', 'constraints', 'few_shot', 'output_format']

export const MODEL_PRICING_TABLE: Record<ModelTarget, ModelPricing> = {
  'claude-3.7-sonnet': {
    name: 'Claude 3.7 Sonnet',
    inputCostPerMillion: 3.0,
    contextWindow: 200000,
    badgeColor: 'text-amber'
  },
  'gpt-4o': {
    name: 'GPT-4o',
    inputCostPerMillion: 2.5,
    contextWindow: 128000,
    badgeColor: 'text-green'
  },
  'gemini-2.5-flash': {
    name: 'Gemini 2.5 Flash',
    inputCostPerMillion: 0.075,
    contextWindow: 1000000,
    badgeColor: 'text-miku'
  },
  'gemini-2.5-pro': {
    name: 'Gemini 2.5 Pro',
    inputCostPerMillion: 1.25,
    contextWindow: 2000000,
    badgeColor: 'text-blue-400'
  },
  'deepseek-r1': {
    name: 'DeepSeek R1',
    inputCostPerMillion: 0.55,
    contextWindow: 64000,
    badgeColor: 'text-pink'
  }
}

export const SEED_BLOCKS: [string, string, SectionRole?][] = [
  [
    'investigate_first',
    '<investigate_before_answering>\nNever speculate about code you have not opened. If the user references a specific file, read it before answering. Investigate relevant files BEFORE making any claim about the codebase. Give grounded, hallucination-free answers.\n</investigate_before_answering>',
    'constraint'
  ],
  [
    'no_overengineering',
    "Avoid over-engineering. Only make changes that are directly requested or clearly necessary. Don't add features, refactors, docs, defensive code, or abstractions beyond the task. The right amount of complexity is the minimum needed.",
    'constraint'
  ],
  [
    'general_solution',
    "Write a high-quality, general-purpose solution using standard tools. Don't hard-code to specific test inputs; implement logic that works for all valid inputs. Tests verify correctness — they don't define the solution. If a task is infeasible or a test is wrong, say so rather than working around it.",
    'instruction'
  ],
  [
    'chain_of_thought_reasoning',
    '<thought_process>\nBefore outputting the final deliverable, outline your step-by-step reasoning inside <thinking> tags. Analyze edge cases, verify constraints, and ensure full alignment with user intent.\n</thought_process>',
    'instruction'
  ],
  [
    'json_schema_enforcement',
    '<output_format>\nRespond ONLY with a valid, parseable JSON object matching the requested schema. Do not enclose the JSON in backticks, markdown code blocks, or include introductory/explanatory text.\n</output_format>',
    'output-format'
  ],
  [
    'autonomy_safety',
    'Take local, reversible actions freely (editing files, running tests), but for actions that are hard to reverse, affect shared systems, or are destructive (deleting files/branches, dropping tables, rm -rf, git push --force, posting to PRs/issues), ask before proceeding. Never use destructive shortcuts like --no-verify.',
    'constraint'
  ],
  [
    'cleanup_temp_files',
    'If you create any temporary files, scripts, or helper files for iteration, remove them at the end of the task.',
    'constraint'
  ],
  [
    'parallel_tools',
    '<use_parallel_tool_calls>\nIf you intend to call multiple tools with no dependencies between them, make all the independent calls in parallel. If a call depends on a previous result, call them sequentially. Never use placeholders or guess missing parameters.\n</use_parallel_tool_calls>',
    'instruction'
  ],
  [
    'conservative_action',
    '<do_not_act_before_instructions>\nDo not change files unless clearly instructed. When intent is ambiguous, default to information, research, and recommendations rather than action.\n</do_not_act_before_instructions>',
    'constraint'
  ],
  [
    'few_shot_demonstration',
    '<example>\n<input>\n{{sample_input}}\n</input>\n<output>\n{{expected_output}}\n</output>\n</example>',
    'few-shot'
  ],
  [
    'self_check',
    'Before you finish, verify your answer against the success criteria / constraints above.',
    'instruction'
  ],
  [
    'no_preamble',
    'Respond directly without preamble. Do not start with phrases like "Here is..." or "Based on...".',
    'constraint'
  ]
]

export function newId(prefix: string): string {
  let s = ''
  while (s.length < 8) {
    s += Math.random().toString(36).slice(2)
  }
  return prefix + '_' + s.slice(0, 8)
}

export function slugTag(label: string | null | undefined): string {
  const s = String(label == null ? '' : label)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
  if (!s) return 'section'
  if (/^[0-9]/.test(s)) return 's_' + s
  return s
}

export function estimateTokens(text: string): number {
  if (!text || typeof text !== 'string') return 0
  // Fast token estimation: roughly 4 chars per token for English/code, plus word count adjustment
  const words = text.trim().split(/\s+/).filter(Boolean).length
  const chars = text.length
  return Math.max(1, Math.round((chars / 3.8 + words * 0.3) / 1.1))
}

export function newSection(opts?: Partial<Section>): Section {
  const o = opts || {}
  const body = o.body == null ? '' : String(o.body)
  return {
    id: o.id || newId('s'),
    tag: slugTag(o.tag || 'section'),
    body,
    include: o.include === undefined ? true : !!o.include,
    role: o.role || 'custom',
    title: o.title || '',
    tokensEstimated: estimateTokens(body)
  }
}

export function newPrompt(opts?: Partial<Prompt>): Prompt {
  const o = opts || {}
  const now = Date.now()
  return {
    id: o.id || newId('p'),
    name: o.name == null ? '' : String(o.name),
    kind: o.kind === 'template' ? 'template' : 'filled',
    created: o.created || now,
    updated: o.updated || now,
    description: o.description || '',
    modelTarget: o.modelTarget || 'claude-3.7-sonnet',
    temperature: o.temperature !== undefined ? o.temperature : 0.7,
    variables: o.variables || {},
    sections:
      o.sections ||
      DEFAULT_TAGS.map(t => {
        let role: SectionRole = 'custom'
        if (t === 'system') role = 'system'
        else if (t === 'instructions') role = 'instruction'
        else if (t === 'context') role = 'context'
        else if (t === 'constraints') role = 'constraint'
        else if (t === 'few_shot') role = 'few-shot'
        else if (t === 'output_format') role = 'output-format'
        return newSection({ tag: t, role })
      })
  }
}

export function cloneSection(section: Section): Section {
  return {
    id: newId('s'),
    tag: section.tag,
    body: section.body,
    include: true,
    role: section.role || 'custom',
    title: section.title || '',
    tokensEstimated: estimateTokens(section.body)
  }
}

// Extract {{var}} keys from text
export function extractVariables(text: string): string[] {
  if (!text || typeof text !== 'string') return []
  const matches = text.matchAll(/\{\{([a-zA-Z0-9_-]+)\}\}/g)
  const set = new Set<string>()
  for (const m of matches) {
    if (m[1]) set.add(m[1])
  }
  return Array.from(set)
}

// Interpolate {{var}} in text with map
export function interpolateText(text: string, vars: Record<string, string>): string {
  if (!text || typeof text !== 'string') return ''
  return text.replace(/\{\{([a-zA-Z0-9_-]+)\}\}/g, (match, key) => {
    return vars[key] !== undefined ? vars[key] : match
  })
}

// ── Multi-Target Compilers ───────────────────────────────────────────────────

export function toXml(prompt: Prompt | null | undefined, vars?: Record<string, string>): string {
  if (!prompt || !Array.isArray(prompt.sections)) return ''
  return prompt.sections
    .filter(s => s && s.include && String(s.body).trim() !== '')
    .map(s => {
      const body = vars ? interpolateText(s.body, vars) : s.body
      return `<${s.tag}>\n${body}\n</${s.tag}>`
    })
    .join('\n\n')
}

export function toOpenAiMessages(prompt: Prompt | null | undefined, vars?: Record<string, string>): any[] {
  if (!prompt || !Array.isArray(prompt.sections)) return []
  const validSections = prompt.sections.filter(s => s && s.include && String(s.body).trim() !== '')

  const systemSections = validSections.filter(s => s.tag === 'system' || s.role === 'system' || s.tag === 'role')
  const otherSections = validSections.filter(s => !systemSections.includes(s))

  const messages: any[] = []

  if (systemSections.length > 0) {
    const sysText = systemSections
      .map(s => (vars ? interpolateText(s.body, vars) : s.body))
      .join('\n\n')
    messages.push({ role: 'system', content: sysText })
  }

  if (otherSections.length > 0) {
    const userText = otherSections
      .map(s => {
        const body = vars ? interpolateText(s.body, vars) : s.body
        return `<${s.tag}>\n${body}\n</${s.tag}>`
      })
      .join('\n\n')
    messages.push({ role: 'user', content: userText })
  }

  return messages
}

export function toGeminiAst(prompt: Prompt | null | undefined, vars?: Record<string, string>): any {
  if (!prompt || !Array.isArray(prompt.sections)) return {}
  const validSections = prompt.sections.filter(s => s && s.include && String(s.body).trim() !== '')

  const sys = validSections.find(s => s.tag === 'system' || s.role === 'system' || s.tag === 'role')
  const systemInstruction = sys ? (vars ? interpolateText(sys.body, vars) : sys.body) : ''

  const userContent = validSections
    .filter(s => s !== sys)
    .map(s => {
      const body = vars ? interpolateText(s.body, vars) : s.body
      return `<${s.tag}>\n${body}\n</${s.tag}>`
    })
    .join('\n\n')

  return {
    model: prompt.modelTarget || 'gemini-2.5-flash',
    config: {
      temperature: prompt.temperature ?? 0.7,
      systemInstruction: systemInstruction ? { parts: [{ text: systemInstruction }] } : undefined
    },
    contents: userContent
  }
}

export function toRawMarkdown(prompt: Prompt | null | undefined, vars?: Record<string, string>): string {
  if (!prompt || !Array.isArray(prompt.sections)) return ''
  const valid = prompt.sections.filter(s => s && s.include && String(s.body).trim() !== '')
  return valid
    .map(s => {
      const body = vars ? interpolateText(s.body, vars) : s.body
      const heading = s.title || s.tag.toUpperCase()
      return `### ${heading}\n\n${body}`
    })
    .join('\n\n---\n\n')
}

export function toPythonSdk(prompt: Prompt | null | undefined, vars?: Record<string, string>): string {
  if (!prompt) return ''
  const model = prompt.modelTarget || 'claude-3.7-sonnet'

  if (model.startsWith('claude')) {
    const xml = toXml(prompt, vars)
    return `import anthropic

client = anthropic.Anthropic()

prompt_payload = """${xml.replace(/"""/g, '\\"\\"\\"')}"""

response = client.messages.create(
    model="${model}",
    max_tokens=4096,
    temperature=${prompt.temperature ?? 0.7},
    messages=[
        {"role": "user", "content": prompt_payload}
    ]
)

print(response.content[0].text)`
  }

  if (model.startsWith('gpt') || model.startsWith('deepseek')) {
    const msgs = JSON.stringify(toOpenAiMessages(prompt, vars), null, 4)
    return `from openai import OpenAI

client = OpenAI()

response = client.chat.completions.create(
    model="${model}",
    temperature=${prompt.temperature ?? 0.7},
    messages=${msgs}
)

print(response.choices[0].message.content)`
  }

  // Gemini Python
  const gemini = toGeminiAst(prompt, vars)
  return `from google import genai
from google.genai import types

client = genai.Client()

response = client.models.generate_content(
    model="${model}",
    contents="""${gemini.contents.replace(/"""/g, '\\"\\"\\"')}""",
    config=types.GenerateContentConfig(
        system_instruction="""${gemini.config?.systemInstruction?.parts[0]?.text?.replace(/"""/g, '\\"\\"\\"') || ''}""",
        temperature=${prompt.temperature ?? 0.7},
    )
)

print(response.text)`
}

export function toTypeScriptSdk(prompt: Prompt | null | undefined, vars?: Record<string, string>): string {
  if (!prompt) return ''
  const model = prompt.modelTarget || 'claude-3.7-sonnet'

  if (model.startsWith('claude')) {
    const xml = toXml(prompt, vars)
    return `import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic();

const prompt = \`${xml.replace(/`/g, '\\`').replace(/\${/g, '\\${')}\`;

const message = await anthropic.messages.create({
  model: '${model}',
  max_tokens: 4096,
  temperature: ${prompt.temperature ?? 0.7},
  messages: [{ role: 'user', content: prompt }],
});

console.log(message.content[0]);`
  }

  if (model.startsWith('gpt') || model.startsWith('deepseek')) {
    const msgs = JSON.stringify(toOpenAiMessages(prompt, vars), null, 2)
    return `import OpenAI from 'openai';

const openai = new OpenAI();

const response = await openai.chat.completions.create({
  model: '${model}',
  temperature: ${prompt.temperature ?? 0.7},
  messages: ${msgs}
});

console.log(response.choices[0].message.content);`
  }

  // Gemini TS SDK
  const gemini = toGeminiAst(prompt, vars)
  return `import { GoogleGenAI } from '@google/genai';

const ai = new GoogleGenAI();

const response = await ai.models.generateContent({
  model: '${model}',
  contents: \`${gemini.contents.replace(/`/g, '\\`').replace(/\${/g, '\\${')}\`,
  config: {
    systemInstruction: \`${gemini.config?.systemInstruction?.parts[0]?.text?.replace(/`/g, '\\`').replace(/\${/g, '\\${') || ''}\`,
    temperature: ${prompt.temperature ?? 0.7}
  }
});

console.log(response.text);`
}

// ── Autocomplete Harvesting & Candidate Engine ──────────────────────────────
const WORD_REGEX = /[A-Za-z][A-Za-z0-9_-]{2,}/g
const PHRASE_REGEX = /\b[A-Z][a-z0-9]*(?:\s+[A-Z][a-z0-9]*)+\b/g

export function harvest(text: string): string[] {
  if (typeof text !== 'string' || !text) return []
  const out: string[] = []
  const seen: Record<string, boolean> = Object.create(null)

  const collect = (re: RegExp) => {
    re.lastIndex = 0
    let m: RegExpExecArray | null
    while ((m = re.exec(text)) !== null) {
      const v = m[0]
      if (!seen[v]) {
        seen[v] = true
        out.push(v)
      }
    }
  }

  collect(WORD_REGEX)
  collect(PHRASE_REGEX)
  return out
}

export function getCandidates(prefix: string, docTerms: string[], bankTerms: string[]): string[] {
  if (!prefix) return []
  const lower = prefix.toLowerCase()
  const seen: Record<string, boolean> = Object.create(null)
  const ranked: { term: string; rank: number; len: number; i: number }[] = []

  // Bank (rank 0) ranks above doc (rank 1)
  ;[bankTerms || [], docTerms || []].forEach((source, rank) => {
    ;(source || []).forEach((term, i) => {
      if (typeof term !== 'string') return
      if (term === prefix) return
      if (term.toLowerCase().indexOf(lower) !== 0) return
      if (seen[term]) return
      seen[term] = true
      ranked.push({ term, rank, len: term.length, i })
    })
  })

  ranked.sort((a, b) => a.rank - b.rank || a.len - b.len || a.i - b.i)
  return ranked.map(r => r.term)
}

export function buildSeedStore(): PromptStoreData {
  const now = Date.now()
  const blocksPrompt: Prompt = {
    id: newId('p'),
    name: 'Best-Practice Engineering Blocks',
    kind: 'template',
    created: now,
    updated: now,
    description: 'Pre-curated guardrails, chain-of-thought instructions, and schema validators.',
    modelTarget: 'claude-3.7-sonnet',
    temperature: 0.5,
    variables: { sample_input: 'User payload query', expected_output: 'Structured answer' },
    sections: SEED_BLOCKS.map(b => newSection({ tag: b[0], body: b[1], role: b[2] || 'custom', include: false }))
  }

  const defaultStarter: Prompt = {
    id: newId('p'),
    name: 'Full-Stack Software Architect Prompt',
    kind: 'filled',
    created: now + 1,
    updated: now + 1,
    description: 'Production-ready system instruction with strict reasoning constraints and dynamic variables.',
    modelTarget: 'claude-3.7-sonnet',
    temperature: 0.4,
    variables: {
      framework: 'Nuxt 3 & Tailwind CSS',
      target_task: 'Refactor state store and implement multi-target AST serializer',
      code_path: '/composables/usePromptStore.ts'
    },
    sections: [
      newSection({
        tag: 'system',
        role: 'system',
        body: 'You are a Principal Software Architect and Lead Prompt Engineer specializing in {{framework}}.'
      }),
      newSection({
        tag: 'context',
        role: 'context',
        body: 'The active task is: {{target_task}}\nPrimary codebase component: {{code_path}}\nDesign system follows high-contrast cyber-editorial aesthetics with strict typography pairing.'
      }),
      newSection({
        tag: 'instructions',
        role: 'instruction',
        body: '<step_by_step_execution>\n1. Inspect all dependencies and AST schemas before applying modifications.\n2. Maintain zero-latency reactive caching with local storage synchronization.\n3. Ensure all unit tests pass with zero regression.\n</step_by_step_execution>'
      }),
      newSection({
        tag: 'constraints',
        role: 'constraint',
        body: 'Avoid over-engineering. Deliver concise, production-ready, strictly typed TypeScript code without unsolicited preamble or marketing fluff.'
      }),
      newSection({
        tag: 'output_format',
        role: 'output-format',
        body: 'Return complete code files or surgical drop-in patches with clean line annotations.'
      })
    ]
  }

  return {
    version: VERSION,
    prompts: [defaultStarter, blocksPrompt],
    bank: [
      { id: newId('t'), text: 'Chain of Thought', category: 'reasoning', created: now },
      { id: newId('t'), text: 'Zero-Shot CoT', category: 'reasoning', created: now },
      { id: newId('t'), text: 'Few-Shot Exemplars', category: 'reasoning', created: now },
      { id: newId('t'), text: 'JSON Schema Validation', category: 'format', created: now },
      { id: newId('t'), text: 'TypeScript', category: 'custom', created: now },
      { id: newId('t'), text: 'Anthropic Claude', category: 'role', created: now },
      { id: newId('t'), text: 'OpenAI GPT-4o', category: 'role', created: now },
      { id: newId('t'), text: 'Gemini 2.5', category: 'role', created: now },
      { id: newId('t'), text: 'Negative Guardrails', category: 'guardrail', created: now },
      { id: newId('t'), text: 'Anti-Hallucination Grounding', category: 'guardrail', created: now },
      { id: newId('t'), text: 'Preamble Elimination', category: 'guardrail', created: now }
    ],
    activeVariables: {
      framework: 'Nuxt 3 & Tailwind CSS',
      target_task: 'Refactor state store and implement multi-target AST serializer',
      code_path: '/composables/usePromptStore.ts',
      sample_input: 'User payload query',
      expected_output: 'Structured answer'
    }
  }
}

export function usePromptStore() {
  const store = useState<PromptStoreData>('promptool_store', () => buildSeedStore())
  const currentPromptId = useState<string | null>('promptool_current_id', () => null)
  const isInitialized = useState<boolean>('promptool_initialized', () => false)

  // Compiler state
  const activeCompilerTarget = useState<CompilerTarget>('promptool_compiler_target', () => 'anthropic-xml')
  const interpolateMode = useState<boolean>('promptool_interpolate_mode', () => false)
  const showVariableMatrix = useState<boolean>('promptool_var_matrix_open', () => false)

  // Search & Filters
  const promptQuery = useState<string>('promptool_prompt_query', () => '')
  const promptKindFilter = useState<PromptKind | ''>('promptool_kind_filter', () => '')
  const sectionQuery = useState<string>('promptool_section_query', () => '')
  const sectionTagFilter = useState<string>('promptool_section_tag_filter', () => '')

  // Term bank modal
  const showBankModal = useState<boolean>('promptool_bank_modal', () => false)

  // Init store from localStorage on client
  const initStore = () => {
    if (process.server || isInitialized.value) return
    isInitialized.value = true

    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) {
        const parsed = JSON.parse(raw)
        if (parsed && parsed.version === VERSION && Array.isArray(parsed.prompts)) {
          store.value = {
            version: VERSION,
            prompts: parsed.prompts,
            bank: Array.isArray(parsed.bank) ? parsed.bank : [],
            activeVariables: parsed.activeVariables || {}
          }
        } else {
          store.value = buildSeedStore()
          saveToStorage()
        }
      } else {
        store.value = buildSeedStore()
        saveToStorage()
      }
    } catch {
      store.value = buildSeedStore()
    }

    if (store.value.prompts.length > 0 && !currentPromptId.value) {
      currentPromptId.value = store.value.prompts[0].id
    }
  }

  const saveToStorage = () => {
    if (process.server) return
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(store.value))
    } catch (e) {
      console.warn('Failed to save to localStorage', e)
    }
  }

  const currentPrompt = computed(() => {
    return store.value.prompts.find(p => p.id === currentPromptId.value) || null
  })

  const bankTermsList = computed<string[]>(() => {
    return store.value.bank.map(b => (typeof b === 'string' ? b : b.text)).filter(Boolean)
  })

  // Harvested terms from all prompts
  const docTermsList = computed<string[]>(() => {
    const allText = store.value.prompts
      .flatMap(p => [p.name, ...p.sections.map(s => `${s.tag} ${s.body}`)])
      .join('\n')
    return harvest(allText)
  })

  // Detected variables across the current active prompt
  const currentPromptVariables = computed<string[]>(() => {
    if (!currentPrompt.value) return []
    const allText = currentPrompt.value.sections.map(s => s.body).join('\n')
    return extractVariables(allText)
  })

  // Computed Token Count for current prompt
  const totalTokens = computed<number>(() => {
    if (!currentPrompt.value) return 0
    return currentPrompt.value.sections
      .filter(s => s.include)
      .reduce((acc, s) => acc + estimateTokens(s.body), 0)
  })

  // Estimated Cost calculation
  const estimatedCost = computed<{ perRunUsd: number; per1kRunsUsd: number; pricing: ModelPricing }>(() => {
    const target = currentPrompt.value?.modelTarget || 'claude-3.7-sonnet'
    const pricing = MODEL_PRICING_TABLE[target] || MODEL_PRICING_TABLE['claude-3.7-sonnet']
    const tokens = totalTokens.value
    const perRun = (tokens / 1000000) * pricing.inputCostPerMillion
    return {
      perRunUsd: perRun,
      per1kRunsUsd: perRun * 1000,
      pricing
    }
  })

  // Prompts search filter
  const filteredPrompts = computed(() => {
    const q = promptQuery.value.trim().toLowerCase()
    const kind = promptKindFilter.value
    return [...store.value.prompts]
      .sort((a, b) => (b.updated || 0) - (a.updated || 0))
      .filter(p => {
        if (kind && p.kind !== kind) return false
        if (!q) return true
        if (p.name.toLowerCase().includes(q)) return true
        return p.sections.some(s => s.body.toLowerCase().includes(q) || s.tag.toLowerCase().includes(q))
      })
  })

  // Sections search filter
  const filteredSections = computed<SectionSearchResult[]>(() => {
    const q = sectionQuery.value.trim().toLowerCase()
    const tag = sectionTagFilter.value
    const results: SectionSearchResult[] = []

    const sortedPrompts = [...store.value.prompts].sort((a, b) => (b.updated || 0) - (a.updated || 0))
    for (const p of sortedPrompts) {
      for (const s of p.sections) {
        if (tag && s.tag !== tag) continue
        if (q && !s.body.toLowerCase().includes(q) && !s.tag.toLowerCase().includes(q)) continue
        results.push({
          promptId: p.id,
          promptName: p.name || 'untitled',
          section: s
        })
      }
    }
    return results
  })

  // Distinct tags
  const distinctTags = computed(() => {
    const counts: Record<string, number> = Object.create(null)
    const order: string[] = []
    store.value.prompts.forEach(p => {
      p.sections.forEach(s => {
        if (!s.tag) return
        if (counts[s.tag] === undefined) {
          counts[s.tag] = 0
          order.push(s.tag)
        }
        counts[s.tag] += 1
      })
    })
    return [...order].sort((a, b) => counts[b] - counts[a] || order.indexOf(a) - order.indexOf(b))
  })

  // Actions
  const createPrompt = (kind: PromptKind = 'filled') => {
    const prompt = newPrompt({ kind, name: kind === 'template' ? 'New Prompt Template' : 'Untitled Prompt' })
    store.value.prompts.unshift(prompt)
    currentPromptId.value = prompt.id
    saveToStorage()
    return prompt
  }

  const selectPrompt = (id: string) => {
    currentPromptId.value = id
  }

  const deletePrompt = (id: string) => {
    const index = store.value.prompts.findIndex(p => p.id === id)
    if (index >= 0) {
      store.value.prompts.splice(index, 1)
      if (currentPromptId.value === id) {
        currentPromptId.value = store.value.prompts[0]?.id || null
      }
      saveToStorage()
    }
  }

  const duplicatePrompt = (promptId: string) => {
    const orig = store.value.prompts.find(p => p.id === promptId)
    if (!orig) return
    const now = Date.now()
    const copy: Prompt = {
      ...orig,
      id: newId('p'),
      name: `${orig.name} (Copy)`,
      created: now,
      updated: now,
      sections: orig.sections.map(s => cloneSection(s))
    }
    store.value.prompts.unshift(copy)
    currentPromptId.value = copy.id
    saveToStorage()
  }

  const updatePromptName = (name: string) => {
    if (!currentPrompt.value) return
    currentPrompt.value.name = name
    currentPrompt.value.updated = Date.now()
    saveToStorage()
  }

  const updatePromptModel = (model: ModelTarget) => {
    if (!currentPrompt.value) return
    currentPrompt.value.modelTarget = model
    currentPrompt.value.updated = Date.now()
    saveToStorage()
  }

  const updatePromptTemperature = (temp: number) => {
    if (!currentPrompt.value) return
    currentPrompt.value.temperature = temp
    currentPrompt.value.updated = Date.now()
    saveToStorage()
  }

  const setPromptVariable = (key: string, value: string) => {
    if (!store.value.activeVariables) store.value.activeVariables = {}
    store.value.activeVariables[key] = value
    if (currentPrompt.value) {
      if (!currentPrompt.value.variables) currentPrompt.value.variables = {}
      currentPrompt.value.variables[key] = value
      currentPrompt.value.updated = Date.now()
    }
    saveToStorage()
  }

  const addSectionToCurrent = (tag = 'section', body = '', role: SectionRole = 'custom') => {
    if (!currentPrompt.value) return
    const sec = newSection({ tag, body, role })
    currentPrompt.value.sections.push(sec)
    currentPrompt.value.updated = Date.now()
    saveToStorage()
  }

  const removeSectionFromCurrent = (sectionId: string) => {
    if (!currentPrompt.value) return
    currentPrompt.value.sections = currentPrompt.value.sections.filter(s => s.id !== sectionId)
    currentPrompt.value.updated = Date.now()
    saveToStorage()
  }

  const duplicateSectionInCurrent = (sectionId: string) => {
    if (!currentPrompt.value) return
    const idx = currentPrompt.value.sections.findIndex(s => s.id === sectionId)
    if (idx < 0) return
    const sec = currentPrompt.value.sections[idx]
    const cloned = cloneSection(sec)
    currentPrompt.value.sections.splice(idx + 1, 0, cloned)
    currentPrompt.value.updated = Date.now()
    saveToStorage()
  }

  const updateSectionInCurrent = (sectionId: string, patch: Partial<Section>) => {
    if (!currentPrompt.value) return
    const sec = currentPrompt.value.sections.find(s => s.id === sectionId)
    if (sec) {
      if (patch.tag !== undefined) sec.tag = slugTag(patch.tag)
      if (patch.body !== undefined) {
        sec.body = String(patch.body)
        sec.tokensEstimated = estimateTokens(sec.body)
      }
      if (patch.include !== undefined) sec.include = !!patch.include
      if (patch.role !== undefined) sec.role = patch.role
      if (patch.title !== undefined) sec.title = patch.title
      currentPrompt.value.updated = Date.now()
      saveToStorage()
    }
  }

  const moveSectionInCurrent = (fromIndex: number, toIndex: number) => {
    if (!currentPrompt.value) return
    const list = [...currentPrompt.value.sections]
    if (fromIndex < 0 || fromIndex >= list.length || toIndex < 0 || toIndex >= list.length) return
    const [moved] = list.splice(fromIndex, 1)
    list.splice(toIndex, 0, moved)
    currentPrompt.value.sections = list
    currentPrompt.value.updated = Date.now()
    saveToStorage()
  }

  const insertLibrarySection = (section: Section) => {
    if (!currentPrompt.value) {
      createPrompt('filled')
    }
    if (currentPrompt.value) {
      currentPrompt.value.sections.push(cloneSection(section))
      currentPrompt.value.updated = Date.now()
      saveToStorage()
    }
  }

  const saveBankTerms = (terms: (string | BankTerm)[]) => {
    store.value.bank = terms
      .map(t => {
        if (typeof t === 'string') {
          return { id: newId('t'), text: t.trim(), category: 'custom' as const, created: Date.now() }
        }
        return t
      })
      .filter(t => t.text)
    saveToStorage()
  }

  const exportStoreJson = () => {
    return JSON.stringify(store.value, null, 2)
  }

  const importStoreJson = (jsonString: string): { ok: boolean; error?: string } => {
    try {
      const parsed = JSON.parse(jsonString)
      if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
        return { ok: false, error: 'Not a valid JSON object' }
      }
      if (!Array.isArray(parsed.prompts)) {
        return { ok: false, error: 'Missing prompts array' }
      }
      if (!Array.isArray(parsed.bank)) {
        return { ok: false, error: 'Missing bank array' }
      }
      store.value = {
        version: VERSION,
        prompts: parsed.prompts,
        bank: parsed.bank,
        activeVariables: parsed.activeVariables || {}
      }
      if (store.value.prompts.length > 0) {
        currentPromptId.value = store.value.prompts[0].id
      }
      saveToStorage()
      return { ok: true }
    } catch {
      return { ok: false, error: 'Malformed JSON payload' }
    }
  }

  return {
    store,
    currentPromptId,
    currentPrompt,
    isInitialized,
    initStore,
    saveToStorage,
    promptQuery,
    promptKindFilter,
    sectionQuery,
    sectionTagFilter,
    showBankModal,
    activeCompilerTarget,
    interpolateMode,
    showVariableMatrix,
    bankTermsList,
    docTermsList,
    currentPromptVariables,
    totalTokens,
    estimatedCost,
    filteredPrompts,
    filteredSections,
    distinctTags,
    createPrompt,
    selectPrompt,
    deletePrompt,
    duplicatePrompt,
    updatePromptName,
    updatePromptModel,
    updatePromptTemperature,
    setPromptVariable,
    addSectionToCurrent,
    removeSectionFromCurrent,
    duplicateSectionInCurrent,
    updateSectionInCurrent,
    moveSectionInCurrent,
    insertLibrarySection,
    saveBankTerms,
    exportStoreJson,
    importStoreJson,
    estimateTokens
  }
}

