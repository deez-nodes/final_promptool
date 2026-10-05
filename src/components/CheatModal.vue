<script setup>
import { state } from '../store'
import { CHEAT } from '../templates'
</script>

<template>
  <div id="modal-bg" :class="{ show: state.cheatOpen }" @click.self="state.cheatOpen = false">
    <div id="modal">
      <button class="modal-close" @click="state.cheatOpen = false">esc</button>
      <h2>VIM CHEATSHEET</h2>
      <div class="sub">prompTOR implements the same modal subset as the Claude Code editor. Enter mode = Esc; not supported: macros, marks, :ex, registers, ctrl-v block.</div>
      <div class="cheat-grid">
        <template v-for="([a, b], i) in CHEAT" :key="i">
          <div v-if="a === 'grp'" class="grp">{{ b }}</div>
          <template v-else><div class="k">{{ a }}</div><div class="d">{{ b }}</div></template>
        </template>
      </div>
    </div>
  </div>
</template>
