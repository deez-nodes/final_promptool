<script setup lang="ts">
/**
 * SectionEditor: one CodeMirror 6 instance per section body, Obsidian Live Preview style.
 * See ./README.md for props, events and the DECIDED.md lines each behaviour covers.
 *
 * Client-only: the view is created in onMounted (never on the server), and the server
 * renders the same empty host element, so there is no hydration mismatch.
 */
import { computed, onBeforeUnmount, onMounted, ref, useCssModule, watch } from 'vue'
import { Annotation, Compartment, EditorState, Prec, Transaction, type Range } from '@codemirror/state'
import {
  Decoration,
  type DecorationSet,
  drawSelection,
  EditorView,
  keymap,
  ViewPlugin,
  type ViewUpdate,
  WidgetType
} from '@codemirror/view'
import { defaultKeymap, history, historyKeymap } from '@codemirror/commands'
import { syntaxTree } from '@codemirror/language'
import {
  deleteMarkupBackward,
  insertNewlineContinueMarkupCommand,
  markdown,
  markdownLanguage
} from '@codemirror/lang-markdown'
import { vim } from '@replit/codemirror-vim'

const props = withDefaults(defineProps<{
  modelValue: string
  /** The section's hue role: role|context|goal|task|constraints|output|custom. */
  role?: string
  /** Vim keybindings; the host owns the toggle (see composables/useVim.ts). */
  vim?: boolean
}>(), { role: 'custom', vim: false })

const emit = defineEmits<{
  'update:modelValue': [value: string]
  focus: []
  blur: []
}>()

const css = useCssModule()
const host = ref<HTMLElement | null>(null)
const focused = ref(false)
let view: EditorView | null = null

/* ── Hue ───────────────────────────────────────────────────────────────── */
const SEEDED_ROLES = ['role', 'context', 'goal', 'task', 'constraints', 'output']
const roleKey = computed(() => (props.role || 'custom').toLowerCase().replace(/[^a-z0-9-]/g, ''))
const hueStyle = computed(() => ({
  // Seeded types read their tokens.css hue; custom sections inherit the --hue the card sets.
  '--section-hue': SEEDED_ROLES.includes(roleKey.value)
    ? 'var(--t-' + roleKey.value + ')'
    : 'var(--hue, var(--t-line-2))'
}))

/* ── Live Preview decorations ──────────────────────────────────────────── */
class PadWidget extends WidgetType {
  constructor(readonly cls: string) { super() }
  eq(other: PadWidget) { return other.cls === this.cls }
  toDOM() {
    const span = document.createElement('span')
    span.className = this.cls
    span.textContent = '0'
    return span
  }
  ignoreEvent() { return false }
}

const mark = (cls: string | undefined) => Decoration.mark({ class: cls })
const line = (cls: string | undefined) => Decoration.line({ class: cls })
const hide = Decoration.replace({})

const deco = {
  heading: [1, 2, 3, 4, 5, 6].map(n => line(css['h' + n])),
  strong: mark(css.strong),
  em: mark(css.em),
  strike: mark(css.strike),
  code: mark(css.code),
  markup: mark(css.markup),
  listMark: mark(css.listMark),
  orderedMark: mark(css.orderedMark),
  quoteMark: mark(css.markup),
  quoteLine: line(css.quote),
  codeLine: line(css.codeBlock),
  link: mark(css.link),
  url: mark(css.markup),
  pad: Decoration.widget({ widget: new PadWidget(css.orderedPad ?? ''), side: -1 })
}

const HIDE_OFF_LINE = new Set(['EmphasisMark', 'StrikethroughMark'])

function buildDecorations(v: EditorView): DecorationSet {
  const { state } = v
  const doc = state.doc
  const out: Range<Decoration>[] = []

  // Lines holding a cursor or selection show their raw markup; the others render it.
  const active = new Set<number>()
  if (v.hasFocus) {
    for (const r of state.selection.ranges) {
      for (let n = doc.lineAt(r.from).number; n <= doc.lineAt(r.to).number; n++) active.add(n)
    }
  }
  const isActive = (pos: number) => active.has(doc.lineAt(pos).number)
  const eachLine = (from: number, to: number, d: Decoration) => {
    for (let n = doc.lineAt(from).number; n <= doc.lineAt(to).number; n++) out.push(d.range(doc.line(n).from))
  }

  for (const { from, to } of v.visibleRanges) {
    syntaxTree(state).iterate({
      from,
      to,
      enter: (node) => {
        const name = node.name
        const heading = /^(?:ATX|Setext)Heading(\d)$/.exec(name)
        if (heading) {
          out.push(deco.heading[Number(heading[1]) - 1]!.range(doc.lineAt(node.from).from))
          return
        }
        switch (name) {
          case 'HeaderMark': {
            const parent = node.node.parent
            if (!parent || !parent.name.startsWith('ATX')) { out.push(deco.markup.range(node.from, node.to)); return }
            if (isActive(node.from)) { out.push(deco.markup.range(node.from, node.to)); return }
            const ln = doc.lineAt(node.from)
            // "## " at the start: hide with the space after; closing "##": hide with the space before.
            if (node.from === parent.from) {
              const end = doc.sliceString(node.to, node.to + 1) === ' ' ? node.to + 1 : node.to
              out.push(hide.range(node.from, Math.min(end, ln.to)))
            } else {
              const start = node.from > ln.from && doc.sliceString(node.from - 1, node.from) === ' ' ? node.from - 1 : node.from
              out.push(hide.range(start, node.to))
            }
            return
          }
          case 'StrongEmphasis': out.push(deco.strong.range(node.from, node.to)); return
          case 'Emphasis': out.push(deco.em.range(node.from, node.to)); return
          case 'Strikethrough': out.push(deco.strike.range(node.from, node.to)); return
          case 'InlineCode': out.push(deco.code.range(node.from, node.to)); return
          case 'CodeMark': {
            if (node.node.parent?.name !== 'InlineCode') { out.push(deco.markup.range(node.from, node.to)); return }
            out.push(isActive(node.from) ? deco.markup.range(node.from, node.to) : hide.range(node.from, node.to))
            return
          }
          case 'ListMark': {
            const list = node.node.parent?.parent
            if (list?.name === 'OrderedList') {
              // A top-level numbered list is the section's points: 01, 02 … (the number is the address).
              const topLevel = list.parent?.name === 'Document'
              const num = parseInt(doc.sliceString(node.from, node.to), 10)
              if (topLevel && num >= 0 && num < 10) out.push(deco.pad.range(node.from))
              out.push(deco.orderedMark.range(node.from, node.to))
            } else {
              out.push(deco.listMark.range(node.from, node.to))
            }
            return
          }
          case 'Blockquote': eachLine(node.from, node.to, deco.quoteLine); return
          case 'QuoteMark': out.push(deco.quoteMark.range(node.from, node.to)); return
          case 'FencedCode':
          case 'CodeBlock': eachLine(node.from, node.to, deco.codeLine); return
          case 'Link': out.push(deco.link.range(node.from, node.to)); return
          case 'URL':
          case 'LinkMark': out.push(deco.url.range(node.from, node.to)); return
          default:
            if (HIDE_OFF_LINE.has(name)) {
              out.push(isActive(node.from) ? deco.markup.range(node.from, node.to) : hide.range(node.from, node.to))
            }
        }
      }
    })
  }
  return Decoration.set(out, true)
}

const livePreview = ViewPlugin.fromClass(class {
  decorations: DecorationSet
  constructor(v: EditorView) { this.decorations = buildDecorations(v) }
  update(u: ViewUpdate) {
    if (u.docChanged || u.viewportChanged || u.selectionSet || u.focusChanged ||
        syntaxTree(u.startState) !== syntaxTree(u.state)) {
      this.decorations = buildDecorations(u.view)
    }
  }
}, { decorations: p => p.decorations })

/* ── Editor ────────────────────────────────────────────────────────────── */
const External = Annotation.define<boolean>()
const vimSlot = new Compartment()

// Enter continues "- ", "* ", "1. " lists; Enter on an empty item ends the list (DZ-53).
const continueList = insertNewlineContinueMarkupCommand({ nonTightLists: false })
// Ctrl/Cmd+Enter is the app's Copy, so the editor must not claim it.
const baseKeys = defaultKeymap.filter(b => b.key !== 'Mod-Enter')

onMounted(() => {
  if (!import.meta.client || !host.value) return
  view = new EditorView({
    parent: host.value,
    state: EditorState.create({
      doc: props.modelValue ?? '',
      extensions: [
        vimSlot.of(props.vim ? vim() : []), // before other keymaps, as the Vim package requires
        history(),
        drawSelection(),
        markdown({ base: markdownLanguage, addKeymap: false }),
        Prec.high(keymap.of([
          { key: 'Enter', run: continueList },
          { key: 'Backspace', run: deleteMarkupBackward }
        ])),
        keymap.of([...baseKeys, ...historyKeymap]),
        EditorView.lineWrapping,
        EditorView.contentAttributes.of({ 'aria-label': roleKey.value + ' section body', spellcheck: 'true' }),
        livePreview,
        EditorView.updateListener.of((u) => {
          if (u.focusChanged) {
            focused.value = u.view.hasFocus
            if (focused.value) emit('focus')
            else emit('blur')
          }
          if (u.docChanged && !u.transactions.some(tr => tr.annotation(External))) {
            emit('update:modelValue', u.state.doc.toString())
          }
        })
      ]
    })
  })
})

watch(() => props.modelValue, (value) => {
  if (!view) return
  const next = value ?? ''
  const current = view.state.doc.toString()
  if (next === current) return
  view.dispatch({
    changes: { from: 0, to: current.length, insert: next },
    annotations: [External.of(true), Transaction.addToHistory.of(false)]
  })
})

watch(() => props.vim, (on) => {
  view?.dispatch({ effects: vimSlot.reconfigure(on ? vim() : []) })
})

onBeforeUnmount(() => {
  view?.destroy()
  view = null
})

defineExpose({
  focused,
  focus: () => view?.focus()
})
</script>

<template>
  <div
    :class="[$style.root, focused && $style.focused, vim && $style.vim]"
    :style="hueStyle"
    :data-role="roleKey"
    :data-focused="focused ? 'true' : undefined"
    data-section-editor
  >
    <div ref="host" :class="$style.host" />
  </div>
</template>

<style module src="./SectionEditor.module.css"></style>
