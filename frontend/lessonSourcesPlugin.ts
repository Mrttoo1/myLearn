import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { resolve } from 'node:path'
import type { Plugin } from 'vite'

// 只在开发/构建时读取这份白名单，不提供任意文件读取接口，也不读取 .env。
const files = [
  'frontend/src/views/NotesView.vue',
  'frontend/src/api/notes.ts',
  'frontend/src/api/http.ts',
  'frontend/src/components/RequestLab.vue',
  'frontend/vite.config.ts',
  'backend/app/main.py',
  'backend/app/routers/notes.py',
  'backend/app/schemas.py',
  'backend/app/services/notes.py',
  'backend/app/models.py',
  'backend/app/database.py',
  'backend/migrations/versions/0001_create_notes.py',
  'scripts/dev-db.ps1',
  'scripts/dev-backend.ps1',
  'scripts/dev-frontend.ps1',
]

export function lessonSourcesPlugin(): Plugin {
  const root = fileURLToPath(new URL('../', import.meta.url))
  const moduleId = '\0virtual:lesson-sources'
  const paths = files.map((file) => resolve(root, file))
  return {
    name: 'lesson-sources',
    resolveId(id) {
      if (id === 'virtual:lesson-sources') return moduleId
    },
    load(id) {
      if (id !== moduleId) return
      const sources = Object.fromEntries(
        files.map((file) => [
          file,
          readFileSync(resolve(root, file), 'utf8').replace(/^\uFEFF/, ''),
        ]),
      )
      return `export default ${JSON.stringify(sources)}`
    },
    configureServer(server) {
      // 修改真实源码后同步更新教学片段，避免手写副本慢慢过时。
      server.watcher.add(paths)
      server.watcher.on('change', (file) => {
        if (!paths.includes(resolve(file))) return
        const module = server.moduleGraph.getModuleById(moduleId)
        if (module) server.moduleGraph.invalidateModule(module)
        server.ws.send({ type: 'full-reload' })
      })
    },
  }
}
