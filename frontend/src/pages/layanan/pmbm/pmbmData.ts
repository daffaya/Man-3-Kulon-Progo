/**
 * @fileoverview pmbmData — Pusat data statis dan tipe untuk fitur PMBM.
 * File ini memisahkan seluruh konstanta teks, array data, dan interface
 * dari komponen UI agar mudah di-maintain tanpa mencari di dalam JSX.
 *
 * @module pages/layanan/pmbm/pmbmData
 */

import React from "react";
import {
  BookOpen,
  Shield,
  Wrench,
  Star,
  Heart,
  Calendar,
  ClipboardList,
  Bell,
  FileText,
  ClipboardCheck,
} from "lucide-react";

/* ═══════════════════════════════════════════════════════════════
   TYPE DEFINITIONS
   ═══════════════════════════════════════════════════════════════ */

/** Representasi satu jalur pendaftaran Gelombang I. */
export interface JalurPendaftaran {
  nama: string;
  icon: React.ElementType;
  deskripsi: string;
  syarat: string[];
}

/** Representasi satu item program unggulan madrasah. */
export interface ProgramUnggulan {
  judul: string;
  deskripsi: string;
  icon: React.ElementType;
}

/** Representasi satu item jadwal pendaftaran. */
export interface JadwalItem {
  label: string;
  value: string;
  icon: React.ElementType;
}

/** Representasi satu langkah dalam alur pendaftaran. */
export interface AlurItem {
  nomor: number;
  judul: string;
  deskripsi: string;
}

/** Representasi satu item pertanyaan & jawaban (FAQ). */
export interface FaqItem {
  question: string;
  answer: string;
}

/* ═══════════════════════════════════════════════════════════════
   KONSTANTA & DATA STATIS
   ═══════════════════════════════════════════════════════════════ */

/** Path relatif ke halaman formulir pendaftaran. */
export const REGISTRATION_LINK = "/layanan/pmbm-daftar";

/** Daftar jalur pendaftaran Gelombang I (jalur khusus). */
export const JALUR_PENDAFTARAN: JalurPendaftaran[] = [
  {
    nama: "Tahfidz",
    icon: BookOpen,
    deskripsi:
      "Khusus siswa berprestasi hafalan Al-Qur'an dengan bimbingan intensif.",
    syarat: ["Sertifikat Tahfidz", "Hafalan juz (sesuai ketentuan)"],
  },
  {
    nama: "KKO",
    icon: Shield,
    deskripsi:
      "Kelas Khusus Olahraga — bagi siswa yang memiliki bakat dan prestasi di bidang olahraga, termasuk bela diri.",
    syarat: ["Sertifikat OR (Organisasi / Kepramukaan)", "Tes Kemampuan Dasar"],
  },
  {
    nama: "Keterampilan",
    icon: Wrench,
    deskripsi:
      "Pengembangan keterampilan praktis dengan tiga pilihan: Tata Busana, Multimedia, dan TITL.",
    syarat: ["Tes seleksi keterampilan sesuai pilihan"],
  },
  {
    nama: "Akademik / Non-Akademik",
    icon: Star,
    deskripsi:
      "Jalur umum berdasarkan prestasi akademik (nilai rapor) atau non-akademik (sertifikat kejuaraan).",
    syarat: [
      "Akademik: Nilai rapor semester 1–5",
      "Non-Akademik: Sertifikat kejuaraan (Kab/Kec, tingkat SMP/sederajat)",
    ],
  },
  {
    nama: "Afirmasi",
    icon: Heart,
    deskripsi: "Kuota khusus bagi putra-putri warga Pantog Wetan.",
    syarat: ["Warga Pantog Wetan"],
  },
];

/** Daftar program ungulan MAN 3 Kulon Progo. */
export const PROGRAM_UNGGULAN: ProgramUnggulan[] = [
  {
    judul: "Program Tahfidz Al-Qur'an",
    deskripsi:
      "Pembinaan hafalan Al-Qur'an dengan bimbingan guru tahfidz berpengalaman sebagai bekal kehidupan.",
    icon: BookOpen,
  },
  {
    judul: "KKO (Kelas Khusus Olahraga)",
    deskripsi:
      "Pengembangan bakat olahraga — termasuk bela diri — di bawah bimbingan pelatih berpengalaman.",
    icon: Shield,
  },
  {
    judul: "Keterampilan Terapan",
    deskripsi:
      "Tiga pilihan keahlian praktis — TITL, Tata Busana, dan Multimedia — sebagai bekal kemandirian siswa.",
    icon: Wrench,
  },
  {
    judul: "Lingkungan Islami & Fasilitas Modern",
    deskripsi:
      "Suasana belajar kondusif berkarakter islami, didukung fasilitas pembelajaran digital yang lengkap.",
    icon: Star, // Di kode asli kamu pakai Sparkles, tapi di import kamu tidak ada Sparkles. Aku samakan dengan import di atas.
  },
];

/** Jadwal kegiatan Gelombang I. */
export const JADWAL_G1: JadwalItem[] = [
  {
    label: "Pendaftaran Online (Gelombang I)",
    value: "1 April – 17 April 2026",
    icon: Calendar,
  },
  {
    label: "Seleksi",
    value: "20 April – 22 April 2026",
    icon: ClipboardList,
  },
  {
    label: "Pengumuman Hasil Seleksi",
    value: "23 April 2026",
    icon: Bell,
  },
  {
    label: "Lapor Diri",
    value: "24 April 2026",
    icon: FileText,
  },
];

/** Jadwal kegiatan Gelombang II. */
export const JADWAL_G2: JadwalItem[] = [
  {
    label: "Pendaftaran Online (Gelombang II)",
    value: "TODO: isi tanggal",
    icon: Calendar,
  },
  {
    label: "Pelaksanaan Tes",
    value: "TODO: isi tanggal",
    icon: ClipboardCheck,
  },
  {
    label: "Pengumuman Hasil Tes",
    value: "TODO: isi tanggal",
    icon: Bell,
  },
  {
    label: "Lapor Diri",
    value: "TODO: isi tanggal",
    icon: FileText,
  },
];

/** Langkah-langkah alur pendaftaran Gelombang I. */
export const ALUR_G1: AlurItem[] = [
  {
    nomor: 1,
    judul: "Daftar Online",
    deskripsi:
      "Isi formulir pendaftaran melalui sistem online MAN 3 Kulon Progo.",
  },
  {
    nomor: 2,
    judul: "Unggah Dokumen",
    deskripsi:
      "Upload KK, akta kelahiran, ijazah, dan dokumen pendukung sesuai jalur.",
  },
  {
    nomor: 3,
    judul: "Seleksi",
    deskripsi:
      "Ikuti proses seleksi sesuai jalur (tes keterampilan, verifikasi dokumen, dsb.).",
  },
  {
    nomor: 4,
    judul: "Pengumuman Hasil",
    deskripsi: "Tunggu pengumuman resmi hasil seleksi dari panitia PMBM.",
  },
  {
    nomor: 5,
    judul: "Lapor Diri",
    deskripsi:
      "Siswa yang diterima wajib lapor diri secara offline di MAN 3 Kulon Progo.",
  },
];

/** Langkah-langkah alur pendaftaran Gelombang II. */
export const ALUR_G2: AlurItem[] = [
  {
    nomor: 1,
    judul: "Daftar Online",
    deskripsi: "Isi formulir pendaftaran Gelombang II melalui sistem online.",
  },
  {
    nomor: 2,
    judul: "Datang untuk Tes",
    deskripsi:
      "Hadir langsung ke MAN 3 Kulon Progo pada jadwal pelaksanaan tes.",
  },
  {
    nomor: 3,
    judul: "Ikuti Tes",
    deskripsi: "Ikuti seleksi tes yang diselenggarakan secara on site.",
  },
  {
    nomor: 4,
    judul: "Pengumuman Hasil",
    deskripsi: "Tunggu pengumuman resmi hasil tes dari panitia PMBM.",
  },
  {
    nomor: 5,
    judul: "Lapor Diri",
    deskripsi:
      "Siswa yang diterima wajib lapor diri secara offline di MAN 3 Kulon Progo.",
  },
];

/** Daftar pertanyaan umum (FAQ) seputar PMBM. */
export const FAQ_DATA: FaqItem[] = [
  {
    question: "Ada berapa gelombang pendaftaran?",
    answer:
      "PMBM MAN 3 Kulon Progo TA 2026/2027 membuka dua gelombang. Gelombang I (jalur khusus) telah ditutup pada 17 April 2026. Gelombang II (jalur tes) saat ini sedang dibuka.",
  },
  {
    question: "Apa perbedaan Gelombang I dan Gelombang II?",
    answer:
      "Gelombang I membuka jalur khusus (Tahfidz, KKO, Keterampilan, Akademik/Non-Akademik, Afirmasi) dengan seleksi berkas dan wawancara. Gelombang II menggunakan jalur tes yang dilaksanakan langsung (on site) di MAN 3 Kulon Progo.",
  },
  {
    question: "Apa saja jalur pendaftaran Gelombang I?",
    answer:
      "Gelombang I membuka 5 jalur khusus: Tahfidz, KKO (Kelas Khusus Olahraga), Keterampilan, Akademik/Non-Akademik, dan Afirmasi. Setiap jalur memiliki syarat dan sistem seleksi masing-masing.",
  },
  {
    question: "Apa itu KKO?",
    answer:
      "KKO adalah Kelas Khusus Olahraga. Di MAN 3 Kulon Progo banyak siswa KKO yang berasal dari klub bela diri. Syarat masuk meliputi sertifikat OR dan tes kemampuan dasar. Jalur ini hanya tersedia di Gelombang I.",
  },
  {
    question: "Bagaimana sistem seleksi Gelombang II?",
    answer:
      "Gelombang II menggunakan jalur tes yang dilaksanakan secara on site (langsung di lokasi). Calon siswa mendaftar online terlebih dahulu, kemudian hadir pada jadwal tes yang telah ditentukan.",
  },
  {
    question: "Apakah boleh mendaftar di sekolah lain secara bersamaan?",
    answer:
      "Boleh, namun di formulir terdapat pertanyaan komitmen: apabila diterima di MAN 3 Kulon Progo dan sekolah lain, apakah bersedia tetap melanjutkan di MAN 3 Kulon Progo.",
  },
  {
    question: "Dokumen apa saja yang perlu disiapkan?",
    answer:
      "Dokumen wajib: Surat Keterangan Aktif, scan KK, scan Akta Kelahiran, dan Ijazah SMP/MTs. Untuk Gelombang I, tambahkan dokumen pendukung sesuai jalur (sertifikat kejuaraan, sertifikat Tahfidz, atau sertifikat OR).",
  },
  {
    question: "Bagaimana cara mengecek status pendaftaran?",
    answer:
      "Kamu bisa cek status pendaftaran secara online melalui halaman Status Pendaftaran di website ini. Cukup cari menggunakan nama atau nomor pendaftaran.",
  },
];

/** Daftar syarat umum pendaftaran. */
export const SYARAT_UMUM: string[] = [
  "Surat Keterangan Aktif dari sekolah asal",
  "Scan Kartu Keluarga (KK)",
  "Scan Akta Kelahiran",
  "Ijazah SMP/MTs",
];

/** Daftar data siswa yang wajib diisi di formulir. */
export const DATA_SISWA: string[] = [
  "Nama lengkap",
  "NISN",
  "NIK",
  "Tempat & Tanggal Lahir",
  "Asal sekolah",
  "No. KK",
  "Alamat lengkap",
  "Alamat domisili",
  "No. HP siswa",
];

/** Daftar data orang tua yang wajib diisi di formulir. */
export const DATA_ORTU: string[] = [
  "Nama Ayah",
  "Nama Ibu",
  "Pekerjaan Ayah",
  "Pekerjaan Ibu",
  "Penghasilan Ayah",
  "Penghasilan Ibu",
  "Alamat lengkap orang tua",
  "Alamat domisili orang tua",
  "No. HP Ayah",
  "No. HP Ibu",
];

/** Daftar dokumen prestasi (khusus Gelombang I). */
export const DOKUMEN_PRESTASI: string[] = [
  "Scan sertifikat kejuaraan",
  "Jenis kejuaraan: Akademik, Kesenian, OR, Tahfidz, atau lainnya",
  "Tingkat kejuaraan: Kota, Provinsi, atau Kabupaten/Kecamatan (tingkat SMP/sederajat)",
];
