declare module 'vue-sonner' {
  import type { App } from 'vue'
  
  interface ToastOptions {
    duration?: number
    position?: 'top-left' | 'top-center' | 'top-right' | 'bottom-left' | 'bottom-center' | 'bottom-right'
  }

  export const toast: {
    success: (message: string, options?: ToastOptions) => void
    error: (message: string, options?: ToastOptions) => void
    info: (message: string, options?: ToastOptions) => void
    warning: (message: string, options?: ToastOptions) => void
  }

  export function install(app: App): void
}
