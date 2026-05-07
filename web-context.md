# Konteks Proyek — man3kulonprogo.sch.id

> File ini dibuat untuk mempercepat onboarding di sesi chat baru.
> Update file ini setiap ada perubahan signifikan.
> Terakhir diupdate: Mei 2026

---

## 👤 Tentang Pengembang

- **Nama**: Daffaya
- **Role**: Pranata Komputer, pengembang tunggal (solo dev)
- **Status**: Kemungkinan tidak lama di sekolah ini → proyek harus bisa hidup tanpa developer
- **Visi jangka panjang**: SaaS Manajemen Sekolah — MAN 3 KP sebagai _living proof_ / percontohan

---

## 🏫 Tentang Proyek

**Website**: [man3kulonprogo.sch.id](https://man3kulonprogo.sch.id)
**Jenis**: Website resmi sekolah + sistem manajemen internal
**Sekolah**: MAN 3 Kulon Progo (Madrasah Aliyah Negeri 3 Kulon Progo), DIY
**Di bawah**: Kemenag (bukan Kemdikbud) → pakai **RDM (Rapor Digital Madrasah)**, bukan ARD

---

## 🛠️ Tech Stack

### Frontend

- React + TypeScript + Vite
- Tailwind CSS
- React Router
- i18n (EN/ID via locales/)
- Deploy: **public_html di Hostinger cPanel**

### Backend

- Node.js + Express
- MySQL (mysql2/promise, raw query, snake_case)
- Pattern: Factory function + dependency injection
- Auth: JWT (Bearer token, localStorage)
- File upload: multer
- Deploy: **Hostinger cPanel — Setup Node.js App**

### Database

- MySQL
- Naming convention: snake_case
- JSON columns untuk CMS data

---

## 📁 Struktur Proyek

```
root/
├── frontend/          → React + Vite
│   ├── src/
│   │   ├── api/       → API calls per domain
│   │   ├── components/→ UI components
│   │   ├── contexts/  → React contexts
│   │   ├── hooks/     → Custom hooks
│   │   ├── pages/     → Halaman per route
│   │   │   ├── admin/ → Halaman admin panel
│   │   │   │   └── cms/ → CMS editor pages (BARU)
│   │   │   ├── layanan/
│   │   │   └── profile/
│   │   ├── types/     → TypeScript types
│   │   └── lib/       → api.ts, utils.ts, storage.ts
│   └── public/        → Static assets
│
├── backend/
│   └── src/
│       ├── config/    → connection.js
│       ├── controllers/
│       ├── middleware/
│       ├── models/
│       ├── routes/
│       ├── services/
│       └── utils/
│
└── .github/
    └── workflows/
        └── deploy.yml → CI/CD (frontend only, backend masih manual)
```

---

## ✅ Fitur yang Sudah Selesai

### Fitur Publik

- Berita/Artikel (lengkap, dinamis)
- Galeri foto (album)
- Profil sekolah (semua halaman)
- Alumni
- PMBM — Penerimaan Murid Baru Madrasah (Gelombang 1 & 2, multi-step form)
- Zona Integritas (6 area, modal navigasi, LKJ, SOP, banner)
- SEDUM — Serapan Aduan Masyarakat
- PTSP Online
- Maklumat Pelayanan
- Cek Kelulusan (CekKelulusanPage — drama reveal, confetti)

### Fitur Internal/Admin

- Presensi siswa (input, rekap, kalender, hari libur, arsip, export PDF)
  - Alur: guru BK input langsung di app, bukan rekap manual
  - Default semua siswa "hadir", tinggal pilih yang tidak hadir
  - Deteksi kelas yang lupa direkap
- Manajemen artikel, galeri, staf, siswa, alumni
- Import data siswa via Excel
- Manajemen user & autentikasi (role-based)
- Arsip dokumen
- Manajemen PMBM (tabel pendaftar, filter, export Excel)
- Manajemen Kelulusan (import Excel, filter tahun ajaran, search, delete)

### CMS (Content Management System) — BARU

- **Arsitektur**: 2 tabel baru (`site_contents`, `site_collections`) di database yang sama
- **Pattern**: `site_contents` pakai JSON column per section, `site_collections` untuk list yang bisa ditambah/hapus/reorder
- **Cache**: In-memory cache (5 menit TTL) di backend, invalidate otomatis setelah admin save
- **16 halaman** sudah di-CMS-isasi — semua konten publik dinamis
- **Admin Panel CMS**: `/atmin/cms` dengan sidebar navigasi

#### Halaman yang sudah di-CMS:

| Halaman             | Route CMS Admin                  |
| ------------------- | -------------------------------- |
| Homepage            | `/atmin/cms/home`                |
| Kontak              | `/atmin/cms/kontak`              |
| Sejarah             | `/atmin/cms/sejarah`             |
| Visi & Misi         | `/atmin/cms/visi-misi`           |
| Kepala Madrasah     | `/atmin/cms/kepala-madrasah`     |
| Struktur Organisasi | `/atmin/cms/struktur-organisasi` |
| Sarana & Prasarana  | `/atmin/cms/sarana-prasarana`    |
| Mitra               | `/atmin/cms/mitra`               |
| Siswa               | `/atmin/cms/siswa`               |
| Program Kerja       | `/atmin/cms/program-kerja`       |
| PMBM                | `/atmin/cms/pmbm`                |
| Zona Integritas     | `/atmin/cms/zona-integritas`     |
| SEDUM               | `/atmin/cms/sedum`               |
| PTSP                | `/atmin/cms/ptsp`                |
| Maklumat Pelayanan  | `/atmin/cms/maklumat-pelayanan`  |
| Web App             | `/atmin/cms/web-app`             |
| Slider Homepage     | `/atmin/cms/collections/slider`  |

---

## 🏗️ Arsitektur CMS

### Database

```sql
-- Konten per section
site_contents (id, page, section, data JSON, updated_at, updated_by)
UNIQUE KEY (page, section)

-- Koleksi item (slider, quick_actions)
site_collections (id, type, data JSON, sort_order, is_active, updated_at, updated_by)
```

### Backend Files

```
src/models/cmsModel.js         → findByPage, findSection, upsertSection, collection CRUD
src/utils/cmsCache.js          → in-memory cache dengan TTL 5 menit
src/controllers/cmsController.js → public read (cached) + admin write (invalidate cache)
src/routes/cmsRoutes.js        → public GET /api/cms/:page, /:page/:section, /collections/:type
src/routes/adminCmsRoutes.js   → protected PUT /api/atmin/cms/:page/:section + collection CRUD
```

### Frontend Files

```
src/hooks/useCmsPage.ts        → useCmsPage, useCmsSection, useCmsCollection hooks
src/pages/admin/cms/
  ├── CmsOverviewPage.tsx      → grid semua halaman CMS (/atmin/cms)
  ├── CmsPmbmForm.tsx          → editor PMBM
  ├── CmsHomeForm.tsx          → editor Homepage
  └── cmsFormComponents.tsx    → shared: SectionCard, Field, TextareaField, dll
src/components/layout/
  ├── CmsLayout.tsx            → layout dengan sidebar CMS
  └── AdminHeader.tsx          → improved header dengan quick nav
```

### Pattern Frontend CMS

```tsx
// Setiap halaman publik pakai pattern ini:
const { data, loading } = useCmsSection<TypeContent>("page-key", "section-key");
const content = data?.field ?? FALLBACK.field; // selalu ada fallback
```

---

## 🎭 User Roles

```
super_admin   → akses semua fitur + CMS
jurnalis      → artikel, galeri
arsiparis     → arsip dokumen
guru_bk       → presensi siswa, kelulusan
pengelola_bmn → inventaris (belum dibuat)
```

---

## 🚀 CI/CD

### Status

- **Frontend**: ✅ Otomatis via GitHub Actions + FTP ke public_html
- **Backend**: ❌ Masih manual (DEBT — lihat roadmap)

### Workflow Frontend (`deploy.yml`)

```
Push ke main
  → npm ci + npm run build (frontend/)
  → lftp mirror --delete ke public_html
  → force put index.html (supaya selalu fresh)
  → exclude .htaccess (jangan dihapus!)
```

### GitHub Secrets yang dipakai

```
FTP_USERNAME, FTP_PASSWORD, FTP_HOST, FTP_PORT
VITE_BACKEND_URL
```

### Hosting

- **Provider**: Hostinger cPanel (shared hosting)
- **Frontend**: public_html (static files)
- **Backend**: Setup Node.js App, restart via `touch tmp/restart.txt`
- **DB**: MySQL di cPanel

---

## 💳 Technical Debt & Roadmap

3. CmsMaklumatForm → 1 section, image upload
4. CmsWebAppForm → 1 section, 2 field
5. CmsSejarahForm → 1 section, array paragraf
6. CmsVisiMisiForm → 4 sections
7. CmsKepalaMadrasahForm → periodisasi tabel
8. CmsStrukturForm → positions + image
9. CmsProgramKerjaForm → nested sections
10. CmsSedumForm → 5 sections
11. CmsPtspForm → services array kompleks
12. CmsZonaIntegritasForm → paling kompleks
13. SurveySlider fix → sudah di CmsHomeForm sebenarnya

### 🔴 Debt (harus diselesaikan)

1. **CI/CD Backend** — masih deploy manual
   - Setup SSH key tanpa passphrase di cPanel
   - GitHub Actions: rsync backend/ ke server + npm ci + touch tmp/restart.txt
   - Blocked by: SSH key passphrase issue di Hostinger

2. **CMS Admin Forms** — baru 2 yang selesai (PMBM, Homepage)
   - Yang belum: Kontak, Sejarah, VisiMisi, KepalaMadrasah, StrukturOrganisasi, SaranaPrasarana, Mitra, Siswa, ProgramKerja, ZonaIntegritas, SEDUM, PTSP, MaklumatPelayanan, WebApp
   - Semua pakai shared components dari `cmsFormComponents.tsx`

3. **SurveySlider** — belum di-CMS-isasi
   - Data SPAK & SPKP sudah ada di DB (section `survey_spak`, `survey_spkp`)
   - Komponen `SurveySlider.tsx` masih hardcoded

4. **ProfilePage.tsx** — masih hardcoded (duplikat dari SejarahPage + VisiMisiPage)
   - Sebaiknya fetch dari CMS juga

### 🟡 Fitur Baru yang Direncanakan

5. **Presensi QR Code** — Model C (QR per siswa)
   - Alur: guru piket scan QR siswa yang tidak hadir
   - QR berisi URL `/scan/{qr_token}` unik per siswa
   - Generate kartu QR massal (PDF) dari sistem
   - Fallback: input manual via NISN kalau kartu tertinggal
   - Belum mulai implementasi

6. **Notifikasi WA ke Wali Murid** — ketika siswa tidak hadir
   - Butuh data nomor HP wali murid di sistem
   - Belum ada di database siswa sekarang

7. **Dashboard Kepala Madrasah** — ringkasan harian otomatis

8. **Presensi Guru** — belum ada sama sekali

9. **Jadwal Pelajaran** — belum ada

10. **Perpustakaan sederhana** — belum ada (ada link ke sistem eksternal)

11. **SPP/Keuangan sederhana** — belum ada

### 🟠 Improvement yang Direncanakan

12. **AdminHeader UX** — sudah di-improve tapi masih bisa lebih baik

13. **Performance** — cold start backend di Hostinger agak lambat (~1 detik)
    - Solusi: ping service setiap 5 menit agar tidak sleep

14. **CekKelulusan** — `TAHUN_AJARAN_AKTIF` masih hardcoded di backend
    - Kandidat untuk di-CMS-isasi

---

## 🔑 Pola Kode Penting

### Backend Pattern

```js
// Factory function + dependency injection
const createXxxController = ({ xxxModel }) => { return { method: async (req, res) => {} } }
const createXxxModel = ({ pool }) => { return { async method() {} } }
const xxxRouterFactory = ({ pool, JWT_SECRET }) => { const router = Router(); ... return router; }
```

### Frontend Pattern

```tsx
// Custom hook untuk API
const { data, loading, error } = useCmsSection<Type>("page", "section");
const value = data?.field ?? FALLBACK.field; // selalu ada fallback

// Skeleton loading di dalam tabel
{
  loading ? [...Array(5)].map((_, i) => <SkeletonRow key={i} />) : <DataRow />;
}
```

### API Helper

```ts
// src/lib/api.ts
apiFetch<T>(endpoint, options); // auto prepend VITE_BACKEND_URL, handle error
```

---

## 📝 Catatan Penting

- **RDM**: Sekolah pakai Rapor Digital Madrasah (Kemenag) → tidak perlu buat modul rapor
- **SDM**: Tantangan utama adalah SDM non-teknis → semua fitur harus zero/low learning curve
- **.htaccess**: Jangan pernah dihapus dari public_html — SPA routing bergantung padanya
- **JSON parse**: mysql2 kadang return JSON column sebagai string → selalu pakai helper `parseJson()`
- **Fallback**: Setiap field CMS harus punya fallback value → halaman tidak crash kalau API gagal
- **Cache invalidation**: Setelah admin save section, cache di-invalidate otomatis via `cmsCache.invalidatePrefix()`
- **PMBM config**: `GELOMBANG_AKTIF`, `GELOMBANG_TAMPIL`, batas tanggal sekarang dari CMS → tidak perlu deploy untuk ganti gelombang
