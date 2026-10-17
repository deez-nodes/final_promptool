<script setup lang="ts">
// One writing surface per section. Markdown converts on the spot (Obsidian Live Preview style).
// The text is never rewritten: value in, the same value out.
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { defaultKeymap, history, historyKeymap, indentWithTab } from '@codemirror/commands'
import { markdown, markdownKeymap, markdownLanguage } from '@codemirror/lang-markdown'
import { HighlightStyle, syntaxHighlighting, syntaxTree } from '@codemirror/language'
import { Compartment, EditorState, Prec } from '@codemirror/state'
import type { Extension, Range } from '@codemirror/state'
import { Decoration, EditorView, GutterMarker, gutter, keymap, placeholder, ViewPlugin } from '@codemirror/view'
import type { DecorationSet, ViewUpdate } from '@codemirror/view'
import { tags as t } from '@lezer/highlight'
import { vim } from '@replit/codemirror-vim'
import { pad } from '../model/points'
import s from './Writing.module.css'

const props = defineProps<{
  modelValue: string
  hint?: string
  label: string
  vim: boolean
  autofocus?: boolean
}>()
const emit = defineEmits<{ (e: 'update:modelValue', v: string): void; (e: 'focus'): void; (e: 'blur'): void }>()

const host = ref<HTMLDivElement | null>(null)
let view: EditorView | null = null
const vimBox = new Compartment()

const highlighting = HighlightStyle.define([
  { tag: t.heading1, class: 'cm-h1' },
  { tag: t.heading2, class: 'cm-h2' },
  { tag: t.heading3, class: 'cm-h3' },
  { tag: [t.heading4, t.heading5, t.heading6], class: 'cm-h4' },
  { tag: t.strong, class: 'cm-strong' },
  { tag: t.emphasis, class: 'cm-em' },
  { tag: t.strikethrough, class: 'cm-strike' },
  { tag: t.monospace, class: 'cm-code' },
  { tag: [t.link, t.url], class: 'cm-link' },
  { tag: [t.processingInstruction, t.meta], class: 'cm-mark' },
])

// Syntax marks: shown on the line being edited, hidden everywhere else.
const MARKS = new Set(['HeaderMark', 'EmphasisMark', 'StrongMark', 'StrikethroughMark', 'CodeMark', 'LinkMark'])
const hidden = Decoration.replace({})
function hiddenMarks(v: EditorView): DecorationSet {
  const marks: Range<Decoration>[] = []
  const cursor = v.state.selection.main
  for (const { from, to } of v.visibleRanges) {
    syntaxTree(v.state).iterate({
      from,
      to,
      enter: (node) => {
        if (!MARKS.has(node.name)) return
        const line = v.state.doc.lineAt(node.from)
        if (cursor.from <= line.to && cursor.to >= line.from) return
        let end = node.to
        if (node.name === 'HeaderMark' && v.state.doc.sliceString(end, end + 1) === ' ') end += 1
        if (end > node.from) marks.push(hidden.range(node.from, end))
      },
    })
  }
  return Decoration.set(marks, true)
}
const quietMarks = ViewPlugin.fromClass(
  class {
    decorations: DecorationSet
    constructor(v: EditorView) {
      this.decorations = hiddenMarks(v)
    }
    update(u: ViewUpdate) {
      if (u.docChanged || u.selectionSet || u.viewportChanged) this.decorations = hiddenMarks(u.view)
    }
  },
  { decorations: (p) => p.decorations },
)

// Lines styled by what they start with: points, quotes, done items.
const ITEM = /^\s*(?:[-*+]|\d+[.)])\s+/
const DONE = /^\s*[-*+] \[[xX]\] /
const QUOTE = /^\s*>/
const pointLine = Decoration.line({ class: 'cm-point' })
const doneLine = Decoration.line({ class: 'cm-done' })
const quoteLine = Decoration.line({ class: 'cm-quote' })
function styleLines(v: EditorView): DecorationSet {
  const lines: Range<Decoration>[] = []
  for (const { from, to } of v.visibleRanges) {
    for (let pos = from; pos <= to; ) {
      const line = v.state.doc.lineAt(pos)
      if (DONE.test(line.text)) lines.push(doneLine.range(line.from))
      else if (QUOTE.test(line.text)) lines.push(quoteLine.range(line.from))
      else if (ITEM.test(line.text)) lines.push(pointLine.range(line.from))
      pos = line.to + 1
    }
  }
  return Decoration.set(lines)
}
const lineStyles = ViewPlugin.fromClass(
  class {
    decorations: DecorationSet
    constructor(v: EditorView) {
      this.decorations = styleLines(v)
    }
    update(u: ViewUpdate) {
      if (u.docChanged || u.viewportChanged) this.decorations = styleLines(u.view)
    }
  },
  { decorations: (p) => p.decorations },
)

// The number is the address: 01, 02 ... in the gutter for every point.
class NumberMarker extends GutterMarker {
  n: string
  constructor(n: string) {
    super()
    this.n = n
  }
  toDOM() {
    const el = document.createElement('span')
    el.textContent = this.n
    return el
  }
}
function pointNumbers(state: EditorState): Map<number, string> {
  const map = new Map<number, string>()
  let n = 0
  for (let i = 1; i <= state.doc.lines; i++) {
    const line = state.doc.line(i)
    if (ITEM.test(line.text) || QUOTE.test(line.text)) map.set(line.from, pad(++n))
  }
  return map
}
const numberGutter = gutter({
  class: 'cm-numbers',
  lineMarker(v, line) {
    const n = pointNumbers(v.state).get(line.from)
    return n ? new NumberMarker(n) : null
  },
  lineMarkerChange: (u) => u.docChanged,
})

// A pasted list splits into one point per line.
const pasteSplit = EditorView.domEventHandlers({
  paste(event, v) {
    const text = event.clipboardData?.getData('text/plain') ?? ''
    const lines = text.replace(/\r\n?/g, '\n').split('\n')
    const nonEmpty = lines.filter((l) => l.trim())
    if (nonEmpty.length < 2) return false
    const line = v.state.doc.lineAt(v.state.selection.main.head)
    const inList = ITEM.test(line.text) || line.text.trim() === ''
    const alreadyList = nonEmpty.every((l) => ITEM.test(l) || QUOTE.test(l))
    if (!inList || alreadyList) return false
    event.preventDefault()
    const insert = nonEmpty.map((l) => '- ' + l.trim()).join('\n')
    const from = line.text.trim() === '' ? line.from : v.state.selection.main.from
    const to = line.text.trim() === '' ? line.to : v.state.selection.main.to
    const prefix = line.text.trim() === '' ? '' : '\n'
    v.dispatch({ changes: { from, to, insert: prefix + insert }, selection: { anchor: from + prefix.length + insert.length } })
    return true
  },
})

const base: Extension[] = [
  history(),
  EditorView.lineWrapping,
  markdown({ base: markdownLanguage, extensions: [{ remove: ['HTMLBlock', 'HTMLTag'] }] }),
  syntaxHighlighting(highlighting),
  quietMarks,
  lineStyles,
  numberGutter,
  pasteSplit,
  keymap.of([...markdownKeymap, ...historyKeymap, ...defaultKeymap, indentWithTab]),
]

onMounted(() => {
  view = new EditorView({
    parent: host.value!,
    state: EditorState.create({
      doc: props.modelValue,
      extensions: [
        vimBox.of(props.vim ? Prec.high(vim()) : []),
        ...base,
        placeholder(props.hint ?? ''),
        EditorView.contentAttributes.of({ 'aria-label': props.label }),
        EditorView.updateListener.of((u) => {
          if (u.docChanged) emit('update:modelValue', u.state.doc.toString())
          if (u.focusChanged) {
            if (u.view.hasFocus) emit('focus')
            else emit('blur')
          }
        }),
      ],
    }),
  })
  if (props.autofocus) view.focus()
})

onBeforeUnmount(() => view?.destroy())

watch(
  () => props.vim,
  (on) => view?.dispatch({ effects: vimBox.reconfigure(on ? Prec.high(vim()) : []) }),
)

// Text changed somewhere else: Undo, merge, or a library insert.
watch(
  () => props.modelValue,
  (value) => {
    if (!view || view.state.doc.toString() === value) return
    view.dispatch({ changes: { from: 0, to: view.state.doc.length, insert: value } })
  },
)

defineExpose({ focus: () => view?.focus() })
</script>

<template>
  <div ref="host" :class="s.writing" />
</template>
