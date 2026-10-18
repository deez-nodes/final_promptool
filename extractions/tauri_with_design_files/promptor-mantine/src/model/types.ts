export type Mode = 'prompt' | 'task'
export type Status = 'ready' | 'in_progress' | 'done' | 'blocked' | 'failed'
export type OutputFormat = 'xml' | 'md'
export type Grader = 'llm' | 'json' | 'code'

export interface FieldDef {
  key: string
  label: string
  hint: string
  placeholder: string
  hasFiles?: boolean
  prefill?: string
}

export interface Template {
  label: string
  isTask?: boolean
  evalGrader?: Grader
  /** Blocks switched on when the template is applied. */
  blocks?: string[]
  /** Blocks the template offers as toggles. */
  blockOptions?: string[]
  fields: FieldDef[]
}

export interface Item {
  id: string
  name: string
  template: string
  mode: Mode
  status: Status
  created: number
  updated?: number
  fields: Record<string, string>
  files: Record<string, string[]>
  blocks: string[]
}

export type Items = Record<string, Item>

export interface Todo {
  id: string
  text: string
  done: boolean
}
