$ErrorActionPreference = 'Stop'
$projectRoot = Split-Path $PSScriptRoot -Parent
Push-Location $projectRoot
try {
    if (Get-Command fnm -ErrorAction SilentlyContinue) {
        # 本机 fnm 使用 power-shell 这个名称，环境变更仅作用于当前终端。
        fnm env --shell power-shell | Out-String | Invoke-Expression
        fnm use (Get-Content -LiteralPath '.node-version' -Raw).Trim()
        if ($LASTEXITCODE -ne 0) { throw '请先执行 fnm install 22.23.1。' }
    }
    Set-Location (Join-Path $projectRoot 'frontend')
    if (!(Test-Path -LiteralPath 'node_modules')) {
        pnpm install --frozen-lockfile
        if ($LASTEXITCODE -ne 0) { throw '前端依赖安装失败。' }
    }
    pnpm dev
} finally {
    Pop-Location
}
