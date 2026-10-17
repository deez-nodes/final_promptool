import { cursor, lineStart, type Edit } from './edit'

const INDENT = '  '
const BULLET = /^(\s*)([-*]\s|(\d+)\.\s)/

function tab({ value, start, end }: Edit, outdent: boolean): Edit {
  const ls = lineStart(value, start)
  if (start !== end) {
    const block = value.slice(ls, end)
    const shifted = outdent ? block.replace(/^ {1,2}/gm, '') : block.replace(/^/gm, INDENT)
    return { value: value.slice(0, ls) + shifted + value.slice(end), start: ls, end: ls + shifted.length }
  }
  if (!outdent) return cursor(value.slice(0, start) + INDENT + value.slice(end), start + INDENT.length)
  const lead = value.slice(ls).match(/^ {1,2}/)?.[0].length ?? 0
  return cursor(value.slice(0, ls) + value.slice(ls + lead), Math.max(ls, start - lead))
}

/** Enter inside a list item continues the list; on an empty item it ends the list. */
function enter({ value, start }: Edit): Edit | null {
  const ls = lineStart(value, start)
  const line = value.slice(ls, start)
  const m = line.match(BULLET)
  if (!m) return null
  const [marker, indent, bullet, num] = m
  if (!line.slice(marker.length).trim()) return cursor(`${value.slice(0, ls)}\n${value.slice(start)}`, ls + 1)
  const next = indent + (num ? `${Number(num) + 1}. ` : bullet)
  return cursor(`${value.slice(0, start)}\n${next}${value.slice(start)}`, start + 1 + next.length)
}

/** Tab / Shift+Tab indent and list continuation. Returns null when the key is not handled. */
export function listKey(key: string, shift: boolean, edit: Edit): Edit | null {
  if (key === 'Tab') return tab(edit, shift)
  if (key === 'Enter') return enter(edit)
  return null
}
