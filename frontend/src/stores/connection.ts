import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import { request } from '@/api/http'

export const useConnectionStore = defineStore('connection', () => {
  // 连接状态由页头和记录页面共同使用；表单内容留在页面本身。
  const status = ref<'checking' | 'online' | 'offline'>('checking')
  const error = ref('')
  const label = computed(() => {
    if (status.value === 'checking') return '正在检查连接'
    return status.value === 'online' ? '服务已连接' : '连接失败 · 点击重试'
  })

  async function check() {
    status.value = 'checking'
    error.value = ''
    try {
      await request<{ status: string; database: string }>('/health')
      status.value = 'online'
    } catch (cause) {
      status.value = 'offline'
      error.value = cause instanceof Error ? cause.message : '连接失败，请重试'
    }
  }

  return { status, error, label, check }
})
