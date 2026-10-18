import { REDO_KEY } from './vim'

export interface CheatGroup {
  title: string
  rows: { label: string; keys: string[] }[]
}

export const CHEATSHEET: CheatGroup[] = [
  {
    title: 'Motion',
    rows: [
      { label: 'move', keys: ['h', 'j', 'k', 'l'] },
      { label: 'word forward / back', keys: ['w', 'b'] },
      { label: 'line start / end', keys: ['0', '$'] },
      { label: 'top / bottom', keys: ['gg', 'G'] },
    ],
  },
  {
    title: 'Edit',
    rows: [
      { label: 'insert before / after', keys: ['i', 'a'] },
      { label: 'delete line', keys: ['dd'] },
      { label: 'yank / paste', keys: ['y', 'p'] },
      { label: 'undo / redo', keys: ['u', REDO_KEY] },
    ],
  },
]
