# 📱 Aplikasi Survey Lapangan – React Native

Aplikasi mobile yang digunakan untuk melakukan **survey lapangan berbasis lokasi** dengan **Google Sign-In**, **Google Maps API**, **SQLite lokal**, serta **sinkronisasi ke web service** (REST API). Dibangun menggunakan **React Native (Expo)** agar dapat berjalan di Android maupun iOS.

## 🎯 Fitur Utama

- 🔐 **Login/Register dengan Google Sign-In**  
  Menggunakan akun email Google untuk otentikasi pengguna.

- 🗺️ **Tampilan Google Maps di Halaman Utama**  
  Menampilkan lokasi pengguna dan titik-titik survey pada peta dengan integrasi Google Maps SDK.

- 📝 **Form Survey Lapangan**  
  Input data survey secara offline menggunakan database lokal (SQLite).

- 🌐 **Sinkronisasi Data ke Web API**  
  Data survey yang tersimpan secara offline dapat disinkronkan ke server online menggunakan REST API.

- 🎨 **UI Responsif dan Estetis**  
  Menggunakan desain yang intuitif, responsif, dan ramah terhadap berbagai ukuran layar.

- ♿ **Aksesibilitas**  
  Komponen UI mengikuti prinsip desain aksesibilitas Android.

## ⚙️ Teknologi yang Digunakan

| Kebutuhan         | Teknologi / Library                           |
|------------------|-----------------------------------------------|
| Framework        | React Native (Expo)                           |
| Auth             | `expo-auth-session`, `expo-google-app-auth`   |
| Maps             | `react-native-maps` + Google Maps API         |
| Database Offline | `expo-sqlite`                                 |
| API Sync         | `axios`, `fetch`, atau `react-query`          |
| UI Component     | `react-native-paper`, `react-navigation`, `mui`      |
| Responsive UI    | `flexbox`, `Dimensions`, `Platform`           |
| Accessibility    | `accessibilityLabel`, `accessible` props      |

## 🚀 Cara Menjalankan

### 1. Clone Repository

```bash
git clone https://github.com/username/survey-lapangan.git
cd survey-lapangan
```

### 2. Install Dependency

```bash
npm install
```

### 3. Jalankan Aplikasi

```bash
npx expo start
```

Buka dengan aplikasi **Expo Go** di Android/iOS, atau jalankan langsung di emulator.

## 🌐 Konfigurasi Web Service (API)

Pastikan endpoint API sudah tersedia dan sesuai dengan struktur data SQLite. Contoh endpoint:
```
POST https://api.example.com/survey/upload
```

## 📄 Lisensi

Aplikasi ini dibuat untuk keperluan akademik dan edukasi. Silakan gunakan dan modifikasi sesuai kebutuhan tugas Anda.
