# Installation Commands for Windows

# Backend Setup
Write-Host "Setting up Backend..." -ForegroundColor Green
cd backend
npm install
if ($LASTEXITCODE -eq 0) {
    Write-Host "✓ Backend dependencies installed successfully" -ForegroundColor Green
}
else {
    Write-Host "✗ Backend installation failed" -ForegroundColor Red
    exit 1
}

# Frontend Setup
Write-Host "`nSetting up Frontend..." -ForegroundColor Green
cd ..\frontend
npm install
if ($LASTEXITCODE -eq 0) {
    Write-Host "✓ Frontend dependencies installed successfully" -ForegroundColor Green
}
else {
    Write-Host "✗ Frontend installation failed" -ForegroundColor Red
    exit 1
}

cd ..

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "✓ Installation Complete!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "`nNext steps:" -ForegroundColor Yellow
Write-Host "1. Make sure MongoDB is running"
Write-Host "2. Start backend: cd backend; npm start"
Write-Host "3. Start frontend: cd frontend; npm start"
Write-Host "`nFor detailed instructions, see SETUP.md"
