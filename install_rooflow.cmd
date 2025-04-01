@echo off
setlocal enabledelayedexpansion

echo --- Starting RooFlow config setup ---

:: Check for Git
where git >nul 2>nul
if %errorlevel% neq 0 (
    echo Error: git is not found in your PATH.
    echo Please install Git and ensure it's added to your system's PATH.
    echo You can download Git from: https://git-scm.com/download/win
    exit /b 1
) else (
    echo Found git executable.
)

:: Define a temporary directory for cloning
set "TEMP_CLONE_DIR=%TEMP%\RooFlowClone_%RANDOM%"
echo Cloning target: %TEMP_CLONE_DIR%

:: Clone the repository
echo Cloning RooFlow repository...
git clone https://github.com/GreatScottyMac/RooFlow "%TEMP_CLONE_DIR%"
if %errorlevel% neq 0 (
    echo Error: Failed to clone RooFlow repository. Check your internet connection and Git setup.
    exit /b 1
)

:: Check if clone was successful by checking for a known file/dir
if not exist "%TEMP_CLONE_DIR%\config" (
    echo Error: RooFlow repository clone seems incomplete. Config directory not found in temp location.
    if exist "%TEMP_CLONE_DIR%" rmdir /s /q "%TEMP_CLONE_DIR%" >nul 2>nul
    exit /b 1
)

:: Copy config files from temp clone (including hidden ones - handled by robocopy)
echo Copying config files from temp directory...
robocopy "%TEMP_CLONE_DIR%\config" "%CD%" /E /NFL /NDL /NJH /NJS /nc /ns /np
if %errorlevel% gtr 7 (
    echo Error: Failed to copy config files from temp directory. Check permissions. Robocopy Errorlevel: %errorlevel%
    if exist "%TEMP_CLONE_DIR%" rmdir /s /q "%TEMP_CLONE_DIR%" >nul 2>nul
    exit /b 1
)

:: Copy .clinerules-default file
echo Copying .clinerules-default...
robocopy "%TEMP_CLONE_DIR%\config\default-mode" "%CD%" ".clinerules-default" /NFL /NDL /NJH /NJS /nc /ns /np
if %errorlevel% gtr 1 (
    echo Warning: Failed to copy .clinerules-default. Robocopy Errorlevel: %errorlevel%. Manual copy might be needed.
    rem Continue script even if this fails, as it's less critical than main config
)

:: Clean up unnecessary files and directories
echo Cleaning up...
echo Attempting to delete insert-variables.sh...
del /q /f insert-variables.sh >nul 2>nul
echo Attempting to remove default-mode directory (if it exists)...
if exist "default-mode" (
    rmdir /s /q default-mode >nul 2>nul
    echo default-mode removal exit code: %errorlevel%
) else ( echo default-mode directory not found to remove. )
echo Attempting to remove temporary clone directory...
if exist "%TEMP_CLONE_DIR%" (
    rmdir /s /q "%TEMP_CLONE_DIR%" >nul 2>nul
    echo Temp clone directory removal exit code: %errorlevel%
) else ( echo Temp clone directory not found to remove. )

:: Check if the .roo directory exists after moving files
if not exist ".roo" (
    echo Error: .roo directory not found after moving config files.
    echo Ensure the .roo directory is located within the 'config' directory in the source repository.
    exit /b 1
)

:: Check if the target script exists before running
if not exist "insert-variables.cmd" (
    echo Error: insert-variables.cmd not found after moving files. Installation failed.
    exit /b 1
)

:: Run the setup script
echo Running insert-variables.cmd...
call insert-variables.cmd
if %errorlevel% neq 0 (
    echo Error: insert-variables.cmd failed to execute properly.
    rem Do not attempt self-delete if the main script failed
    exit /b 1
)
echo insert-variables.cmd completed successfully. Removing it...
del /q /f insert-variables.cmd

echo --- RooFlow config setup complete ---

:: Schedule self-deletion
echo Scheduling self-deletion of install_rooflow.cmd...
start "" /b cmd /c "timeout /t 1 > nul && del /q /f "%~f0""

endlocal
exit /b 0