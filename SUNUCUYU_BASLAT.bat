@echo off
title Galata Carsi Backend Sunucusu
echo Eski sunucu temizleniyor...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :5000') do taskkill /f /pid %%a >nul 2>&1
echo Sunucu baslatiliyor...
cd /d "C:\Users\pc\Desktop\Lidareyn_brand\backend"
node server.js
pause
