<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, ref, watch } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'
import sources from 'virtual:lesson-sources'
import FlowDiagram from '@/components/FlowDiagram.vue'
import RequestLab from '@/components/RequestLab.vue'
import UiIcon from '@/components/UiIcon.vue'
import { defaultLesson, errorLesson, errorScenarios, lessons } from '@/lessons/content'
import { useLessonPlayer } from '@/composables/useLessonPlayer'
import { actors } from '@/lessons/flow'
import '@/lesson.css'
import '@/flow-interaction.css'

const route = useRoute()
const router = useRouter()
const scenario = ref('validation')
const lesson = computed(() =>
  route.query.lesson === 'errors'
    ? errorLesson(scenario.value)
    : lessons.find((item) => item.id === route.query.lesson) || defaultLesson,
)
const {
  index,
  progress,
  playing,
  moving,
  paused,
  running,
  speed,
  atEnd,
  goTo,
  reset,
  toggle,
  pause,
} = useLessonPlayer(lesson)
const inspectedIndex = ref<number | null>(null)
const currentStep = computed(() => lesson.value.steps[index.value] || defaultLesson.steps[0]!)
const step = computed(
  () => lesson.value.steps[inspectedIndex.value ?? index.value] || currentStep.value,
)
const diagramMode = ref('network')
const panel = ref('explain')
const menuOpen = ref(false)
const stageElement = ref<HTMLElement | null>(null)
const inspectorElement = ref<HTMLElement | null>(null)
const messageScroller = ref<HTMLElement | null>(null)
const previewFile = ref('')
const copied = ref(false)
let copyTimer: ReturnType<typeof setTimeout> | undefined
watch(step, () => {
  previewFile.value = ''
  copied.value = false
})
watch(index, async () => {
  inspectedIndex.value = null
  await nextTick()
  const box = messageScroller.value
  const row = box?.querySelector<HTMLElement>('tr.active')
  if (box && row)
    box.scrollTo({
      top: Math.max(0, row.offsetTop - box.clientHeight / 2 + row.clientHeight / 2),
      behavior: 'auto',
    })
})
watch(lesson, async () => {
  inspectedIndex.value = null
  await nextTick()
  stageElement.value?.scrollTo({ top: 0 })
  inspectorElement.value?.scrollTo({ top: 0 })
  messageScroller.value?.scrollTo({ top: 0 })
})
onBeforeUnmount(() => clearTimeout(copyTimer))
const file = computed(() => previewFile.value || step.value.file)
const fileGroups = computed(() => [
  { title: 'frontend', files: Object.keys(sources).filter((path) => path.startsWith('frontend/')) },
  { title: 'backend', files: Object.keys(sources).filter((path) => path.startsWith('backend/')) },
  { title: 'scripts', files: Object.keys(sources).filter((path) => path.startsWith('scripts/')) },
])
const codeLines = computed(() => {
  const lines = (sources[file.value] || '').replace(/\r/g, '').split('\n')
  const found = previewFile.value ? 0 : lines.findIndex((line) => line.includes(step.value.anchor))
  const start = Math.max(0, found)
  return lines
    .slice(start, start + (previewFile.value ? 60 : step.value.codeLines || 10))
    .map((text, offset) => ({ number: start + offset + 1, text }))
})
function selectLesson(id: string) {
  router.replace({ path: '/', query: { lesson: id } })
  menuOpen.value = false
  panel.value = 'explain'
}
function selectStep(target: number) {
  inspectedIndex.value = null
  goTo(target)
  menuOpen.value = false
}
async function inspectMessage(target: number) {
  pause()
  panel.value = 'explain'
  if (target > index.value) {
    inspectedIndex.value = null
    goTo(target)
  } else inspectedIndex.value = target
  await nextTick()
  inspectorElement.value?.scrollTo({ top: 0 })
  if (window.matchMedia('(max-width: 1100px)').matches)
    inspectorElement.value?.scrollIntoView({ block: 'start', behavior: 'auto' })
}
function resetPlayer() {
  inspectedIndex.value = null
  reset()
}
function togglePlayer() {
  inspectedIndex.value = null
  toggle()
}
function onStageKeydown(event: KeyboardEvent) {
  const target = event.target as HTMLElement
  if (
    target.closest(
      'input, textarea, select, button, a, [role="tab"], [role="button"], [contenteditable="true"]',
    )
  )
    return
  if (event.key === ' ') {
    event.preventDefault()
    togglePlayer()
  } else if (event.key === 'ArrowRight') {
    event.preventDefault()
    selectStep(index.value + 1)
  } else if (event.key === 'ArrowLeft') {
    event.preventDefault()
    goTo(index.value - 1, false)
  }
}
async function movePanel(direction: number) {
  const tabs = ['explain', 'files', 'lab']
  const target = tabs[(tabs.indexOf(panel.value) + direction + tabs.length) % tabs.length]
  if (!target) return
  panel.value = target
  await nextTick()
  document.getElementById(`tab-${target}`)?.focus()
}
async function copyPath() {
  try {
    await navigator.clipboard.writeText(file.value)
    copied.value = true
    clearTimeout(copyTimer)
    copyTimer = setTimeout(() => (copied.value = false), 1800)
  } catch {
    copied.value = false
  }
}
</script>

<template>
  <main id="main-content" class="learning-page">
    <button
      class="mobile-course-button"
      :aria-expanded="menuOpen"
      aria-controls="course-navigation"
      @click="menuOpen = !menuOpen"
    >
      <UiIcon :name="menuOpen ? 'close' : 'menu'" />课程目录<span>{{ lesson.title }}</span>
    </button>
    <div class="teaching-layout">
      <aside
        id="course-navigation"
        class="lesson-sidebar"
        :class="{ open: menuOpen }"
        aria-label="课程目录"
      >
        <div class="sidebar-title">
          <UiIcon name="book" />
          <h2>跟着请求，读懂后端</h2>
        </div>
        <p class="sidebar-intro">用这个项目里的真实代码，<br />把每一步发生的事看明白。</p>
        <nav class="chapter-list">
          <section
            v-for="(chapter, chapterIndex) in lessons"
            :key="chapter.id"
            class="chapter"
            :class="{ active: chapter.id === lesson.id }"
          >
            <button
              class="chapter-button"
              :aria-expanded="chapter.id === lesson.id"
              @click="selectLesson(chapter.id)"
            >
              <span class="chapter-number">{{ String(chapterIndex + 1).padStart(2, '0') }}</span
              ><span>{{ chapter.title }}</span
              ><UiIcon name="next" :size="14" />
            </button>
            <ol v-if="chapter.id === lesson.id" class="chapter-steps">
              <li v-for="(item, stepIndex) in lesson.steps" :key="item.title">
                <button
                  :class="{ current: index === stepIndex, visited: index > stepIndex }"
                  :aria-current="index === stepIndex ? 'step' : undefined"
                  @click="selectStep(stepIndex)"
                >
                  <span class="step-number">{{ stepIndex + 1 }}</span
                  ><span>{{ item.title }}</span>
                </button>
              </li>
            </ol>
          </section>
        </nav>
        <div class="sidebar-bottom">
          <p>从理解，到亲手验证。</p>
          <RouterLink to="/notes"
            ><UiIcon name="file" :size="16" />打开学习记录<UiIcon
              name="arrow"
              :size="15" /></RouterLink
          ><a
            href="https://mcp-explained.com/"
            target="_blank"
            rel="noopener noreferrer"
            class="reference-link"
            >交互形式参考 MCP Explained<UiIcon name="arrow" :size="12"
          /></a>
        </div>
      </aside>

      <section
        ref="stageElement"
        class="lesson-stage"
        aria-label="交互式流程演示，空格播放，方向键单步"
        tabindex="0"
        @keydown="onStageKeydown"
      >
        <header class="lesson-heading">
          <h1>{{ lesson.title }}</h1>
          <p>{{ lesson.description }}</p>
          <div v-if="lesson.id === 'errors'" class="scenario-picker">
            <label for="error-scenario">观察哪一种错误？</label
            ><select id="error-scenario" v-model="scenario">
              <option v-for="item in errorScenarios" :key="item.id" :value="item.id">
                {{ item.label }}
              </option>
            </select>
          </div>
        </header>
        <div class="step-heading" aria-live="polite">
          <span class="current-step-count">步骤 {{ index + 1 }} / {{ lesson.steps.length }}</span>
          <h2>{{ currentStep.title }}</h2>
          <p>{{ currentStep.summary }}</p>
        </div>
        <div class="diagram-toolbar">
          <span>全部模块始终显示，跟着高亮查看处理位置。</span>
          <div class="diagram-switch" role="group" aria-label="图示方式">
            <button
              :class="{ selected: diagramMode === 'network' }"
              :aria-pressed="diagramMode === 'network'"
              @click="diagramMode = 'network'"
            >
              <UiIcon name="network" :size="14" />流程图</button
            ><button
              :class="{ selected: diagramMode === 'sequence' }"
              :aria-pressed="diagramMode === 'sequence'"
              @click="diagramMode = 'sequence'"
            >
              <UiIcon name="sequence" :size="14" />时序图
            </button>
          </div>
        </div>
        <FlowDiagram
          :step="currentStep"
          :steps="lesson.steps"
          :index="index"
          :progress="progress"
          :moving="moving"
          :playing="playing"
          :paused="paused"
          :mode="diagramMode"
          :selected-index="inspectedIndex"
          @inspect="inspectMessage"
        />

        <div class="player-controls" aria-label="播放控制">
          <button
            class="course-button dark play-button"
            :aria-label="running ? '暂停演示' : atEnd ? '重新播放演示' : '播放演示'"
            @click="togglePlayer"
          >
            <UiIcon :name="running ? 'pause' : 'play'" :size="16" />{{
              running ? '暂停' : atEnd ? '重播' : '播放'
            }}
          </button>
          <button
            class="course-button"
            :disabled="index === 0"
            aria-label="上一步"
            @click="goTo(index - 1, false)"
          >
            <UiIcon name="previous" :size="15" /><span>上一步</span>
          </button>
          <button
            class="course-button"
            :disabled="index === lesson.steps.length - 1"
            aria-label="下一步"
            @click="goTo(index + 1)"
          >
            <span>下一步</span><UiIcon name="next" :size="15" />
          </button>
          <button class="reset-button" aria-label="重置演示" title="重置演示" @click="resetPlayer">
            <UiIcon name="reset" :size="16" />
          </button>
          <label class="speed-control"
            >速度<select v-model.number="speed" aria-label="播放速度">
              <option :value="0.75">0.75×</option>
              <option :value="1">1×</option>
              <option :value="1.5">1.5×</option>
              <option :value="2">2×</option>
            </select></label
          >
        </div>
        <div class="step-scrubber">
          <input
            type="range"
            min="0"
            :max="lesson.steps.length - 1"
            :value="index"
            aria-label="跳到课程步骤"
            @input="goTo(Number(($event.target as HTMLInputElement).value))"
          /><span>{{ index + 1 }} / {{ lesson.steps.length }}</span>
        </div>

        <section class="message-flow" aria-labelledby="message-title">
          <div class="message-heading">
            <h2 id="message-title">过程记录</h2>
            <span>{{ lesson.steps.length }} 个步骤 · 演示数据</span>
          </div>
          <div ref="messageScroller" class="message-table">
            <table>
              <thead>
                <tr>
                  <th scope="col">步骤</th>
                  <th scope="col">发生了什么</th>
                  <th scope="col">调用 / 消息</th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="(item, itemIndex) in lesson.steps"
                  :key="item.title"
                  :class="{
                    active: itemIndex === index,
                    complete: itemIndex < index,
                    failure: item.error,
                    inspected: itemIndex === inspectedIndex,
                  }"
                  @click="inspectMessage(itemIndex)"
                >
                  <td>
                    <span class="message-index">{{ itemIndex + 1 }}</span>
                  </td>
                  <td>
                    <button
                      :aria-label="`查看消息 ${itemIndex + 1}：${item.title}`"
                      @click.stop="inspectMessage(itemIndex)"
                    >
                      {{ item.title }}
                    </button>
                    <small class="message-direction"
                      >{{ actors[item.from].name }} → {{ actors[item.to].name }}</small
                    >
                  </td>
                  <td>
                    <code>{{ item.method }}</code>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>
      </section>

      <aside
        ref="inspectorElement"
        class="lesson-inspector"
        aria-label="当前步骤的讲解、源码和实验"
      >
        <div
          v-if="inspectedIndex !== null && inspectedIndex !== index"
          class="history-inspection"
          role="status"
        >
          <span
            >正在查看消息 {{ inspectedIndex + 1
            }}<small>播放仍停在步骤 {{ index + 1 }}</small></span
          ><button @click="inspectedIndex = null">回到当前步骤</button>
        </div>
        <div class="inspector-tabs" role="tablist" aria-label="学习方式">
          <button
            id="tab-explain"
            role="tab"
            :aria-selected="panel === 'explain'"
            aria-controls="panel-explain"
            :tabindex="panel === 'explain' ? 0 : -1"
            @click="panel = 'explain'"
            @keydown.right.prevent="movePanel(1)"
            @keydown.left.prevent="movePanel(-1)"
          >
            讲解与代码</button
          ><button
            id="tab-files"
            role="tab"
            :aria-selected="panel === 'files'"
            aria-controls="panel-files"
            :tabindex="panel === 'files' ? 0 : -1"
            @click="panel = 'files'"
            @keydown.right.prevent="movePanel(1)"
            @keydown.left.prevent="movePanel(-1)"
          >
            项目文件</button
          ><button
            id="tab-lab"
            role="tab"
            :aria-selected="panel === 'lab'"
            aria-controls="panel-lab"
            :tabindex="panel === 'lab' ? 0 : -1"
            @click="panel = 'lab'"
            @keydown.right.prevent="movePanel(1)"
            @keydown.left.prevent="movePanel(-1)"
          >
            真实请求
          </button>
        </div>
        <div
          v-if="panel === 'explain'"
          id="panel-explain"
          class="inspector-body"
          role="tabpanel"
          aria-labelledby="tab-explain"
        >
          <h2>{{ step.title }}</h2>
          <p class="inspector-description">{{ step.detail }}</p>
          <div class="source-heading">
            <span><UiIcon name="code" :size="16" />当前源码</span
            ><button :aria-label="`复制文件路径 ${file}`" @click="copyPath">
              <UiIcon name="copy" :size="14" />{{ copied ? '已复制' : '复制路径' }}
            </button>
          </div>
          <code class="source-path">{{ file }}</code>
          <pre
            class="source-code"
          ><code><span v-for="line in codeLines" :key="line.number" class="source-line" :class="{ comment: /^\s*(#|\/\/)/.test(line.text) }"><span class="line-number" aria-hidden="true">{{ line.number }}</span><span>{{ line.text || ' ' }}</span></span></code></pre>
          <div class="data-inspector">
            <h3>进入这一步</h3>
            <pre>{{ step.input }}</pre>
            <h3>离开这一步</h3>
            <pre :class="{ 'response-error': step.error }">{{ step.output }}</pre>
          </div>
          <div class="lesson-takeaway">
            <UiIcon name="book" :size="18" />
            <p>{{ step.takeaway }}</p>
          </div>
        </div>
        <div
          v-else-if="panel === 'files'"
          id="panel-files"
          class="inspector-body"
          role="tabpanel"
          aria-labelledby="tab-files"
        >
          <h2>从流程，找到文件</h2>
          <p class="inspector-description">高亮项对应当前步骤。点击文件，查看项目里的真实源码。</p>
          <div class="file-tree">
            <section v-for="group in fileGroups" :key="group.title">
              <h3><UiIcon name="folder" :size="16" />{{ group.title }}/</h3>
              <button
                v-for="path in group.files"
                :key="path"
                :class="{ active: file === path, related: step.file === path }"
                @click="previewFile = path"
              >
                <UiIcon name="file" :size="14" /><span>{{
                  path.replace(`${group.title}/`, '')
                }}</span>
              </button>
            </section>
          </div>
          <code class="source-path file-preview-path">{{ file }}</code>
          <pre
            class="source-code"
          ><code><span v-for="line in codeLines" :key="line.number" class="source-line"><span class="line-number" aria-hidden="true">{{ line.number }}</span><span>{{ line.text || ' ' }}</span></span></code></pre>
          <p class="source-note">源码在前端构建时读取白名单文件；不读取 .env 和数据库密码。</p>
        </div>
        <div v-else id="panel-lab" class="inspector-body" role="tabpanel" aria-labelledby="tab-lab">
          <RequestLab />
        </div>
      </aside>
    </div>
  </main>
</template>
