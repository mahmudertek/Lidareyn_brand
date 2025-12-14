@echo off
chcp 65001 >nul
echo ====================================
echo   TUM SITE YEDEKLEME (FULL BACKUP)
echo ====================================

REM Tarih ve saat bilgisini al
for /f "tokens=2 delims==" %%I in ('wmic os get localdatetime /value') do set datetime=%%I
set YEAR=%datetime:~0,4%
set MONTH=%datetime:~4,2%
set DAY=%datetime:~6,2%
set HOUR=%datetime:~8,2%
set MINUTE=%datetime:~10,2%
set SECOND=%datetime:~12,2%
set TIMESTAMP=%YEAR%-%MONTH%-%DAY%_%HOUR%-%MINUTE%-%SECOND%

set BACKUP_DIR=backups\full_backup_%TIMESTAMP%
echo Yedekleme klasoru olusturuluyor: %BACKUP_DIR%

if not exist "backups" mkdir "backups"
mkdir "%BACKUP_DIR%"

echo.
echo Dosyalar kopyalaniyor (Robocopy kullanarak)...
echo Haric tutulanlar: backups, .git, .agent, node_modules, .gemini
echo.

REM Robocopy kullanımı:
REM .              : Kaynak (Mevcut klasör)
REM %BACKUP_DIR%   : Hedef
REM /E             : Alt klasörleri (boş olanlar dahil) kopyala
REM /XD            : Klasörleri hariç tut (backups, .git, .agent, node_modules)
REM /XF            : Dosyaları hariç tut (bu scriptlerin kendisi)
REM /NFL /NDL      : Dosya ve klasör listesini loglarda gizle (daha temiz çıktı için) - İsteğe bağlı, şimdilik kaldırıyorum ki görsünler
REM /NJH /NJS      : İş ve özet başlıklarını gizle - İsteğe bağlı

robocopy . "%BACKUP_DIR%" /E /XD backups .git .agent node_modules .gemini /XF full_backup.bat backup.bat

if %ERRORLEVEL% LSS 8 goto success
echo.
echo [!] Bazi dosyalar kopyalanirken hata olusmus olabilir (Hata Kodu: %ERRORLEVEL%).
goto end

:success
echo.
echo [✓] Kopyalama basariyla tamamlandi.

:end
echo.
echo ====================================
echo   ISLEM BITTI
echo ====================================
echo Yedek konumu: %CD%\%BACKUP_DIR%
echo.

