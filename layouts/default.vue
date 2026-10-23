<template>
  <div class="h-screen w-screen flex flex-col overflow-hidden bg-bg text-text font-mono">
    <Navbar />

    <!-- Studio shell: sidebar | editor | preview -->
    <div class="flex-1 flex min-h-0 overflow-hidden bg-bg text-text font-mono text-xs select-none">
      <aside id="sidebar" class="w-72 flex-shrink-0 border-r border-border flex flex-col min-h-0 bg-surface/55">
        <slot name="sidebar" />
      </aside>

      <main id="editor" class="flex-1 min-w-0 overflow-y-auto p-4 pb-24 select-text relative">
        <slot />
      </main>

      <aside id="preview-pane" class="w-[38%] min-w-[340px] flex-shrink-0 border-l border-border flex flex-col min-h-0 bg-surface/55 select-text">
        <slot name="preview" />
      </aside>

      <TermBankModal />
    </div>
  </div>
</template>
