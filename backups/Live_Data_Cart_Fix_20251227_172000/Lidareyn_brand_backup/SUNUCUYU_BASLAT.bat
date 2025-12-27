
@echo off
echo Galata Carsi Sunucusu Baslatiliyor...
echo Lutfen bu pencereyi KAPATMAYIN.
echo.
cd /d "%~dp0\backend"
if exist node_modules (
    npm start
) else (
    echo Node Modules bulunamadi (Ilk kurulum). Yukleniyor...
    npm install
    npm start
)
pause
