// Undo/redo over immutable snapshots. Pure: every call returns a new History.
// Implements DECIDED.md Layout L28 (undo on every destructive action) for the destructive
// edits in doc.ts and reuse.ts (remove/merge/clear section, remove message, remove from library).
// Ported from the snapshot stack (remember/undo) in versions/served-implementation/src/store/app.ts,
// with redo added and the store's mutation taken out.
//
// Use: before a destructive edit, `h = remember(h, 'Delete section', ws)`, then apply the edit.
// `undo(h, ws)` gives back the state before it (and keeps `ws` for redo).

export interface Snapshot<T> {
  label: string
  state: T
}

export interface History<T> {
  past: Snapshot<T>[]
  future: Snapshot<T>[]
  limit: number
}

export interface Step<T> {
  history: History<T>
  state: T
  label: string
}

/** Snapshots are deep copies of plain JSON data, so later edits cannot reach them. */
const freeze = <T>(state: T): T => JSON.parse(JSON.stringify(state)) as T

export const createHistory = <T>(limit = 50): History<T> => ({ past: [], future: [], limit })

/** Record the state as it is before a destructive edit. Clears redo. */
export function remember<T>(h: History<T>, label: string, state: T): History<T> {
  const past = [...h.past, { label, state: freeze(state) }]
  return { ...h, past: past.length > h.limit ? past.slice(past.length - h.limit) : past, future: [] }
}

/** Go back one step. `current` is kept so redo can return to it. Null when there is nothing to undo. */
export function undo<T>(h: History<T>, current: T): Step<T> | null {
  const last = h.past[h.past.length - 1]
  if (!last) return null
  return {
    history: { ...h, past: h.past.slice(0, -1), future: [{ label: last.label, state: freeze(current) }, ...h.future] },
    state: freeze(last.state),
    label: last.label,
  }
}

/** Go forward one step after an undo. Null when there is nothing to redo. */
export function redo<T>(h: History<T>, current: T): Step<T> | null {
  const next = h.future[0]
  if (!next) return null
  return {
    history: { ...h, past: [...h.past, { label: next.label, state: freeze(current) }], future: h.future.slice(1) },
    state: freeze(next.state),
    label: next.label,
  }
}

export const canUndo = (h: History<unknown>): boolean => h.past.length > 0
export const canRedo = (h: History<unknown>): boolean => h.future.length > 0
/** Label of the step undo would reverse, for "Undo: Delete section". */
export const undoLabel = (h: History<unknown>): string | null => h.past[h.past.length - 1]?.label ?? null
