# PowerShell script to run npm run dev

# Set error action preference to stop on any error
$ErrorActionPreference = "Stop"

try {
    # Display starting message
    Write-Host "Starting development server..." -ForegroundColor Green
    
    # Get the script's directory path
    $scriptPath = Split-Path -Parent $MyInvocation.MyCommand.Path
    
    # Change to the script's directory
    Set-Location $scriptPath
    
    # Kill any process using port 4321
    Write-Host "Checking for processes using port 4321..." -ForegroundColor Yellow
    $processInfo = Get-NetTCPConnection -LocalPort 4321 -ErrorAction SilentlyContinue | Select-Object -First 1
    
    if ($processInfo) {
        $process = Get-Process -Id $processInfo.OwningProcess
        Write-Host "Found process using port 4321: $($process.ProcessName) (PID: $($process.Id))" -ForegroundColor Yellow
        Stop-Process -Id $processInfo.OwningProcess -Force
        Write-Host "Successfully killed process on port 4321" -ForegroundColor Green
        # Wait a moment to ensure the port is freed
        Start-Sleep -Seconds 2
    } else {
        Write-Host "No process found using port 4321" -ForegroundColor Cyan
    }
    
    # Run npm run dev
    Write-Host "Executing 'npm run dev'..." -ForegroundColor Cyan
    npm run dev
}
catch {
    # Error handling
    Write-Host "Error occurred while starting the development server:" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    exit 1
}