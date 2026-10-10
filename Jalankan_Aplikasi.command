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
    echo "[INFO] Membuka Google Chrome khusus otomasi dan portal DKJ PASTI..."
    "$CHROME_BIN" --remote-debugging-port=9222 --user-data-dir="$PROFILE_DIR" --no-first-run --no-default-browser-check "https://dkjpasti.kemenkum.go.id/notaris/laporan" >/dev/null 2>&1 &
else
    echo "[PERHATIAN] Google Chrome tidak ditemukan di /Applications."
    echo "Anda masih bisa membuka Chrome lewat tombol di Dashboard web."
fi

echo ""
echo "[INFO] Memulai server aplikasi..."
echo "Halaman Dashboard akan terbuka otomatis di browser (http://localhost:3000)"
echo "Jangan tutup jendela terminal ini selama otomasi sedang berjalan."
echo "===================================================="
echo ""

# 4. Buka browser Dashboard setelah delay 3 detik
(sleep 3 && open http://localhost:3000) &

# 5. Jalankan server Next.js
npm run dev
