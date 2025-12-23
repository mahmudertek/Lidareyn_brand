@echo off
title Galata Carsi - CANLI SITEYI YAYINA AL
echo 1. SITEYI YERELDE ACILIYOR...
set "PROJE_YOLU=C:\Users\pc\Desktop\Lidareyn_brand"
cd /d "%PROJE_YOLU%"
echo window.BAKIM_MODU_AKTIF = false; > bakim-ayari.js

echo 2. DEGISIKLIKLER GITHUB'A GONDERILIYOR (LIVE SITE ICIN)...
git add bakim-ayari.js
git commit -m "Site yayina alindi"
git push

echo.
echo [BAŞARILI] Değişiklik GitHub'a iletildi!
echo Canlı siteniz 1-2 dakika içinde tekrar yayına girecektir.
pause
