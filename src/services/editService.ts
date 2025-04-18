import { createApp, h, ref } from 'vue'
import EditModal from '@/components/EditModal.vue'

type EditOptions<T> = {
  title?: string
  confirmText?: string
  cancelText?: string
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl' | 'full'
  formComponent: any
  formProps?: Record<string, any>
}

export const edit = <T>(options: EditOptions<T>, formData: T): Promise<T | null> => {
  return new Promise((resolve) => {
    const container = document.createElement('div')
    document.body.appendChild(container)
    
    const app = createApp({
      setup() {
        const visible = ref(true)
        const formModel = ref<T>(formData)
        
        const handleConfirm = () => {
          visible.value = false
          resolve(formModel.value)
          setTimeout(() => {
            app.unmount()
            document.body.removeChild(container)
          }, 300)
        }
        
        const handleCancel = () => {
          visible.value = false
          resolve(null)
          setTimeout(() => {
            app.unmount()
            document.body.removeChild(container)
          }, 300)
        }
        
        return () => h(EditModal, {
          show: visible.value,
          title: options.title || '编辑',
          confirmText: options.confirmText || '保存',
          cancelText: options.cancelText || '取消',
          maxWidth: options.maxWidth,
          onConfirm: handleConfirm,
          onCancel: handleCancel
        }, {
          default: () => h(options.formComponent, {
            modelValue: formModel.value,
            'onUpdate:modelValue': (value: T) => formModel.value = value,
            ...options.formProps
          })
        })
      }
    })
    
    app.mount(container)
  })
}
