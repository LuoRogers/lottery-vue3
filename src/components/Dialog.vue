<script setup lang="ts">
defineProps<{
  show: boolean
  title?: string
  message: string
  type?: 'success' | 'error' | 'info' | 'warning'
  confirmText?: string
  cancelText?: string
}>()

const emit = defineEmits<{
  (e: 'confirm'): void
  (e: 'cancel'): void
}>()
</script>

<template>
  <div class="modal" :class="{ 'modal-open': show }">
    <div class="modal-box">
      <h3 class="font-bold text-lg">{{ title || '提示' }}</h3>
      <p class="py-4">{{ message }}</p>
      <div class="modal-action">
        <template v-if="type === 'info' || type === 'success'">
          <button class="btn btn-primary" @click="emit('confirm')">
            {{ confirmText || '确定' }}
          </button>
        </template>
        <template v-else>
          <button class="btn" @click="emit('cancel')">
            {{ cancelText || '取消' }}
          </button>
          <button class="btn btn-primary" @click="emit('confirm')">
            {{ confirmText || '确定' }}
          </button>
        </template>
      </div>
    </div>
  </div>
</template>
