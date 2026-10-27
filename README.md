<div align="center">

# 🔥 DEVILBOT FREE

### WhatsApp Automation • By HironiLN

**Bot WhatsApp untuk Termux dengan instalasi yang mudah dan praktis.**

[![Platform](https://img.shields.io/badge/Platform-Termux-green?style=for-the-badge)](https://termux.dev/)
[![Runtime](https://img.shields.io/badge/Runtime-Node.js-339933?style=for-the-badge)](https://nodejs.org/)
[![License](https://img.shields.io/badge/Price-FREE-ff1744?style=for-the-badge)](#-ketentuan-penggunaan)

> ⚠️ **100% GRATIS — DILARANG DIPERJUALBELIKAN.**
> Jika ada pihak yang menjual ulang script ini, harap berhati-hati.

</div>

---

## 📌 Daftar Isi

* [Tentang Project](#-tentang-project)
* [Persyaratan](#-persyaratan)
* [Instalasi Termux](#-instalasi-termux)
* [Download Project](#-download-project)
* [Menyiapkan Dependencies](#-menyiapkan-dependencies)
* [Menjalankan Bot](#-menjalankan-bot)
* [Verifikasi Script](#-verifikasi-script)
* [Mengatasi Masalah](#-mengatasi-masalah)
* [Keamanan](#-keamanan)
* [Ketentuan Penggunaan](#-ketentuan-penggunaan)

---

## 🚀 Tentang Project

**DevilBot Free** merupakan project bot WhatsApp berbasis JavaScript yang dirancang agar mudah digunakan melalui Termux di Android.

Project ini dikelola dengan branding **By HironiLN**.

### ✨ Informasi Project

| Informasi          | Keterangan                |
| ------------------ | ------------------------- |
| Nama               | DevilBot Free             |
| Developer          | HironiLN                  |
| Bahasa pemrograman | JavaScript                |
| Runtime            | Node.js                   |
| Platform           | Android + Termux          |
| Harga              | Gratis                    |
| Repository         | `Hironi645/devilbot-free` |

---

## 📱 Persyaratan

Sebelum memulai, siapkan:

* 📱 HP Android.
* 📦 Aplikasi Termux.
* 🌐 Koneksi internet.
* 💾 Ruang penyimpanan yang cukup.
* 📲 Akun WhatsApp yang akan digunakan untuk bot.

### Download Termux

Unduh Termux dari sumber resminya:

**F-Droid:** https://f-droid.org/packages/com.termux/

**GitHub:** https://github.com/termux/termux-app

Hindari aplikasi Termux dari sumber tidak dikenal.

---

## 🛠️ Instalasi Termux

### STEP 1 — Update paket

Buka Termux, lalu jalankan:

```bash
pkg update && pkg upgrade -y
```

Tunggu sampai proses selesai.

### STEP 2 — Install Node.js dan Git

```bash
pkg install nodejs git -y
```

Periksa apakah instalasi berhasil:

```bash
node -v
npm -v
git --version
```

Jika masing-masing perintah menampilkan nomor versi, berarti komponen tersebut sudah tersedia.

### STEP 3 — Berikan izin penyimpanan

Jalankan:

```bash
termux-setup-storage
```

Jika Android menampilkan permintaan izin, pilih **Izinkan**.

Langkah ini berguna jika kamu perlu mengakses file dari penyimpanan HP.

---

## 📥 Download Project

### STEP 4 — Clone repository

Jalankan perintah:

```bash
cd ~
git clone https://github.com/Hironi645/devilbot-free.git
```

Masuk ke folder project:

```bash
cd devilbot-free
```

Periksa file yang tersedia:

```bash
ls -la
```

Pastikan kamu melihat file `index.js`.

> Jika folder `devilbot-free` sudah ada, masuk ke folder tersebut saja. Jangan mengulang `git clone` di dalam folder project yang sama.

---

## 📦 Menyiapkan Dependencies

### STEP 5 — Periksa konfigurasi project

Jalankan:

```bash
ls -la
```

Jika tersedia file `package.json`, install dependencies menggunakan:

```bash
npm install
```

Jika tidak tersedia `package.json`, jangan langsung menjalankan perintah tersebut dan menganggap instalasi sudah lengkap.

Periksa bagian awal `index.js` untuk mengetahui modul yang dibutuhkan script. Dependencies harus sesuai dengan library dan versi yang digunakan oleh project.

**Penting:** Jangan memasang library secara acak karena versi yang tidak sesuai dapat menyebabkan bot mengalami error.

---

## ▶️ Menjalankan Bot

### STEP 6 — Jalankan script

Setelah dependencies selesai dipasang, jalankan:

```bash
node index.js
```

Jika script meminta kode verifikasi, masukkan kode yang diberikan oleh pemilik script.

Jika script menampilkan proses pairing WhatsApp, ikuti instruksi yang muncul di terminal.

**Catatan:** Tampilan dan metode login bergantung pada versi script yang kamu gunakan.

### STEP 7 — Hubungkan WhatsApp

Jika script meminta pairing code:

1. Buka WhatsApp di HP.
2. Masuk ke menu **Perangkat tertaut**.
3. Pilih **Tautkan perangkat**.
4. Jika tersedia, pilih opsi untuk menautkan dengan nomor telepon.
5. Masukkan pairing code yang dihasilkan script sesuai instruksi WhatsApp.

Jika script menggunakan QR code, pindai QR code melalui menu perangkat tertaut.

Jangan membagikan pairing code, QR code, atau kredensial sesi kepada orang lain.

---

## 🔐 Verifikasi Integritas Script

Project dapat menggunakan file:

```text
.hironi-integrity.sha256
```

File ini digunakan untuk memeriksa hash script agar perubahan yang tidak diharapkan dapat terdeteksi.

Untuk melihat file tersebut:

```bash
cat .hironi-integrity.sha256
```

**Perlu diketahui:**

* Hash harus sesuai dengan script yang diperiksa.
* Mengedit `index.js` dapat menyebabkan pemeriksaan integritas gagal.
* Jika script dan file hash dapat diedit bersamaan oleh pihak yang tidak tepercaya, perlindungan ini dapat dilewati.
* Hash SHA-256 bukan sistem lisensi atau tanda tangan digital yang tahan terhadap pemalsuan.

Jangan membuat hash baru hanya untuk menghilangkan pesan error sebelum memastikan penyebabnya.

---

## 🧰 Mengatasi Masalah

### ❌ Error: `node: command not found`

Install Node.js:

```bash
pkg install nodejs -y
```

### ❌ Error: `Cannot find module`

Pastikan kamu berada di folder project:

```bash
cd ~/devilbot-free
```

Jika tersedia `package.json`, coba:

```bash
npm install
```

Jika error tetap muncul, periksa nama modul pada pesan error dan pastikan modul tersebut memang merupakan dependency project.

### ❌ Error: `Permission denied`

Periksa lokasi file dan izin aksesnya. Untuk script JavaScript yang dijalankan melalui Node.js, biasanya kamu cukup menggunakan:

```bash
node index.js
```

Tidak perlu menambahkan izin executable jika kamu menjalankannya seperti ini.

### ❌ Pairing gagal

* Pastikan koneksi internet stabil.
* Periksa apakah WhatsApp dapat digunakan secara normal.
* Pastikan nomor yang digunakan benar.
* Jangan membagikan kode pairing kepada pihak lain.
* Periksa log error dari script.

### ❌ Bot berhenti ketika Termux ditutup

Termux dapat membatasi proses di latar belakang. Coba aktifkan izin penggunaan baterai yang sesuai dan hindari memaksa aplikasi berhenti.

Untuk mencoba menjalankan bot kembali:

```bash
cd ~/devilbot-free
node index.js
```

---

## 🛡️ Keamanan

Demi keamanan akun WhatsApp:

* Gunakan script dari repository yang kamu percaya.
* Periksa kode sebelum menjalankannya.
* Jangan mengunggah kredensial, token, atau data sesi ke repository publik.
* Jangan membagikan file autentikasi WhatsApp.
* Hindari penggunaan bot untuk spam atau aktivitas yang melanggar ketentuan WhatsApp.

---

## 📜 Ketentuan Penggunaan

1. Script ini dibagikan secara gratis.
2. Dilarang memperjualbelikan ulang script sebagai produk berbayar tanpa izin pemiliknya.
3. Pengguna bertanggung jawab atas penggunaan script masing-masing.
4. Jangan gunakan bot untuk mengirim spam atau mengganggu orang lain.
5. Perubahan kode dan distribusi ulang harus mengikuti izin serta ketentuan yang ditetapkan pemilik project.

---

<div align="center">

### 🔥 DEVILBOT FREE

**Free By HironiLN**

*Simple Setup • JavaScript • Termux*

**Gunakan dengan bijak. Tetap aman.**

</div>
