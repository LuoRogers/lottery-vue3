 <template>
  <dialog :open="show" class="modal">
    <div class="modal-box">
      <h3 class="font-bold text-lg">{{ title }}</h3>
      <p class="py-4"><slot></slot></p>
      <div class="modal-action">
        <button class="btn" @click="handleCancel">{{ cancelText }}</button>
        <button class="btn btn-primary" @click="handleConfirm">{{ confirmText }}</button>
      </div>
    </div>
  </dialog>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const props = defineProps({
  show: {
    type: Boolean,
    required: true
  },
  title: {
    type: String,
    default: '确认操作'
  },
  confirmText: {
    type: String,
    default: '确认'
  },
  cancelText: {
    type: String,
    default: '取消'
  }
})

const emit = defineEmits(['confirm', 'cancel'])

const resolvePromise = ref<Function | null>(null)
const rejectPromise = ref<Function | null>(null)

const handleConfirm = () => {
  emit('confirm')
  resolvePromise.value?.(true)
  reset()
}

const handleCancel = () => {
  emit('cancel')
  rejectPromise.value?.(false)
  reset()
}

const reset = () => {
  resolvePromise.value = null
  rejectPromise.value = null
}

const confirm = (options: {
  title?: string
  message: string
  confirmText?: string
  cancelText?: string
}) => {
  return new Promise<boolean>((resolve, reject) => {
    resolvePromise.value = resolve
    rejectPromise.value = reject
    // 更新 props 以显示对话框
    Object.assign(props, {
      title: options.title || '确认操作',
      confirmText: options.confirmText || '确认',
      cancelText: options.cancelText || '取消',
      show: true
    })
    // 设置插槽内容
    return {
      message: options.message,
      show: true
    }
  })
}

const showDialog = confirm // 别名方法

defineExpose({
  confirm,
  show: showDialog
})
</script>
