import type { Mode, Status, Template } from './types'

export const TEMPLATES: Record<string, Template> = {
  promptology: {
    label: 'Promptology',
    fields: [
      { key: 'role', label: 'Role / Context', hint: 'who you are + constraints', placeholder: 'Active day trader. MES/ES futures...' },
      { key: 'goal', label: 'Goal', hint: 'session-level objective', placeholder: 'Build a gap scanner...' },
      { key: 'theory', label: 'Background / Theory', hint: 'what you believe is true', placeholder: 'High volume gaps over $2 tend to hold...' },
      { key: 'state', label: 'Current State', hint: 'code / data / prior output', placeholder: 'Paste existing code, output, or context...' },
      { key: 'task', label: 'Task', hint: 'exact imperative ask', placeholder: 'Write a Python scanner that...' },
      { key: 'output', label: 'Output Format', hint: 'how you want the response', placeholder: 'Code only. Inline comments...' },
    ],
  },
  general: {
    label: 'General',
    fields: [
      { key: 'role', label: 'Role / Persona', hint: 'who the AI acts as', placeholder: 'Senior Architect...' },
      { key: 'context', label: 'Context', hint: 'background information', placeholder: 'We are building a...' },
      { key: 'task', label: 'Specific Task', hint: 'the active imperative ask', placeholder: 'Write a summary...' },
      { key: 'output', label: 'Output Format', hint: 'how the response should look', placeholder: 'Markdown list...' },
    ],
  },
  dev: {
    label: 'Dev / Code',
    fields: [
      { key: 'env', label: 'Tech Stack', hint: 'tools, versions, platforms', placeholder: 'Python 3.12, FastAPI, Nuxt 4...' },
      { key: 'files', label: 'Reference Files', hint: 'files to read', hasFiles: true, placeholder: '' },
      { key: 'state', label: 'Reference Code', hint: 'raw code', placeholder: 'Paste existing code here...' },
      { key: 'task', label: 'Specific Task', hint: 'the active imperative ask', placeholder: 'Refactor this function for...' },
      { key: 'rules', label: 'Constraints', hint: 'what NOT to do', placeholder: 'Keep architecture minimalist...' },
    ],
  },
  claude_code: {
    label: 'Claude Code Task',
    isTask: true,
    fields: [
      { key: 'task_id', label: 'Task ID', hint: 'e.g. S1-03', placeholder: 'S1-03' },
      { key: 'objective', label: 'Objective', hint: 'one sentence goal', placeholder: 'Wire useTradeLog to GET /trades' },
      { key: 'files', label: 'Files to Change', hint: 'exact paths only', hasFiles: true, placeholder: '' },
      { key: 'depends', label: 'Depends On', hint: 'task IDs this needs', placeholder: 'S1-01, S1-02' },
      { key: 'scope', label: 'Scope / Rules', hint: 'what NOT to touch', placeholder: 'Do not touch anything outside listed files.' },
      { key: 'notes', label: 'Implementation Notes', hint: 'context for claude', placeholder: 'useTradeLog exposes: trades ref...' },
    ],
  },
  // Anthropic best-practice templates
  pe_general: {
    label: 'PE — General Task',
    evalGrader: 'llm',
    blocks: [],
    blockOptions: ['self-check', 'no-preamble', 'avoid-markdown'],
    fields: [
      { key: 'role', label: 'Role', hint: 'system: who Claude is (D1)', placeholder: 'a senior technical writer...' },
      { key: 'task', label: 'Task', hint: 'specific ask; request "above and beyond" (A1)', placeholder: 'Write X. Go beyond the basics.' },
      { key: 'context', label: 'Context / Why', hint: 'motivation sharpens output (A2)', placeholder: 'This will be read aloud, so...' },
      { key: 'examples', label: 'Examples', hint: '3–5, wrapped in <example> (B1)', placeholder: '<example>\ninput: ...\noutput: ...\n</example>' },
      { key: 'output', label: 'Output Format', hint: 'say what TO do (F1)', placeholder: 'Smoothly flowing prose.', prefill: 'Respond directly, without preamble.' },
    ],
  },
  pe_extract: {
    label: 'PE — Structured Extract',
    evalGrader: 'json',
    blocks: ['no-preamble'],
    blockOptions: ['no-preamble', 'self-check'],
    fields: [
      { key: 'input', label: 'Input', hint: 'text to process, in <input> (C1)', placeholder: '{{the text}}' },
      { key: 'fields', label: 'Fields to Extract', hint: 'keys + types', placeholder: 'name (string), amount (number)' },
      { key: 'labels', label: 'Labels (if class.)', hint: 'enum of valid labels', placeholder: 'positive | negative | neutral' },
      { key: 'output', label: 'Output Format', hint: 'Structured Outputs, not prefill (F5)', placeholder: '', prefill: 'Return strict JSON matching the schema. Choose exactly one label. No prose.' },
    ],
  },
  pe_longdoc: {
    label: 'PE — Long Document',
    evalGrader: 'llm',
    blocks: [],
    blockOptions: ['self-check'],
    fields: [
      { key: 'documents', label: 'Documents', hint: 'data at top, <document> tags (E1)', hasFiles: true, placeholder: '' },
      { key: 'paste', label: 'Or Paste Docs', hint: 'inline document text', placeholder: '<document index="1">...</document>' },
      { key: 'question', label: 'Question', hint: 'the actual task (asked last)', placeholder: 'Identify strategic advantages...' },
      { key: 'instructions', label: 'Instructions', hint: 'quote-ground first (E3)', placeholder: '', prefill: 'First find quotes relevant to the question in <quotes> tags. Then answer using only those quotes in <answer> tags.' },
    ],
  },
  pe_agentic: {
    label: 'PE — Agentic Coding',
    evalGrader: 'code',
    blocks: ['investigate-first', 'no-overengineering', 'general-solution', 'cleanup-temp-files'],
    blockOptions: ['investigate-first', 'no-overengineering', 'general-solution', 'cleanup-temp-files', 'autonomy-safety', 'conservative-action', 'parallel-tools', 'self-check'],
    fields: [
      { key: 'env', label: 'Environment', hint: 'stack / harness', placeholder: 'Claude Code, Python 3.12' },
      { key: 'files', label: 'Files to Read', hint: 'exact paths (read before edit)', hasFiles: true, placeholder: '' },
      { key: 'task', label: 'Task', hint: 'EXPLICIT action ask, not "suggest" (G1)', placeholder: 'Change this function to improve perf.' },
      { key: 'rules', label: 'Scope / Rules', hint: 'kept minimal by default (I2)', placeholder: '', prefill: "Only change what is requested or clearly necessary. Don't touch unrelated code." },
    ],
  },
  pe_research: {
    label: 'PE — Research',
    evalGrader: 'llm',
    blocks: [],
    blockOptions: ['self-check', 'no-preamble'],
    fields: [
      { key: 'question', label: 'Research Question', hint: 'what to find out', placeholder: 'What is the current state of X?' },
      { key: 'success', label: 'Success Criteria', hint: 'what a complete answer covers (I8)', placeholder: 'A complete answer names..., cites...' },
      { key: 'approach', label: 'Approach', hint: 'verify + hypotheses (I8)', placeholder: '', prefill: 'Verify key facts across multiple independent sources. Track competing hypotheses and confidence; self-critique before concluding.' },
    ],
  },
  pe_role: {
    label: 'PE — Role Assistant',
    evalGrader: 'llm',
    blocks: [],
    blockOptions: ['avoid-markdown', 'no-preamble', 'self-check'],
    fields: [
      { key: 'role', label: 'Role + Specialty', hint: 'system prompt (D1)', placeholder: 'a patient customer-support agent...' },
      { key: 'tone', label: 'Tone & Style', hint: 'how it should sound', placeholder: 'Empathetic, concise, never defensive.' },
      { key: 'behavior', label: 'Behavior Rules', hint: 'do/avoid, escalation, limits', placeholder: 'Confirm order number before acting.' },
      { key: 'identity', label: 'Identity (opt.)', hint: 'only if it must self-identify (D2)', placeholder: 'The assistant is Claude, created by Anthropic.' },
    ],
  },
  subagent_worker: {
    label: 'Subagent Work Packet (SWP)',
    isTask: true,
    evalGrader: 'code',
    blocks: ['isolated-context', 'no-speculative-edits', 'diff-only', 'verifiable-exit', 'no-overengineering'],
    blockOptions: ['isolated-context', 'no-speculative-edits', 'diff-only', 'verifiable-exit', 'no-overengineering', 'cleanup-temp-files', 'self-check', 'zero-db-bloat'],
    fields: [
      { key: 'task_id', label: 'Packet ID', hint: 'e.g. SWP-01-inv or SWP-02-code', placeholder: 'SWP-02-code' },
      { key: 'role', label: 'Subagent Role & Tier', hint: 'investigator | coder | tester (fast/worker)', placeholder: 'coder (worker tier)' },
      { key: 'objective', label: 'Single Imperative Ask', hint: 'exact action to execute', placeholder: 'Refactor serializeDoc to include <subagent_packet> tags.' },
      { key: 'files', label: 'Write Boundary (Target Files)', hint: 'only files allowed to change', hasFiles: true, placeholder: '' },
      { key: 'read_files', label: 'Read-Only Files', hint: 'reference only, zero writes', hasFiles: true, placeholder: '' },
      { key: 'rules', label: 'Negative Constraints', hint: 'forbidden actions', placeholder: 'Do not touch files outside target. Do not add DB/external dependencies.' },
      { key: 'output', label: 'Output Contract', hint: 'expected format', placeholder: 'Unified diff against target files only. No conversation.' },
      { key: 'verify', label: 'Verification Command', hint: 'deterministic pass/fail check', placeholder: 'npm run build' },
    ],
  },
  pe_decompose: {
    label: 'PE — Task Decomposer',
    evalGrader: 'llm',
    blocks: ['investigate-first', 'no-overengineering'],
    blockOptions: ['investigate-first', 'no-overengineering', 'self-check'],
    fields: [
      { key: 'goal', label: 'High-Level Goal', hint: 'large task to split', placeholder: 'Implement complete subagent context units across models.' },
      { key: 'scope', label: 'Scope & Target Files', hint: 'boundary boundaries', hasFiles: true, placeholder: '' },
      { key: 'decomposition', label: 'Decomposition Rules', hint: 'how to slice for worker models', placeholder: 'Slice into 3 SWPs: 1) Investigation (read-only), 2) Minimal edit (diff-only), 3) Verification check. Keep each packet under 800 tokens.' },
      { key: 'output', label: 'Output Format', hint: 'subagent packet list', placeholder: 'Array of <subagent_packet> envelopes with strict read/write boundaries.' },
    ],
  },
}

/** Canned best-practice rules, keyed by the name shown on the toggle. */
export const BLOCKS: Record<string, string> = {
  'isolated-context': '<isolated_context_boundary>\nOperate strictly within the files and snippets provided in this packet. Do not explore outside designated read_files. Keep tokens minimal and focused.\n</isolated_context_boundary>',
  'no-speculative-edits': 'Do not make speculative edits, stylistic rewrites, or collateral changes to non-target files. Confine all edits to write_files.',
  'diff-only': 'Return changes as a standard unified diff format. Do not return conversational chatter or unsolicited explanations.',
  'verifiable-exit': 'Before completing the task, execute the provided verification command and confirm 0 errors.',
  'zero-db-bloat': 'Do not introduce database connections, external state stores, or server overhead in design/prototyping phases.',
  'investigate-first': '<investigate_before_answering>\nNever speculate about code you have not opened. If the user references a specific file, read it before answering. Investigate relevant files BEFORE making any claim about the codebase. Give grounded, hallucination-free answers.\n</investigate_before_answering>',
  'no-overengineering': "Avoid over-engineering. Only make changes that are directly requested or clearly necessary. Don't add features, refactors, docs, defensive code, or abstractions beyond the task. The right amount of complexity is the minimum needed.",
  'autonomy-safety': 'Take local, reversible actions freely (editing files, running tests), but for actions that are hard to reverse, affect shared systems, or are destructive (deleting files/branches, dropping tables, rm -rf, git push --force, posting to PRs/issues), ask before proceeding. Never use destructive shortcuts like --no-verify.',
  'cleanup-temp-files': 'If you create any temporary files, scripts, or helper files for iteration, remove them at the end of the task.',
  'parallel-tools': '<use_parallel_tool_calls>\nIf you intend to call multiple tools with no dependencies between them, make all the independent calls in parallel. If a call depends on a previous result, call them sequentially. Never use placeholders or guess missing parameters.\n</use_parallel_tool_calls>',
  'conservative-action': '<do_not_act_before_instructions>\nDo not change files unless clearly instructed. When intent is ambiguous, default to information, research, and recommendations rather than action.\n</do_not_act_before_instructions>',
  'self-check': 'Before you finish, verify your answer against the success criteria / constraints above.',
  'avoid-markdown': '<avoid_excessive_markdown>\nWrite in clear flowing prose using complete paragraphs. Reserve markdown for inline code, code blocks, and simple headings. Avoid bullet/numbered lists unless presenting truly discrete items or asked for a list.\n</avoid_excessive_markdown>',
  'no-preamble': 'Respond directly without preamble. Do not start with phrases like "Here is..." or "Based on...".',
}

const option = (value: string) => ({ value, label: TEMPLATES[value].label })

export const TEMPLATE_OPTIONS = [
  { group: 'Prompt Templates', items: ['promptology', 'general', 'dev'].map(option) },
  { group: 'Best-Practice (Anthropic)', items: ['pe_general', 'pe_extract', 'pe_longdoc', 'pe_agentic', 'pe_research', 'pe_role'].map(option) },
  { group: 'Subagent Packets', items: ['subagent_worker', 'pe_decompose'].map(option) },
  { group: 'Tasks', items: ['claude_code'].map(option) },
]

export const STATUS_OPTIONS: { value: Status; label: string }[] = [
  { value: 'ready', label: '● Ready' },
  { value: 'in_progress', label: '◎ In Progress' },
  { value: 'done', label: '✓ Done' },
  { value: 'blocked', label: '✗ Blocked' },
  { value: 'failed', label: '! Failed' },
]

export const DEFAULT_TEMPLATE: Record<Mode, string> = { prompt: 'pe_general', task: 'claude_code' }
