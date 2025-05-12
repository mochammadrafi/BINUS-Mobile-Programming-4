# 📱 Aplikasi Survey Lapangan – React Native

Aplikasi mobile yang digunakan untuk melakukan **survey lapangan berbasis lokasi** dengan **Google Sign-In**, **Google Maps API**, **SQLite lokal**, serta **sinkronisasi ke web service** (REST API). Dibangun menggunakan **React Native (Expo)** agar dapat berjalan di Android maupun iOS.

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