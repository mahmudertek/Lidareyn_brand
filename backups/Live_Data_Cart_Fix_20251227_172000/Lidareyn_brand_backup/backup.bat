@echo off
chcp 65001 >nul
echo ====================================
echo   LIDAREYN YEDEKLEME SCRIPTI
echo ====================================
echo.

REM Tarih ve saat bilgisini al (YYYY-MM-DD_HH-MM-SS formatında)
for /f "tokens=2 delims==" %%I in ('wmic os get localdatetime /value') do set datetime=%%I
set YEAR=%datetime:~0,4%
set MONTH=%datetime:~4,2%
set DAY=%datetime:~6,2%
set HOUR=%datetime:~8,2%
set MINUTE=%datetime:~10,2%
set SECOND=%datetime:~12,2%

set TIMESTAMP=%YEAR%-%MONTH%-%DAY%_%HOUR%-%MINUTE%-%SECOND%

REM Yedekleme klasörünü oluştur
set BACKUP_DIR=backups\backup_%TIMESTAMP%
echo Yedekleme klasörü oluşturuluyor: %BACKUP_DIR%
if not exist "backups" mkdir "backups"
mkdir "%BACKUP_DIR%"

REM Dosyaları yedekle
echo.
echo Dosyalar yedekleniyor...
echo.

if exist "index.html" (
    copy "index.html" "%BACKUP_DIR%\index.html" >nul
    echo [✓] index.html yedeklendi
) else (
    echo [!] index.html bulunamadı
)

if exist "style.css" (
    copy "style.css" "%BACKUP_DIR%\style.css" >nul
    echo [✓] style.css yedeklendi
) else (
    echo [!] style.css bulunamadı
)

if exist "script.js" (
    copy "script.js" "%BACKUP_DIR%\script.js" >nul
    echo [✓] script.js yedeklendi
) else (
    echo [!] script.js bulunamadı
)

REM Yedekleme bilgisi dosyası oluştur
echo Yedekleme Tarihi: %YEAR%-%MONTH%-%DAY% %HOUR%:%MINUTE%:%SECOND% > "%BACKUP_DIR%\yedekleme_bilgisi.txt"
echo Yedeklenen Dosyalar: >> "%BACKUP_DIR%\yedekleme_bilgisi.txt"
if exist "index.html" echo - index.html >> "%BACKUP_DIR%\yedekleme_bilgisi.txt"
if exist "style.css" echo - style.css >> "%BACKUP_DIR%\yedekleme_bilgisi.txt"
if exist "script.js" echo - script.js >> "%BACKUP_DIR%\yedekleme_bilgisi.txt"

echo.
echo ====================================
echo   YEDEKLEME TAMAMLANDI!
echo ====================================
echo.
echo Yedekleme konumu: %BACKUP_DIR%
echo.
echo Geri yüklemek için:
echo 1. backups klasörüne gidin
echo 2. İstediğiniz yedekleme klasörünü açın
echo 3. Dosyaları kopyalayıp ana klasöre yapıştırın
echo.
pause
