if (Test-Path cloudflared.log) { Remove-Item cloudflared.log }
Start-Process -NoNewWindow -FilePath ".\cloudflared.exe" -ArgumentList "tunnel --url http://localhost:3000" -RedirectStandardError "cloudflared.log"
Start-Process -NoNewWindow -FilePath "node" -ArgumentList "scripts/autoWebhookSync.js"
