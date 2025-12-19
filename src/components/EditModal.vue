<template>
<dialog id="edit-modal" class="modal fixed inset-0 z-50" ref="modal">
  <div class="modal-box relative z-50" :class="maxWidthClass">
      <h3 class="font-bold text-lg">{{ title }}</h3>
      <div class="py-4">
        <slot></slot>
      </div>
      <div class="modal-action">
        <slot name="actions">
          <button class="btn" @click="onCancel">{{ cancelText }}</button>
          <button class="btn btn-primary" @click="onConfirm">{{ confirmText }}</button>
        </slot>
      </div>
    </div>
  </dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick } from 'vue'

const props = withDefaults(defineProps<{
  title?: string
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl' | 'full'
  confirmText?: string
  cancelText?: string
  show?: boolean
}>(), {
  title: '编辑',
  show: false
})

const emit = defineEmits<{
  (e: 'confirm'): void
  (e: 'cancel'): void
}>()

const maxWidthClass = computed(() => {
  if (!props.maxWidth) return ''
  return `max-w-${props.maxWidth}`
})

const confirmText = props.confirmText || '确认'
const cancelText = props.cancelText || '取消'

const modal = ref<HTMLDialogElement>()

watch(() => props.show, async (newVal) => {
  if (newVal) {
    // Ensure the component is fully mounted and modal ref is available
    await nextTick()
    modal.value?.showModal()
  } else {
    modal.value?.close()
  }
}, { immediate: true })

const show = () => {
  modal.value?.showModal()
}

const hide = () => {
  modal.value?.close()
}

const onConfirm = () => {
  emit('confirm')
  hide()
}

const onCancel = () => {
  emit('cancel')
  hide()
}

defineExpose({
  show,
  hide
})
</script>
