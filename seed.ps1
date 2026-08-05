Write-Host "Seeding CustomerPilot Database..."
npx tsx prisma/seed.ts
Write-Host "Seeding Complete." -ForegroundColor Green
