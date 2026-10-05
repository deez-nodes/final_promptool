<script setup>
import { ref, computed, onMounted } from 'vue'
import { state, touch, addFile, removeFile } from '../store'
import { vim, setVimMode, onFieldKeydown, autoResize } from '../vim'
import { slug } from '../output'

const props = defineProps({ item: Object, field: Object, index: Number })
const ta = ref(null)
const fileDraft = ref('')

const tagName = computed(() => {
  const t = props.item.template
  return t.startsWith('pe_') || ['promptology', 'general', 'dev'].includes(t) ? slug(props.field.label) : null
})
const files = computed(() => props.item.files[props.field.key] || [])
const disp = fp => fp.startsWith(state.baseDir) ? fp.slice(state.baseDir.length).replace(/^\//, '') : fp

// push the textarea's value into the store (used by typing and by the vim engine)
function commit() {
  props.item.fields[props.field.key] = ta.value.value
  touch(props.item)
  autoResize(ta.value)
}
function onFocus() { if (vim.on) setVimMode('normal', props.field.key) }
function onFileKey(e) {
  if (e.key !== 'Enter' && e.key !== ',') return
  e.preventDefault()
  const raw = fileDraft.value.trim().replace(/,$/, '')
  if (raw) { addFile(props.field.key, raw); fileDraft.value = '' }
}
onMounted(() => autoResize(ta.value))
</script>

<template>
  <div class="field" :class="{
    'vim-normal': vim.fieldKey === field.key && vim.mode === 'normal',
    'vim-visual': vim.fieldKey === field.key && vim.mode === 'visual' }">
    <div class="field-head">
      <div class="field-num">{{ index + 1 }}</div>
      <div v-if="tagName" class="field-tag"><span class="ang">&lt;</span>{{ tagName }}<span class="ang">&gt;</span></div>
      <div class="field-name">{{ field.label }}</div>
      <div class="field-hint">{{ field.hint }}</div>
    </div>
    <div v-if="field.hasFiles" class="file-row">
      <div v-for="fp in files" :key="fp" class="file-pill">
        <span>{{ disp(fp) }}</span>
        <button class="file-pill-del" @click="removeFile(field.key, fp)">×</button>
      </div>
      <input v-model="fileDraft" class="file-add-input" placeholder="path/to/file  (Enter to add)"
             spellcheck="false" @keydown="onFileKey">
    </div>
    <textarea v-show="!field.hasFiles" ref="ta" class="field-ta" :data-key="field.key"
              :placeholder="field.placeholder || ''" :value="item.fields[field.key] || ''" spellcheck="false"
              @input="commit" @keydown="onFieldKeydown($event, ta, field.key, commit)" @focus="onFocus"></textarea>
  </div>
</template>
