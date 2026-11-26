@echo off
chcp 65001 >nul
title IMAMAT: DIVAN-KHANA (1845) — Desktop App Mode Launcher
set "APP_HTML=%~dp0Imamat_DivanKhana_Standalone_Playtest.html"

if exist "%ProgramFiles(x86)%\Microsoft\Edge\Application\msedge.exe" (
    start "" "%ProgramFiles(x86)%\Microsoft\Edge\Application\msedge.exe" --app="file:///%APP_HTML:\=/%" --window-size=1480,920
    exit /b 0
)
if exist "%ProgramFiles%\Microsoft\Edge\Application\msedge.exe" (
    start "" "%ProgramFiles%\Microsoft\Edge\Application\msedge.exe" --app="file:///%APP_HTML:\=/%" --window-size=1480,920
    exit /b 0
)
if exist "%ProgramFiles%\Google\Chrome\Application\chrome.exe" (
    start "" "%ProgramFiles%\Google\Chrome\Application\chrome.exe" --app="file:///%APP_HTML:\=/%" --window-size=1480,920
    exit /b 0
)
start "" "%APP_HTML%"
