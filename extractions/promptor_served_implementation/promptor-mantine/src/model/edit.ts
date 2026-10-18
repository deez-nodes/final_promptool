/** A textarea's text and selection: what a key handler reads and what it returns. */
export interface Edit {
  value: string
  start: number
  end: number
}

export const lineStart = (v: string, p: number) => (p <= 0 ? 0 : v.lastIndexOf('\n', p - 1) + 1)

export const lineEnd = (v: string, p: number) => {
  const i = v.indexOf('\n', p)
  return i < 0 ? v.length : i
}

export const cursor = (value: string, pos: number): Edit => {
  const p = Math.max(0, Math.min(value.length, pos))
  return { value, start: p, end: p }
}
