// Section body -> lead text and numbered points; paste splitting; quote + answer.
// Implements DECIDED.md "What it is" L7 (lead text, numbered points 01, 02 …, the number is
// the address), L9 (In Response To: the quote first, points under it), L10 (a point holds the
// quoted line and your answer; a pasted list splits into one point per line, DZ-54),
// L13 (text verbatim, spacing kept, Markdown passes through, DZ-49).
// Ported from versions/served-implementation/src/model/points.ts and the paste handler in
// src/components/Writing.vue. Changes from the port: continuation lines are kept exactly as
// typed (no de-indent), blank lines inside a point stay with it instead of moving text into
// the lead, nested list items and fenced code do not start points, and pasting a list that
// is partly marked no longer doubles its markers.

import type { Point } from './types'

/** A list item: `- `, `* `, `+ `, `1. `, `1) `. Group 1 is the indent, group 2 the text. */
export const ITEM = /^(\s*)(?:[-*+]|\d+[.)])\s+(.*)$/
/** A quote line with text. Group 1 is the indent, group 2 the quoted text. */
export const QUOTE = /^(\s*)>\s?(.*\S.*)$/
const FENCE = /^\s*(```|~~~)/
const BULLET_GLYPH = /^\s*[•◦▪‣·●○■–—]\s*/

/** The address of point n: 01, 02 … 99, 100. */
export const pad = (n: number): string => String(n).padStart(2, '0')

export const isBlank = (text: string): boolean => text.trim() === ''

const normalise = (body: string) => body.replace(/\r\n?/g, '\n')

const trimBlankEdges = (lines: string[]): string[] => {
  let a = 0
  let b = lines.length
  while (a < b && isBlank(lines[a] ?? '')) a++
  while (b > a && isBlank(lines[b - 1] ?? '')) b--
  return lines.slice(a, b)
}

export interface ParsedBody {
  /** Text before the first point, verbatim, outer blank lines trimmed. */
  lead: string[]
  points: Point[]
}

/**
 * Read a section body. A list item or a `> ` quote line at the outer indent starts a point;
 * every line after it, blank lines included, belongs to that point until the next one.
 * Lines inside a code fence and deeper-indented list items never start a point.
 */
export function parseBody(body: string): ParsedBody {
  const lines = normalise(body).split('\n')
  const lead: string[] = []
  const points: Point[] = []
  let current: Point | null = null
  let fenced = false
  let outer = -1

  lines.forEach((raw, i) => {
    if (FENCE.test(raw)) {
      fenced = !fenced
    } else if (!fenced) {
      const item = ITEM.exec(raw)
      const quote = item ? null : QUOTE.exec(raw)
      const indent = (item ?? quote)?.[1]?.length ?? -1
      if (indent >= 0 && (outer < 0 || indent <= outer)) {
        if (outer < 0) outer = indent
        current = item
          ? { n: points.length + 1, lines: [item[2] ?? ''], line: i, end: i + 1 }
          : { n: points.length + 1, quote: quote![2] ?? '', lines: [], line: i, end: i + 1 } // quote! : indent >= 0 and no item means QUOTE matched
        points.push(current)
        return
      }
    }
    if (current) {
      current.lines.push(raw)
      if (!isBlank(raw)) current.end = i + 1
    } else {
      lead.push(raw)
    }
  })

  for (const p of points) {
    while (p.lines.length && isBlank(p.lines[p.lines.length - 1] ?? '')) p.lines.pop()
  }
  return { lead: trimBlankEdges(lead), points }
}

export const pointCount = (body: string): number => parseBody(body).points.length

/** A point with nothing in it: no quote and only blank lines. */
export const isEmptyPoint = (p: Point): boolean => p.quote === undefined && p.lines.every(isBlank)

/**
 * A pasted multi-line block, rewritten as one list item per non-blank line (DZ-54).
 * Returns null when the paste should go in as-is: a single line, or text that is already
 * all list items and quotes. Bullet glyphs (•, –, …) become `- `; marked lines keep their mark.
 */
export function splitPaste(text: string): string | null {
  const lines = normalise(text).split('\n').filter((l) => !isBlank(l))
  if (lines.length < 2) return null
  if (lines.every((l) => ITEM.test(l) || QUOTE.test(l))) return null
  return lines
    .map((l) => (ITEM.test(l) || QUOTE.test(l) ? l : '- ' + l.replace(BULLET_GLYPH, '').trimStart()))
    .join('\n')
}

/** Pasted reply text as quote lines, one per non-blank line, ready to answer under. */
export const quoteLines = (text: string): string =>
  normalise(text)
    .split('\n')
    .filter((l) => !isBlank(l))
    .map((l) => '> ' + l.trim())
    .join('\n')

/** A quote with its answer under it, as body text. */
export const quotePoint = (quote: string, answer = ''): string => (answer ? `> ${quote}\n${answer}` : `> ${quote}`)

/** Append one point per item to a body, after whatever is there. */
export function appendPoints(body: string, items: readonly string[]): string {
  const add = items.filter((t) => !isBlank(t)).map((t) => '- ' + t)
  if (!add.length) return body
  const base = body.replace(/\s+$/, '')
  return base ? base + '\n' + add.join('\n') : add.join('\n')
}

/** Write an answer under point n (1-based). Returns the body unchanged when there is no such point. */
export function answerUnder(body: string, n: number, answer: string): string {
  const lines = normalise(body).split('\n')
  const p = parseBody(body).points[n - 1]
  if (!p || isBlank(answer)) return body
  lines.splice(p.end, 0, ...normalise(answer).split('\n'))
  return lines.join('\n')
}
