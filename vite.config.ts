import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import electron from 'vite-plugin-electron'
import path from 'path'
import AutoImport from 'unplugin-auto-import/vite'

// https://vite.dev/config/
export default defineConfig({
  base: '/lottery-vue3/',
  plugins: [
    vue(),
    // electron({
    //   entry: 'electron/main.ts',
    // }),
    AutoImport({
      imports: [
        'vue',
        'pinia',
      ],
      dts: true,
    }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  },
  build: {
    outDir: 'dist',
    assetsDir: './',
    emptyOutDir: true,
    minify: 'terser',
    sourcemap: false,
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      external: ['vue-router'],
      output: {
        manualChunks: {
          vue: ['vue', 'pinia', 'vue-router'],
          ui: ['daisyui', 'tailwindcss'],
        }
      }
    },
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
      },
    },
  }
})
