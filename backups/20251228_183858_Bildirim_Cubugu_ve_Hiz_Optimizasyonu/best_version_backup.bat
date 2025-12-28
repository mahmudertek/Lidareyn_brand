@echo off
chcp 65001 >nul
echo ====================================
echo   KARAKÖY TÜCCARI - EN İYİ SÜRÜM YEDEKLEME
echo ====================================
echo.

REM Tarih ve saat bilgisini al
for /f "tokens=2 delims==" %%I in ('wmic os get localdatetime /value') do set datetime=%%I
set YEAR=%datetime:~0,4%
set MONTH=%datetime:~4,2%
set DAY=%datetime:~6,2%
set HOUR=%datetime:~8,2%
set MINUTE=%datetime:~10,2%
set SECOND=%datetime:~12,2%

set TIMESTAMP=%YEAR%-%MONTH%-%DAY%_%HOUR%-%MINUTE%-%SECOND%

REM Yedekleme klasörünü oluştur - ÖZEL İSİM
set BACKUP_DIR=backups\en_iyi_surum_%TIMESTAMP%
echo Yedekleme klasörü oluşturuluyor: %BACKUP_DIR%
if not exist "backups" mkdir "backups"
mkdir "%BACKUP_DIR%"

echo.
echo Dosyalar yedekleniyor...
echo.

REM HTML dosyalarını yedekle
echo [HTML Dosyaları]
for %%f in (*.html) do (
    copy "%%f" "%BACKUP_DIR%\%%f" >nul 2>&1
    if errorlevel 1 (
        echo [!] %%f yedeklenemedi
    ) else (
        echo [✓] %%f
    )
)

echo.
echo [CSS Dosyaları]
REM CSS dosyalarını yedekle
for %%f in (*.css) do (
    copy "%%f" "%BACKUP_DIR%\%%f" >nul 2>&1
    if errorlevel 1 (
        echo [!] %%f yedeklenemedi
    ) else (
        echo [✓] %%f
    )
)

echo.
echo [JavaScript Dosyaları]
REM JS dosyalarını yedekle
for %%f in (*.js) do (
    copy "%%f" "%BACKUP_DIR%\%%f" >nul 2>&1
    if errorlevel 1 (
        echo [!] %%f yedeklenemedi
    ) else (
        echo [✓] %%f
    )
)

echo.
echo [Python Dosyaları]
REM Python dosyalarını yedekle
for %%f in (*.py) do (
    copy "%%f" "%BACKUP_DIR%\%%f" >nul 2>&1
    if errorlevel 1 (
        echo [!] %%f yedeklenemedi
    ) else (
        echo [✓] %%f
    )
)

echo.
echo [Diğer Dosyalar]
REM Diğer önemli dosyaları yedekle
if exist "backup_list.txt" (
    copy "backup_list.txt" "%BACKUP_DIR%\backup_list.txt" >nul 2>&1
    echo [✓] backup_list.txt
)

REM Görsel klasörünü yedekle (varsa)
if exist "gorseller" (
    echo.
    echo [Görsel Klasörü]
    xcopy "gorseller" "%BACKUP_DIR%\gorseller\" /E /I /Y >nul 2>&1
    if errorlevel 1 (
        echo [!] gorseller klasörü yedeklenemedi
    ) else (
        echo [✓] gorseller klasörü yedeklendi
    )
)

REM Yedekleme bilgisi dosyası oluştur
echo.
echo Yedekleme bilgisi oluşturuluyor...
(
    echo ====================================
    echo   YEDEKLEME BİLGİLERİ (EN İYİ SÜRÜM)
    echo ====================================
    echo.
    echo Yedekleme Tarihi: %YEAR%-%MONTH%-%DAY%
    echo Yedekleme Saati: %HOUR%:%MINUTE%:%SECOND%
    echo.
    echo Yedeklenen Dosyalar:
    echo.
    echo [HTML Dosyaları]
    for %%f in (*.html) do echo - %%f
    echo.
    echo [CSS Dosyaları]
    for %%f in (*.css) do echo - %%f
    echo.
    echo [JavaScript Dosyaları]
    for %%f in (*.js) do echo - %%f
    echo.
    echo [Python Dosyaları]
    for %%f in (*.py) do echo - %%f
    echo.
    if exist "gorseller" (
        echo [Klasörler]
        echo - gorseller\
    )
) > "%BACKUP_DIR%\yedekleme_bilgisi.txt"

echo.
echo ====================================
echo   YEDEKLEME TAMAMLANDI!
echo ====================================
echo.
echo Yedekleme konumu: %BACKUP_DIR%
echo.
pause
