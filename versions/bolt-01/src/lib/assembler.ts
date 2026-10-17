import type { Section, ExportFormat } from "../store/types"

function sanitizeTag(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9_]/g, "_")
    .replace(/^[^a-z]/, "s_$&")
    .replace(/__+/g, "_")
}

function needsCdata(text: string): boolean {
  return text.includes("<") || text.includes("&") || text.includes("]]>")
}

function wrapCdata(text: string): string {
  if (needsCdata(text)) {
    return `<![CDATA[${text.replace(/]]>/g, "]]]]><![CDATA[>")}]]>`
  }
  return text
}

function demoteHeadings(text: string, by: number): string {
  return text.replace(/^(#{1,6})\s/gm, (_, hashes: string) =>
    "#".repeat(Math.min(6, hashes.length + by)) + " ",
  )
}

// Section headings render at their chosen level; any heading the author typed
// inside the body is pushed below that level so the outline never inverts.
function assembleMarkdown(sections: Section[]): string {
  const parts: string[] = []
  for (const sec of sections) {
    const level = sec.headingLevel ?? 1
    parts.push(`${"#".repeat(level)} ${sec.name}`)
    if (sec.freeText.trim()) {
      parts.push(demoteHeadings(sec.freeText.trim(), level))
    }
    sec.points.forEach((pt, i) => {
      const num = String(i + 1).padStart(2, "0")
      if (pt.quote) {
        parts.push(`${num}. `)
        pt.quote.split("\n").forEach((line) => parts.push(`> ${line}`))
      }
      if (pt.text.trim()) {
        if (!pt.quote) parts.push(`${num}. ${pt.text.trim()}`)
        else parts.push(`   ${pt.text.trim()}`)
      }
      if (pt.comment?.trim()) {
        parts.push(`   _${pt.comment.trim()}_`)
      }
    })
    parts.push("")
  }
  return parts.join("\n").trim()
}

function assembleXml(sections: Section[]): string {
  const lines: string[] = ["<prompt>"]
  for (const sec of sections) {
    const tag = sanitizeTag(sec.name)
    const levelAttr = sec.headingLevel ? ` level="${sec.headingLevel}"` : ""
    lines.push(`  <${tag}${levelAttr}>`)
    if (sec.freeText.trim()) {
      lines.push(`    ${wrapCdata(sec.freeText.trim())}`)
    }
    sec.points.forEach((pt, i) => {
      const num = String(i + 1).padStart(2, "0")
      const childTag = `${tag}_${num}`
      if (pt.quote) {
        lines.push(`    <${childTag}_quote>${wrapCdata(pt.quote)}</${childTag}_quote>`)
      }
      if (pt.text.trim()) {
        lines.push(`    <${childTag}>${wrapCdata(pt.text.trim())}</${childTag}>`)
      }
      if (pt.comment?.trim()) {
        lines.push(`    <${childTag}_note>${wrapCdata(pt.comment.trim())}</${childTag}_note>`)
      }
    })
    lines.push(`  </${tag}>`)
  }
  lines.push("</prompt>")
  return lines.join("\n")
}

// Plaintext has no real heading levels, so level is shown as an explicit
// marker that survives being pasted anywhere.
function assemblePlaintext(sections: Section[]): string {
  const parts: string[] = []
  for (const sec of sections) {
    const level = sec.headingLevel ?? 1
    parts.push(`H${level}  ${sec.name.toUpperCase()}`)
    parts.push("─".repeat(Math.max(sec.name.length + 4, 20)))
    if (sec.freeText.trim()) {
      parts.push(sec.freeText.trim())
    }
    sec.points.forEach((pt, i) => {
      const num = String(i + 1).padStart(2, "0")
      if (pt.quote) {
        parts.push(`  ${num}. [Quote]`)
        pt.quote.split("\n").forEach((line) => parts.push(`      "${line}"`))
      }
      if (pt.text.trim()) {
        if (!pt.quote) parts.push(`  ${num}. ${pt.text.trim()}`)
        else parts.push(`      ${pt.text.trim()}`)
      }
      if (pt.comment?.trim()) {
        parts.push(`      (${pt.comment.trim()})`)
      }
    })
    parts.push("")
  }
  return parts.join("\n").trim()
}

export function assemblePrompt(
  sections: Section[],
  format: ExportFormat,
): string {
  switch (format) {
    case "markdown":
      return assembleMarkdown(sections)
    case "xml":
      return assembleXml(sections)
    case "plaintext":
      return assemblePlaintext(sections)
  }
}

export function countWords(text: string): number {
  const trimmed = text.trim()
  if (!trimmed) return 0
  return trimmed.split(/\s+/).length
}
