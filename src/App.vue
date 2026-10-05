<script setup>
import { onMounted, onBeforeUnmount } from 'vue'
import AppHeader from './components/AppHeader.vue'
import ItemSidebar from './components/ItemSidebar.vue'
import EditorPane from './components/EditorPane.vue'
import PreviewPanel from './components/PreviewPanel.vue'
import CheatModal from './components/CheatModal.vue'
import { state } from './store'
import { initBridge } from './bridge'

// global Esc closes modal
const onKey = e => { if (e.key === 'Escape' && state.cheatOpen) state.cheatOpen = false }
onMounted(() => { document.addEventListener('keydown', onKey); initBridge() })
onBeforeUnmount(() => document.removeEventListener('keydown', onKey))
</script>

<template>
  <AppHeader />
  <div id="layout">
    <ItemSidebar />
    <EditorPane />
    <PreviewPanel />
  </div>
  <CheatModal />
  <div id="toast" :class="{ show: state.toastShow }">{{ state.toast }}</div>
</template>
