$ErrorActionPreference = 'Stop'
$projectRoot = Split-Path $PSScriptRoot -Parent
$backendDir = Join-Path $projectRoot 'backend'

# 优先使用已安装的 uv；本机也准备了一份放在 .tools 中的独立工具。
$uvCommand = Get-Command uv -ErrorAction SilentlyContinue
if ($uvCommand) {
    $uvPath = $uvCommand.Source
} else {
    $uvPath = Get-ChildItem -Path (Join-Path $projectRoot '.tools\uv') -Filter uv.exe -Recurse -ErrorAction SilentlyContinue | Select-Object -First 1 -ExpandProperty FullName
}
if (!$uvPath) { throw '请先安装 uv，安装方法见 README。' }

$env:UV_CACHE_DIR = Join-Path $projectRoot '.tools\uv-cache'
$env:UV_PYTHON_INSTALL_DIR = Join-Path $projectRoot '.tools\python'
Push-Location $backendDir
try {
    if (!(Test-Path -LiteralPath '.env')) { Copy-Item -LiteralPath '.env.example' -Destination '.env' }
    & $uvPath sync --locked
    if ($LASTEXITCODE -ne 0) { throw '后端依赖安装失败。' }
    & $uvPath run alembic upgrade head
    if ($LASTEXITCODE -ne 0) { throw '数据库迁移失败，请检查数据库是否启动，以及 backend/.env 的连接地址。' }
    # --reload 在源码变化时重启应用，适合开发，不用于生产部署。
    & $uvPath run uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
} finally {
    Pop-Location
}
