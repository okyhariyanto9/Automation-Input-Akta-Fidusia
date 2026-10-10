#!/bin/bash
cd "$(dirname "$0")"

echo "===================================================="
echo "       OTOMASI INPUT AKTA FIDUSIA (DKJ PASTI)       "
echo "===================================================="
echo ""

# Cek apakah Node.js sudah terpasang
if ! command -v node >/dev/null 2>&1; then
    echo "[ERROR] Node.js belum terpasang di Mac ini!"
    echo "Silakan unduh dan install Node.js dari: https://nodejs.org"
    echo ""
    read -p "Tekan Enter untuk keluar..."
    exit 1
fi

# Cek dan install dependensi jika folder node_modules belum ada
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

echo "[INFO] Memulai server aplikasi..."
echo "Halaman web akan terbuka otomatis di browser (http://localhost:3000)"
echo "Jangan tutup jendela terminal ini selama otomasi sedang berjalan."
echo "===================================================="
echo ""

# Buka browser otomatis setelah delay 3 detik
(sleep 3 && open http://localhost:3000) &

# Jalankan server Next.js
npm run dev
