<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import TechnicalDevice from './TechnicalDevice.vue'
import {
  actors,
  connectionKey,
  messageKind,
  messagePoint,
  messageRoute,
  messageTrack,
  positions,
  topologyLinks,
  visibleActors,
} from '@/lessons/flow'
import type { LessonStep, NodeId } from '@/lessons/content'
import type { Point } from '@/lessons/flow'

const props = defineProps<{
  step: LessonStep
  steps: LessonStep[]
  index: number
  progress: number
  moving: boolean
  playing: boolean
  paused: boolean
  mode: string
  selectedIndex: number | null
}>()
const emit = defineEmits<{ inspect: [index: number] }>()
const small = ref(false)
const reduced = ref(false)
const diagramContainer = ref<HTMLElement | null>(null)
const renderedWidth = ref(800)
const sequenceScroller = ref<HTMLElement | null>(null)
let resizeObserver: ResizeObserver | undefined
const mobileQuery = window.matchMedia('(max-width: 700px)')
const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
function updateMedia() {
  small.value = mobileQuery.matches
  reduced.value = motionQuery.matches
}
onMounted(() => {
  updateMedia()
  mobileQuery.addEventListener('change', updateMedia)
  motionQuery.addEventListener('change', updateMedia)
  resizeObserver = new ResizeObserver(([entry]) => {
    if (entry) renderedWidth.value = entry.contentRect.width
  })
  if (diagramContainer.value) resizeObserver.observe(diagramContainer.value)
})
onBeforeUnmount(() => {
  mobileQuery.removeEventListener('change', updateMedia)
  motionQuery.removeEventListener('change', updateMedia)
  resizeObserver?.disconnect()
})

const ids = computed(() => visibleActors(props.steps))
const points = computed(() => positions(ids.value, small.value))
const startup = computed(() => ids.value.includes('terminal'))
const width = computed(() => (small.value ? 800 : 1000))
const height = computed(() =>
  small.value ? (startup.value ? 740 : 660) : startup.value ? 600 : 480,
)
// SVG 会随中栏缩小；补偿文字字号，避免在笔记本和手机上变成难读的小字。
const textScale = computed(() => Math.max(1, Math.min(2.4, width.value / renderedWidth.value)))
// 浮框使用独立比例，让文字在大屏和手机上都保持约 12px，不随插图一起放大。
const popupScale = computed(() => width.value / Math.max(1, renderedWidth.value))
const kind = computed(() => messageKind(props.step))
const route = computed(() => messageRoute(props.step))
const viaProxy = computed(
  () => route.value.includes('vite') && props.step.from !== 'vite' && props.step.to !== 'vite',
)
const color = computed(
  () =>
    ({
      error: '#ab4a35',
      command: '#87653f',
      local: '#737566',
      sql: '#7b6841',
      response: '#6b728d',
      request: '#466e5b',
    })[kind.value],
)
function point(id: NodeId) {
  return points.value[id] || { x: width.value / 2, y: height.value / 2 }
}
const activeTracks = computed(() =>
  route.value
    .slice(1)
    .map((to, index) => messageTrack(point(route.value[index]!), point(to), small.value)),
)
const activeKeys = computed(() =>
  route.value.slice(1).map((to, index) => connectionKey(route.value[index]!, to)),
)
const links = computed(() => topologyLinks(props.steps, props.index))
function line(track: Point[]) {
  return track.map((point, index) => `${index ? 'L' : 'M'}${point.x} ${point.y}`).join(' ')
}
const packet = computed(() => {
  const tracks = activeTracks.value
  if (!tracks.length) return point(props.step.to)
  // 代理的入站与出站各走一段连线，不把连接线画穿 Vite 设备。
  const value = (reduced.value ? 1 : props.progress) * tracks.length
  const part = Math.min(Math.floor(value), tracks.length - 1)
  return messagePoint(tracks[part]!, Math.min(1, value - part))
})
const packetWidth = computed(() => {
  const textWidth = Array.from(props.step.method).reduce(
    (sum, character) => sum + (character.charCodeAt(0) < 128 ? 7.2 : 12),
    0,
  )
  return Math.min(width.value - 32, (textWidth + 32) * popupScale.value)
})
// 浮框始终保留。桌面随消息移动，放在线上方；本地动作放在对应模块上方。
// 手机使用图内下方的留白，避免浮框挡住紧凑排列的模块。
const packetLabel = computed(() => ({
  x: Math.max(
    packetWidth.value / 2 + 16,
    Math.min(width.value - packetWidth.value / 2 - 16, packet.value.x),
  ),
  y: Math.max(
    13 * popupScale.value + 12,
    small.value
      ? height.value - 24 * popupScale.value
      : props.step.from === props.step.to
        ? packet.value.y - 98
        : packet.value.y - 50 * popupScale.value,
  ),
}))
const zones = computed(() => {
  // 按运行环境分组；浏览器和 Vite 共用边界，小插图在画布内固定分布。
  const groups: { id: string; label: string; members: NodeId[] }[] = [
    { id: 'frontend', label: '本机前端', members: ['browser', 'vite'] },
    { id: 'api', label: 'Python 后端', members: ['api'] },
    { id: 'database', label: '数据库服务', members: ['database'] },
  ]
  if (startup.value) groups.push({ id: 'terminal', label: '启动命令', members: ['terminal'] })
  return groups.map((group) => {
    const members = group.members.map(point)
    const padding = small.value ? 125 : 105
    const left = Math.min(...members.map((p) => p.x)) - padding
    const right = Math.max(...members.map((p) => p.x)) + padding
    const top = Math.min(...members.map((p) => p.y)) - 65
    return { ...group, x: left, y: top, w: right - left, h: 170 }
  })
})
function address(id: NodeId) {
  if (!startup.value || id === 'browser' || id === 'terminal') return actors[id].address
  const completed = props.steps.slice(0, props.index + (props.moving ? 0 : 1))
  if (completed.some((step) => step.from === 'terminal' && step.to === id))
    return actors[id].address
  return props.moving && props.step.to === id ? '正在执行命令' : '尚未启动'
}
const status = computed(() =>
  props.paused
    ? '已暂停'
    : props.step.from === props.step.to
      ? props.moving
        ? '本地处理中'
        : '本地处理'
      : props.moving
        ? props.playing
          ? '正在传递'
          : '单步传递中'
        : '已到达',
)

// 时序图展示完整消息历史；查看旧消息不会改变播放位置。
const sequenceIds = computed(() => Array.from(new Set(props.steps.flatMap(messageRoute))))
const sequenceWidth = computed(() => Math.max(600, sequenceIds.value.length * 185))
const sequenceHeight = computed(() => 108 + props.steps.length * 60)
function lane(id: NodeId) {
  return ((sequenceIds.value.indexOf(id) + 0.5) * sequenceWidth.value) / sequenceIds.value.length
}
function rowPath(item: LessonStep, row: number) {
  const a = lane(item.from),
    b = lane(item.to),
    y = 120 + row * 60
  return a === b ? `M${a} ${y - 8}h42v22h-42` : `M${a} ${y}H${b}`
}
watch([() => props.index, () => props.mode], async () => {
  await nextTick()
  const box = sequenceScroller.value
  if (box && props.mode === 'sequence') {
    const y = 120 + props.index * 60
    if (y > box.scrollTop + box.clientHeight - 50 || y < box.scrollTop + 80)
      box.scrollTo({ top: Math.max(0, y - 140), behavior: reduced.value ? 'auto' : 'smooth' })
  }
})
</script>

<template>
  <div
    ref="diagramContainer"
    class="flow-illustration message-diagram"
    :class="{ 'is-error': step.error }"
    :style="{ '--diagram-text-scale': textScale, '--popup-scale': popupScale }"
  >
    <svg
      v-if="mode === 'network'"
      class="network-canvas"
      :viewBox="`0 0 ${width} ${height}`"
      role="group"
      aria-label="完整系统拓扑，全部模块始终显示，当前消息沿连线移动"
      :data-progress="progress.toFixed(3)"
    >
      <defs>
        <pattern id="lesson-dots" width="20" height="20" patternUnits="userSpaceOnUse">
          <circle cx="1" cy="1" r="0.7" fill="#d4d0c6" />
        </pattern>
        <marker
          id="flow-arrow"
          viewBox="0 0 10 10"
          refX="9"
          refY="5"
          markerWidth="6"
          markerHeight="6"
          orient="auto"
        >
          <path d="M1 1 9 5 1 9" fill="none" stroke="context-stroke" stroke-width="1.5" />
        </marker>
      </defs>
      <rect width="100%" height="100%" fill="url(#lesson-dots)" />
      <g v-for="zone in zones" :key="zone.id" class="execution-zone" :class="zone.id">
        <rect :x="zone.x" :y="zone.y" :width="zone.w" :height="zone.h" rx="12" />
        <text :x="zone.x + 14" :y="zone.y + 23">{{ zone.label }}</text>
      </g>
      <path
        v-for="link in links"
        :key="link.key"
        :d="line(messageTrack(point(link.from), point(link.to), small))"
        class="topology-wire"
        :class="{ used: link.used, active: activeKeys.includes(link.key) }"
        :data-connection="link.key"
      />
      <g v-for="(track, trackIndex) in activeTracks" :key="trackIndex">
        <path :d="line(track)" class="message-wire" :stroke="color" marker-end="url(#flow-arrow)" />
        <path
          :d="line(track)"
          class="message-trail"
          :stroke="color"
          pathLength="1"
          stroke-dasharray="1"
          :stroke-dashoffset="
            reduced ? 0 : 1 - Math.max(0, Math.min(1, progress * activeTracks.length - trackIndex))
          "
        />
      </g>
      <path
        v-if="!small && activeTracks.length"
        :d="`M${packet.x} ${packet.y}L${packetLabel.x} ${packetLabel.y + 13 * popupScale}`"
        class="message-leader"
        :stroke="color"
      />
      <g
        v-for="id in ids"
        :key="id"
        class="flow-actor"
        :class="{
          sender: step.from === id,
          receiver: step.to === id,
          involved: route.includes(id),
        }"
        :data-actor="id"
      >
        <ellipse :cx="point(id).x" :cy="point(id).y + 29" rx="44" ry="10" class="actor-ground" />
        <ellipse
          v-if="step.from === id && step.to === id"
          :cx="point(id).x"
          :cy="point(id).y - 8"
          rx="54"
          ry="46"
          class="local-processing"
        />
        <TechnicalDevice
          :kind="id"
          :x="point(id).x - 44"
          :y="point(id).y - 50"
          width="88"
          height="88"
        />
        <text :x="point(id).x" :y="point(id).y + 61" text-anchor="middle" class="device-name">
          {{ actors[id].name }}
        </text>
        <text :x="point(id).x" :y="point(id).y + 92" text-anchor="middle" class="device-port">
          {{ address(id) }}
        </text>
        <circle
          v-if="step.to === id"
          :cx="point(id).x + 52"
          :cy="point(id).y - 44"
          r="4"
          :fill="color"
        />
      </g>
      <circle
        v-if="activeTracks.length"
        class="message-position"
        :cx="packet.x"
        :cy="packet.y"
        r="6"
        :fill="color"
      />
      <g
        class="flow-packet named-packet"
        :class="{ arrived: !moving }"
        :transform="`translate(${packetLabel.x} ${packetLabel.y})`"
        role="button"
        tabindex="0"
        :aria-label="`查看动作：${step.method}`"
        @click="emit('inspect', index)"
        @keydown.enter="emit('inspect', index)"
        @keydown.space.prevent="emit('inspect', index)"
      >
        <rect
          :x="-packetWidth / 2"
          :y="-13 * popupScale"
          :width="packetWidth"
          :height="26 * popupScale"
          :rx="13 * popupScale"
          :stroke="color"
        />
        <circle
          :cx="-packetWidth / 2 + 12 * popupScale"
          cy="0"
          :r="3.3 * popupScale"
          :fill="color"
        />
        <text :x="6 * popupScale" :y="4 * popupScale" text-anchor="middle" :fill="color">
          {{ step.method }}
        </text>
      </g>
    </svg>
    <div
      v-else
      ref="sequenceScroller"
      class="sequence-scroller"
      tabindex="0"
      aria-label="可滚动的完整时序消息"
    >
      <svg
        class="sequence-history"
        :viewBox="`0 0 ${sequenceWidth} ${sequenceHeight}`"
        :style="{ minWidth: `${sequenceWidth}px` }"
        role="group"
        aria-label="完整时序图，点击消息查看详情"
      >
        <defs>
          <marker
            id="sequence-arrowhead"
            viewBox="0 0 10 10"
            refX="9"
            refY="5"
            markerWidth="6"
            markerHeight="6"
            orient="auto"
          >
            <path d="M1 1 9 5 1 9" fill="none" stroke="context-stroke" />
          </marker>
        </defs>
        <g v-for="id in sequenceIds" :key="id">
          <text :x="lane(id)" y="36" text-anchor="middle" class="device-name">
            {{ actors[id].name }}
          </text>
          <text :x="lane(id)" y="59" text-anchor="middle" class="device-role">
            {{ actors[id].role }}
          </text>
          <path :d="`M${lane(id)} 80V${sequenceHeight}`" class="sequence-lifeline" />
        </g>
        <g
          v-for="(item, row) in steps"
          :key="item.title"
          class="sequence-message"
          :class="{
            future: row > index,
            current: row === index,
            selected: row === selectedIndex,
            failure: item.error,
          }"
          role="button"
          tabindex="0"
          :aria-label="`查看第 ${row + 1} 条消息：${item.method}`"
          @click="emit('inspect', row)"
          @keydown.enter="emit('inspect', row)"
          @keydown.space.prevent="emit('inspect', row)"
        >
          <rect x="2" :y="91 + row * 60" :width="sequenceWidth - 4" height="56" rx="5" />
          <path :d="rowPath(item, row)" fill="none" marker-end="url(#sequence-arrowhead)" />
          <text :x="(lane(item.from) + lane(item.to)) / 2" :y="109 + row * 60" text-anchor="middle">
            {{ item.method }}
          </text>
          <text x="8" :y="125 + row * 60" class="sequence-number">{{ row + 1 }}</text>
        </g>
      </svg>
    </div>
    <div v-if="mode === 'sequence'" class="current-message" aria-label="当前调用或消息">
      <span>当前消息</span><code>{{ step.method }}</code>
    </div>
    <div class="flow-legend">
      <span class="flow-state" :style="{ color }"
        ><i class="legend-dot" :style="{ background: color }"></i>{{ status }} ·
        {{ actors[step.from].name }}<span aria-hidden="true">→</span
        >{{ actors[step.to].name }}</span
      ><span>{{ viaProxy ? '经 Vite 开发代理 · ' : '' }}演示消息 · 可点击查看</span>
    </div>
  </div>
</template>
