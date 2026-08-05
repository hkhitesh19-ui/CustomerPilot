Write-Host "Resetting CustomerPilot Database and Docker Containers..." -ForegroundColor Red
docker-compose down -v
npx prisma migrate reset --force
Write-Host "Reset Complete. Run '.\setup.ps1' to rebuild." -ForegroundColor Green
