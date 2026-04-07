# Sistem Informasi Manajemen MAN 3 Kulon Progo

Aplikasi web full-stack untuk mengelola berbagai aspek informasi dan kegiatan di MAN 3 Kulon Progo.

**Tech Stack:** Node.js • Express.js • React • TypeScript • Tailwind CSS

## Overview

Proyek ini adalah Sistem Informasi Manajemen (SIM) yang dikembangkan untuk memenuhi kebutuhan administrasi dan publikasi MAN 3 Kulon Progo. Aplikasi ini dibangun dengan arsitektur full-stack yang memisahkan **Backend (API)** dan **Frontend (Aplikasi Web)** untuk memberikan pengalaman pengguna yang optimal dan memudahkan dalam pengembangan selanjutnya.

Backend menyediakan RESTful API yang robust untuk mengelola data, sedangkan frontend dibangun dengan React yang modern dan responsif, dapat diakses oleh admin untuk manajemen data dan oleh publik untuk melihat informasi terkini.

## Features

- **User Management**: Sistem autentikasi dan otorisasi aman untuk mengelola akses admin.
- **Manajemen Siswa & Alumni**: Kelola data siswa, import data massal dari Excel, dan database alumni.
- **Attendance System (Sistem Presensi)**: Pencatatan kehadiran harian, rekap bulanan, dan manajemen hari libur.
- **Content Publishing (Publikasi Konten)**: Kelola berita, artikel, dan kategori untuk website publik.
- **Photo Gallery (Galeri Foto)**: Upload dan kelola album serta koleksi foto.
- **Digital Archive (Arsip Digital)**: Kelola dokumen penting dalam format digital.
- **Profil Madrasah**: Halaman untuk visi-misi, sejarah, struktur organisasi, sarana-prasarana, dan staf pengajar.
- **Public Services (Layanan Publik)**: Integrasi informasi layanan seperti PMBM, PTSP, dan Zona Integritas.

## Installation

Pastikan sudah menginstall **Node.js (v18+)** dan **npm** di komputer.

```bash
git clone https://github.com/daffaya/Man-3-Kulon-Progo
cd Man-3-Kulon-Progo
```

## Install Backend Dependencies

```bash
cd backend
npm install
```

## Install Frontend Dependencies

Buka terminal baru atau setelah selesai di backend:

```bash
cd frontend
npm install
```

## Usage

### Jalankan Backend

Di dalam folder `backend`:

```bash
npm run dev
```

Server backend akan berjalan di http://localhost:3001

### Jalankan Frontend

Di dalam folder `frontend`:

```bash
npm run dev
```

Aplikasi frontend akan terbuka otomatis di browser, biasanya di http://localhost:5173

## Configuration

Kamu perlu membuat file `.env` di kedua folder `backend` dan `frontend`.

### 1. Backend `.env`

Buat file `.env` di folder `backend` dengan isi seperti berikut:

```bash
env
# Server
PORT=3001
FRONTEND_URL=http://localhost:5173
ALLOWED_ORIGINS=https://man3kulonprogo.sch.id,http://localhost:5173

# Database
DATABASE_HOST=localhost
DATABASE_USER=root
DATABASE_PASSWORD=xxx
DATABASE_NAME=xxxx

# JWT
JWT_SECRET=xxxx
JWT_EXPIRATION=1h

```

### 2. Frontend `.env`

Buat file `.env` di folder `frontend`dengan isi sebagai berikut:

```bash
env
VITE_FRONTEND_URL=https://man3kulonprogo.sch.id/
VITE_BACKEND_URL=http://localhost:3001/api
```

## Folder Structure

```bash
text
├── backend/                  # Aplikasi Backend (API)
│   ├── src/
│   │   ├── config/           # Konfigurasi koneksi database
│   │   ├── controllers/      # Logika bisnis untuk menangani request
│   │   ├── middleware/       # Middleware (auth, upload file, rate limiter)
│   │   ├── models/           # Skema dan model database
│   │   ├── routes/           # Definisi endpoint API
│   │   ├── services/         # Logika bisnis tambahan (export, import, dll.)
│   │   └── utils/            # Fungsi-fungsi helper
│   ├── uploads/              # Folder penyimpanan file yang diupload
│   └── server.js             # Entry point dari aplikasi backend
│
└── frontend/                 # Aplikasi Frontend (Website)
    ├── public/               # Aset statis (gambar, ikon, dll.)
    ├── src/
    │   ├── api/              # Fungsi untuk komunikasi dengan backend API
    │   ├── components/       # Komponen UI yang reusable
    │   ├── contexts/         # React Context untuk state global
    │   ├── hooks/            # Custom React Hooks
    │   ├── lib/              # Utilitas dan konfigurasi library
    │   ├── locales/          # File terjemahan (i18n)
    │   ├── pages/            # Komponen untuk setiap halaman/rute
    │   ├── services/         # Layanan logika bisnis di sisi frontend
    │   └── types/            # Definisi tipe TypeScript
    └── index.html            # Entry point dari aplikasi frontend
```

## Contributing

Contribution, issues, feature dipersilakan. Bisa ikuti langkah-langkah berikut:

1. Fork repository ini.
2. Buat branch baru:

```bash
   git checkout -b fitur/fitur-baru
```

3. Commit changes:

```bash
git commit -am 'Menambahkan fitur baru'
```

4. Push ke branch:

```bash
git push origin fitur/fitur-baru
```

5. Buat Pull Request di GitHub.

## License

Proyek ini dilisensikan di bawah MIT License – lihat file `LICENSE` untuk detailnya.

## Author / Kontak

- Daffa Pasya Al Ghifary
- Email: daffapasyaa21@gmail.com
- Link Repository: https://github.com/daffaya/Man-3-Kulon-Progo
