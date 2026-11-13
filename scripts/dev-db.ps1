param([switch]$Stop)

# 这是本机练习的便捷入口。通用的 Docker 数据库启动方式见 README。
$ErrorActionPreference = 'Stop'
$projectRoot = Split-Path $PSScriptRoot -Parent
$pgBin = Join-Path $projectRoot '.tools\postgres\package\native\bin'
$dataDir = Join-Path $projectRoot '.tools\pg-data'
$pgCtl = Join-Path $pgBin 'pg_ctl.exe'

if (!(Test-Path -LiteralPath $pgCtl) -or !(Test-Path -LiteralPath (Join-Path $dataDir 'PG_VERSION'))) {
    throw '找不到本机练习数据库。请按照 README 使用 Docker 或自行安装 PostgreSQL。'
}

if ($Stop) {
    & $pgCtl -D $dataDir -w stop
    exit $LASTEXITCODE
}

& $pgCtl -D $dataDir status
if ($LASTEXITCODE -eq 0) { exit 0 }

# 使用 55432 端口，与可能已有的 5432 数据库分开，且只允许本机连接。
& $pgCtl -D $dataDir -l (Join-Path $projectRoot '.tools\postgres.log') -o '-h 127.0.0.1 -p 55432' -w start
if ($LASTEXITCODE -ne 0) { throw '数据库启动失败，请查看 .tools/postgres.log。' }
