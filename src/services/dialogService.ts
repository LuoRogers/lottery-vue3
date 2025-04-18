import { createApp, h, ref } from 'vue'
import Dialog from '@/components/Dialog.vue'

type DialogOptions = {
  title?: string
  message: string
  type?: 'success' | 'error' | 'info' | 'warning'
  confirmText?: string
  cancelText?: string
}

export const useDialog = () => {
  const showDialog = (options: DialogOptions) => {
    return new Promise<boolean>((resolve) => {
      const container = document.createElement('div')
      document.body.appendChild(container)
      
      const app = createApp({
        setup() {
          const visible = ref(true)
          
          const handleConfirm = () => {
            visible.value = false
            resolve(true)
            setTimeout(() => {
              app.unmount()
              document.body.removeChild(container)
            }, 300)
          }
          
          const handleCancel = () => {
            visible.value = false
            resolve(false)
            setTimeout(() => {
              app.unmount()
              document.body.removeChild(container)
            }, 300)
          }
          
          return () => h(Dialog, {
            show: visible.value,
            title: options.title,
            message: options.message,
            type: options.type,
            confirmText: options.confirmText,
            cancelText: options.cancelText,
            onConfirm: handleConfirm,
            onCancel: handleCancel
          })
        }
      })
      
      app.mount(container)
    })
  }

  return {
    showDialog
  }
}
