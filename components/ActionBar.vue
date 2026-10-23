<template>
  <!-- Fixed action bar: these six and no more (DECIDED.md Layout "remove or merge controls before adding any"). -->
  <nav id="action-bar" :class="$style.bar" aria-label="Actions">
    <UButton :class="$style.btn" :title="'New prompt (' + k.newPrompt + ')'" @click="store.startMessage('prompt')">
      New prompt <kbd :class="$style.kbd">{{ k.newPrompt }}</kbd>
    </UButton>
    <UButton :class="$style.btn" :title="'New reply (' + k.newReply + ')'" @click="store.startMessage('reply')">
      New reply <kbd :class="$style.kbd">{{ k.newReply }}</kbd>
    </UButton>

    <!-- Copy is the one primary action: the current message as XML, straight to the clipboard. -->
    <UButton
      id="copy-button"
      :class="[$style.btn, $style.primary]"
      :title="'Copy the message to the clipboard (' + k.copy + '). The XML is not shown.'"
      @click="store.copy()"
    >
      Copy <kbd :class="[$style.kbd, $style.kbdPrimary]">{{ k.copy }}</kbd>
    </UButton>

    <UButton
      :class="$style.btn"
      :disabled="!store.canUndo.value"
      :title="undoTitle"
      @click="store.undo()"
    >
      Undo <kbd :class="$style.kbd">{{ k.undo }}</kbd>
    </UButton>

    <UButton
      :class="[$style.btn, vimOn && $style.on]"
      :aria-pressed="vimOn"
      :title="'Vim keys ' + (vimOn ? 'on' : 'off') + ' (' + k.vim + ')'"
      @click="toggleVim"
    >
      Vim {{ vimOn ? 'on' : 'off' }} <kbd :class="$style.kbd">{{ k.vim }}</kbd>
    </UButton>

    <UButton :class="$style.btn" :title="'Next theme (' + k.theme + ')'" @click="cycleTheme">
      Theme: {{ theme }} <kbd :class="$style.kbd">{{ k.theme }}</kbd>
    </UButton>

    <span id="action-notice" :class="$style.notice" role="status" aria-live="polite">{{ store.notice.value }}</span>

    <KeysOverlay />
  </nav>
</template>

<script setup lang="ts">
const store = useWorkspace()
const { theme, cycleTheme } = useTheme()
const { enabled: vimOn, toggle: toggleVim, bindHotkey } = useVim()

bindHotkey()
bindShortcuts()

const k = {
  newPrompt: keysOf('newPrompt'),
  newReply: keysOf('newReply'),
  copy: keysOf('copy'),
  undo: keysOf('undo'),
  vim: keysOf('vim'),
  theme: keysOf('theme')
}

const undoTitle = computed(() => {
  const next = store.nextUndo.value
  return next ? 'Undo: ' + next + ' (' + k.undo + ')' : 'Nothing to undo (' + k.undo + ')'
})
</script>

<style module src="./ActionBar.module.css"></style>
