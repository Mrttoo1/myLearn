import { after, test } from 'node:test'
import assert from 'node:assert/strict'
import { setTimeout as delay } from 'node:timers/promises'
import { createRenderer, h, nextTick, ref } from 'vue'
import gsap from 'gsap'
import { lessons, defaultLesson, errorLesson } from '../src/lessons/content.ts'
import {
  messagePoint,
  messageRoute,
  messageTrack,
  positions,
  topologyLinks,
  visibleActors,
} from '../src/lessons/flow.ts'
import { useLessonPlayer } from '../src/composables/useLessonPlayer.ts'

// 用内存节点运行 Vue 生命周期；验证播放器状态，不模拟浏览器外观。
const renderer = createRenderer({
  createElement: () => ({ children: [] }),
  createText: (text) => ({ text }),
  createComment: (text) => ({ text }),
  insert: (node, parent) => parent.children.push(node),
  remove() {},
  patchProp() {},
  setText() {},
  setElementText() {},
  parentNode: () => null,
  nextSibling: () => null,
})
function mountPlayer() {
  const lesson = ref(defaultLesson)
  let player
  const app = renderer.createApp({
    setup() {
      player = useLessonPlayer(lesson)
      return () => h('div')
    },
  })
  app.mount({ children: [] })
  return { player, lesson, dispose: () => app.unmount() }
}
async function waitFor(predicate, timeout = 1800) {
  const start = Date.now()
  while (!predicate()) {
    if (Date.now() - start > timeout) throw new Error('播放器未在预期时间内完成操作')
    await delay(10)
  }
}
after(() => gsap.ticker.sleep())

test('迁移期间仍显示全部系统模块，独立终端负责执行迁移', () => {
  const startup = lessons.find((lesson) => lesson.id === 'startup')
  const migration = startup.steps[1]
  assert.equal(migration.from, 'terminal')
  assert.deepEqual(visibleActors(startup.steps), ['browser', 'vite', 'api', 'database', 'terminal'])
  assert.equal(migration.to, 'database')
})

test('整节课的模块、位置和连接保持不变，步骤只改变经过的状态', () => {
  for (const lesson of [...lessons, errorLesson('validation')]) {
    const ids = visibleActors(lesson.steps)
    for (const mobile of [false, true]) {
      const layout = positions(ids, mobile)
      for (const id of ['browser', 'vite', 'api', 'database']) assert.ok(layout[id])
      const keys = topologyLinks(lesson.steps, 0).map((link) => link.key)
      lesson.steps.forEach((step, index) => {
        assert.ok(ids.includes(step.from))
        assert.ok(ids.includes(step.to))
        assert.deepEqual(
          topologyLinks(lesson.steps, index).map((link) => link.key),
          keys,
        )
        assert.deepEqual(positions(visibleActors(lesson.steps), mobile), layout)
      })
    }
  }
  const start = topologyLinks(defaultLesson.steps, 0)
  const saved = topologyLinks(defaultLesson.steps, 5)
  assert.equal(start.find((link) => link.key === 'api:database').used, false)
  assert.equal(saved.find((link) => link.key === 'api:database').used, true)
})

test('简写的 HTTP 消息仍通过 Vite，响应沿相反方向返回', () => {
  assert.deepEqual(messageRoute({ from: 'browser', to: 'api' }), ['browser', 'vite', 'api'])
  assert.deepEqual(messageRoute({ from: 'api', to: 'browser' }), ['api', 'vite', 'browser'])
  assert.deepEqual(messageRoute({ from: 'api', to: 'api' }), ['api'])
})

test('连线从设备侧面出发，完整走到接收端，反向响应沿原路返回', () => {
  for (const mobile of [false, true]) {
    const points = positions(['api', 'database'], mobile)
    const track = messageTrack(points.api, points.database, mobile)
    assert.deepEqual(messagePoint(track, 0), track[0])
    assert.deepEqual(messagePoint(track, 1), track.at(-1))
    assert.ok(Math.hypot(track[1].x - track[0].x, track[1].y - track[0].y) >= 100)
    assert.deepEqual(messageTrack(points.database, points.api, mobile), [...track].reverse())
    assert.ok(Math.abs(track[0].x - points.api.x) > 44)
    assert.equal(track[0].y, points.api.y - 8)
    assert.equal(track.at(-1).y, points.database.y - 8)
  }
})

test('绕行命令按完整路程运动，不会在拐弯时跳过路径', () => {
  const track = messageTrack({ x: 800, y: 455 }, { x: 800, y: 235 }, false)
  assert.equal(track.length, 4)
  assert.deepEqual(messagePoint(track, 0), track[0])
  assert.deepEqual(messagePoint(track, 1), track.at(-1))
  const middle = messagePoint(track, 0.5)
  assert.ok(Number.isFinite(middle.x) && Number.isFinite(middle.y))
  const corner = [
    { x: 0, y: 0 },
    { x: 100, y: 0 },
    { x: 100, y: 300 },
  ]
  assert.deepEqual(messagePoint(corner, 0.5), { x: 100, y: 100 })
})

test('错误判定发生在后端本地，HTTP 状态不会发给数据库', () => {
  for (const scenario of ['validation', 'missing', 'database']) {
    const step = errorLesson(scenario).steps[1]
    assert.equal(step.from, 'api')
    assert.equal(step.to, 'api')
    assert.deepEqual(visibleActors(errorLesson(scenario).steps), [
      'browser',
      'vite',
      'api',
      'database',
    ])
  }
})

test('单步播放完整发送，到达后停住，不自动跳到下一条', async () => {
  const { player, dispose } = mountPlayer()
  try {
    player.speed.value = 2
    player.goTo(1)
    assert.equal(player.index.value, 1)
    assert.equal(player.progress.value, 0)
    assert.equal(player.running.value, true)
    await waitFor(() => player.progress.value > 0.1)
    await waitFor(() => player.progress.value === 1)
    assert.equal(player.moving.value, false)
    assert.equal(player.playing.value, false)
    await delay(80)
    assert.equal(player.index.value, 1)
  } finally {
    dispose()
  }
})

test('中途暂停保持进度，继续后从原位置完成发送', async () => {
  const { player, dispose } = mountPlayer()
  try {
    player.speed.value = 2
    player.goTo(2)
    await waitFor(() => player.progress.value > 0.1)
    player.pause()
    const before = player.progress.value
    await delay(80)
    assert.equal(player.progress.value, before)
    assert.equal(player.paused.value, true)
    player.toggle()
    assert.equal(player.paused.value, false)
    await waitFor(() => player.progress.value === 1)
    player.pause()
    assert.equal(player.index.value, 2)
  } finally {
    dispose()
  }
})

test('快速换步骤会取消旧动画，结束后可以重播', async () => {
  const { player, dispose } = mountPlayer()
  try {
    player.speed.value = 2
    player.goTo(1)
    player.goTo(9)
    await waitFor(() => player.progress.value === 1)
    assert.equal(player.index.value, 9)
    assert.equal(player.atEnd.value, true)
    player.toggle()
    assert.equal(player.index.value, 0)
    assert.equal(player.playing.value, true)
  } finally {
    dispose()
  }
})

test('自动播放发送下一条消息，切换课程会取消原队列', async () => {
  const { player, lesson, dispose } = mountPlayer()
  try {
    player.speed.value = 2
    player.toggle()
    assert.equal(player.index.value, 1)
    await waitFor(() => player.index.value === 2)
    lesson.value = lessons.find((item) => item.id === 'startup')
    await nextTick()
    assert.equal(player.index.value, 0)
    assert.equal(player.progress.value, 1)
    assert.equal(player.playing.value, false)
    await delay(100)
    assert.equal(player.index.value, 0)
  } finally {
    dispose()
  }
})
