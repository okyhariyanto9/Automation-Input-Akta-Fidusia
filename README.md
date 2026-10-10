# Automation Input Akta Fidusia (DKJ PASTI)

Aplikasi otomasi input data Akta Fidusia ke portal Kemenkumham (DKJ PASTI) menggunakan integrasi Google Chrome Remote Debugging & Playwright.

---

## 🚀 Panduan Penggunaan untuk Staf / Tim

Aplikasi ini dapat dijalankan dengan mudah di laptop **Windows** maupun **Mac** staf masing-masing.

### Syarat Awal (Hanya Sekali di Awal):
1. Pastikan **Google Chrome** sudah terpasang.
2. Pastikan **Node.js** (versi 18, 20, atau 22 LTS) sudah terpasang di laptop. Unduh di: [https://nodejs.org](https://nodejs.org)

---

### Cara Menjalankan Aplikasi

#### 🪟 Pengguna Windows:
1. Buka folder aplikasi ini.
2. Klik ganda (**double-click**) file **`Jalankan_Aplikasi.bat`**.
3. Sistem akan otomatis menyiapkan komponen saat pertama kali dibuka, menyalakan server, dan langsung membuka browser di `http://localhost:3000`.

#### 🍎 Pengguna Mac:
1. Buka folder aplikasi ini.
2. Klik ganda (**double-click**) file **`Jalankan_Aplikasi.command`**.
   *(Jika muncul peringatan izin saat pertama kali di Mac, klik kanan file > pilih Open, atau jalankan perintah `chmod +x Jalankan_Aplikasi.command` di Terminal).*
3. Server akan menyala dan otomatis membuka browser di `http://localhost:3000`.

---

### 📝 Alur Kerja Otomasi di Dashboard

1. **Tutup semua jendela Google Chrome** yang sedang terbuka.
2. Di halaman Dashboard aplikasi, klik tombol **"BUKA CHROME"**.
3. Jendela Chrome khusus akan terbuka. Silakan:
   - Login ke portal **DKJ PASTI / AHU Online**.
   - Selesaikan Captcha / OTP login secara mandiri.
   - Buka menu laporan input akta fidusia.
4. Di Dashboard aplikasi:
   - Unggah (**Upload**) file CSV data fidusia.
   - Tentukan **Baris Awal** dan **Baris Akhir** yang ingin diproses.
   - Klik tombol **"MULAI AUTOMATION"**.
5. Sistem akan mengisi form secara otomatis per baris hingga selesai.
