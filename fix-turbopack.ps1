# Fix Turbopack Error Script
# Run this script to fix the Turbopack error

Write-Host "🔧 Fixing Turbopack Error..." -ForegroundColor Cyan
Write-Host ""

# Step 1: Remove .next folder
Write-Host "Step 1: Removing .next folder..." -ForegroundColor Yellow
if (Test-Path ".next") {
    Remove-Item -Recurse -Force .next
    Write-Host "✓ .next folder removed" -ForegroundColor Green
} else {
    Write-Host "✓ .next folder doesn't exist" -ForegroundColor Green
}

# Step 2: Remove node_modules
Write-Host ""
Write-Host "Step 2: Removing node_modules..." -ForegroundColor Yellow
if (Test-Path "node_modules") {
    Remove-Item -Recurse -Force node_modules
    Write-Host "✓ node_modules removed" -ForegroundColor Green
} else {
    Write-Host "✓ node_modules doesn't exist" -ForegroundColor Green
}

# Step 3: Remove package-lock.json
Write-Host ""
Write-Host "Step 3: Removing package-lock.json..." -ForegroundColor Yellow
if (Test-Path "package-lock.json") {
    Remove-Item -Force package-lock.json
    Write-Host "✓ package-lock.json removed" -ForegroundColor Green
} else {
    Write-Host "✓ package-lock.json doesn't exist" -ForegroundColor Green
}

# Step 4: Clear npm cache
Write-Host ""
Write-Host "Step 4: Clearing npm cache..." -ForegroundColor Yellow
npm cache clean --force
Write-Host "✓ npm cache cleared" -ForegroundColor Green

# Step 5: Reinstall dependencies
Write-Host ""
Write-Host "Step 5: Reinstalling dependencies..." -ForegroundColor Yellow
Write-Host "This may take a few minutes..." -ForegroundColor Gray
npm install

if ($LASTEXITCODE -eq 0) {
    Write-Host "✓ Dependencies installed successfully" -ForegroundColor Green
} else {
    Write-Host "✗ Installation failed. Trying with --legacy-peer-deps..." -ForegroundColor Red
    npm install --legacy-peer-deps
}

# Done
Write-Host ""
Write-Host "✅ Fix complete!" -ForegroundColor Green
Write-Host ""
Write-Host "Now run: npm run dev" -ForegroundColor Cyan
Write-Host ""
