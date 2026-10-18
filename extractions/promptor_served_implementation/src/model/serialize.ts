import type { Doc, Section } from './types'
import { pad, parseBody, isEmpty } from './points'

/** The section title becomes the tag. Whitespace joins with "_", nothing else is touched. */
export const tagOf = (title: string) => title.trim().replace(/\s+/g, '_') || 'Section'

export function serializeSection(s: Section): string {
  const { lead, points } = parseBody(s.body)
  const tag = tagOf(s.title)
  const out: string[] = ['<' + tag + '>']
  if (lead.length) out.push(lead.join('\n'))
  const isCorrections = s.title.trim().toLowerCase() === 'corrections'
  points.forEach((p, i) => {
    const n = pad(i + 1)
    if (isCorrections && p.quote !== undefined) {
      const truth = p.lines.join(' ').replace(/^it is\s+/i, '')
      out.push(n + ' you said ' + p.quote + '; it is ' + truth)
      return
    }
    if (p.quote !== undefined) {
      out.push(n + ' > ' + p.quote)
      p.lines.forEach((l) => out.push('   ' + l))
      return
    }
    out.push(n + ' ' + (p.lines[0] ?? ''))
    p.lines.slice(1).forEach((l) => out.push('   ' + l))
  })
  out.push('</' + tag + '>')
  return out.join('\n')
}

/** XML with no root. Empty sections drop out. */
export function serializeDoc(doc: Doc): string {
  return doc.sections
    .filter((s) => s.included && !isEmpty(s.body))
    .map(serializeSection)
    .join('\n\n')
}
