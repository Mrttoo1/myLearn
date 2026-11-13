import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { lessonSourcesPlugin } from './lessonSourcesPlugin.ts'

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue(), lessonSourcesPlugin()],
  server: {
    host: '127.0.0.1',
    port: 5173,
    strictPort: true,
    // 浏览器请求同源的 /api，由 Vite 转发到后端；开发时无需放开后端 CORS。
    proxy: {
      '/api': { target: 'http://127.0.0.1:8000', changeOrigin: true },
    },
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
})
