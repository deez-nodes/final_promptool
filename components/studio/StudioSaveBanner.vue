<template>
  <div v-if="showFailure || showBackup" :class="$style.stack">
    <!-- Save failure: persistent until a write succeeds -->
    <div
      v-if="showFailure"
      id="save-failed-banner"
      role="alert"
      :class="[$style.banner, $style.failed]"
    >
      <strong :class="$style.label">Not saved</strong>
      <span :class="$style.text">
        {{ persist.error || 'Changes could not be written to browser storage.' }}
        Your work is still open in this window; closing it loses unsaved changes.
      </span>
    </div>

    <!-- Unreadable data was copied aside on load -->
    <div
      v-if="showBackup"
      id="backup-notice"
      role="status"
      :class="[$style.banner, $style.backup]"
    >
      <strong :class="$style.label">Backup taken</strong>
      <span :class="$style.text">
        Your saved workspace could not be loaded ({{ persist.backupReason }}). The original data was kept
        unchanged in localStorage under
        <code :class="$style.key">{{ persist.backupKey }}</code>.
        You are now in a fresh workspace.
      </span>
      <UButton :class="$style.btn" @click="dismissedBackup = true">
        Dismiss
      </UButton>
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

<style module src="./StudioSaveBanner.module.css"></style>
