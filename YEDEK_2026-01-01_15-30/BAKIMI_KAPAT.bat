@echo off
chcp 65001 >nul
title Bakım Modu KAPATILIYOR...

echo.
echo ╔═══════════════════════════════════════════╗
echo ║     GALATA ÇARŞI - BAKIM MODU KAPALI      ║
echo ╚═══════════════════════════════════════════╝
echo.

cd /d "C:\Users\pc\Desktop\Lidareyn_brand"

echo [1/3] maintenance-config.json güncelleniyor...
echo { > maintenance-config.json
echo     "enabled": false, >> maintenance-config.json
echo     "message": "Sitemiz şu anda bakımdadır. Lütfen daha sonra tekrar deneyiniz.", >> maintenance-config.json
echo     "estimatedTime": "Kısa süre içinde hizmetinizde olacağız." >> maintenance-config.json
echo } >> maintenance-config.json

echo [2/3] Git commit yapılıyor...
git add maintenance-config.json
git commit -m "BAKIM MODU KAPATILDI"

echo [3/3] Vercel'e gönderiliyor...
git push origin main

echo.
echo ╔═══════════════════════════════════════════╗
echo ║   ✓ BAKIM MODU BAŞARIYLA KAPATILDI!       ║
echo ║   Site 1-2 dakika içinde açılacak.        ║
echo ╚═══════════════════════════════════════════╝
echo.
pause
