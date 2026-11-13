<script setup lang="ts">
import { onMounted } from 'vue'
import { RouterLink, RouterView } from 'vue-router'
import { useConnectionStore } from '@/stores/connection'
import UiIcon from '@/components/UiIcon.vue'

const connection = useConnectionStore()
onMounted(() => connection.check())
</script>

<template>
  <div class="application">
    <a class="skip-link" href="#main-content">跳到主要内容</a>
    <header class="app-header">
      <RouterLink class="app-brand" to="/" aria-label="前后端图解首页">
        <svg viewBox="0 0 32 32" fill="none" aria-hidden="true">
          <path d="M5 5h10a5 5 0 0 1 5 5v18a7 7 0 0 0-5-2H5V5Z" />
          <path d="M20 10a5 5 0 0 1 5-5h3v21h-3a7 7 0 0 0-5 2M9 11h6M9 16h6" />
        </svg>
        前后端图解
      </RouterLink>
      <nav class="app-navigation" aria-label="主导航">
        <RouterLink to="/" exact-active-class="active"
          ><UiIcon name="network" :size="15" />交互课程</RouterLink
        ><RouterLink to="/notes" active-class="active"
          ><UiIcon name="file" :size="15" />学习记录</RouterLink
        >
      </nav>
      <button
        class="connection-status"
        :class="connection.status"
        :disabled="connection.status === 'checking'"
        :title="connection.error || '点击重新检查服务连接'"
        :aria-label="connection.label"
        @click="connection.check()"
      >
        <span class="status-dot" aria-hidden="true"></span>
        <span class="connection-label">{{ connection.label }}</span>
      </button>
    </header>
    <RouterView />
  </div>
</template>
