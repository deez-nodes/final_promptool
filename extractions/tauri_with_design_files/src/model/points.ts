// Turns a section body into lead text and numbered points. Text is kept verbatim.
export interface Point {
  /** The quoted line, for "In Response To" and Corrections. */
  quote?: string
  lines: string[]
}

const ITEM = /^(\s*)(?:[-*+]|\d+[.)])\s+(.*)$/
const QUOTE = /^\s*>\s?(.*)$/

export function parseBody(body: string): { lead: string[]; points: Point[] } {
  const lead: string[] = []
  const points: Point[] = []
  let current: Point | null = null
  for (const raw of body.split('\n')) {
    const item = ITEM.exec(raw)
    const quote = QUOTE.exec(raw)
    if (item) {
      current = { lines: [item[2]] }
      points.push(current)
    } else if (quote) {
      current = { quote: quote[1], lines: [] }
      points.push(current)
    } else if (raw.trim() === '') {
      current = null
      if (points.length === 0) lead.push(raw)
    } else if (current) {
      current.lines.push(raw.replace(/^\s{1,4}/, ''))
    } else {
      lead.push(raw)
    }
  }
  while (lead.length && lead[lead.length - 1].trim() === '') lead.pop()
  return { lead, points }
}

export const pad = (n: number) => String(n).padStart(2, '0')

export const isEmpty = (body: string) => body.trim() === ''

export const pointCount = (body: string) => parseBody(body).points.length
