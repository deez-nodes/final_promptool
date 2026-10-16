<script setup>
import { ref, computed, watch, nextTick } from 'vue'
import { state, active, copyPreview } from '../store'
import { previewHtml } from '../output'
import { bridge, chatSend } from '../bridge'

const html = computed(() => previewHtml(state.preview, active.value, state.fmt))
const thread = ref(null)
const draft = ref('')
const input = ref(null)

watch(() => bridge.msgs.length, () => nextTick(() => { if (thread.value) thread.value.scrollTop = thread.value.scrollHeight }))

function send() { chatSend(draft.value); draft.value = ''; input.value.style.height = 'auto' }
// Enter sends, Shift+Enter newline
function onKey(e) { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send() } }
function grow() { const ci = input.value; ci.style.height = 'auto'; ci.style.height = Math.min(120, ci.scrollHeight) + 'px' }
</script>

<template>
  <div id="preview-panel">
    <div id="preview-header">
      <div id="preview-tabs">
        <button class="ptab" :class="{ active: state.preview === 'prompt' }" @click="state.preview = 'prompt'">Prompt</button>
        <button class="ptab" :class="{ active: state.preview === 'eval' }" @click="state.preview = 'eval'">Eval Stub</button>
        <button v-if="bridge.enabled" class="ptab" :class="{ active: state.preview === 'chat' }" @click="state.preview = 'chat'">Chat</button>
      </div>
      <button class="ptab" style="color:var(--miku)" @click="copyPreview">Copy ⧉</button>
    </div>
    <div v-show="state.preview !== 'chat'" id="preview-text" v-html="html"></div>
    <div v-show="state.preview === 'chat'" id="chat-panel">
      <div id="chat-thread" ref="thread">
        <div v-for="(m, i) in bridge.msgs" :key="i" class="cmsg" :class="m.role">{{ m.text }}</div>
      </div>
      <div id="chat-inputrow">
        <textarea id="chat-input" ref="input" v-model="draft" rows="1" placeholder="message the session… (Enter to send)"
                  :disabled="!bridge.up" @keydown="onKey" @input="grow"></textarea>
        <button class="btn btn-primary" id="chat-send" :disabled="!bridge.up" @click="send">Send</button>
      </div>
    </div>
  </div>
</template>
