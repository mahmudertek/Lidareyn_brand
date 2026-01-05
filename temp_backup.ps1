$root = "C:\Users\pc\Desktop\Lidareyn_brand"
$timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
$backupsDir = Join-Path $root "backups"
$dest = Join-Path $backupsDir ("backup_" + $timestamp)

if (-not (Test-Path $backupsDir)) { New-Item -ItemType Directory -Path $backupsDir }
New-Item -ItemType Directory -Path $dest

$exclude = @("backups", "node_modules", ".git", ".agent", ".gemini")

Get-ChildItem -Path $root | Where-Object { $exclude -notcontains $_.Name } | Copy-Item -Destination $dest -Recurse

Write-Host "Backup Success: $dest"
