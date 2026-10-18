import type { PromptDoc, PromptSection } from "@/lib/types"

export function sectionsToText(label: string, sections: PromptSection[]): string {
  const body = sections
    .filter((section) => section.points.some((point) => point.text.trim()))
    .map((section) => {
      const points = section.points
        .filter((point) => point.text.trim())
        .map((point) => `- ${point.text.trim()}`)
        .join("\n")
      return `<${section.name}>\n${points}\n</${section.name}>`
    })
    .join("\n\n")

  if (!body) return ""
  return `# ${label}\n\n${body}`
}

export function composeDocument(doc: PromptDoc): string {
  const base = sectionsToText(doc.title, doc.baseSections)
  const midtask = sectionsToText("Mid-task", doc.midtaskSections)
  return [base, midtask].filter(Boolean).join("\n\n")
}

export function countWords(text: string): number {
  const trimmed = text.trim()
  if (!trimmed) return 0
  return trimmed.split(/\s+/).length
}

export function estimateTokens(text: string): number {
  return Math.ceil(text.length / 4)
}

export function totalPoints(doc: PromptDoc): number {
  return [...doc.baseSections, ...doc.midtaskSections].reduce(
    (sum, section) => sum + section.points.filter((p) => p.text.trim()).length,
    0
  )
}

export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch {
    return false
  }
}
