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
   - Membuka **1 jendela Google Chrome khusus** dengan 2 tab:
     * **Tab 1:** Portal DKJ PASTI (`https://dkjpasti.kemenkum.go.id/notaris/laporan`)
     * **Tab 2:** Dashboard Web (`http://localhost:3000`)
   - Menyalakan server otomasi di latar belakang.

#### 🍎 Pengguna Mac:
1. Buka folder aplikasi ini.
2. Klik ganda (**double-click**) file **`Jalankan_Aplikasi.command`**.
   *(Jika muncul peringatan izin saat pertama kali di Mac, klik kanan file > pilih Open, atau jalankan perintah `chmod +x Jalankan_Aplikasi.command` di Terminal).*
3. Sistem akan otomatis membuka 1 jendela Google Chrome khusus dengan 2 tab (DKJ PASTI & Dashboard `http://localhost:3000`).

---

### 📝 Alur Kerja Otomasi

1. Pada jendela Google Chrome yang terbuka:
   - Di **Tab DKJ PASTI**: Login ke portal, selesaikan Captcha / OTP secara mandiri, lalu buka menu laporan input akta fidusia.
   - Di **Tab Dashboard** (`http://localhost:3000`):
     - Unggah file CSV data fidusia.
     - Tentukan **Baris Awal** dan **Baris Akhir** yang ingin diproses.
     - Klik tombol **"MULAI AUTOMATION"**.
2. Sistem otomasi akan langsung mendeteksi tab DKJ PASTI dan mengisi formulir secara otomatis baris demi baris hingga selesai!
   *(Tombol "BUKA CHROME" di Dashboard tetap ada sebagai cadangan jika Chrome tidak sengaja ditutup).*
