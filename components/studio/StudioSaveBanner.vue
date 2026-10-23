<template>
  <div
    v-if="showFailure || showBackup"
    class="fixed bottom-3 left-1/2 -translate-x-1/2 z-50 w-[min(720px,calc(100vw-2rem))] flex flex-col gap-2 font-mono text-[11px]"
  >
    <!-- Save failure: persistent until a write succeeds -->
    <div
      v-if="showFailure"
      id="save-failed-banner"
      role="alert"
      class="flex items-center gap-3 px-3 py-2 rounded border border-pink bg-surface2 text-text shadow-glow-pink"
    >
      <span class="text-pink font-bold flex-shrink-0">Not saved</span>
      <span class="flex-1 min-w-0">
        {{ persist.error || 'Changes could not be written to browser storage.' }}
        Your work is still open here; export it to keep a copy.
      </span>
      <button
        @click="promptStore.downloadWorkspaceJson()"
        class="flex-shrink-0 px-2.5 py-1 bg-surface3 hover:bg-surface4 border border-acid/50 hover:border-acid text-acid rounded transition-colors font-bold"
      >
        Export workspace JSON
      </button>
    </div>

    <!-- Unreadable data was copied aside on load -->
    <div
      v-if="showBackup"
      id="backup-notice"
      role="status"
      class="flex items-center gap-3 px-3 py-2 rounded border border-amber bg-surface2 text-text"
    >
      <span class="text-amber font-bold flex-shrink-0">Backup taken</span>
      <span class="flex-1 min-w-0">
        Your saved workspace could not be loaded ({{ persist.backupReason }}). The original data was kept
        unchanged in localStorage under
        <code class="text-acid break-all">{{ persist.backupKey }}</code>.
        You are now in a fresh workspace.
      </span>
      <button
        @click="dismissedBackup = true"
        class="flex-shrink-0 px-2 py-1 bg-surface hover:bg-surface3 border border-border hover:border-text text-muted2 hover:text-text rounded transition-colors"
      >
        Dismiss
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
const promptStore = usePromptStore()
const persist = promptStore.persist
const dismissedBackup = ref(false)

const showFailure = computed(() => persist.value.status === 'failed')
const showBackup = computed(() => !!persist.value.backupKey && !dismissedBackup.value)
</script>
