Write-Host "======================================================"
Write-Host " CUSTOMERPILOT - DOCTOR SCRIPT (SYSTEM CHECK)"
Write-Host "======================================================"

$errors = 0

Write-Host "Checking Node.js..." -NoNewline
if (Get-Command node -ErrorAction SilentlyContinue) {
    Write-Host " [OK] " (node -v) -ForegroundColor Green
} else {
    Write-Host " [FAIL]" -ForegroundColor Red
    $errors++
}

Write-Host "Checking Docker..." -NoNewline
if (Get-Command docker -ErrorAction SilentlyContinue) {
    # Check if daemon is running
    $dockerInfo = docker info 2>&1
    if ($dockerInfo -match "error during connect") {
        Write-Host " [FAIL] (Docker daemon is not running)" -ForegroundColor Red
        $errors++
    } else {
        Write-Host " [OK]" -ForegroundColor Green
    }
} else {
    Write-Host " [FAIL]" -ForegroundColor Red
    $errors++
}

Write-Host "Checking .env file..." -NoNewline
if (Test-Path .env) {
    Write-Host " [OK]" -ForegroundColor Green
} else {
    Write-Host " [FAIL]" -ForegroundColor Red
    $errors++
}

Write-Host "======================================================"
if ($errors -eq 0) {
    Write-Host "System is ready for CustomerPilot!" -ForegroundColor Green
} else {
    Write-Host "Found $errors issue(s). Please fix them before starting." -ForegroundColor Red
}
Write-Host "======================================================"
