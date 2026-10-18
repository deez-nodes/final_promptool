import { templateOf } from './items'
import { BLOCKS } from './templates'
import type { Item, OutputFormat } from './types'

export const slug = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '')

/** Fields carried by the task header instead of their own section. */
const HEADER_FIELDS = ['task_id', 'depends']
/** Fields fenced as code in Markdown output. */
const CODE_FIELDS = ['state', 'error']

export function buildOutput(item: Item, fmt: OutputFormat): string {
  const tpl = templateOf(item)
  const xml = fmt === 'xml'
  const lines: string[] = []

  const section = (label: string, body: string, code = false) => {
    if (xml) {
      const tag = slug(label)
      lines.push(`<${tag}>`, body, `</${tag}>`)
    } else {
      lines.push(`# ${label}`, ...(code ? ['```', body, '```'] : [body]))
    }
    lines.push('')
  }

  if (tpl.isTask) {
    const id = item.fields.task_id?.trim() || '??'
    const name = item.name.trim() || 'Untitled Task'
    const status = item.status.toUpperCase()
    const depends = item.fields.depends?.trim()
    if (xml) {
      lines.push(`<task id="${id}" status="${status}"${depends ? ` depends="${depends}"` : ''}>`, name, '</task>')
    } else {
      lines.push(`## [${id}] ${name}`, ...(depends ? [`Depends on: ${depends}`] : []), `Status: ${status}`)
    }
    lines.push('')
  }

  for (const f of tpl.fields) {
    if (HEADER_FIELDS.includes(f.key)) continue
    if (f.hasFiles) {
      const files = item.files[f.key] ?? []
      if (files.length) section(f.label, files.map((path) => `- ${path}`).join('\n'))
      continue
    }
    const value = item.fields[f.key]?.trim()
    if (value) section(f.label, value, CODE_FIELDS.includes(f.key))
  }

  const blocks = item.blocks.filter((key) => key in BLOCKS)
  if (blocks.length) section('Guidelines', blocks.map((key) => BLOCKS[key]).join('\n\n'))

  return lines.join('\n').trim()
}
