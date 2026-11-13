import type { LessonStep, NodeId } from './content'

export interface FlowActor {
  id: NodeId
  name: string
  role: string
  address: string
}
export interface Point {
  x: number
  y: number
}

export const actors: Record<NodeId, FlowActor> = {
  browser: { id: 'browser', name: 'Vue 页面', role: '浏览器', address: '表单与页面状态' },
  vite: { id: 'vite', name: 'Vite', role: '开发服务与代理', address: '127.0.0.1:5173' },
  api: { id: 'api', name: 'FastAPI', role: 'Python 后端', address: '127.0.0.1:8000' },
  database: { id: 'database', name: 'PostgreSQL', role: '数据库', address: '本机练习 :55432' },
  terminal: { id: 'terminal', name: '本机终端', role: '启动命令', address: 'PowerShell' },
}

// 可见角色由整节课决定，而不是由当前步骤决定。点击下一步时，模块不会消失或换位置。
export function visibleActors(steps: LessonStep[]): NodeId[] {
  const ids: NodeId[] = ['browser', 'vite', 'api', 'database']
  if (steps.some((step) => step.from === 'terminal' || step.to === 'terminal')) ids.push('terminal')
  return ids
}

export function positions(ids: NodeId[], mobile: boolean): Partial<Record<NodeId, Point>> {
  const layout: Record<NodeId, Point> = mobile
    ? {
        browser: { x: 150, y: 445 },
        vite: { x: 410, y: 445 },
        api: { x: 670, y: 235 },
        database: { x: 190, y: 105 },
        terminal: { x: 670, y: 485 },
      }
    : {
        browser: { x: 230, y: 335 },
        vite: { x: 455, y: 335 },
        api: { x: 800, y: 235 },
        database: { x: 250, y: 105 },
        terminal: { x: 800, y: 455 },
      }
  return Object.fromEntries(ids.map((id) => [id, layout[id]]))
}

// 连线连接设备两侧，名称留在设备下方；同一列的启动命令从右侧绕行。
export function messageTrack(from: Point, to: Point, mobile: boolean): Point[] {
  if (from.x !== to.x) {
    const direction = Math.sign(to.x - from.x)
    return [
      { x: from.x + direction * 52, y: from.y - 8 },
      { x: to.x - direction * 52, y: to.y - 8 },
    ]
  }
  const gutter = mobile ? 780 : 970
  return [
    { x: from.x + 52, y: from.y - 8 },
    { x: gutter, y: from.y - 8 },
    { x: gutter, y: to.y - 8 },
    { x: to.x + 52, y: to.y - 8 },
  ]
}

// 按实际路程计算位置：经过代理或拐弯时，消息仍沿着同一条完整路径前进。
export function messagePoint(track: Point[], progress: number): Point {
  const lengths = track
    .slice(1)
    .map((point, index) => Math.hypot(point.x - track[index]!.x, point.y - track[index]!.y))
  let remaining =
    Math.max(0, Math.min(1, progress)) * lengths.reduce((sum, length) => sum + length, 0)
  for (let index = 0; index < lengths.length; index++) {
    const length = lengths[index]!
    if (remaining <= length) {
      const from = track[index]!,
        to = track[index + 1]!
      const t = length ? remaining / length : 1
      return { x: from.x + (to.x - from.x) * t, y: from.y + (to.y - from.y) * t }
    }
    remaining -= length
  }
  return track[track.length - 1]!
}

export function connectionKey(from: NodeId, to: NodeId) {
  return [from, to].sort().join(':')
}

// 全部连接始终存在；只改变当前高亮及已经经过的状态。
export function topologyLinks(steps: LessonStep[], index: number) {
  const links = new Map<string, { key: string; from: NodeId; to: NodeId; used: boolean }>()
  const add = (from: NodeId, to: NodeId, used: boolean) => {
    const key = connectionKey(from, to)
    const previous = links.get(key)
    links.set(key, { key, from, to, used: used || !!previous?.used })
  }
  add('browser', 'vite', false)
  add('vite', 'api', false)
  add('api', 'database', false)
  steps.forEach((step, stepIndex) => {
    const route = messageRoute(step)
    route.slice(1).forEach((to, part) => add(route[part]!, to, stepIndex <= index))
  })
  return Array.from(links.values())
}

export function messageRoute(step: LessonStep): NodeId[] {
  if (step.from === step.to) return [step.from]
  // 简写的浏览器↔后端步骤，仍然经过真实配置中的开发代理。
  if (step.from === 'browser' && step.to === 'api') return ['browser', 'vite', 'api']
  if (step.from === 'api' && step.to === 'browser') return ['api', 'vite', 'browser']
  return [step.from, step.to]
}

export function messageKind(step: LessonStep) {
  if (step.error) return 'error'
  if (step.from === 'terminal') return 'command'
  if (step.from === step.to) return 'local'
  if (step.from === 'database' || step.to === 'database') return 'sql'
  if (/^(201|JSON → JavaScript)/.test(step.method)) return 'response'
  return 'request'
}
