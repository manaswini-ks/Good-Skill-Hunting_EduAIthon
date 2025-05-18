@echo off
echo EduSpark MongoDB Diagnostic Tool
echo ================================

REM Check if Python is installed
python --version > nul 2>&1
if %ERRORLEVEL% neq 0 (
    echo Python is not installed or not in PATH. Please install Python first.
    exit /b 1
)

REM Run the diagnostic script
echo Running diagnostics, please wait...
python diagnose_mongodb.py %*

if %ERRORLEVEL% neq 0 (
    echo.
    echo Diagnostics failed. Please check the error message above.
    echo If you need more detailed diagnostics, try running with --verbose flag:
    echo diagnose_mongodb.bat --verbose
) else (
    echo.
    echo Diagnostics completed. Follow the recommendations if any issues were found.
)

pause 