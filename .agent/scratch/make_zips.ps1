# PowerShell script to create separate zip files for frontend and admin, excluding node_modules, .git, and build directories.

# 1. Zip Frontend App
Write-Host "Starting Frontend packaging..." -ForegroundColor Cyan
$tempFront = Join-Path $env:TEMP "medssevaappfront_temp"
if (Test-Path $tempFront) { 
    Remove-Item -Path $tempFront -Recurse -Force 
}
New-Item -ItemType Directory -Path $tempFront | Out-Null

# Copy files using robocopy (robust copying and folder exclusion)
Write-Host "Copying frontend files (excluding node_modules, .git, .expo)..."
robocopy "c:\Users\Mahek Saarla\Desktop\medssevaappfront" $tempFront /E /XD node_modules .git .expo | Out-Null

# Compress
Write-Host "Creating medssevaappfront.zip on Desktop..." -ForegroundColor Yellow
$zipFrontPath = "c:\Users\Mahek Saarla\Desktop\medssevaappfront.zip"
if (Test-Path $zipFrontPath) {
    Remove-Item -Path $zipFrontPath -Force
}
Compress-Archive -Path "$tempFront\*" -DestinationPath $zipFrontPath -Force

# Clean up
Remove-Item -Path $tempFront -Recurse -Force
Write-Host "Frontend package created successfully at: $zipFrontPath" -ForegroundColor Green

Write-Host "------------------------------------"

# 2. Zip Admin App
Write-Host "Starting Admin packaging..." -ForegroundColor Cyan
$tempAdmin = Join-Path $env:TEMP "medssevaadmin_temp"
if (Test-Path $tempAdmin) { 
    Remove-Item -Path $tempAdmin -Recurse -Force 
}
New-Item -ItemType Directory -Path $tempAdmin | Out-Null

# Copy files using robocopy
Write-Host "Copying admin files (excluding node_modules, .git, dist, build)..."
robocopy "c:\Users\Mahek Saarla\Desktop\medssevaadmin" $tempAdmin /E /XD node_modules .git dist build | Out-Null

# Compress
Write-Host "Creating medssevaadmin.zip on Desktop..." -ForegroundColor Yellow
$zipAdminPath = "c:\Users\Mahek Saarla\Desktop\medssevaadmin.zip"
if (Test-Path $zipAdminPath) {
    Remove-Item -Path $zipAdminPath -Force
}
Compress-Archive -Path "$tempAdmin\*" -DestinationPath $zipAdminPath -Force

# Clean up
Remove-Item -Path $tempAdmin -Recurse -Force
Write-Host "Admin package created successfully at: $zipAdminPath" -ForegroundColor Green

Write-Host "`nAll operations completed successfully!" -ForegroundColor Green
