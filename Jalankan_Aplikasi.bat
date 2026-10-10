@echo off
chcp 65001 >nul
title Otomasi Input Akta Fidusia
cd /d "%~dp0"

echo ====================================================
echo        OTOMASI INPUT AKTA FIDUSIA (DKJ PASTI)
echo ====================================================
echo.

:: Cek apakah Node.js sudah terpasang
where node >nul 2>nul
if %ERRORLEVEL% neq 0 (
    echo [ERROR] Node.js belum terpasang di komputer ini!
    echo Silakan unduh dan install Node.js dari: https://nodejs.org
    echo Setelah instalasi selesai, buka kembali file ini.
    echo.
    pause
    exit /b 1
)

:: Cek dan install dependensi jika folder node_modules belum ada
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

echo [INFO] Memulai server aplikasi...
echo Halaman web akan terbuka otomatis di browser (http://localhost:3000)
echo Jangan tutup jendela ini selama otomasi sedang berjalan.
echo ====================================================
echo.

:: Buka browser otomatis setelah delay 3 detik
start "" cmd /c "timeout /t 3 /nobreak >nul & start http://localhost:3000"

:: Jalankan server Next.js
call npm run dev
pause
