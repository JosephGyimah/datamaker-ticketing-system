$ErrorActionPreference = "Stop"

$root = Split-Path -Parent $PSScriptRoot
$nodePath = "C:\Program Files\nodejs"

if (Test-Path $nodePath) {
  $env:PATH = "$nodePath;$env:PATH"
}

$backendPath = Join-Path $root "backend"
$frontendPath = Join-Path $root "frontend"

Write-Host "Starting backend..."
Start-Process -FilePath "npm" -ArgumentList @("--prefix", $backendPath, "start") -WorkingDirectory $root

Write-Host "Building frontend..."
& "npm" --prefix $frontendPath run build

Write-Host "Serving frontend on port 3000..."
Start-Process -FilePath "npx" -ArgumentList @("--yes", "serve", "-s", "dist", "-l", "3000") -WorkingDirectory $frontendPath

Write-Host "Done. Keep this window open for logs."
