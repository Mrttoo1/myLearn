# 前后端图解 · 全栈学习项目

首页通过可播放、暂停和逐步观察的 GSAP 动画讲解前后端交互，结合项目真实源码、请求数据与响应。学习记录是独立的练习功能，用于验证 Vue、FastAPI 和 PostgreSQL 的完整数据流程。

现有课程包括服务启动、新增记录和错误排查。学习记录支持新增、分页查看、编辑和删除。动画中的数据明确标为演示数据；“真实请求”实验保存成功后，会真正新增学习记录。关键后端代码包含中文注释。

## 在当前电脑上启动

已为本机准备 Node 22.23.1（通过 fnm 使用）、项目内 Python 3.13、uv 和独立的 PostgreSQL 练习环境。工具和数据库文件在 `.tools/`，不进入 Git；Python 依赖在 `backend/.venv/`。

在项目根目录 `E:\myLearn` 打开 PowerShell，先启动数据库：

```powershell
.\scripts\dev-db.ps1
```

数据库在后台运行。再分别打开两个终端执行：

```powershell
# 终端一：检查依赖、执行数据库迁移，然后启动后端。
.\scripts\dev-backend.ps1
```

```powershell
# 终端二：使用 fnm 切换 Node，然后启动前端。
.\scripts\dev-frontend.ps1
```

- 交互课程：<http://127.0.0.1:5173>
- 学习记录：<http://127.0.0.1:5173/notes>
- 可直接调试的接口文档：<http://127.0.0.1:8000/docs>
- 服务与数据库连接检查：<http://127.0.0.1:8000/api/health>

本机 `backend/.env` 连接的是 `127.0.0.1:55432`。共享的 `.env.example` 使用 Docker 路线的 `5432`，请按实际数据库修改。

前后端终端按 `Ctrl+C` 停止；停止本机练习数据库：

```powershell
.\scripts\dev-db.ps1 -Stop
```

停止数据库不会删除已保存的记录。

## 换一台电脑时准备环境

需要 Node `^22.18.0 || >=24.12.0`、pnpm、uv 和 PostgreSQL。根目录 `.node-version` 固定本次使用的 Node；后端 `.python-version` 指定 Python 3.13，由 uv 自动准备。

前端依赖采用 `pnpm-lock.yaml`，后端依赖采用 `uv.lock`。重新安装时使用锁文件，便于复现环境。

### 1. 准备 Node 和 Python 工具

```powershell
fnm install 22.23.1
fnm use 22.23.1
node --version
pnpm --version
```

如果尚未安装 pnpm 或 uv，可按照 [pnpm 安装说明](https://pnpm.io/installation)和 [uv 安装说明](https://docs.astral.sh/uv/getting-started/installation/)准备。

### 2. 启动数据库

安装并启动 Docker 后，在项目根目录执行：

```powershell
docker compose up -d db
docker compose ps
Copy-Item backend/.env.example backend/.env
```

复制配置时请保留已有自定义配置。Docker 数据库端口是 `5432`，默认连接信息见 `compose.yaml`，仅用于本地练习。也可以使用已安装的 PostgreSQL，手动创建 `learn` 数据库并修改 `backend/.env`。

### 3. 启动后端

```powershell
cd backend
uv sync --locked
uv run alembic upgrade head
uv run uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

`app.main:app` 表示导入 `app/main.py` 中名为 `app` 的应用对象。迁移命令负责建表；启动后端不会自动建表。

### 4. 启动前端

另开终端：

```powershell
cd frontend
pnpm install --frozen-lockfile
pnpm dev
```

前端使用相对地址 `/api`。开发服务器通过 `vite.config.ts` 将请求转发到 `127.0.0.1:8000`。前端和后端是两个独立进程，生产部署时需要另行配置反向代理。

## 从哪里开始阅读

建议先在首页点击“播放”或“下一步”，结合右侧源码走完“一条记录的旅程”。再看 [教学页面使用与源码说明](docs/教学页面使用与源码说明.md)和 [第一课：追踪一次请求](docs/第一课-追踪一次请求.md)。后端按以下顺序阅读：

| 顺序 | 文件 | 重点 |
| --- | --- | --- |
| 1 | `backend/app/main.py` | 应用入口、路由注册、健康检查 |
| 2 | `backend/app/routers/notes.py` | 请求地址、请求方法、依赖注入、状态码 |
| 3 | `backend/app/schemas.py` | 请求校验、响应字段、模型与接口结构的区别 |
| 4 | `backend/app/services/notes.py` | 查询、修改、提交事务 |
| 5 | `backend/app/models.py` | 表、字段、类型和时间 |
| 6 | `backend/app/database.py` | 连接池、会话、请求结束后的清理 |
| 7 | `backend/migrations/versions/0001_create_notes.py` | 数据库迁移如何创建表 |
| 8 | `frontend/src/api/notes.ts`、`frontend/src/views/NotesView.vue` | 前端操作如何对应后端接口 |

学习进度和自己的理解记录在 [学习记录](学习记录.md)。不需要一次读懂全部文件，先追踪新增一条记录。

教学界面本身按以下职责组织：

| 文件 | 作用 |
| --- | --- |
| `frontend/src/lessons/content.ts` | 课程步骤、输入输出示例与真实文件映射 |
| `frontend/src/lessons/flow.ts` | 消息角色、方向与图示坐标 |
| `frontend/src/composables/useLessonPlayer.ts` | GSAP 播放头、暂停、跳转和倍速 |
| `frontend/src/components/FlowDiagram.vue` | 流程图、时序图、当前数据包位置 |
| `frontend/src/components/TechnicalDevice.vue` | 原创几何 SVG 设备插图 |
| `frontend/src/components/RequestLab.vue` | 实际 HTTP 请求、状态码和耗时 |
| `frontend/lessonSourcesPlugin.ts` | 开发和构建时读取白名单源码，不读取 `.env` |

交互和布局参考 [MCP Explained](https://mcp-explained.com/)，课程内容与代码映射围绕本项目独立编写。

## 接口清单

| 方法 | 地址 | 作用 | 成功状态码 |
| --- | --- | --- | --- |
| GET | `/api/health` | 执行 `SELECT 1`，检查服务和数据库 | 200 |
| GET | `/api/notes?limit=5&offset=0` | 分页查询，返回 `items` 和 `total` | 200 |
| GET | `/api/notes/{id}` | 查询单条记录 | 200 |
| POST | `/api/notes` | 新增记录 | 201 |
| PUT | `/api/notes/{id}` | 完整更新标题和正文 | 200 |
| DELETE | `/api/notes/{id}` | 删除记录，响应没有正文 | 204 |

标题去掉首尾空白后须为 1～100 字符，正文最多 10000 字符。参数错误返回 `422`，不存在的记录返回 `404`，数据库错误返回 `503`。详细请求和返回结构以 `/docs` 为准。

## 验证代码

前端：

```powershell
cd frontend
pnpm test
pnpm lint
pnpm format:check
pnpm build
```

后端检查（已运行过 `uv sync`）：

```powershell
cd backend
.\.venv\Scripts\ruff.exe check
.\.venv\Scripts\ruff.exe format --check
.\.venv\Scripts\python.exe -m alembic check
```

接口测试使用真实 PostgreSQL，必须使用独立测试库。本机练习环境已经创建 `learn_test`：

```powershell
cd backend
$env:TEST_DATABASE_URL = 'postgresql+psycopg://learn:learn_dev_password@127.0.0.1:55432/learn_test'
.\.venv\Scripts\python.exe -m pytest -q
```

Docker 路线则先在根目录创建测试库，然后将上述测试地址的端口改为 `5432`：

```powershell
docker compose exec db createdb -U learn learn_test
```

测试执行真实迁移，每条用例使用独立事务并在结束后回滚，不会向业务库写入测试记录。

## 常见问题

- **pnpm 提示 Node 太旧**：在当前终端执行 `fnm use 22.23.1`，再用 `node --version` 确认；旧终端不会自动继承新终端的环境。
- **显示无法连接服务**：检查后端终端是否仍在运行，端口是否为 `8000`。
- **健康检查返回 503**：检查数据库是否启动、`.env` 中的账号和端口是否正确。健康检查只验证连接；记录接口还要求已执行迁移。
- **提示 notes 表不存在**：在 `backend` 目录执行 `uv run alembic upgrade head`。
- **前端端口被占用**：先停止占用 `5173` 的进程。本项目设置了 `strictPort`，避免悄悄换端口造成混淆。

下一阶段再加入登录、用户数据归属和服务器部署。第一版用于本地单人学习。
