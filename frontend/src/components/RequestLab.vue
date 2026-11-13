<script setup lang="ts">
import { computed, onBeforeUnmount, ref } from 'vue'
import { RouterLink } from 'vue-router'

const scenario = ref('create')
const title = ref('我的第一条请求实验')
const content = ref('我在教学页面发出了一次真实 HTTP 请求。')
const busy = ref(false)
const output = ref('')
const status = ref<number | null>(null)
const elapsed = ref(0)
const created = ref(false)
let controller: AbortController | undefined
let timeout: ReturnType<typeof setTimeout> | undefined
const route = computed(() =>
  scenario.value === 'health'
    ? '/api/health'
    : scenario.value === 'missing'
      ? '/api/notes/999999999'
      : '/api/notes',
)
const method = computed(() => (['health', 'missing'].includes(scenario.value) ? 'GET' : 'POST'))
onBeforeUnmount(() => {
  controller?.abort()
  clearTimeout(timeout)
})

async function send() {
  busy.value = true
  output.value = ''
  status.value = null
  created.value = false
  controller = new AbortController()
  timeout = setTimeout(() => controller?.abort(), 10000)
  const start = performance.now()
  try {
    // 实验需要展示真实状态码，包括 422/404，因此直接保留 fetch 的 Response。
    const response = await fetch(route.value, {
      method: method.value,
      signal: controller.signal,
      headers: { 'Content-Type': 'application/json' },
      body:
        method.value === 'POST'
          ? JSON.stringify({
              title: scenario.value === 'invalid' ? '   ' : title.value,
              content: content.value,
            })
          : undefined,
    })
    status.value = response.status
    const body = await response.text()
    try {
      output.value = JSON.stringify(JSON.parse(body), null, 2)
    } catch {
      output.value = body || '服务没有返回正文，请检查后端和开发代理。'
    }
    created.value = response.status === 201
  } catch (error) {
    output.value =
      error instanceof Error && error.name === 'AbortError'
        ? '请求超时。请检查后端和数据库是否启动。'
        : '无法连接后端。请先运行数据库和 dev-backend.ps1，再重试。'
  } finally {
    clearTimeout(timeout)
    elapsed.value = Math.round(performance.now() - start)
    busy.value = false
  }
}
</script>

<template>
  <div class="request-lab">
    <h2>让请求真的走一遍</h2>
    <p class="inspector-description">
      这里调用本机后端。正常保存成功后，会在学习记录中新增一条数据。
    </p>
    <form @submit.prevent="send">
      <label for="lab-scenario">实验场景</label>
      <select id="lab-scenario" v-model="scenario" :disabled="busy">
        <option value="create">正常保存 · POST</option>
        <option value="invalid">空标题校验 · 422</option>
        <option value="missing">查询不存在的记录 · 404</option>
        <option value="health">检查服务连接 · GET</option>
      </select>
      <template v-if="scenario === 'create'">
        <label for="lab-title">学习主题</label
        ><input id="lab-title" v-model="title" :disabled="busy" maxlength="100" />
        <label for="lab-content">记录内容</label
        ><textarea
          id="lab-content"
          v-model="content"
          :disabled="busy"
          rows="3"
          maxlength="10000"
        ></textarea>
      </template>
      <p v-if="scenario === 'invalid'" class="lab-hint">
        直接向接口提交只有空格的标题，观察后端校验。
      </p>
      <div class="request-address">
        <b>{{ method }}</b> {{ route }}
      </div>
      <button class="course-button dark" :disabled="busy" type="submit">
        {{ busy ? '等待响应…' : scenario === 'create' ? '发送并保存记录' : '发送请求' }}
      </button>
    </form>
    <div v-if="output" class="lab-result" aria-live="polite">
      <div class="lab-result-header">
        <strong :class="{ 'response-error': status === null || status >= 400 }">{{
          status === null ? '未取得 HTTP 响应' : `HTTP ${status}`
        }}</strong
        ><span>{{ elapsed }} ms</span>
      </div>
      <pre>{{ output }}</pre>
      <RouterLink v-if="created" class="lab-notes-link" to="/notes"
        >已保存，去学习记录查看 <span aria-hidden="true">→</span></RouterLink
      >
    </div>
    <p class="lab-help">需要后端 :8000 和数据库。课程的分步演示不受服务连接状态影响。</p>
  </div>
</template>
