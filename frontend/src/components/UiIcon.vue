<script setup lang="ts">
defineProps<{ name: string; size?: number }>()
const paths: Record<string, string> = {
  play: 'm8 5 11 7-11 7V5Z',
  pause: 'M8 5v14M16 5v14',
  next: 'm9 5 7 7-7 7',
  previous: 'm15 5-7 7 7 7',
  reset: 'M3 10a9 9 0 1 1 2 8M3 4v6h6',
  code: 'm8 7-5 5 5 5m8-10 5 5-5 5M14 4l-4 16',
  folder: 'M3 7V5h6l2 2h10v13H3V7Z',
  file: 'M6 3h8l4 4v14H6V3Zm8 0v5h4M9 12h6m-6 4h6',
  arrow: 'M4 12h16m-6-6 6 6-6 6',
  copy: 'M8 8h12v13H8V8Zm8-4V2H3v14h2',
  book: 'M3 4h7l2 2 2-2h7v16h-7l-2 2-2-2H3V4Zm9 2v16',
  menu: 'M4 6h16M4 12h16M4 18h16',
  close: 'm5 5 14 14M19 5 5 19',
  network: 'M8 5h8v5H8V5Zm-6 12h6v5H2v-5Zm14 0h6v5h-6v-5ZM12 10v4M5 17v-3h14v3',
  sequence: 'M5 3v18M19 3v18M5 8h14m-4-3 4 3-4 3M19 16H5m4-3-4 3 4 3',
}
</script>

<template>
  <svg
    :width="size || 18"
    :height="size || 18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="1.6"
    stroke-linecap="round"
    stroke-linejoin="round"
    aria-hidden="true"
  >
    <path :d="paths[name] || paths.file" />
  </svg>
</template>
