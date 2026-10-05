<script setup>
import PromptField from './PromptField.vue'
import { state, active, activeTpl, touch, newItem, changeTemplate, toggleBlock, copyPreview, saveMd } from '../store'
import { TEMPLATES, TEMPLATE_GROUPS, BLOCKS } from '../templates'
import { vim, vimBadge, vimHint, setVim } from '../vim'
import { bridge, optimizeViaBridge, runViaBridge, onRunCfgChange } from '../bridge'
</script>

<template>
  <div id="main">
    <template v-if="active">
      <div id="topbar">
        <input id="name-input" v-model="active.name" type="text" placeholder="Untitled" maxlength="80" @input="touch(active)">
        <select id="template-select" :value="active.template" @change="changeTemplate($event.target.value)">
          <optgroup v-for="g in TEMPLATE_GROUPS" :key="g.label" :label="g.label">
            <option v-for="k in g.keys" :key="k" :value="k">{{ TEMPLATES[k].label }}</option>
          </optgroup>
        </select>
        <select v-show="activeTpl.isTask" id="status-select" v-model="active.status" @change="touch(active)">
          <option value="ready">● Ready</option><option value="in_progress">◎ In Progress</option>
          <option value="done">✓ Done</option><option value="blocked">✗ Blocked</option>
        </select>
      </div>

      <div id="fields-wrap">
        <PromptField v-for="(f, i) in activeTpl.fields" :key="active.id + ':' + active.template + ':' + f.key"
                     :item="active" :field="f" :index="i" />
        <div v-if="activeTpl.blockOptions && activeTpl.blockOptions.length" class="field blocks-field">
          <div class="field-head">
            <div class="field-num">✓</div><div class="field-name">Best-Practice Blocks</div>
            <div class="field-hint">click to include canned rules</div>
          </div>
          <div id="blocks-row">
            <div v-for="key in activeTpl.blockOptions.filter(k => BLOCKS[k])" :key="key" class="block-toggle"
                 :class="{ on: (active.blocks || []).includes(key) }" :title="BLOCKS[key].text" @click="toggleBlock(key)">
              <span class="bt-box">{{ (active.blocks || []).includes(key) ? '✓' : '' }}</span><span>{{ BLOCKS[key].label }}</span>
            </div>
          </div>
        </div>
      </div>

      <div id="actions">
        <button class="btn btn-primary" @click="copyPreview">Copy</button>
        <button class="btn btn-secondary" @click="saveMd">Save</button>
        <button class="btn btn-secondary" id="btn-optimize" title="Optimize this draft in the live session"
                :disabled="!bridge.up" @click="optimizeViaBridge">✦ Optimize</button>
        <button class="btn btn-secondary" id="btn-run" title="Run this draft in the live session"
                :disabled="!bridge.up" @click="runViaBridge">▶ Run</button>
        <select id="run-select-model" v-model="bridge.model" title="Engine model (restarts session)"
                :disabled="!bridge.up" @change="onRunCfgChange">
          <option value="sonnet">sonnet</option><option value="opus">opus</option><option value="fable">fable</option>
        </select>
        <select id="run-select-effort" v-model="bridge.effort" title="Engine effort (restarts session)"
                :disabled="!bridge.up" @change="onRunCfgChange">
          <option value="low">low</option><option value="medium">medium</option><option value="high">high</option>
        </select>
        <span id="bridge-dot" :class="{ up: bridge.up }"
              :title="bridge.up ? 'Bridge online — live session' : 'Bridge offline — open via bridge.js to run'">●</span>
        <div class="seg acid" id="fmt-seg" title="Context wrapping — how sections are wrapped for copy/paste">
          <button :class="{ on: state.fmt === 'xml' }" @click="state.fmt = 'xml'">&lt;XML&gt;</button>
          <button :class="{ on: state.fmt === 'md' }" @click="state.fmt = 'md'">MD</button>
        </div>
        <div class="seg" id="vim-seg" title="Vim editing (toggle)">
          <button :class="{ on: vim.on }" @click="setVim(true)">VIM</button>
          <button :class="{ on: !vim.on }" @click="setVim(false)">OFF</button>
        </div>
        <div id="vim-hud">
          <span id="vim-mode" :class="vimBadge[0]">{{ vimBadge[1] }}</span>
          <span id="vim-hint" v-html="vimHint"></span>
          <button id="vim-help-btn" title="Vim cheatsheet" @click="state.cheatOpen = !state.cheatOpen">?</button>
        </div>
      </div>
    </template>

    <div v-else id="empty">
      <div id="empty-glyph">⌖</div>
      <p style="font-size:12px">No prompt selected</p>
      <button class="btn btn-secondary" @click="newItem">+ New</button>
    </div>
  </div>
</template>
