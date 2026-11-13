<script setup lang="ts">
import type { NodeId } from '@/lessons/content'
defineProps<{ kind: NodeId }>()
</script>

<template>
  <!-- 原创几何 SVG：固定线宽、纸色明暗面。图中的设备始终对应真实运行角色。 -->
  <svg
    viewBox="0 0 128 128"
    fill="none"
    stroke="currentColor"
    stroke-width="1.5"
    stroke-linejoin="round"
    stroke-linecap="round"
    aria-hidden="true"
  >
    <g v-if="kind === 'browser'">
      <path d="m22 20 73 17 9-5-73-17-9 5Z" fill="#eeece5" />
      <path d="m95 37 9-5v61l-9 5V37Z" fill="#d8d5cc" />
      <path d="m22 20 73 17v61L22 81V20Z" fill="#faf9f5" />
      <path d="m29 34 58 13v40L29 74V34Z" fill="#e8eee8" />
      <path d="m29 43 58 13M36 30l1 .2m5 1 1 .2m5 1 1 .2" />
      <path d="m44 55-6 4 6 7m20-7 6 7-6 4m-8-17-5 17" stroke="#648074" />
      <path d="m54 90 13 3v11l-13-3V90Zm-11 14 16-4 22 6-16 5-22-7Z" fill="#eeece5" />
    </g>
    <g v-else-if="kind === 'vite' || kind === 'terminal'">
      <path d="m21 28 71-17 17 12-71 17-17-12Z" fill="#eeece5" />
      <path d="m92 11 17 12v68L92 79V11Z" fill="#d8d5cc" />
      <path d="m21 28 71-17v68l-71 17V28Z" fill="#faf9f5" />
      <path d="m28 36 57-14v48L28 84V36Z" fill="#ede9e1" />
      <path d="m37 45 8 5-8 9m17-2 16-4" stroke="#a16c43" stroke-width="2" />
      <path d="m35 100 41-10 28 18-41 10-28-18Z" fill="#eeece5" />
      <path d="m35 100 28 18v5l-28-18v-5Zm28 18 41-10v5l-41 10v-5Z" fill="#dedbd1" />
      <path d="m47 101 28-7m-18 14 28-7" stroke="#a5a196" />
    </g>
    <g v-else-if="kind === 'api'">
      <g v-for="level in [0, 1, 2]" :key="level" :transform="`translate(0 ${level * 26})`">
        <path d="m19 28 47-16 43 20-47 16-43-20Z" fill="#f0eee7" />
        <path d="m19 28 43 20v20L19 48V28Z" fill="#e4e1d8" />
        <path d="m62 48 47-16v20L62 68V48Z" fill="#faf9f5" />
        <path d="m27 39 25 11m-25-5 25 11" stroke="#918d82" />
        <circle cx="99" cy="45" r="2" fill="#7b9983" stroke="none" />
        <path d="m71 54 14-5m-14 10 22-8" stroke="#aaa69b" />
      </g>
    </g>
    <g v-else>
      <path d="M22 31v65c0 10 19 18 42 18s42-8 42-18V31H22Z" fill="#e4e1d8" />
      <path d="M64 49v65c23 0 42-8 42-18V31L64 49Z" fill="#f4f2ec" stroke="none" />
      <ellipse cx="64" cy="31" rx="42" ry="18" fill="#faf9f5" />
      <ellipse cx="64" cy="31" rx="29" ry="10" stroke="#aaa69b" />
      <path
        d="M22 52c0 10 19 18 42 18s42-8 42-18M22 74c0 10 19 18 42 18s42-8 42-18M22 31v65c0 10 19 18 42 18s42-8 42-18V31"
      />
      <path d="m32 54 8 4m-8 18 8 4m-8 18 8 4" stroke="#8d897e" />
      <circle cx="94" cy="90" r="2.5" fill="#7b9983" stroke="none" />
    </g>
  </svg>
</template>
