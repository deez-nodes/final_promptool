<script setup>
import { state, setMode } from '../store'
import { bridge, setBridge } from '../bridge'
</script>

<template>
  <div id="header">
    <div id="logo">promp<b>TOR</b><span>// rich prompt editor</span></div>
    <div id="mode-tabs">
      <button class="mode-tab" :class="{ active: state.mode === 'prompt' }" @click="setMode('prompt')">Prompts</button>
      <button class="mode-tab" :class="{ active: state.mode === 'task' }" @click="setMode('task')">Tasks</button>
    </div>
    <div id="header-spacer"></div>
    <div class="seg" title="Bridge — optional live LLM session (Optimize, Run, Chat). Not needed for editing.">
      <button :class="{ on: bridge.enabled }" @click="setBridge(true)">BRIDGE</button>
      <button :class="{ on: !bridge.enabled }" @click="setBridge(false)">OFF</button>
    </div>
    <div id="basedir-wrap">
      <span id="basedir-label">base dir</span>
      <input id="basedir-input" v-model="state.baseDir" type="text" placeholder="~/Projects/..." spellcheck="false">
    </div>
  </div>
</template>
