@echo off
setlocal enabledelayedexpansion

:: Renk tanımları
set "GREEN=[92m"
set "RED=[91m"
set "YELLOW=[93m"
set "BLUE=[94m"
set "RESET=[0m"

title Lidareyn Brand - Sunucu Yoneticisi

echo %BLUE%================================================%RESET%
echo %BLUE%      LIDAREYN BRAND - SUNUCU BASLATICI       %RESET%
echo %BLUE%================================================%RESET%
echo.

:: 1. Node.js Kontrolu
echo %YELLOW%[1/4] Node.js sistemi kontrol ediliyor...%RESET%
node -v >nul 2>&1
if %errorlevel% neq 0 (
    echo %RED%HATA: Node.js bilgisayarinizda yuklu degil!%RESET%
    echo Lutfen https://nodejs.org/ adresinden indirip kurun.
    pause
    exit /b
)
echo %GREEN%OK: Node.js yuklu.%RESET%
echo.

:: 2. Proje Dizini Kontrolu
echo %YELLOW%[2/4] Klasorler kontrol ediliyor...%RESET%
set "PROJECT_DIR=%~dp0"
set "BACKEND_DIR=%PROJECT_DIR%backend"

if not exist "%BACKEND_DIR%" (
    echo %RED%HATA: Backend klasoru bulunamadi!%RESET%
    echo Beklenen konum: "%BACKEND_DIR%"
    pause
    exit /b
)
echo %GREEN%OK: Backend klasoru bulundu.%RESET%
echo.

:: 3. Bagimlilik (node_modules) Kontrolu
cd /d "%BACKEND_DIR%"
echo %YELLOW%[3/4] Bagimliliklar kontrol ediliyor...%RESET%
if not exist "node_modules\" (
    echo %YELLOW%Bagimliliklar eksik. Yukleme yapiliyor (Bu birkac dakika surebilir)...%RESET%
    call npm install
    if !errorlevel! neq 0 (
        echo %RED%HATA: "npm install" basarisiz oldu!%RESET%
        pause
        exit /b
    )
)
echo %GREEN%OK: Bagimliliklar hazir.%RESET%
echo.

:: 4. Sunucuyu Baslatma
echo %GREEN%[4/4] Sunucu baslatiliyor...%RESET%
echo %BLUE%------------------------------------------------%RESET%
echo %YELLOW%IPUCU: Bu pencere acik kaldigi surece site calisir.%RESET%
echo %YELLOW%Kapatmak icin bu pencereyi kapatabilir veya Ctrl+C yapabilirsiniz.%RESET%
echo %BLUE%------------------------------------------------%RESET%
echo.

:: npm start komutunu calistir
call npm start

if %errorlevel% neq 0 (
    echo.
    echo %RED%HATA: Sunucu durdu veya baslatilamadi!%RESET%
    echo Olası nedenler:
    echo - .env dosyası hatalı veya eksik.
    echo - Port 5000 (veya belirlenen port) baska bir uygulama tarafindan kullaniliyor.
    echo - Veritabani (MongoDB) baglantisi kurulamadi.
    echo.
    pause
)
