import { createApp, h, ref } from 'vue'
import ConfirmDialog from '@/components/ConfirmDialog.vue'

type ConfirmOptions = {
  title?: string
  message: string
  confirmText?: string
  cancelText?: string
}

export const confirm = (options: ConfirmOptions): Promise<boolean> => {
  return new Promise((resolve) => {
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
        
        return () => h(ConfirmDialog, {
          show: visible.value,
          title: options.title || '确认操作',
          confirmText: options.confirmText || '确认',
          cancelText: options.cancelText || '取消',
          onConfirm: handleConfirm,
          onCancel: handleCancel
        }, {
          default: () => options.message
        })
      }
    })
    
    app.mount(container)
  })
}
