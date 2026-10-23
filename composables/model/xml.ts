// XML output: what Copy (Ctrl+Enter) puts on the clipboard.
// Implements DECIDED.md "What it is" L7 (the title becomes the XML tag; points numbered
// 01, 02 …), L10 (quote and answer under it, DZ-54), L11 (Corrections reads
// "you said X; it is Y" and drops out when empty, DZ-55), L13 (XML with no root element;
// text verbatim: not escaped, not rewritten, spacing kept; Markdown passes through, DZ-49),
// L15 (empty sections drop out); Layout L24 (an excluded section never goes out, DZ-52).
// Ported from versions/served-implementation/src/model/serialize.ts. Changes: the tag is
// always a valid XML name (rule below), continuation lines are not re-indented, blank points
// are skipped without renumbering the rest, and a correction with no answer drops out.

import type { Doc, Section } from './types'
import { isBlank, isEmptyPoint, pad, parseBody } from './points'

/**
 * The slug rule (stable; changing it changes every tag a user has seen):
 *   1. NFC-normalise and lower-case the title.
 *   2. Every run of characters that is not a Unicode letter or digit becomes one `_`.
 *   3. Leading and trailing `_` are removed.
 *   4. Empty -> `section`. Starting with a digit -> prefixed with `_` (XML names cannot).
 * "Output Format" -> output_format, "In Response To" -> in_response_to, "Q&A / notes" -> q_a_notes.
 */
export function tagOf(title: string): string {
  const t = title
    .normalize('NFC')
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, '_')
    .replace(/^_+|_+$/g, '')
  if (!t) return 'section'
  return /^\p{N}/u.test(t) ? '_' + t : t
}

/** Corrections is recognised by its tag, so a custom "corrections" section reads the same way. */
export const isCorrections = (s: Pick<Section, 'title'>): boolean => tagOf(s.title) === 'corrections'

/** "you said X; it is Y". A leading "it is" typed in the answer is not doubled. */
export const correctionLine = (said: string, is: string): string => `you said ${said}; it is ${is.replace(/^\s*it is\s+/i, '')}`

/** The body lines of a section as they go out, or [] when nothing would. */
export function sectionLines(s: Section): string[] {
  const { lead, points } = parseBody(s.body)
  const corrections = isCorrections(s)
  const out: string[] = [...lead]
  for (const p of points) {
    if (isEmptyPoint(p)) continue
    const n = pad(p.n)
    if (p.quote === undefined) {
      out.push(`${n} ${p.lines[0] ?? ''}`, ...p.lines.slice(1))
    } else if (corrections) {
      const first = p.lines.findIndex((l) => !isBlank(l))
      if (first < 0) continue
      out.push(`${n} ${correctionLine(p.quote, p.lines[first] ?? '')}`, ...p.lines.slice(first + 1))
    } else {
      out.push(`${n} > ${p.quote}`, ...p.lines)
    }
  }
  return out.some((l) => !isBlank(l)) ? out : []
}

/** True when the section would not appear in the output. */
export const dropsOut = (s: Section): boolean => !s.included || sectionLines(s).length === 0

/** One section as `<tag>…</tag>`, or null when it drops out. */
export function sectionToXml(s: Section): string | null {
  if (!s.included) return null
  const lines = sectionLines(s)
  if (!lines.length) return null
  const tag = tagOf(s.title)
  return [`<${tag}>`, ...lines, `</${tag}>`].join('\n')
}

/** The whole message: sibling elements with no root, separated by a blank line. */
export function docToXml(doc: Pick<Doc, 'sections'>): string {
  return doc.sections
    .map(sectionToXml)
    .filter((x): x is string => x !== null)
    .join('\n\n')
}
