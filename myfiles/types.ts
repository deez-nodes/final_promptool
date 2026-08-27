/**
 * prompTOR / PrompTool IDE Type Definitions & Domain Schemas
 */

export type PromptKind = 'filled' | 'template'

export type SectionRole =
  | 'system'
  | 'instruction'
  | 'context'
  | 'constraint'
  | 'few-shot'
  | 'output-format'
  | 'custom'

export type ModelTarget =
  | 'claude-3.7-sonnet'
  | 'gpt-4o'
  | 'gemini-2.5-flash'
  | 'gemini-2.5-pro'
  | 'deepseek-r1'

export interface PromptVariable {
  id?: string
  key: string
  label?: string
  value?: string
  defaultValue?: string
  type?: 'string' | 'number' | 'enum' | 'json'
  options?: string[]
}

export interface Section {
  id: string
  tag: string
  body: string
  include: boolean
  role?: SectionRole
  title?: string
  tokensEstimated?: number
}

export interface Prompt {
  id: string
  name: string
  kind: PromptKind
  created: number
  updated: number
  description?: string
  modelTarget?: ModelTarget
  temperature?: number
  variables?: Record<string, string>
  sections: Section[]
}

export interface BankTerm {
  id: string
  text: string
  category?: 'role' | 'reasoning' | 'guardrail' | 'format' | 'custom'
  snippet?: string
  created: number
}

export interface PromptStoreData {
  version: number
  prompts: Prompt[]
  bank: (string | BankTerm)[]
  activeVariables?: Record<string, string>
}

export type CompilerTarget =
  | 'anthropic-xml'
  | 'openai-messages'
  | 'gemini-ast'
  | 'raw-markdown'
  | 'sdk-python'
  | 'sdk-typescript'

export interface ModelPricing {
  name: string
  inputCostPerMillion: number
  contextWindow: number
  badgeColor: string
}

