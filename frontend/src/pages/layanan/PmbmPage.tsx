/**
 * @fileoverview PMBMPage - Landing page pendaftaran siswa baru (PMBM) MAN 3 Kulon Progo.
 **/

import React, { useState, useEffect } from "react";
import {
  FileText,
  Calendar,
  Phone,
  HelpCircle,
  CheckCircle,
  ChevronDown,
  ArrowRight,
  Users,
  Award,
  BookOpen,
  Sparkles,
  Mail,
  Bell,
  ZoomIn,
  Shield,
  Wrench,
  Star,
  Heart,
  ClipboardList,
  Info,
} from "lucide-react";
import Layout from "../../components/layout/Layout";
import ImageZoomModal from "../../components/modals/ImageZoomModal";

const PmbmPage: React.FC = () => {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [scrollY, setScrollY] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", handleScroll);
    setIsLoaded(true);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const registrationLink = "/layanan/pmbm-daftar";

  /* ═══════════════ DATA: Jalur Gelombang 1 (Khusus) ═══════════════ */
  const jalurPendaftaran = [
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
      syarat: [
        "Sertifikat OR (Organisasi / Kepramukaan)",
        "Tes Kemampuan Dasar",
      ],
    },
    {
      nama: "Keterampilan",
      icon: Wrench,
      deskripsi:
        "Pengembangan keterampilan praktis dengan tiga pilihan: Tata Busana, dan Multimedia, TITL(Teknik Instalasi Tenaga Listrik).",
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

  /* ═══════════════ DATA: Program Unggulan ═══════════════ */
  const programUnggulan = [
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
      icon: Sparkles,
    },
  ];

  /* ═══════════════ DATA: Jadwal PMBM ═══════════════ */
  const jadwalPMBM = [
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

  /* ═══════════════ DATA: Alur Pendaftaran ═══════════════ */
  const alurPendaftaran = [
    {
      nomor: 1,
      judul: "Daftar Online",
      deskripsi:
        "Isi formulir pendaftaran melalui Google Form resmi MAN 3 Kulon Progo.",
    },
    {
      nomor: 2,
      judul: "Unggah Dokumen",
      deskripsi:
        "Upload KK, akta kelahiran, ijazah, dan dokumen pendukung sesuai jalur yang dipilih.",
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

  /* ═══════════════ DATA: FAQ ═══════════════ */
  const faqData = [
    {
      pertanyaan: "Apa saja jalur pendaftaran yang tersedia?",
      jawaban:
        "Gelombang I membuka 5 jalur khusus: Tahfidz, KKO (Kelas Khusus Olahraga), Keterampilan, Akademik/Non-Akademik, dan Afirmasi. Gelombang II (reguler/jalur tes) akan dibuka menyusul.",
    },
    {
      pertanyaan: "Apa itu KKO?",
      jawaban:
        "KKO adalah Kelas Khusus Olahraga. Meski secara umum mencakup berbagai cabang olahraga, di MAN 3 Kulon Progo banyak siswa KKO yang berasal dari klub bela diri. Syarat masuk meliputi sertifikat OR dan tes kemampuan dasar.",
    },
    {
      pertanyaan: "Bagaimana sistem seleksi jalur Akademik dan Non-Akademik?",
      jawaban:
        "Jalur Akademik menggunakan nilai rapor semester 1–5. Jalur Non-Akademik menggunakan sertifikat kejuaraan tingkat Kabupaten/Kecamatan (akademik, kesenian, OR, tahfidz, atau lainnya) dari jenjang SMP/sederajat.",
    },
    {
      pertanyaan: "Apa saja pilihan program Keterampilan?",
      jawaban:
        "Tersedia tiga pilihan: TITL (Teknik Instalasi Tenaga Listrik), Tata Busana, dan Multimedia. Peserta jalur Keterampilan akan mengikuti tes seleksi sesuai pilihan.",
    },
    {
      pertanyaan: "Siapa yang bisa mendaftar jalur Afirmasi?",
      jawaban:
        "Jalur Afirmasi dikhususkan bagi putra-putri warga Pantog Wetan.",
    },
    {
      pertanyaan: "Apakah boleh mendaftar di sekolah lain secara bersamaan?",
      jawaban:
        "Boleh, namun di formulir terdapat pertanyaan komitmen: apabila diterima di MAN 3 Kulon Progo dan sekolah lain, apakah bersedia tetap melanjutkan di MAN 3 Kulon Progo.",
    },
    {
      pertanyaan: "Dokumen apa saja yang perlu di-upload?",
      jawaban:
        "Dokumen wajib: Surat Keterangan Aktif, scan KK, scan Akta Kelahiran, dan Ijazah SMP/MTs. Dokumen pendukung sesuai jalur: sertifikat kejuaraan, sertifikat Tahfidz (jalur Tahfidz), atau sertifikat OR (jalur KKO).",
    },
  ];

  /* ═══════════════ DATA: Syarat & Dokumen ═══════════════ */
  const syaratUmum = [
    "Surat Keterangan Aktif dari sekolah asal",
    "Scan Kartu Keluarga (KK)",
    "Scan Akta Kelahiran",
    "Ijazah SMP/MTs",
  ];

  const dataSiswa = [
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

  const dataOrtu = [
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

  const dokumenPrestasi = [
    "Scan sertifikat kejuaraan",
    "Jenis kejuaraan: Akademik, Kesenian, OR, Tahfidz, atau lainnya",
    "Tingkat kejuaraan: Kota, Provinsi, atau Kabupaten/Kecamatan (tingkat SMP/sederajat)",
  ];

  return (
    <Layout>
      {/* ─── Floating CTA (Mobile) ─── */}
      <a
        href={registrationLink}
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 right-6 z-50 md:hidden bg-accent text-white p-4 rounded-full shadow-lg hover:scale-110 transition-all duration-300 flex items-center justify-center group"
        aria-label="Daftar Sekarang"
      >
        <ArrowRight
          size={24}
          className="group-hover:translate-x-1 transition-transform"
        />
        <span className="absolute right-full mr-3 bg-primary text-white text-sm px-3 py-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
          Daftar Sekarang
        </span>
      </a>

      {/* ═══════════════════════════════════════════════════
          HERO
      ═══════════════════════════════════════════════════ */}
      <section className="relative h-screen w-full overflow-hidden flex items-center justify-center">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: "url(/Hero.jpg)",
            transform: `translateY(${scrollY * 0.5}px)`,
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-black/70" />
        </div>

        <div
          className={`relative z-10 container max-w-6xl mx-auto px-4 sm:px-6 text-center md:text-left transition-all duration-1000 ${
            isLoaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
          }`}
        >
          <div className="max-w-3xl mx-auto md:mx-0">
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white mb-4 leading-tight">
              PMBM MAN 3 Kulon Progo
              <br />
              <span className="text-accent">TA 2026/2027</span>
            </h1>
            <p className="text-lg sm:text-xl text-white/90 mb-4 max-w-xl mx-auto md:mx-0">
              Penerimaan Murid Baru Madrasah secara online — jalur khusus di
              Gelombang I telah dibuka.
            </p>
            <p className="text-sm text-white/60 mb-8">
              Gelombang I: 1 – 17 April 2026
            </p>
            <a
              href={registrationLink}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 btn-primary font-semibold text-lg px-8 py-4 rounded-full transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1 group"
            >
              Daftar Sekarang
              <ArrowRight
                size={20}
                className="group-hover:translate-x-1 transition-transform"
              />
            </a>
            <a
              href="/layanan/pmbm/status"
              className="inline-flex items-center gap-3 btn-secondary font-semibold text-lg px-10 py-5 rounded-full transition-all duration-300"
            >
              <ClipboardList size={22} />
              Cek Status Pendaftaran
            </a>
          </div>
        </div>

        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 text-white animate-bounce">
          <svg width="30" height="30" viewBox="0 0 30 30" fill="none">
            <path
              d="M15 20L8 13L9.4 11.6L15 17.2L20.6 11.6L22 13L15 20Z"
              fill="white"
            />
          </svg>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════
          JALUR PENDAFTARAN (GELOMBANG 1)
      ═══════════════════════════════════════════════════ */}
      <section className="py-16 bg-background">
        <div className="container max-w-6xl mx-auto px-4 sm:px-6">
          <h2 className="text-3xl font-serif font-bold text-center mb-2 text-foreground">
            Jalur Pendaftaran
          </h2>
          <p className="text-center text-secondary mb-2 max-w-2xl mx-auto">
            <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-accent bg-accent/10 px-3 py-1 rounded-full mb-3">
              Gelombang I — Jalur Khusus
            </span>
          </p>
          <p className="text-center text-secondary mb-10 max-w-2xl mx-auto">
            Pilih jalur yang sesuai dengan prestasi dan minatmu. Setiap jalur
            memiliki sistem seleksi masing-masing.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {jalurPendaftaran.map((item, index) => {
              const Icon = item.icon;
              return (
                <div
                  key={index}
                  className="group bg-[rgb(var(--color-background))] border border-[rgb(var(--color-secondary))]/20 rounded-xl p-6 shadow-sm hover:shadow-xl transition-all duration-500 hover:-translate-y-2 relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 w-32 h-32 bg-[rgb(var(--color-accent))]/5 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-700" />

                  <div className="relative z-10">
                    <div className="mb-4">
                      <div className="bg-accent/20 p-3 rounded-full inline-flex group-hover:bg-accent/30 transition-all duration-300">
                        <Icon className="text-accent" size={24} />
                      </div>
                    </div>

                    <h3 className="font-bold text-xl mb-2 text-foreground">
                      {item.nama}
                    </h3>
                    <p className="text-secondary text-sm mb-4">
                      {item.deskripsi}
                    </p>

                    <div className="space-y-2">
                      {item.syarat.map((s, i) => (
                        <div key={i} className="flex items-start gap-2">
                          <CheckCircle
                            className="text-accent flex-shrink-0 mt-0.5"
                            size={14}
                          />
                          <span className="text-sm text-secondary">{s}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Info gelombang 2 */}
          <div className="mt-8 max-w-3xl mx-auto p-4 bg-accent/5 border border-accent/20 rounded-lg flex items-start gap-3">
            <Info className="text-accent flex-shrink-0 mt-0.5" size={18} />
            <p className="text-sm text-secondary">
              <strong className="text-accent">Gelombang II (Reguler)</strong>{" "}
              dengan jalur tes akan dibuka menyusul. Pantau terus informasi
              terbaru melalui website dan media sosial MAN 3 Kulon Progo.
            </p>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════
          TENTANG PMBM
      ═══════════════════════════════════════════════════ */}
      <section className="py-12 bg-semibackground">
        <div className="container max-w-6xl mx-auto px-4 sm:px-6">
          <h2 className="text-3xl font-serif font-bold text-center mb-8 text-foreground">
            Tentang PMBM MAN 3 Kulon Progo
          </h2>
          <div className="max-w-4xl mx-auto text-center">
            <p className="text-lg leading-relaxed text-secondary mb-6">
              MAN 3 Kulon Progo membuka Penerimaan Murid Baru Madrasah (PMBM)
              Tahun Ajaran 2026/2027 bagi putra-putri terbaik bangsa yang siap
              tumbuh menjadi generasi berilmu, berakhlak mulia, dan berdaya
              saing global. Sebagai madrasah di bawah naungan Kementerian Agama
              Republik Indonesia, kami berkomitmen membentuk siswa yang unggul
              dalam ilmu pengetahuan dan kuat dalam nilai-nilai keislaman.
            </p>
            <p className="text-lg leading-relaxed text-secondary">
              Pendaftaran dapat dilakukan dari mana saja melalui sistem online
              kami.
              <strong className="text-accent">
                {" "}
                Segera daftarkan diri dan jadilah bagian dari keluarga besar MAN
                3 Kulon Progo!
              </strong>
            </p>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════
          PROGRAM UNGGULAN
      ═══════════════════════════════════════════════════ */}
      <section className="py-12 bg-background">
        <div className="container max-w-6xl mx-auto px-4 sm:px-6">
          <h2 className="text-3xl font-serif font-bold text-center mb-8 text-foreground">
            Program Unggulan
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
            {programUnggulan.map((item, index) => {
              const Icon = item.icon;
              return (
                <div
                  key={index}
                  className="group bg-[rgb(var(--color-background))] border border-[rgb(var(--color-secondary))]/20 rounded-xl p-6 shadow-sm hover:shadow-xl transition-all duration-500 hover:-translate-y-2 relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 w-32 h-32 bg-[rgb(var(--color-accent))]/5 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-700" />
                  <div className="flex items-start gap-4 relative z-10">
                    <div className="bg-accent/20 p-3 rounded-full group-hover:bg-accent/30 transition-all duration-300">
                      <Icon className="text-accent" size={24} />
                    </div>
                    <div>
                      <h3 className="font-bold text-xl mb-2 text-foreground">
                        {item.judul}
                      </h3>
                      <p className="text-secondary">{item.deskripsi}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════
          JADWAL PMBM
      ═══════════════════════════════════════════════════ */}
      <section className="py-12 bg-semibackground">
        <div className="container max-w-6xl mx-auto px-4 sm:px-6">
          <h2 className="text-3xl font-serif font-bold text-center mb-8 text-foreground">
            Jadwal PMBM
          </h2>
          <div className="max-w-4xl mx-auto">
            <div className="card p-6 md:p-8">
              <p className="text-center mb-6 text-secondary">
                Catat tanggal-tanggal penting berikut agar tidak ketinggalan:
              </p>
              <div className="grid grid-cols-1 gap-6">
                {jadwalPMBM.map((item, i) => {
                  const Icon = item.icon;
                  return (
                    <div key={i} className="flex items-start gap-3">
                      <Icon
                        className="text-accent mt-1 flex-shrink-0"
                        size={20}
                      />
                      <div>
                        <p className="font-semibold text-foreground">
                          {item.label}
                        </p>
                        <p className="text-secondary">{item.value}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
              <p className="text-center mt-6 text-secondary">
                Jangan tunggu sampai menit terakhir — lengkapi semua persyaratan
                dari sekarang!
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════
          SYARAT & DATA PENDAFTARAN
      ═══════════════════════════════════════════════════ */}
      <section className="py-12 bg-background">
        <div className="container max-w-6xl mx-auto px-4 sm:px-6">
          <h2 className="text-3xl font-serif font-bold text-center mb-8 text-foreground">
            Syarat & Data Pendaftaran
          </h2>
          <div className="max-w-4xl mx-auto space-y-6">
            {/* Syarat Umum */}
            <div className="card p-6 md:p-8">
              <h3 className="font-bold text-xl mb-4 text-foreground flex items-center gap-2">
                <ClipboardList className="text-accent" size={20} />
                Syarat Umum
              </h3>
              <ul className="space-y-3">
                {syaratUmum.map((item, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <CheckCircle
                      className="text-accent mt-0.5 flex-shrink-0"
                      size={18}
                    />
                    <span className="text-secondary">{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Data Siswa */}
            <div className="card p-6 md:p-8">
              <h3 className="font-bold text-xl mb-4 text-foreground flex items-center gap-2">
                <FileText className="text-accent" size={20} />
                Data Siswa yang Perlu Disiapkan
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {dataSiswa.map((item, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-accent rounded-full flex-shrink-0" />
                    <span className="text-secondary text-sm">{item}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Data Orang Tua */}
            <div className="card p-6 md:p-8">
              <h3 className="font-bold text-xl mb-4 text-foreground flex items-center gap-2">
                <Users className="text-accent" size={20} />
                Data Orang Tua
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {dataOrtu.map((item, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-accent rounded-full flex-shrink-0" />
                    <span className="text-secondary text-sm">{item}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Dokumen Prestasi */}
            <div className="card p-6 md:p-8">
              <h3 className="font-bold text-xl mb-4 text-foreground flex items-center gap-2">
                <Award className="text-accent" size={20} />
                Dokumen Prestasi (jika ada)
              </h3>
              <ul className="space-y-3">
                {dokumenPrestasi.map((item, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <CheckCircle
                      className="text-accent mt-0.5 flex-shrink-0"
                      size={18}
                    />
                    <span className="text-secondary">{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Catatan */}
            <div className="p-4 bg-accent/10 rounded-lg">
              <p className="text-sm text-secondary">
                <strong className="text-accent">Catatan:</strong> Persyaratan
                tambahan berlaku sesuai jalur pendaftaran yang dipilih (lihat
                section "Jalur Pendaftaran" di atas). Data persyaratan dapat
                berubah mengikuti kebijakan panitia PMBM MAN 3 Kulon Progo TA
                2026/2027.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════
          SOP
      ═══════════════════════════════════════════════════ */}
      <section className="py-12 bg-semibackground">
        <div className="container max-w-6xl mx-auto px-4 sm:px-6">
          <h2 className="text-3xl font-serif font-bold text-center mb-8 text-foreground flex items-center justify-center gap-2">
            <FileText className="text-accent" />
            Dokumen Prosedur (SOP)
          </h2>
          <div className="max-w-4xl mx-auto">
            <div className="bg-background border border-border rounded-lg p-6 shadow-sm">
              <p className="text-secondary mb-4 text-sm text-center">
                Berikut adalah dokumen Standard Operating Procedure (SOP) PMBM
                MAN 3 Kulon Progo.
              </p>
              <div
                className="relative w-full overflow-hidden rounded-md border border-gray-200 cursor-zoom-in group"
                onClick={() => setIsModalOpen(true)}
              >
                <img
                  src="/SOP_PMBM.png"
                  alt="SOP PMBM MAN 3 Kulon Progo"
                  className="w-full h-auto object-contain transition-transform duration-300 group-hover:scale-105"
                />
                <div className="absolute top-4 right-4 bg-black/50 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                  <ZoomIn size={20} />
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-2 text-center">
                *Klik gambar untuk memperbesar
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════
          ALUR PENDAFTARAN
      ═══════════════════════════════════════════════════ */}
      <section className="py-12 bg-background">
        <div className="container max-w-6xl mx-auto px-4 sm:px-6">
          <h2 className="text-3xl font-serif font-bold text-center mb-8 text-foreground">
            Alur Pendaftaran PMBM
          </h2>
          <div className="max-w-4xl mx-auto">
            <p className="text-center mb-6 text-secondary">
              Berikut langkah-langkah pendaftaran PMBM di MAN 3 Kulon Progo:
            </p>
            <div className="relative">
              {alurPendaftaran.map((item, index) => (
                <div
                  key={index}
                  className="flex items-start gap-6 mb-8 last:mb-0 relative"
                >
                  {index < alurPendaftaran.length - 1 && (
                    <div className="absolute left-5 top-12 bottom-0 w-0.5 bg-accent/30 hidden md:block" />
                  )}
                  <div className="flex flex-col items-center">
                    <div className="bg-accent text-white rounded-full w-12 h-12 flex items-center justify-center font-bold text-lg z-10 shadow-md">
                      {item.nomor}
                    </div>
                  </div>
                  <div className="flex-1 card p-5">
                    <h3 className="font-bold text-xl mb-2 text-foreground">
                      {item.judul}
                    </h3>
                    <p className="text-secondary">{item.deskripsi}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════
          FAQ
      ═══════════════════════════════════════════════════ */}
      <section className="py-12 bg-semibackground">
        <div className="container max-w-6xl mx-auto px-4 sm:px-6">
          <h2 className="text-3xl font-serif font-bold text-center mb-8 text-foreground">
            Pertanyaan Umum (FAQ)
          </h2>
          <div className="max-w-4xl mx-auto">
            <div className="space-y-4">
              {faqData.map((item, index) => (
                <div key={index} className="card overflow-hidden">
                  <button
                    onClick={() => setOpenFaq(openFaq === index ? null : index)}
                    className="w-full px-6 py-5 flex items-center justify-between text-left hover:bg-accent/5 transition-colors"
                    aria-expanded={openFaq === index}
                  >
                    <div className="flex items-center gap-4">
                      <HelpCircle
                        className="text-accent flex-shrink-0"
                        size={22}
                      />
                      <span className="font-semibold text-foreground">
                        {item.pertanyaan}
                      </span>
                    </div>
                    <ChevronDown
                      className={`text-accent transition-transform duration-300 flex-shrink-0 ${
                        openFaq === index ? "rotate-180" : ""
                      }`}
                      size={20}
                    />
                  </button>
                  <div
                    className={`overflow-hidden transition-all duration-300 ${
                      openFaq === index ? "max-h-60" : "max-h-0"
                    }`}
                  >
                    <p className="px-6 pb-5 pt-2 text-secondary">
                      {item.jawaban}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            <p className="text-center mt-6 text-secondary">
              Masih ada pertanyaan? Jangan ragu menghubungi tim PMBM kami.
            </p>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════
          KONTAK
      ═══════════════════════════════════════════════════ */}
      <section className="py-12 bg-background">
        <div className="container max-w-6xl mx-auto px-4 sm:px-6">
          <h2 className="text-3xl font-serif font-bold text-center mb-8 text-foreground">
            Kontak Tim PMBM
          </h2>
          <div className="max-w-4xl mx-auto">
            <div className="card p-6 md:p-8">
              <p className="text-center mb-6 text-secondary">
                Butuh bantuan? Hubungi tim PMBM kami:
              </p>
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="bg-accent/10 p-3 rounded-full">
                    <Mail className="text-accent" size={24} />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">Email</p>
                    <a
                      href="mailto:man3kulonprogo@gmail.com"
                      className="text-accent hover:underline transition-colors"
                    >
                      man3kulonprogo@gmail.com
                    </a>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="bg-accent/10 p-3 rounded-full">
                    <Phone className="text-accent" size={24} />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">WhatsApp</p>

                    <a
                      href="https://wa.me/6285743881574"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-accent hover:underline transition-colors"
                    >
                      +62 857-4388-1574
                    </a>
                    <span className="text-secondary text-md ml-1">
                      (Isti Wulandari)
                    </span>

                    <span className="text-secondary mx-2">/</span>

                    <a
                      href="https://wa.me/6283189810114"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-accent hover:underline transition-colors"
                    >
                      +62 831-8981-0114
                    </a>
                    <span className="text-secondary text-md ml-1">
                      (Wijiardani)
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════
          FINAL CTA
      ═══════════════════════════════════════════════════ */}
      <section className="py-16 bg-gradient-to-r from-accent/10 to-accent/5">
        <div className="container max-w-6xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="text-3xl md:text-5xl font-serif font-bold mb-6 text-foreground">
            Daftar Sekarang
          </h2>
          <p className="text-lg md:text-xl text-secondary mb-10 max-w-2xl mx-auto">
            Jangan lewatkan kesempatan menjadi bagian dari MAN 3 Kulon Progo.
          </p>
          <a
            href={registrationLink}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-3 btn-primary font-bold text-lg px-10 py-5 rounded-full transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:-translate-y-1 group"
          >
            Daftar Sekarang
            <ArrowRight
              size={22}
              className="group-hover:translate-x-1 transition-transform"
            />
          </a>
        </div>
      </section>

      {/* Modal Zoom */}
      <ImageZoomModal
        src="/SOP_PMBM.png"
        alt="SOP PMBM MAN 3 Kulon Progo"
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </Layout>
  );
};

export default PmbmPage;
