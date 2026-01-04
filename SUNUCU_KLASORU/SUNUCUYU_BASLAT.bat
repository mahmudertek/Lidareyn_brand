@echo off
title Lidareyn Sunucu Baslatici (DEBUG MOD)

echo ================================================
echo      LIDAREYN BRAND - SUNUCU BASLATICI
echo ================================================
echo.

:: 1. Yol Kontrolu (Daha kapsamlı)
echo [1/3] Klasorler kontrol ediliyor...

:: Senaryo 1: Klasorun icinde
if exist "%~dp0backend" (
    set "BACKEND_DIR=%~dp0backend"
    echo Konum bulundu: Script icinde.
) else if exist "%~dp0..\backend" (
    :: Senaryo 2: SUNUCU_KLASORU klasoru masaustunde, proje yaninda
    set "BACKEND_DIR=%~dp0..\backend"
    echo Konum bulundu: Komsu klasorde.
) else if exist "%~dp0..\Lidareyn_brand\backend" (
    :: Senaryo 3: Klasor masaustunde, Lidareyn_brand masaustunde
    set "BACKEND_DIR=%~dp0..\Lidareyn_brand\backend"
    echo Konum bulundu: Lidareyn_brand icinde.
) else (
    echo HATA: Backend klasoru bulunamadi!
    echo Lutfen bu dosyayi projenin yanindaki bir klasorde veya projenin icinde tutun.
    echo Script Konumu: %~dp0
    pause
    exit /b
)

echo Hedef Klasor: %BACKEND_DIR%
echo.

:: 2. Islem
cd /d "%BACKEND_DIR%"

echo [2/3] Moduller kontrol ediliyor...
if not exist "node_modules\" (
    echo Moduller eksik, npm install calistiriliyor...
    call npm install
)

echo.
echo [3/3] Sunucu baslatiliyor...
echo ------------------------------------------------
echo IPUCU: Eger sunucu hemen kapaniyorsa asagidaki hatayi okuyun.
echo ------------------------------------------------
echo.

:: npm start yerine dogrudan node ile baslatalım ki hata net gorunsun
node server.js

echo.
echo ------------------------------------------------
echo UYARI: Sunucu durdu! 
echo Yukaridaki hata mesajini okuyun (Kirmizi yazilar hata sebebidir).
echo Lutfen pencereyi kapatmadan hatanin ekran goruntusunu alin.
echo ------------------------------------------------
pause
