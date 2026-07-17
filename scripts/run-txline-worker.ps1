$ErrorActionPreference = "Stop"

$projectRoot = Split-Path -Parent $PSScriptRoot
$nodePath = if ($env:MATCHFLASH_NODE_PATH) {
  $env:MATCHFLASH_NODE_PATH
} else {
  "C:\Program Files\nodejs\node.exe"
}

if (-not (Test-Path -LiteralPath $nodePath)) {
  throw "Node.js was not found at '$nodePath'. Install Node.js 20+ for all users or set MATCHFLASH_NODE_PATH."
}

$envFile = Join-Path $projectRoot ".env.worker"
if (-not (Test-Path -LiteralPath $envFile)) {
  throw "Create '$envFile' from .env.worker.example before starting the worker."
}

Set-Location -LiteralPath $projectRoot
& $nodePath "--env-file=$envFile" "--experimental-strip-types" "workers/txline-worker.ts"
exit $LASTEXITCODE
