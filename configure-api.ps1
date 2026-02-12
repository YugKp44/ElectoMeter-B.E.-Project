# API Configuration Helper
# Run this script to update the API base URL based on your setup

Write-Host "`n=== Smart Energy Meter - API Configuration ===" -ForegroundColor Cyan
Write-Host ""

# Get current IP address
$ipAddress = (Get-NetIPAddress -AddressFamily IPv4 | Where-Object { $_.InterfaceAlias -notlike "*Loopback*" -and $_.IPAddress -notlike "169.254.*" } | Select-Object -First 1).IPAddress

Write-Host "Your current IP address: $ipAddress" -ForegroundColor Green
Write-Host ""
Write-Host "Choose your setup:" -ForegroundColor Yellow
Write-Host "1. Web Browser (use localhost)"
Write-Host "2. iOS Simulator (use localhost)"
Write-Host "3. Android Emulator (use 10.0.2.2)"
Write-Host "4. Physical Device (use $ipAddress)"
Write-Host ""

$choice = Read-Host "Enter your choice (1-4)"

$apiUrl = switch ($choice) {
    "1" { "http://localhost:3000/api" }
    "2" { "http://localhost:3000/api" }
    "3" { "http://10.0.2.2:3000/api" }
    "4" { "http://${ipAddress}:3000/api" }
    default { 
        Write-Host "Invalid choice. Using localhost." -ForegroundColor Red
        "http://localhost:3000/api"
    }
}

Write-Host ""
Write-Host "Updating API configuration to: $apiUrl" -ForegroundColor Cyan

# Update the API file
$apiFilePath = ".\frontend\services\api.js"
$content = Get-Content $apiFilePath -Raw

# Replace the API_BASE_URL line
$pattern = "const API_BASE_URL = '.*';"
$replacement = "const API_BASE_URL = '$apiUrl';"
$newContent = $content -replace $pattern, $replacement

Set-Content -Path $apiFilePath -Value $newContent

Write-Host "✓ API configuration updated successfully!" -ForegroundColor Green
Write-Host ""
Write-Host "Make sure to restart your frontend (Expo) for changes to take effect." -ForegroundColor Yellow
Write-Host ""

# Test the connection
Write-Host "Testing backend connection..." -ForegroundColor Cyan
try {
    $testUrl = $apiUrl.Replace('/api', '')
    $response = Invoke-RestMethod -Uri $testUrl -Method Get -TimeoutSec 5
    Write-Host "✓ Backend is running!" -ForegroundColor Green
    Write-Host "  Version: $($response.version)" -ForegroundColor Gray
    Write-Host "  Status: $($response.status)" -ForegroundColor Gray
}
catch {
    Write-Host "✗ Cannot connect to backend at $testUrl" -ForegroundColor Red
    Write-Host "  Make sure the backend server is running: cd backend && npm start" -ForegroundColor Yellow
}

Write-Host ""
