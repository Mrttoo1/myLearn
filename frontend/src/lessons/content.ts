// 课程内容与组件分开：增加一节课时，先描述步骤和数据，再复用播放器。
export type NodeId = 'browser' | 'vite' | 'api' | 'database' | 'terminal'
export interface LessonStep {
  title: string
  summary: string
  detail: string
  file: string
  anchor: string
  codeLines?: number
  from: NodeId
  to: NodeId
  method: string
  input: string
  output: string
  takeaway: string
  error?: boolean
}
export interface Lesson {
  id: string
  title: string
  description: string
  steps: LessonStep[]
}

const payload = '{\n  "title": "理解一次请求",\n  "content": "从 Vue 页面到数据库。"\n}'
const result = '{\n  "id": 1,\n  "title": "理解一次请求",\n  "content": "从 Vue 页面到数据库。"\n}'

const request: Lesson = {
  id: 'request',
  title: '一条记录的旅程',
  description: '跟着一次保存操作，看数据怎样从 Vue 页面进入数据库，再回到页面。',
  steps: [
    {
      title: '在页面里，写下一个想法',
      summary: '你在 Vue 页面中输入内容。此时，数据只保存在浏览器的表单状态里。',
      detail:
        '输入框通过 v-model 更新 form 对象。这一步还没有发送请求，刷新页面会丢失尚未保存的内容。',
      file: 'frontend/src/views/NotesView.vue',
      anchor: 'const form = reactive',
      codeLines: 1,
      from: 'browser',
      to: 'browser',
      method: 'v-model → form',
      input: '输入：理解一次请求',
      output: payload,
      takeaway: '页面里的状态，不等于数据库里的数据。',
    },
    {
      title: '把对象，装进 HTTP 请求',
      summary: '点击保存后，createNote 将表单对象转成 JSON 文本，准备发送给后端。',
      detail:
        'api/notes.ts 设置请求地址和 POST 方法，http.ts 调用 fetch 发送请求。请求头中的 Content-Type 用来说明正文采用 JSON 格式。',
      file: 'frontend/src/api/notes.ts',
      anchor: 'export function createNote',
      codeLines: 6,
      from: 'browser',
      to: 'vite',
      method: 'POST /api/notes',
      input: payload,
      output: 'POST /api/notes\nContent-Type: application/json\n\n' + payload,
      takeaway: '浏览器和 Python 之间，传递的是 HTTP 消息。',
    },
    {
      title: '开发代理，替请求带个路',
      summary: 'Vite 收到 /api 开头的请求，将它转发到 8000 端口。',
      detail:
        '浏览器先把请求发给页面所在的开发服务（5173），Vite 再转发给后端（8000）。这是开发环境的代理规则，上线时需要配置反向代理。',
      file: 'frontend/vite.config.ts',
      anchor: 'proxy:',
      codeLines: 5,
      from: 'vite',
      to: 'api',
      method: '5173 → 8000',
      input: 'http://127.0.0.1:5173/api/notes',
      output: 'http://127.0.0.1:8000/api/notes',
      takeaway: '前端开发服务和后端服务，是两个不同进程。',
    },
    {
      title: '先检查，再交给接口函数',
      summary: 'FastAPI 根据请求地址和方法找到接口，再由 Pydantic 按 NoteInput 校验数据。',
      detail:
        'Pydantic 先去掉标题首尾的空白，再检查长度。通过校验后，FastAPI 才会把数据交给 create_note。函数中的 Depends 负责提供这次请求使用的数据库会话。',
      file: 'backend/app/schemas.py',
      anchor: 'class NoteInput',
      codeLines: 10,
      from: 'api',
      to: 'api',
      method: 'JSON → NoteInput',
      input: payload,
      output: 'NoteInput(\n  title="理解一次请求",\n  content="从 Vue 页面到数据库。"\n)',
      takeaway: 'TypeScript 检查前端代码，Pydantic 检查真正收到的数据。',
    },
    {
      title: '登记对象，还没有提交',
      summary: '业务函数创建 Note 对象，用 session.add 登记本次修改。',
      detail:
        '路由文件 routers/notes.py 调用业务文件 services/notes.py。这里先创建 Note 对象，再用 add 登记修改；按当前函数的执行顺序，此时还没有提交事务。SQLAlchemy 是随后端运行的 Python 库，不需要单独启动服务。',
      file: 'backend/app/services/notes.py',
      anchor: 'def create_note',
      codeLines: 4,
      from: 'api',
      to: 'api',
      method: 'session.add(note)',
      input: '经过校验的 NoteInput',
      output: 'Note 对象：待写入\n事务：尚未提交',
      takeaway: '模型描述数据，业务函数决定怎样处理数据。',
    },
    {
      title: 'commit：真正写入并提交',
      summary: 'commit 先把待写入的数据发给数据库（flush），再提交事务。',
      detail:
        'SQLAlchemy 通过数据库驱动 Psycopg，将 SQL 发给 PostgreSQL 执行。本次只保存一条记录；以后多个关联操作需要一起成功时，可以把它们放进同一个事务。',
      file: 'backend/app/services/notes.py',
      anchor: '    session.add(note)',
      codeLines: 7,
      from: 'api',
      to: 'database',
      method: 'INSERT · COMMIT',
      input: 'Note 对象：待写入',
      output:
        '-- 示意 SQL，实际 SQL 可通过 SQL_ECHO 查看\nINSERT INTO notes (title, content) VALUES (...);\nCOMMIT;',
      takeaway: '事务提交成功，这次修改才算正式保存。',
    },
    {
      title: '读回数据库生成的字段',
      summary: 'refresh 从数据库重新读取刚保存的记录，包括 id、创建时间等字段。',
      detail:
        'id 和默认时间由数据库生成。业务函数返回 Note 对象后，NoteRead 会从它的属性中读取要返回给前端的字段。',
      file: 'backend/app/services/notes.py',
      anchor: '    session.refresh(note)',
      codeLines: 3,
      from: 'database',
      to: 'api',
      method: 'SELECT → Note',
      input: '数据库中刚创建的记录',
      output: result,
      takeaway: '客户端提交什么，和服务端返回什么，可以使用不同结构。',
    },
    {
      title: '用 201 告诉前端：创建成功',
      summary: 'FastAPI 按 NoteRead 选取返回字段，再转成 JSON 文本。这一步也叫序列化。',
      detail:
        '路由中的 status_code=201 表示“创建成功”。成功响应有不同的状态码，200 和 201 都表示成功，但含义不同。',
      file: 'backend/app/routers/notes.py',
      anchor: '@router.post(',
      codeLines: 7,
      from: 'api',
      to: 'vite',
      method: '201 Created',
      input: 'Python Note 对象',
      output: 'HTTP/1.1 201 Created\nContent-Type: application/json\n\n' + result,
      takeaway: 'HTTP 响应同时包含状态码、响应头和正文。',
    },
    {
      title: '前端收到响应，结束等待',
      summary: 'fetch 收到响应，response.json() 将 JSON 解析成 JavaScript 数据。',
      detail:
        'http.ts 检查响应状态码，失败时抛出错误，交给页面显示。保存成功后，页面清空表单，并显示成功提示。',
      file: 'frontend/src/api/http.ts',
      anchor: '    const body = await response.json()',
      codeLines: 8,
      from: 'vite',
      to: 'browser',
      method: 'JSON → JavaScript',
      input: '201 + JSON 响应正文',
      output: result,
      takeaway: '请求耗时来自真实服务；这里的慢动作仅用于讲解。',
    },
    {
      title: '再查询一次，更新列表',
      summary: '保存成功后，页面再发一次 GET 请求查询列表，Vue 随后更新显示。',
      detail:
        'saveNote 调用 loadNotes，重新查询列表，同时检查服务状态。这次查询仍会经过开发代理。刷新页面后记录还在，是因为它已经保存在数据库中。',
      file: 'frontend/src/views/NotesView.vue',
      anchor: '    await Promise.all([loadNotes(isEditing',
      codeLines: 3,
      from: 'browser',
      to: 'api',
      method: 'GET /api/notes',
      input: '保存成功，列表需要更新',
      output: '{ "items": [ …刚保存的记录 ], "total": 1 }',
      takeaway: '一次页面操作，可以对应多个 HTTP 请求。',
    },
  ],
}

const startup: Lesson = {
  id: 'startup',
  title: '先让服务跑起来',
  description: '按顺序启动数据库、后端和前端，弄清每个服务负责什么。',
  steps: [
    {
      title: '先启动 PostgreSQL',
      summary: '数据库负责保存数据，本机练习环境监听 55432 端口。',
      detail:
        'dev-db.ps1 使用 pg_ctl 启动已有数据库。看到 server started 后再继续；Docker 路线的端口是 5432，以 backend/.env 实际配置为准。',
      file: 'scripts/dev-db.ps1',
      anchor: '# 使用 55432',
      from: 'terminal',
      to: 'database',
      method: 'dev-db.ps1',
      input: '已有数据目录 .tools/pg-data',
      output: '127.0.0.1:55432\nserver started',
      takeaway: '启动数据库不会清空已有记录。',
    },
    {
      title: '迁移先准备好表结构',
      summary: 'Alembic 执行尚未应用的迁移，创建 notes 表。',
      detail:
        '如果这时连接数据库超时，迁移会失败，后端也还没启动。迁移用于准备或更新表结构，保存记录时不会重新建表。',
      file: 'backend/migrations/versions/0001_create_notes.py',
      anchor: 'def upgrade',
      from: 'terminal',
      to: 'database',
      method: 'alembic upgrade head',
      input: '迁移版本 0001',
      output: 'notes 表已创建\n迁移版本被记录',
      takeaway: 'Python 模型文件，并不会自动改变已有数据库。',
    },
    {
      title: '再运行 Python 后端',
      summary: 'Uvicorn 在 8000 端口等待 HTTP 请求，收到后交给 FastAPI 处理。',
      detail:
        'app.main:app 指向 app/main.py 里的应用对象。include_router 给学习记录接口增加 /api 前缀；/docs 提供可操作的接口文档。',
      file: 'backend/app/main.py',
      anchor: 'app = FastAPI',
      from: 'terminal',
      to: 'api',
      method: 'Uvicorn · :8000',
      input: 'Python 应用 app.main:app',
      output: 'http://127.0.0.1:8000/docs',
      takeaway: '后端是持续运行、等待请求的程序。',
    },
    {
      title: '打开前端，开始交互',
      summary: 'Vite 在 5173 提供页面，并把 /api 请求转发到后端。',
      detail:
        '先执行 dev-backend.ps1，再在另一个终端执行 dev-frontend.ps1。课程的分步演示只需前端；真实请求实验和学习记录功能需要后端及数据库。',
      file: 'scripts/dev-frontend.ps1',
      anchor: '    pnpm dev',
      from: 'terminal',
      to: 'vite',
      method: 'Vite · :5173',
      input: 'Vue 源码与开发代理配置',
      output: 'http://127.0.0.1:5173',
      takeaway: '浏览器、开发服务器、后端和数据库承担不同工作。',
    },
  ],
}

export const errorScenarios = [
  { id: 'validation', label: '参数错误 · 422' },
  { id: 'missing', label: '记录不存在 · 404' },
  { id: 'database', label: '数据库断开 · 503' },
]

export function errorLesson(scenario: string): Lesson {
  const validation = scenario === 'validation'
  const missing = scenario === 'missing'
  const code = validation ? 422 : missing ? 404 : 503
  const file = validation
    ? 'backend/app/schemas.py'
    : missing
      ? 'backend/app/routers/notes.py'
      : 'backend/app/main.py'
  const anchor = validation
    ? 'class NoteInput'
    : missing
      ? 'def get_note('
      : '@app.exception_handler'
  const issue = validation
    ? '标题只有空格'
    : missing
      ? 'id 对应的记录不存在'
      : '运行中的后端无法访问数据库'
  return {
    id: 'errors',
    title: '请求出错之后',
    description: '沿着请求找出失败的位置：是参数有误、记录不存在，还是数据库连不上？',
    steps: [
      {
        title: '发出一个需要排查的请求',
        summary: issue + '。先观察输入，再猜测会停在哪一层。',
        detail: validation
          ? '这次直接调用接口，绕过页面的必填校验，看看后端能否拦住不合要求的数据。'
          : '请求仍然会经过开发代理，再到达后端。页面显示“操作失败”时，需要继续查看状态码和响应正文，才能判断原因。',
        file: missing ? 'frontend/src/components/RequestLab.vue' : 'frontend/src/api/notes.ts',
        anchor: missing ? 'const route = computed' : 'export function createNote',
        codeLines: missing ? 13 : 6,
        from: 'browser',
        to: 'api',
        method: missing ? 'GET /api/notes/999999999' : 'POST /api/notes',
        input: validation
          ? '{ "title": "   ", "content": "测试" }'
          : missing
            ? 'id = 999999999'
            : payload,
        output: '请求进入 FastAPI',
        takeaway: '错误排查的第一步：确认实际发送了什么。',
      },
      {
        title: validation
          ? '校验不通过，停止保存'
          : missing
            ? '查询没有找到对应记录'
            : '数据库连接失败',
        summary: issue + '，后端在这一层决定如何响应。',
        detail: validation
          ? '去掉首尾空白后标题长度为 0，Pydantic 返回 422，正常的保存业务函数不会执行。'
          : missing
            ? 'session.get 返回 None，路由抛出 HTTPException(404)，没有删除或修改任何记录。'
            : 'SQLAlchemy 抛出数据库异常，由 main.py 的异常处理器返回 503。这里演示运行期间断开；启动时迁移失败属于前一节的启动流程。',
        file,
        anchor,
        from: 'api',
        to: 'api',
        method: validation ? '校验失败' : missing ? 'HTTPException(404)' : 'SQLAlchemyError → 503',
        input: issue,
        output: validation ? 'NoteInput 校验失败' : missing ? 'note is None' : 'SQLAlchemyError',
        takeaway: validation
          ? '前端校验改善体验，后端校验确保入口数据符合规则。'
          : missing
            ? '没有找到数据，与数据库连接失败是两种情况。'
            : '先确认数据库进程、端口和连接配置。',
        error: true,
      },
      {
        title: `让 ${code} 回到浏览器`,
        summary: '前端读取状态码和错误正文，再向用户显示失败原因。',
        detail:
          '你可以在“真实请求”中亲手验证 422 和 404。这里的 503 只演示错误流程，不会关闭数据库。实验面板会显示实际收到的响应。',
        file: 'frontend/src/api/http.ts',
        anchor: '    if (!response.ok)',
        from: 'api',
        to: 'browser',
        method: `HTTP ${code}`,
        input: '后端错误响应',
        output: JSON.stringify(
          {
            detail: validation
              ? [
                  {
                    type: 'string_too_short',
                    loc: ['body', 'title'],
                    msg: 'String should have at least 1 character',
                    input: '   ',
                    ctx: { min_length: 1 },
                  },
                ]
              : missing
                ? '学习记录不存在'
                : '数据库暂时不可用，请检查数据库和迁移状态',
          },
          null,
          2,
        ),
        takeaway: '观察状态码、响应内容和后端日志，沿调用路径定位。',
        error: true,
      },
    ],
  }
}

export const lessons = [startup, request, errorLesson('validation')]
export const defaultLesson = request
