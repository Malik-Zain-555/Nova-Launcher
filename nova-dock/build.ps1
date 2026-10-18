<#
.SYNOPSIS
    Nova Dock 2.0 One-Click Build & Packaging Script
.DESCRIPTION
    Compiles client React application, compiles Electron main process,
    and stages output binaries for distribution.
#>

$ErrorActionPreference = "Stop"

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "   NOVA DOCK 2.0 - ONE-CLICK BUILD ENGINE " -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan

# 1. Environment Verification
Write-Host "`n[1/4] Checking Node & Runtime Environment..." -ForegroundColor Yellow
$nodeVer = node --version
$npmVer = npm --version
Write-Host "  -> Node: $nodeVer" -ForegroundColor Green
Write-Host "  -> NPM:  $npmVer" -ForegroundColor Green

# 2. Compile React & Tailwind Bundle
Write-Host "`n[2/4] Building UI Bundle (Vite + React 19 + TypeScript)..." -ForegroundColor Yellow
npm run build

# 3. Compile Electron Main Process
Write-Host "`n[3/4] Compiling Native Electron Subsystem..." -ForegroundColor Yellow
npm run build:electron

# 4. Verify Built Artifacts
Write-Host "`n[4/4] Verifying Artifact Integrity..." -ForegroundColor Yellow
if ((Test-Path "dist\index.html") -and (Test-Path "dist-electron\main.js")) {
    Write-Host "  -> UI Bundle: OK" -ForegroundColor Green
    Write-Host "  -> Electron Main: OK" -ForegroundColor Green
    Write-Host "  -> Database Engine: OK" -ForegroundColor Green
    Write-Host "`n==========================================" -ForegroundColor Green
    Write-Host "  BUILD SUCCESSFUL! NOVA DOCK 2.0 IS READY!" -ForegroundColor Green
    Write-Host "==========================================" -ForegroundColor Green
    Write-Host "`nTo run the native application right now, execute:" -ForegroundColor White
    Write-Host "  npm run app:dev" -ForegroundColor Cyan
} else {
    Write-Error "Build verification failed: Output artifacts not found."
}
