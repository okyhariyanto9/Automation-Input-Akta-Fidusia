# Automation Input Akta Fidusia (DKJ PASTI)

Aplikasi otomasi input data Akta Fidusia ke portal Kemenkumham (DKJ PASTI) menggunakan integrasi Google Chrome Remote Debugging & Playwright.

---

## 🚀 Panduan Penggunaan untuk Staf / Tim

Aplikasi ini dapat dijalankan dengan mudah (cukup **1x klik**) di laptop **Windows** maupun **Mac** staf masing-masing.

### Syarat Awal (Hanya Sekali di Awal):
1. Pastikan **Google Chrome** sudah terpasang.
2. Pastikan **Node.js** (versi 18, 20, atau 22 LTS) sudah terpasang di laptop. Unduh di: [https://nodejs.org](https://nodejs.org)

---

### Cara Menjalankan Aplikasi (1x Klik):

> **Tips:** Sebelum menjalankan, pastikan semua jendela Google Chrome biasa sudah ditutup agar mode otomasi dapat langsung aktif.

#### 🪟 Pengguna Windows:
1. Buka folder aplikasi ini.
2. Klik ganda (**double-click**) file **`Jalankan_Aplikasi.bat`**.
3. Sistem akan otomatis:
   - Menyiapkan komponen (hanya saat pertama kali dibuka).
   - Membuka **Google Chrome khusus otomasi** langsung ke portal **DKJ PASTI**.
   - Menyalakan server dan membuka halaman **Dashboard** di `http://localhost:3000`.

#### 🍎 Pengguna Mac:
1. Buka folder aplikasi ini.
2. Klik ganda (**double-click**) file **`Jalankan_Aplikasi.command`**.
   *(Jika muncul peringatan izin saat pertama kali di Mac, klik kanan file > pilih Open, atau jalankan perintah `chmod +x Jalankan_Aplikasi.command` di Terminal).*
3. Sistem akan otomatis membuka Google Chrome khusus otomasi dan Dashboard web di `http://localhost:3000`.

---

### 📝 Alur Kerja Otomasi

1. Pada **Google Chrome khusus** yang baru saja terbuka otomatis:
   - Login ke portal **DKJ PASTI / AHU Online**.
   - Selesaikan Captcha / OTP login secara mandiri.
   - Masuk ke menu laporan input akta fidusia.
2. Pada **Dashboard Aplikasi** (`http://localhost:3000`):
   - Unggah (**Upload**) file CSV data fidusia.
   - Tentukan **Baris Awal** dan **Baris Akhir** yang ingin diproses.
   - Klik tombol **"MULAI AUTOMATION"**.
   - *(Tombol "BUKA CHROME" di Step 1 tetap tersedia sebagai cadangan jika Chrome tidak sengaja tertutup).*
3. Sistem akan mengisi form secara otomatis per baris hingga selesai.
