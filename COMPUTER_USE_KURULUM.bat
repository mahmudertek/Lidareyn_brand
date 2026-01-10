@echo off
echo ========================================
echo Google Computer Use Agent - Kurulum
echo ========================================
echo.

echo [1/3] google-genai kuruluyor...
pip install google-genai

echo.
echo [2/3] playwright kuruluyor...
pip install playwright

echo.
echo [3/3] Chromium tarayicisi kuruluyor...
playwright install chromium

echo.
echo ========================================
echo KURULUM TAMAMLANDI!
echo ========================================
echo.
echo Simdi API Key'inizi ayarlayin:
echo   set GOOGLE_API_KEY=your_api_key_here
echo.
echo API Key almak icin:
echo   https://aistudio.google.com/apikey
echo.
echo Sonra scripti calistirin:
echo   python google_computer_use_agent.py
echo.
pause
