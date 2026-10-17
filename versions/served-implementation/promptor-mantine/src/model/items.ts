import { DEFAULT_TEMPLATE, TEMPLATES } from './templates'
import type { Item, Mode, Template } from './types'

export const genId = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 6)

export const templateOf = (item: Item): Template => TEMPLATES[item.template] ?? TEMPLATES.promptology

/** Switch an item to a template: fill empty fields with its prefills and reset its blocks. */
export function withTemplate(item: Item, template: string): Item {
  const tpl = TEMPLATES[template]
  const fields = { ...item.fields }
  for (const f of tpl.fields) {
    if (f.prefill && !fields[f.key]?.trim()) fields[f.key] = f.prefill
  }
  return { ...item, template, fields, blocks: [...(tpl.blocks ?? [])] }
}

export function createItem(mode: Mode): Item {
  const blank: Item = { id: genId(), name: '', template: '', mode, status: 'ready', created: Date.now(), fields: {}, files: {}, blocks: [] }
  return withTemplate(blank, DEFAULT_TEMPLATE[mode])
}

/** Relative paths are taken from the base dir; absolute, home and dot paths stay as typed. */
export function resolvePath(raw: string, baseDir: string): string {
  return /^[/~.]/.test(raw) ? raw : `${baseDir.replace(/\/$/, '')}/${raw}`
}

export const lastTouched = (item: Item) => item.updated ?? item.created
