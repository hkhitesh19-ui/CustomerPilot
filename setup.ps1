Write-Host "======================================================"
Write-Host " CUSTOMERPILOT - SETUP SCRIPT (WINDOWS)"
Write-Host "======================================================"

Write-Host "[1/4] Installing Node.js Dependencies..."
npm install

if (!(Test-Path .env)) {
  Write-Host "[2/4] Creating .env file from .env.example..."
  Copy-Item .env.example .env
  Write-Host "WARNING: Please review the .env file and add your Google/Gemini keys." -ForegroundColor Yellow
} else {
  Write-Host "[2/4] .env file already exists. Skipping..."
}

Write-Host "[3/4] Starting Docker Containers (Postgres, Redis, Evolution)..."
docker-compose up -d postgres redis evolution-api pgadmin redisinsight

Write-Host "Waiting for PostgreSQL to be ready..."
Start-Sleep -Seconds 5

Write-Host "[4/4] Initializing Database (Prisma)..."
npx prisma generate
npx prisma migrate dev --name init

Write-Host "======================================================"
Write-Host " Setup Complete! Run '.\start.ps1' to launch."
Write-Host "======================================================"
