$ErrorActionPreference = "Stop"

$ports = 3000, 5000

foreach ($port in $ports) {
  $connections = Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue
  if ($connections) {
    $processIds = $connections.OwningProcess | Sort-Object -Unique
    foreach ($processId in $processIds) {
      try {
        Stop-Process -Id $processId -Force
      } catch {
        Write-Host "Failed to stop process ID $processId on port $port"
      }
    }
  }
}

Write-Host "Stopped services on ports 3000 and 5000."
