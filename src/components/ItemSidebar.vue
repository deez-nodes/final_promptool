<script setup>
import { state, sidebarItems, newItem, loadItem, deleteItem } from '../store'
import { TEMPLATES } from '../templates'

const fmtDate = item => new Date(item.updated || item.created)
  .toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })

function badge(item) {
  const td = TEMPLATES[item.template] || {}
  if (td.isTask) return {
    cls: item.status === 'done' ? 'badge-done' : item.status === 'blocked' ? 'badge-blocked' : 'badge-task',
    label: item.status || 'ready',
  }
  return {
    cls: item.template && item.template.startsWith('pe_') ? 'badge-pe' : 'badge-prompt',
    label: (td.label || 'prompt').replace('PE — ', ''),
  }
}
</script>

<template>
  <div id="sidebar">
    <div id="sidebar-section">
      <span id="sidebar-label">{{ state.mode === 'task' ? 'tasks' : 'prompts' }}</span>
      <span id="item-count">{{ sidebarItems.length }}</span>
    </div>
    <div id="item-list">
      <div v-for="item in sidebarItems" :key="item.id" class="list-item"
           :class="{ active: item.id === state.activeId }" @click="loadItem(item.id)">
        <div class="item-title">{{ item.name || 'Untitled' }}</div>
        <div class="item-meta">
          <span class="item-badge" :class="badge(item).cls">{{ badge(item).label }}</span>
          <span class="item-date">{{ fmtDate(item) }}</span>
        </div>
        <button class="item-del" @click.stop="deleteItem(item.id)">×</button>
      </div>
    </div>
    <button id="new-btn" @click="newItem">+ New</button>
  </div>
</template>
