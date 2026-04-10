/**
 * @fileoverview SedumPage component for displaying the public complaint/suggestion service page.
 * This component provides information about the school's public complaint service, including
 * contact channels, FAQ section, and a form link for submitting complaints or suggestions.
 *
 * UPDATED: Added SOP section with ImageZoomModal.
 */

import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  MessageSquare,
  Mail,
  Phone,
  MessageCircle,
  MapPin,
  ChevronRight,
  Shield,
  Clock,
  CheckCircle,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  HelpCircle,
  FileText, // Tambah import
  ZoomIn, // Tambah import
} from "lucide-react";
import Layout from "../../components/layout/Layout";
import ImageZoomModal from "../../components/modals/ImageZoomModal"; // Import Modal

/**
 * Component for displaying the public complaint/suggestion service page (Serapan Aduan Masyarakat).
 * Provides information about the service, contact channels, FAQ, and a link to the complaint form.
 */
const SedumPage: React.FC = () => {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  // State untuk Modal Zoom
  const [isModalOpen, setIsModalOpen] = useState(false);

  const faqItems = [
    {
      question: "Apakah identitas saya aman?",
      answer:
        "Ya, identitas pelapor akan dienkripsi dan hanya diakses oleh tim khusus yang menangani aduan. Anda juga bisa memilih untuk tetap anonim.",
    },
    {
      question: "Bagaimana cara tracking aduan saya?",
      answer:
        "Setelah mengajukan aduan, Anda akan menerima nomor tracking. Simpan nomor tersebut dan hubungi kami untuk mengetahui status penanganan.",
    },
    {
      question: "Apa saja yang tidak boleh diadukan?",
      answer:
        "Pengaduan hoaks/SARA, masalah pribadi di luar kewenangan sekolah, dan aduan yang sedang dalam proses hukum tidak akan diproses.",
    },
    {
      question: "Berapa lama waktu respons untuk aduan?",
      answer:
        "Kami berkomitmen untuk merespons semua aduan dalam maksimal 3x24 jam kerja. Untuk kasus mendesak, kami akan merespons lebih cepat.",
    },
  ];

  return (
    <Layout>
      {/* Hero Section */}
      <section className="py-16 bg-gradient-to-r from-accent/10 to-primary/10 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-background/50"></div>
        <div className="container max-w-4xl mx-auto px-4 sm:px-6 text-center relative z-10">
          <div className="inline-flex items-center justify-center p-3 bg-accent/10 rounded-full mb-6 animate-pulse">
            <MessageSquare className="text-accent" size={32} />
          </div>
          <h1 className="text-3xl md:text-4xl font-serif font-bold mb-4 text-foreground">
            Serapan Aduan Masyarakat
          </h1>
          <p className="text-lg text-secondary max-w-2xl mx-auto">
            Layanan resmi MAN 3 Kulon Progo untuk menyampaikan saran, keluhan,
            dan masukan demi peningkatan kualitas layanan pendidikan
          </p>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-12 bg-background">
        <div className="container max-w-4xl mx-auto px-4 sm:px-6">
          {/* About Section */}
          <div className="bg-semibackground rounded-xl shadow-sm p-8 mb-12 fade-in">
            <div className="flex items-start mb-6">
              <div className="bg-accent/10 p-2 rounded-full mr-4">
                <MessageSquare className="text-accent" size={24} />
              </div>
              <div>
                <h2 className="text-2xl font-serif font-bold mb-2 text-foreground">
                  Tentang Layanan Ini
                </h2>
                <p className="text-secondary">
                  MAN 3 Kulon Progo membuka ruang seluas-luasnya bagi masyarakat
                  (orang tua/wali, siswa, alumni, maupun publik) untuk
                  menyampaikan aduan, saran, atau masukan konstruktif demi
                  peningkatan kualitas layanan pendidikan.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="text-center p-4 hover:bg-background/50 rounded-lg transition-colors">
                <div className="bg-accent/10 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Shield className="text-accent" size={20} />
                </div>
                <p className="font-medium mb-1 text-foreground">
                  Kerahasiaan Terjamin
                </p>
                <p className="text-sm text-secondary">
                  Identitas pelapor akan kami lindungi
                </p>
              </div>
              <div className="text-center p-4 hover:bg-background/50 rounded-lg transition-colors">
                <div className="bg-accent/10 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Clock className="text-accent" size={20} />
                </div>
                <p className="font-medium mb-1 text-foreground">Respon Cepat</p>
                <p className="text-sm text-secondary">
                  Maksimal 3x24 jam kerja
                </p>
              </div>
              <div className="text-center p-4 hover:bg-background/50 rounded-lg transition-colors">
                <div className="bg-accent/10 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                  <CheckCircle className="text-accent" size={20} />
                </div>
                <p className="font-medium mb-1 text-foreground">Profesional</p>
                <p className="text-sm text-secondary">
                  Ditindaklanjuti oleh tim khusus
                </p>
              </div>
            </div>

            <div className="text-center">
              <a
                href="https://forms.gle/HmxhgcbJvt8XB5P2A"
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-primary btn-lg inline-flex items-center"
              >
                <MessageSquare size={20} className="mr-2" />
                Ajukan Aduan/Saran
                <ExternalLink size={16} className="ml-2" />
              </a>
              <p className="text-sm text-secondary mt-3">
                Anda akan diarahkan ke formulir Google yang aman
              </p>
            </div>
          </div>

          {/* Contact Channels */}
          <div className="mb-12">
            <h2 className="text-2xl font-serif font-bold mb-6 text-foreground">
              Saluran Pengaduan Alternatif
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="card p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-start mb-4">
                  <div className="bg-accent/10 p-2 rounded-full mr-4">
                    <Mail className="text-accent" size={20} />
                  </div>
                  <div>
                    <p className="font-medium mb-1 text-foreground">Email</p>
                    <p className="text-secondary">man3kulonprogo@gmail.com</p>
                  </div>
                </div>
                <p className="text-sm text-secondary mb-4">
                  Kirimkan aduan/saran Anda melalui email dengan subjek jelas
                </p>
                <a
                  href="mailto:man3kulonprogo@gmail.com"
                  className="text-accent hover:underline text-sm font-medium flex items-center"
                >
                  Kirim Email
                  <ChevronRight size={16} className="ml-1" />
                </a>
              </div>

              <div className="card p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-start mb-4">
                  <div className="bg-accent/10 p-2 rounded-full mr-4">
                    <Phone className="text-accent" size={20} />
                  </div>
                  <div>
                    <p className="font-medium mb-1 text-foreground">Hotline</p>
                    <p className="text-secondary">0274-2821138</p>
                  </div>
                </div>
                <p className="text-sm text-secondary mb-4">
                  Hubungi kami pada jam kerja (08.00 - 15.00 WIB)
                </p>
                <a
                  href="tel:0274-2821138"
                  className="text-accent hover:underline text-sm font-medium flex items-center"
                >
                  Hubungi Sekarang
                  <ChevronRight size={16} className="ml-1" />
                </a>
              </div>

              <div className="card p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-start mb-4">
                  <div className="bg-accent/10 p-2 rounded-full mr-4">
                    <MessageCircle className="text-accent" size={20} />
                  </div>
                  <div>
                    <p className="font-medium mb-1 text-foreground">WhatsApp</p>
                    <p className="text-secondary">+62-878-5810-2393</p>
                  </div>
                </div>
                <p className="text-sm text-secondary mb-4">
                  Kirim pesan langsung melalui WhatsApp
                </p>
                <a
                  href="https://wa.me/6287858102393"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-accent hover:underline text-sm font-medium flex items-center"
                >
                  Kirim Pesan
                  <ChevronRight size={16} className="ml-1" />
                </a>
              </div>

              <div className="card p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-start mb-4">
                  <div className="bg-accent/10 p-2 rounded-full mr-4">
                    <MapPin className="text-accent" size={20} />
                  </div>
                  <div>
                    <p className="font-medium mb-1 text-foreground">
                      Gedung PTSP
                    </p>
                    <p className="text-secondary">Lokasi kontak</p>
                  </div>
                </div>
                <p className="text-sm text-secondary mb-4">
                  Surat fisik bisa dimasukkan ke kotak pengaduan
                </p>
                <Link
                  to="/contact"
                  className="text-accent hover:underline text-sm font-medium flex items-center"
                >
                  Lihat Lokasi
                  <ChevronRight size={16} className="ml-1" />
                </Link>
              </div>
            </div>
          </div>

          {/* ======================================================= */}
          {/* SECTION BARU: SOP (Serupa dengan Zona Integritas)      */}
          {/* ======================================================= */}
          <div className="mb-12">
            <h2 className="text-2xl font-serif font-bold mb-6 text-foreground flex items-center">
              <FileText className="mr-2 text-accent" size={24} />
              Dokumen Prosedur (SOP)
            </h2>

            <div className="bg-semibackground border border-border rounded-lg p-6 shadow-sm">
              <p className="text-secondary mb-4 text-sm text-center">
                Berikut adalah dokumen Standard Operating Procedure (SOP)
                Penanganan Pengaduan Masyarakat.
              </p>

              {/* Pembungkus gambar: tambahkan min-h agar ada ruang cadangan */}
              <div
                className="relative w-full overflow-hidden rounded-md border border-gray-200 cursor-zoom-in group min-h-[200px] bg-gray-100"
                onClick={() => setIsModalOpen(true)}
              >
                <img
                  src="/SOP_Pengaduan_Masyarakat.png"
                  alt="SOP Penanganan Pengaduan"
                  // Perbaikan: Hapus object-contain, tambahkan block
                  className="w-full h-auto block transition-transform duration-300 group-hover:scale-105"
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
          {/* AKHIR SECTION SOP */}

          {/* FAQ Section */}
          <div className="mb-12">
            <h2 className="text-2xl font-serif font-bold mb-6 text-foreground">
              Pertanyaan Umum
            </h2>
            <div className="space-y-4">
              {faqItems.map((item, index) => (
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
                      <span className="font-medium text-foreground">
                        {item.question}
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
                      {item.answer}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Privacy Note */}
          <div className="bg-accent/5 border border-accent/20 rounded-lg p-6">
            <p className="font-medium mb-2 text-foreground flex items-center">
              <Shield className="mr-2 text-accent" size={20} />
              Kebijakan Privasi
            </p>
            <p className="text-secondary">
              Data pelapor dilindungi oleh UU No. 14/2008 tentang Keterbukaan
              Informasi Publik dan hanya digunakan untuk kepentingan
              penindaklanjutan aduan. MAN 3 Kulon Progo berkomitmen menjaga
              kerahasiaan data pribadi Anda.
            </p>
          </div>
        </div>
      </section>

      {/* Modal Zoom */}
      <ImageZoomModal
        src="/SOP_Pengaduan_Masyarakat.png"
        alt="SOP Penanganan Pengaduan"
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </Layout>
  );
};

export default SedumPage;
