@echo off
chcp 65001 >nul
title Otomasi Input Akta Fidusia
cd /d "%~dp0"

echo ====================================================
echo        OTOMASI INPUT AKTA FIDUSIA (DKJ PASTI)
echo ====================================================
echo.

:: 1. Cek apakah Node.js sudah terpasang
where node >nul 2>nul
if %ERRORLEVEL% neq 0 (
    echo [ERROR] Node.js belum terpasang di komputer ini!
    echo Silakan unduh dan install Node.js dari: https://nodejs.org
    echo Setelah instalasi selesai, buka kembali file ini.
    echo.
    pause
    exit /b 1
)

:: 2. Cek dan install dependensi jika folder node_modules belum ada
if not exist "node_modules\" (
    echo [INFO] Menyiapkan dependensi pertama kali (npm install)...
    echo Mohon tunggu sebentar hingga selesai...
    echo.
    call npm install
    if %ERRORLEVEL% neq 0 (
        echo.
        echo [ERROR] Gagal menginstall dependensi. Pastikan koneksi internet aktif.
        pause
        exit /b 1
    )
)

:: 3. Cari dan luncurkan Google Chrome dalam mode debugging port 9222
set "CHROME_BIN="
if exist "%ProgramFiles%\Google\Chrome\Application\chrome.exe" (
    set "CHROME_BIN=%ProgramFiles%\Google\Chrome\Application\chrome.exe"
) else if exist "%ProgramFiles(x86)%\Google\Chrome\Application\chrome.exe" (
    set "CHROME_BIN=%ProgramFiles(x86)%\Google\Chrome\Application\chrome.exe"
) else if exist "%LOCALAPPDATA%\Google\Chrome\Application\chrome.exe" (
    set "CHROME_BIN=%LOCALAPPDATA%\Google\Chrome\Application\chrome.exe"
)

set "PROFILE_DIR=%LOCALAPPDATA%\Google\Chrome\AutomationProfile"
if not exist "%PROFILE_DIR%" mkdir "%PROFILE_DIR%"

if defined CHROME_BIN (
    echo [INFO] Membuka Google Chrome khusus otomasi dan portal DKJ PASTI...
    start "" "%CHROME_BIN%" --remote-debugging-port=9222 --user-data-dir="%PROFILE_DIR%" --no-first-run --no-default-browser-check "https://dkjpasti.kemenkum.go.id/notaris/laporan"
) else (
    echo [PERHATIAN] Google Chrome tidak ditemukan di lokasi standar.
    echo Anda masih bisa membuka Chrome lewat tombol di Dashboard web.
)

echo.
echo [INFO] Memulai server aplikasi...
echo Halaman Dashboard akan terbuka otomatis di browser (http://localhost:3000)
echo Jangan tutup jendela ini selama otomasi sedang berjalan.
echo ====================================================
echo.

:: 4. Buka browser Dashboard setelah delay 3 detik
start "" cmd /c "timeout /t 3 /nobreak >nul & start http://localhost:3000"

:: 5. Jalankan server Next.js
call npm run dev
pause
