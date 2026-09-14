# Moobi Koperasi Pro

Sistem Koperasi Perusahaan dengan 2 platform:
1. **Web Admin Dashboard & API** (`/web`): Next.js (App Router, TypeScript, Tailwind CSS).
2. **Mobile App Karyawan** (`/mobile`): React Native Expo (TypeScript) dengan dukungan Web Browser Preview.

---

## 🛠️ Setup Pertama Kali (Setelah Clone Repository)

Jika rekan tim Anda baru pertama kali mengunduh / clone repository ini:

### 1. Setup Backend & Web
```bash
cd web
npm install
copy .env.example .env
```
> 💡 **Catatan Database**: Pastikan MySQL di **Laragon** sudah menyala (*Start All*). Konfigurasi koneksi database ada di dalam file `web/.env`.

### 2. Setup Mobile App
```bash
cd ../mobile
npm install
```

---

## 🚀 Cara Menjalankan Project

### 1. Menjalankan Web Admin (Next.js)
Masuk ke folder `web` dan jalankan:
```bash
cd web
npm run dev
```
Buka browser di: [http://localhost:3000](http://localhost:3000)

---

### 2. Menjalankan Mobile App di Browser Web (Expo Web)
Masuk ke folder `mobile` dan jalankan:
```bash
cd mobile
npm run web
```
Aplikasi mobile akan otomatis terbuka di browser di: [http://localhost:8081](http://localhost:8081)

> 💡 **Tips Tampilan Layar HP di Browser**: 
> 1. Buka browser Chrome/Edge pada alamat `http://localhost:8081`.
> 2. Tekan tombol **F12** (Developer Tools).
> 3. Klik ikon **Toggle Device Toolbar (Ctrl + Shift + M)**.
> 4. Pilih perangkat (misal: *iPhone 14 Pro* atau *Pixel 7*) untuk simulasi layar HP.

---

### 3. (Opsional) Menjalankan Mobile App di HP Fisik
Jika ingin mencoba langsung di layar HP fisik:
1. Install aplikasi **Expo Go** dari Google Play Store (Android) / Apple App Store (iOS) di HP Anda.
2. Pastikan HP dan Laptop terhubung di **Wi-Fi yang sama**.
3. Jalankan perintah di terminal:
   ```bash
   cd mobile
   npx expo start
   ```
4. Scan **QR Code** yang muncul di terminal menggunakan kamera HP / aplikasi Expo Go.
