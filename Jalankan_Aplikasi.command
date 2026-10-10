#!/bin/bash
cd "$(dirname "$0")"

echo "===================================================="
echo "       OTOMASI INPUT AKTA FIDUSIA (DKJ PASTI)       "
echo "===================================================="
echo ""

# 1. Cek apakah Node.js sudah terpasang
if ! command -v node >/dev/null 2>&1; then
    echo "[ERROR] Node.js belum terpasang di Mac ini!"
    echo "Silakan unduh dan install Node.js dari: https://nodejs.org"
    echo ""
    read -p "Tekan Enter untuk keluar..."
    exit 1
fi

# 2. Cek dan install dependensi jika folder node_modules belum ada
if [ ! -d "node_modules" ]; then
    echo "[INFO] Menyiapkan komponen pertama kali (npm install)..."
    echo "Mohon tunggu sebentar hingga selesai..."
    echo ""
    npm install
    if [ $? -ne 0 ]; then
        echo ""
        echo "[ERROR] Gagal menginstall komponen. Pastikan koneksi internet aktif."
        read -p "Tekan Enter untuk keluar..."
        exit 1
    fi
fi

# 3. Cari dan luncurkan Google Chrome dalam mode debugging port 9222
CHROME_BIN="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
PROFILE_DIR="$HOME/Library/Application Support/Google/Chrome/AutomationProfile"
mkdir -p "$PROFILE_DIR"

if [ -f "$CHROME_BIN" ]; then
    echo "[INFO] Membuka Google Chrome (Mode Debugging Port 9222)..."
    echo "  - Tab 1: Portal DKJ PASTI (https://dkjpasti.kemenkum.go.id/notaris/laporan)"
    echo "  - Tab 2: Dashboard Otomasi (http://localhost:3000)"
    "$CHROME_BIN" --remote-debugging-port=9222 --user-data-dir="$PROFILE_DIR" --no-first-run --no-default-browser-check "https://dkjpasti.kemenkum.go.id/notaris/laporan" "http://localhost:3000" >/dev/null 2>&1 &
else
    echo "[PERHATIAN] Google Chrome tidak ditemukan di /Applications."
    echo "Membuka browser default..."
    (sleep 3 && open http://localhost:3000) &
fi

echo ""
echo "[INFO] Memulai server aplikasi..."
echo "Jangan tutup jendela terminal ini selama otomasi sedang berjalan."
echo "===================================================="
echo ""

# 4. Jalankan server Next.js
npm run dev
