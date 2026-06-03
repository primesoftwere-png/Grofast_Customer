@echo off
echo.
echo ========================================
echo    Fixing Turbopack Error
echo ========================================
echo.

echo Step 1: Removing .next folder...
if exist ".next" (
    rmdir /s /q ".next"
    echo [OK] .next folder removed
) else (
    echo [OK] .next folder doesn't exist
)

echo.
echo Step 2: Removing node_modules...
if exist "node_modules" (
    rmdir /s /q "node_modules"
    echo [OK] node_modules removed
) else (
    echo [OK] node_modules doesn't exist
)

echo.
echo Step 3: Removing package-lock.json...
if exist "package-lock.json" (
    del /f "package-lock.json"
    echo [OK] package-lock.json removed
) else (
    echo [OK] package-lock.json doesn't exist
)

echo.
echo Step 4: Clearing npm cache...
call npm cache clean --force
echo [OK] npm cache cleared

echo.
echo Step 5: Reinstalling dependencies...
echo This may take a few minutes...
call npm install

if %errorlevel% neq 0 (
    echo [ERROR] Installation failed. Trying with --legacy-peer-deps...
    call npm install --legacy-peer-deps
)

echo.
echo ========================================
echo    Fix Complete!
echo ========================================
echo.
echo Now run: npm run dev
echo.
pause
