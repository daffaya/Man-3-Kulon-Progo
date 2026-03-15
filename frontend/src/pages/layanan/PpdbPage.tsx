/**
 * @fileoverview PpdbPage component for displaying information about the new student admission process.
 * UPDATED: Added single SOP section similar to ZonaIntegritasPage with ImageZoomModal.
 */

import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  FileText,
  Calendar,
  Phone,
  HelpCircle,
  CheckCircle,
  ChevronDown,
  ArrowRight,
  Clock,
  MapPin,
  Users,
  Award,
  BookOpen,
  Sparkles,
  Mail,
  Bell,
  ZoomIn, // Import ZoomIn
} from "lucide-react";
import Layout from "../../components/layout/Layout";
import ImageZoomModal from "../../components/modals/ImageZoomModal"; // Import Modal

const PpdbPage: React.FC = () => {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [scrollY, setScrollY] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);

  // State untuk Modal Zoom
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", handleScroll);
    setIsLoaded(true);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const tentangPPDB = `MAN 3 Kulon Progo membuka Penerimaan Peserta Didik Baru (PPDB) Tahun Pelajaran 2025/2026 bagi putra-putri terbaik bangsa yang siap tumbuh menjadi generasi berilmu, berakhlak mulia, dan berdaya saing global. Sebagai madrasah di bawah naungan Kementerian Agama Republik Indonesia, kami berkomitmen membentuk siswa yang unggul dalam ilmu pengetahuan dan kuat dalam nilai-nilai keislaman.`;

  const keunggulanSekolah = [
    {
      judul: "Kurikulum Integratif Berbasis Agama",
      deskripsi:
        "Proses pembelajaran yang menggabungkan ilmu umum dengan nilai-nilai Islam untuk membentuk pribadi yang beriman dan berpengetahuan luas.",
      icon: BookOpen,
    },
    {
      judul: "Program Keterampilan & Pengembangan Diri",
      deskripsi:
        "Siswa dibekali kemampuan praktis di bidang multimedia, tata busana, dan keterampilan lainnya sebagai bekal menuju masa depan.",
      icon: Award,
    },
    {
      judul: "Lingkungan Belajar Islami & Nyaman",
      deskripsi:
        "Suasana belajar yang kondusif, berkarakter islami, dan penuh semangat kebersamaan antara guru dan siswa.",
      icon: Users,
    },
    {
      judul: "Fasilitas Modern & Lengkap",
      deskripsi:
        "Didukung sarana pembelajaran digital, laboratorium, dan fasilitas pendukung kegiatan akademik maupun non-akademik.",
      icon: Sparkles,
    },
  ];

  const syaratPendaftaran = [
    "Mengisi formulir pendaftaran secara online melalui laman resmi MAN 3 Kulon Progo.",
    "Fotokopi ijazah MTs/SMP yang telah dilegalisir (2 lembar).",
    "Surat Keterangan Hasil Ujian Nasional (SKHUN) atau Surat Tanda Lulus (STL).",
    "Pas foto ukuran 3×4 sebanyak 4 lembar dengan latar belakang berwarna biru.",
  ];

  const registrationLink =
    "https://docs.google.com/forms/d/e/1FAIpQLSd0X3TY6AXjqBIdq4FgDF2YjJcvym1PbUrK0ZoFy0pd8tzAzw/viewform";

  return (
    <Layout>
      {/* Floating CTA Button - Mobile Only */}
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

      {/* Hero Section */}
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
              PPDB MAN 3 Kulon Progo
              <br />
              <span className="text-accent">Tahun Pelajaran 2025/2026</span>
            </h1>
            <p className="text-lg sm:text-xl text-white/90 mb-8 max-w-xl mx-auto md:mx-0">
              Pendaftaran peserta didik baru kini dapat dilakukan secara online
              dengan mudah, cepat, dan transparan.
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
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 text-white animate-bounce">
          <svg
            width="30"
            height="30"
            viewBox="0 0 30 30"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M15 20L8 13L9.4 11.6L15 17.2L20.6 11.6L22 13L15 20Z"
              fill="white"
            />
          </svg>
        </div>
      </section>

      {/* Tentang PPDB */}
      <section className="py-12 bg-background">
        <div className="container max-w-6xl mx-auto px-4 sm:px-6">
          <h2 className="text-3xl font-serif font-bold text-center mb-8 text-foreground">
            Tentang PPDB MAN 3 Kulon Progo
          </h2>
          <div className="max-w-4xl mx-auto text-center">
            <p className="text-lg leading-relaxed text-secondary mb-6">
              {tentangPPDB}
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

      {/* Keunggulan Sekolah */}
      <section className="py-12 bg-semibackground">
        <div className="container max-w-6xl mx-auto px-4 sm:px-6">
          <h2 className="text-3xl font-serif font-bold text-center mb-8 text-foreground">
            Mengapa Memilih MAN 3 Kulon Progo?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
            {keunggulanSekolah.map((item, index) => {
              const Icon = item.icon;
              return (
                <div
                  key={index}
                  className="group bg-[rgb(var(--color-background))] border border-[rgb(var(--color-secondary))]/20 rounded-xl p-6 shadow-sm hover:shadow-xl transition-all duration-500 hover:-translate-y-2 relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 w-32 h-32 bg-[rgb(var(--color-accent))]/5 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-700"></div>
                  <div className="flex items-start gap-4 relative z-10">
                    <div className="bg-[rgb(var(--color-accent))]/20 p-3 rounded-full group-hover:bg-[rgb(var(--color-accent))]/30 transition-all duration-300">
                      <Icon
                        className="text-[rgb(var(--color-accent))]"
                        size={24}
                      />
                    </div>
                    <div>
                      <h3 className="font-bold text-xl mb-2 text-[rgb(var(--color-foreground))]">
                        {item.judul}
                      </h3>
                      <p className="text-[rgb(var(--color-secondary))]">
                        {item.deskripsi}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Syarat Pendaftaran */}
      <section className="py-12 bg-background">
        <div className="container max-w-6xl mx-auto px-4 sm:px-6">
          <h2 className="text-3xl font-serif font-bold text-center mb-8 text-foreground">
            Syarat Pendaftaran
          </h2>
          <div className="max-w-4xl mx-auto">
            <div className="card p-6 md:p-8">
              <ul className="space-y-4">
                {syaratPendaftaran.map((item, index) => (
                  <li key={index} className="flex items-start gap-4">
                    <div className="bg-accent/10 p-2 rounded-full flex-shrink-0">
                      <FileText className="text-accent" size={20} />
                    </div>
                    <span className="text-secondary leading-relaxed">
                      {item}
                    </span>
                  </li>
                ))}
              </ul>
              <div className="mt-6 p-4 bg-accent/10 rounded-lg">
                <p className="text-sm text-secondary">
                  <strong className="text-accent">Catatan:</strong> Persyaratan
                  dapat berubah mengikuti kebijakan panitia PPDB MAN 3 Kulon
                  Progo Tahun 2025/2026.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Jadwal Pendaftaran */}
      <section className="py-12 bg-semibackground">
        <div className="container max-w-6xl mx-auto px-4 sm:px-6">
          <h2 className="text-3xl font-serif font-bold text-center mb-8 text-foreground">
            Jadwal PPDB
          </h2>
          <div className="max-w-4xl mx-auto">
            <div className="card p-6 md:p-8">
              <p className="text-center mb-6 text-secondary">
                Pastikan kamu mencatat tanggal-tanggal penting agar tidak
                ketinggalan kesempatan mendaftar:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-1 gap-6">
                {[
                  {
                    label: "Pendaftaran Online",
                    value: "1 Mei – 15 Juni 2026",
                    icon: Calendar,
                  },
                  {
                    label: "Verifikasi Dokumen",
                    value: "16 Juni – 20 Juni 2026",
                    icon: FileText,
                  },
                  {
                    label: "Pengumuman Hasil Seleksi",
                    value: "25 Juni 2026",
                    icon: Bell,
                  },
                ].map((item, i) => {
                  const Icon = item.icon;
                  return (
                    <div key={i} className="flex items-start gap-3">
                      {Icon && (
                        <Icon
                          className="text-accent mt-1 flex-shrink-0"
                          size={20}
                        />
                      )}
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
                Jangan tunggu sampai menit terakhir, yuk lengkapi semua
                persyaratan dari sekarang!
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ======================================================= */}
      {/* SECTION BARU: SOP (Sama seperti Zona Integritas)       */}
      {/* ======================================================= */}
      <section className="py-12 bg-background">
        <div className="container max-w-6xl mx-auto px-4 sm:px-6">
          <h2 className="text-3xl font-serif font-bold text-center mb-8 text-foreground flex items-center justify-center gap-2">
            <FileText className="text-accent" />
            Dokumen Prosedur (SOP)
          </h2>

          <div className="max-w-4xl mx-auto">
            <div className="bg-semibackground border border-border rounded-lg p-6 shadow-sm">
              <p className="text-secondary mb-4 text-sm text-center">
                Berikut adalah dokumen Standard Operating Procedure (SOP) PPDB
                MAN 3 Kulon Progo.
              </p>

              <div
                className="relative w-full overflow-hidden rounded-md border border-gray-200 cursor-zoom-in group"
                onClick={() => setIsModalOpen(true)}
              >
                {/* GANTI SRC DENGAN GAMBAR SOP PPDB KAMU */}
                <img
                  src="/SOP_PPDB.png"
                  alt="SOP PPDB MAN 3 Kulon Progo"
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
      {/* AKHIR SECTION SOP */}

      {/* Alur Pendaftaran (Background diubah jadi abu-abu) */}
      <section className="py-12 bg-semibackground">
        <div className="container max-w-6xl mx-auto px-4 sm:px-6">
          <h2 className="text-3xl font-serif font-bold text-center mb-8 text-foreground">
            Alur Pendaftaran PPDB
          </h2>
          <div className="max-w-4xl mx-auto">
            <p className="text-center mb-6 text-secondary">
              Berikut langkah-langkah pendaftaran PPDB di MAN 3 Kulon Progo:
            </p>
            <div className="relative">
              {[
                {
                  nomor: 1,
                  judul: "Daftar Online",
                  deskripsi: "melalui website resmi kami.",
                },
                {
                  nomor: 2,
                  judul: "Unggah Dokumen",
                  deskripsi: "sesuai persyaratan.",
                },
                {
                  nomor: 3,
                  judul: "Verifikasi & Konfirmasi",
                  deskripsi: "oleh tim administrasi.",
                },
                {
                  nomor: 4,
                  judul: "Pengumuman Hasil Seleksi",
                  deskripsi: "tunggu pengumuman resmi dari sekolah.",
                },
              ].map((item, index) => (
                <div
                  key={index}
                  className="flex items-start gap-6 mb-8 last:mb-0 relative"
                >
                  {/* Connector Line */}
                  {index < 3 && (
                    <div
                      className="absolute left-5 top-12 bottom-0 w-0.5 bg-accent/30 hidden md:block"
                      style={{ height: "calc(100% - 3rem)" }}
                    />
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
            <p className="text-center mt-6 text-secondary">
              Pastikan setiap langkah dilalui dengan teliti agar proses
              pendaftaran lancar.
            </p>
          </div>
        </div>
      </section>

      {/* Persyaratan Pendaftaran (Background diubah jadi putih) */}
      <section className="py-12 bg-background">
        <div className="container max-w-6xl mx-auto px-4 sm:px-6">
          <h2 className="text-3xl font-serif font-bold text-center mb-8 text-foreground">
            Persyaratan Pendaftaran
          </h2>
          <div className="max-w-4xl mx-auto">
            <div className="card p-6 md:p-8">
              <p className="text-center mb-6 text-secondary">
                Untuk mendaftar, peserta diharapkan menyiapkan:
              </p>
              <div className="space-y-4">
                {[
                  "Dokumen identitas (Kartu Keluarga, Akta Kelahiran)",
                  "Rapor terakhir",
                  "Dokumen pendukung lainnya sesuai jalur pendaftaran",
                ].map((item, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <CheckCircle
                      className="text-accent mt-1 flex-shrink-0"
                      size={20}
                    />
                    <p className="text-secondary">{item}</p>
                  </div>
                ))}
              </div>
              <p className="text-center mt-6 text-secondary">
                Semua dokumen harus lengkap agar pendaftaran kamu diproses tanpa
                hambatan.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ (Background diubah jadi abu-abu) */}
      <section className="py-12 bg-semibackground">
        <div className="container max-w-6xl mx-auto px-4 sm:px-6">
          <h2 className="text-3xl font-serif font-bold text-center mb-8 text-foreground">
            FAQ – Pertanyaan Umum
          </h2>
          <div className="max-w-4xl mx-auto">
            <div className="space-y-4">
              {[
                {
                  pertanyaan: "Bagaimana cara mendaftar?",
                  jawaban:
                    "Mudah! Cukup ikuti alur pendaftaran online di website kami, dan tim PPDB siap membantu jika ada kendala.",
                },
                {
                  pertanyaan: "Apakah ada batas usia pendaftaran?",
                  jawaban:
                    "Ya, setiap jalur pendaftaran memiliki ketentuan usia tertentu. Detail lengkap bisa dicek di halaman persyaratan.",
                },
                {
                  pertanyaan: "Apa saja dokumen yang dibutuhkan?",
                  jawaban:
                    "Siapkan dokumen identitas, rapor, dan dokumen pendukung lainnya.",
                },
              ].map((item, index) => (
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
                      className={`text-accent transition-transform duration-300 ${
                        openFaq === index ? "rotate-180" : ""
                      }`}
                      size={20}
                    />
                  </button>
                  <div
                    className={`overflow-hidden transition-all duration-300 ${
                      openFaq === index ? "max-h-40" : "max-h-0"
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
              Kalau ada pertanyaan lain, jangan ragu untuk menghubungi kami.
            </p>
          </div>
        </div>
      </section>

      {/* Kontak (Background diubah jadi putih) */}
      <section className="py-12 bg-background">
        <div className="container max-w-6xl mx-auto px-4 sm:px-6">
          <h2 className="text-3xl font-serif font-bold text-center mb-8 text-foreground">
            Kontak Tim PPDB
          </h2>
          <div className="max-w-4xl mx-auto">
            <div className="card p-6 md:p-8">
              <p className="text-center mb-6 text-secondary">
                Masih bingung atau butuh bantuan? Hubungi tim PPDB kami:
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
                    <p className="font-semibold text-foreground">Telepon/WA</p>
                    <a
                      href="tel:+6281234567890"
                      className="text-accent hover:underline transition-colors"
                    >
                      +62 812-3456-7890
                    </a>
                  </div>
                </div>
              </div>
              <p className="text-center mt-6 text-secondary">
                Kami siap membantu kamu, yuk segera daftar dan raih kesempatan
                belajar di Man 3 Kulon Progo!
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-16 bg-gradient-to-r from-accent/10 to-accent/5">
        <div className="container max-w-6xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="text-3xl md:text-5xl font-serif font-bold mb-6 text-foreground">
            Daftar Sekarang
          </h2>
          <p className="text-lg md:text-xl text-secondary mb-10 max-w-2xl mx-auto">
            Jangan lewatkan kesempatan menjadi bagian dari Man 3 Kulon Progo
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
        src="/SOP_PPDB.png" // Pastikan sama dengan src di atas
        alt="SOP PPDB MAN 3 Kulon Progo"
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </Layout>
  );
};

export default PpdbPage;
