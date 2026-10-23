<template>
  <div id="studio-shell" :class="$style.shell">
    <Navbar />

    <!-- Studio shell: sidebar | editor | board. No preview pane: output stays hidden until asked for. -->
    <div :class="$style.body">
      <aside id="sidebar" :class="$style.sidebar">
        <slot name="sidebar" />
      </aside>

      <main id="editor" :class="$style.editor">
        <slot />
      </main>

      <aside id="board-pane" :class="$style.board">
        <slot name="board" />
      </aside>

      <TermBankModal />
    </div>
  </div>
</template>

<style module src="./default.module.css"></style>
