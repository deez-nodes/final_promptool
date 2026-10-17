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

  if (item.template === 'subagent_worker') {
    const id = item.fields.task_id?.trim() || 'SWP-01'
    const role = item.fields.role?.trim() || 'coder'
    const obj = item.fields.objective?.trim() || item.name.trim()
    const targetFiles = (item.files.files ?? []).join(', ') || 'none'
    const readOnlyFiles = (item.files.read_files ?? []).join(', ') || 'none'
    const rules = item.fields.rules?.trim() || 'None'
    const outputContract = item.fields.output?.trim() || 'diff'
    const verify = item.fields.verify?.trim()

    if (xml) {
      lines.push(
        `<subagent_packet id="${id}" role="${role}">`,
        `  <objective>${obj}</objective>`,
        `  <boundaries>`,
        `    <write_files>${targetFiles}</write_files>`,
        `    <read_files>${readOnlyFiles}</read_files>`,
        `    <forbidden>${rules}</forbidden>`,
        `  </boundaries>`,
        `  <output_contract>${outputContract}</output_contract>`,
        ...(verify ? [`  <verification>${verify}</verification>`] : []),
        `</subagent_packet>`,
        ''
      )
    } else {
      lines.push(
        `# [SUBAGENT WORK PACKET: ${id}]`,
        `**Role**: ${role}`,
        `**Objective**: ${obj}`,
        `**Write Boundary**: ${targetFiles}`,
        `**Read Boundary**: ${readOnlyFiles}`,
        `**Forbidden**: ${rules}`,
        `**Output Contract**: ${outputContract}`,
        ...(verify ? [`**Verification**: ${verify}`] : []),
        ''
      )
    }

    const blocks = item.blocks.filter((key) => key in BLOCKS)
    if (blocks.length) section('Guidelines', blocks.map((key) => BLOCKS[key]).join('\n\n'))
    return lines.join('\n').trim()
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
