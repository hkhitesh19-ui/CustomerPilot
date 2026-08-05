Write-Host "Starting CustomerPilot Dev Server..."
docker-compose up -d postgres redis evolution-api

Write-Host "Starting Cloudflare Quick Tunnel..."
# Clear old log
if (Test-Path cloudflared.log) { Remove-Item cloudflared.log }
Start-Process -NoNewWindow -FilePath ".\cloudflared.exe" -ArgumentList "tunnel --url http://localhost:3001" -RedirectStandardError "cloudflared.log"

Write-Host "Running Auto-Sync Webhook Script..."
Start-Process -NoNewWindow -FilePath "node" -ArgumentList "scripts/autoWebhookSync.js"

npm run dev
