@echo off
title Galata Carsi - CANLI SITEYI BAKIMA AL
echo 1. SITEYI YERELDE KAPATILIYOR...
set "PROJE_YOLU=C:\Users\pc\Desktop\Lidareyn_brand"
cd /d "%PROJE_YOLU%"
echo window.BAKIM_MODU_AKTIF = true; > bakim-ayari.js

echo 2. DEGISIKLIKLER GITHUB'A GONDERILIYOR (LIVE SITE ICIN)...
git add bakim-ayari.js
git commit -m "Site bakima alindi"
git push

echo.
echo [BAŞARILI] Değişiklik GitHub'a iletildi!
echo Vercel/Render şimdi siteyi güncelleyecek. 
echo 1-2 dakika içinde canlı siteniz de kapanmış olacak.
pause
