# Latch — Live Demo Test Script
# Fires 4 webhooks with different HTTP methods so you can see colored badges on the dashboard.
#
# Usage:
#   powershell -ExecutionPolicy Bypass -File .\scripts\test-live.ps1
#   powershell -ExecutionPolicy Bypass -File .\scripts\test-live.ps1 -ProjectId "your-uuid-here"

param(
    [string]$ProjectId = "73402e9f-10a2-446f-988c-40e9627f4031",  # "Struoe" project (most recent)
    [string]$BaseUrl   = "http://localhost:3000"
)

$url = "$BaseUrl/api/ingest/$ProjectId"

Write-Host ""
Write-Host "🎯 Latch Live Demo — Firing test webhooks" -ForegroundColor Cyan
Write-Host "   Project ID : $ProjectId" -ForegroundColor DarkGray
Write-Host "   Ingest URL : $url" -ForegroundColor DarkGray
Write-Host ""

# POST — emerald badge
Write-Host "→ POST  (emerald badge)..." -ForegroundColor Green -NoNewline
try {
  $r = Invoke-RestMethod -Uri $url -Method POST -ContentType "application/json" -Body '{"event":"payment.completed","amount":4900,"currency":"usd"}'
  Write-Host " ✓ $($r | ConvertTo-Json -Compress)" -ForegroundColor Green
} catch { Write-Host " ✗ $($_.Exception.Message)" -ForegroundColor DarkRed }
Start-Sleep -Milliseconds 600

# PUT — amber badge
Write-Host "→ PUT   (amber badge)..." -ForegroundColor Yellow -NoNewline
try {
  $r = Invoke-RestMethod -Uri $url -Method PUT -ContentType "application/json" -Body '{"event":"customer.updated","name":"Jane Doe","plan":"pro"}'
  Write-Host " ✓ $($r | ConvertTo-Json -Compress)" -ForegroundColor Yellow
} catch { Write-Host " ✗ $($_.Exception.Message)" -ForegroundColor DarkRed }
Start-Sleep -Milliseconds 600

# DELETE — red badge
Write-Host "→ DELETE (red badge)..." -ForegroundColor Red -NoNewline
try {
  $r = Invoke-RestMethod -Uri $url -Method DELETE -ContentType "application/json" -Body '{"event":"subscription.cancelled","id":"sub_123","reason":"user_request"}'
  Write-Host " ✓ $($r | ConvertTo-Json -Compress)" -ForegroundColor Red
} catch { Write-Host " ✗ $($_.Exception.Message)" -ForegroundColor DarkRed }
Start-Sleep -Milliseconds 600

# PATCH — blue badge
Write-Host "→ PATCH  (blue badge)..." -ForegroundColor Blue -NoNewline
try {
  $r = Invoke-RestMethod -Uri $url -Method PATCH -ContentType "application/json" -Body '{"event":"order.amended","item":"Widget Pro","qty":3}'
  Write-Host " ✓ $($r | ConvertTo-Json -Compress)" -ForegroundColor Blue
} catch { Write-Host " ✗ $($_.Exception.Message)" -ForegroundColor DarkRed }

Write-Host ""
Write-Host "✅ Done! Check your dashboard — 4 events should have streamed in live." -ForegroundColor Cyan
Write-Host ""
