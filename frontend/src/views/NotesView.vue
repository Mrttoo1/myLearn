<script setup lang="ts">
import { computed, nextTick, onMounted, reactive, ref } from 'vue'
import { createNote, deleteNote, listNotes, updateNote } from '@/api/notes'
import { useConnectionStore } from '@/stores/connection'
import type { Note } from '@/types/note'

const connection = useConnectionStore()
const notes = ref<Note[]>([])
const total = ref(0)
const offset = ref(0)
const pageSize = 5
const loading = ref(false)
const saving = ref(false)
const deletingId = ref<number | null>(null)
const listError = ref('')
const formError = ref('')
const notice = ref('')
const editingId = ref<number | null>(null)
const titleInput = ref<HTMLInputElement | null>(null)
const form = reactive({ title: '', content: '' })
const original = reactive({ title: '', content: '' })
const busy = computed(() => loading.value || saving.value || deletingId.value !== null)
const dirty = computed(() => form.title !== original.title || form.content !== original.content)
const currentPage = computed(() => Math.floor(offset.value / pageSize) + 1)
const pageCount = computed(() => Math.max(1, Math.ceil(total.value / pageSize)))
const dateFormat = new Intl.DateTimeFormat('zh-CN', {
  month: 'long',
  day: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
})

function errorMessage(error: unknown) {
  return error instanceof Error ? error.message : '操作失败，请重试'
}

async function loadNotes(nextOffset = offset.value) {
  loading.value = true
  listError.value = ''
  try {
    const page = await listNotes(pageSize, nextOffset)
    notes.value = page.items
    total.value = page.total
    offset.value = nextOffset
  } catch (error) {
    listError.value = errorMessage(error)
  } finally {
    loading.value = false
  }
}

async function refresh() {
  await Promise.all([loadNotes(), connection.check()])
}

function clearForm() {
  form.title = ''
  form.content = ''
  original.title = ''
  original.content = ''
  editingId.value = null
  formError.value = ''
}

async function focusEditor() {
  await nextTick()
  titleInput.value?.focus()
}

async function startNew() {
  if (dirty.value && !window.confirm('当前内容尚未保存，确定清空并新建吗？')) return
  clearForm()
  await focusEditor()
}

async function editNote(note: Note) {
  if (dirty.value && !window.confirm('当前内容尚未保存，确定切换到这条记录吗？')) return
  editingId.value = note.id
  form.title = note.title
  form.content = note.content
  original.title = note.title
  original.content = note.content
  formError.value = ''
  notice.value = ''
  await focusEditor()
}

async function saveNote() {
  formError.value = ''
  notice.value = ''
  if (!form.title.trim()) {
    formError.value = '请先填写学习主题，标题不能只有空格'
    await focusEditor()
    return
  }
  saving.value = true
  try {
    const data = { title: form.title.trim(), content: form.content }
    const isEditing = editingId.value !== null
    if (editingId.value !== null) await updateNote(editingId.value, data)
    else await createNote(data)
    // 写入成功后清空表单。即使刷新列表失败，也不会引导用户重复提交。
    clearForm()
    notice.value = isEditing ? '修改已保存。' : '学习记录已保存。'
    await Promise.all([loadNotes(isEditing ? offset.value : 0), connection.check()])
  } catch (error) {
    formError.value = errorMessage(error)
  } finally {
    saving.value = false
  }
}

async function removeNote(note: Note) {
  if (!window.confirm(`确定删除“${note.title}”吗？删除后无法恢复。`)) return
  deletingId.value = note.id
  notice.value = ''
  listError.value = ''
  try {
    await deleteNote(note.id)
    if (editingId.value === note.id) clearForm()
    notice.value = '记录已删除。'
    // 删除本页最后一条时回到上一页。
    const nextOffset =
      notes.value.length === 1 ? Math.max(0, offset.value - pageSize) : offset.value
    await loadNotes(nextOffset)
  } catch (error) {
    listError.value = errorMessage(error)
  } finally {
    deletingId.value = null
  }
}

onMounted(() => loadNotes(0))
</script>

<template>
  <main id="main-content" class="app-shell notes-page">
    <section class="page-intro" aria-labelledby="page-title">
      <div>
        <h1 id="page-title">学习记录</h1>
        <p>一个概念、一次尝试，或一个还没弄懂的问题。<br />把今天的理解，写下来。</p>
      </div>
      <button class="button primary new-note" :disabled="busy" @click="startNew">写一条记录</button>
    </section>
    <p class="save-notice" role="status" aria-live="polite">{{ notice }}</p>

    <div class="workspace">
      <section class="notes-section" aria-labelledby="notes-title" :aria-busy="loading">
        <div class="section-heading">
          <h2 id="notes-title">
            我的记录 <span class="record-count">{{ total }} 条</span>
          </h2>
          <button class="text-button" :disabled="busy" @click="refresh">
            {{ loading ? '刷新中…' : '刷新' }}
          </button>
        </div>
        <div v-if="listError" class="error-message" role="alert">
          <p>{{ listError }}</p>
          <button class="text-button" :disabled="busy" @click="refresh">重新加载</button>
        </div>
        <p v-if="loading && notes.length === 0" class="empty-state">正在读取你的学习记录…</p>
        <div v-else-if="!listError && notes.length === 0" class="empty-state">
          <h3>从第一条记录开始</h3>
          <p>不必写得完整。先记下今天学到的一件事，<br />以后再回来补充。</p>
          <button class="text-button" @click="focusEditor">开始记录</button>
        </div>
        <div v-else class="note-list">
          <article
            v-for="note in notes"
            :key="note.id"
            class="note"
            :class="{ selected: editingId === note.id }"
          >
            <div class="note-meta">
              <time :datetime="note.created_at">{{
                dateFormat.format(new Date(note.created_at))
              }}</time>
              <span v-if="editingId === note.id" class="editing-label">正在编辑</span>
            </div>
            <h3>{{ note.title }}</h3>
            <p class="note-content">{{ note.content || '还没有正文，可以在编辑时补充。' }}</p>
            <div class="note-actions">
              <button
                class="text-button"
                :disabled="busy"
                :aria-label="`编辑：${note.title}`"
                @click="editNote(note)"
              >
                编辑
              </button>
              <button
                class="text-button danger"
                :disabled="busy"
                :aria-label="`删除：${note.title}`"
                @click="removeNote(note)"
              >
                {{ deletingId === note.id ? '删除中…' : '删除' }}
              </button>
            </div>
          </article>
        </div>
        <nav v-if="total > pageSize" class="pagination" aria-label="记录分页">
          <button
            class="button secondary"
            :disabled="busy || offset === 0"
            @click="loadNotes(offset - pageSize)"
          >
            上一页
          </button>
          <span>第 {{ currentPage }} / {{ pageCount }} 页</span>
          <button
            class="button secondary"
            :disabled="busy || offset + pageSize >= total"
            @click="loadNotes(offset + pageSize)"
          >
            下一页
          </button>
        </nav>
      </section>

      <aside class="editor" aria-labelledby="editor-title">
        <div class="section-heading">
          <h2 id="editor-title">{{ editingId === null ? '写下新的收获' : '编辑这条记录' }}</h2>
          <span class="editor-mark" aria-hidden="true"></span>
        </div>
        <p class="editor-description">用自己的话，记下你真正理解的部分。</p>
        <form @submit.prevent="saveNote">
          <label for="note-title">学习主题 <span class="required">必填</span></label>
          <input
            id="note-title"
            ref="titleInput"
            v-model="form.title"
            name="title"
            placeholder="例如：第一次理解数据库事务"
            maxlength="100"
            required
            :disabled="saving"
            :aria-invalid="Boolean(formError)"
            :aria-describedby="formError ? 'form-error' : undefined"
          />
          <label for="note-content">记录内容 <span class="optional">选填</span></label>
          <textarea
            id="note-content"
            v-model="form.content"
            name="content"
            rows="9"
            placeholder="学到了什么？做了哪些尝试？还有什么疑问？"
            maxlength="10000"
            :disabled="saving"
            aria-describedby="content-count"
          ></textarea>
          <div id="content-count" class="character-count">
            {{ form.content.length.toLocaleString() }} / 10,000
          </div>
          <p v-if="formError" id="form-error" class="error-message" role="alert">{{ formError }}</p>
          <div class="form-actions">
            <button class="button primary" type="submit" :disabled="busy">
              {{ saving ? '保存中…' : editingId === null ? '保存记录' : '保存修改' }}
            </button>
            <button
              v-if="editingId !== null || dirty"
              class="text-button"
              type="button"
              :disabled="busy"
              @click="startNew"
            >
              {{ editingId === null ? '清空' : '取消编辑' }}
            </button>
          </div>
        </form>
      </aside>
    </div>
  </main>
</template>
