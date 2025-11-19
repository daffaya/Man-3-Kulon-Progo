/**
 * @fileoverview ProgramKerjaPage component for displaying the work program of MAN 3 Kulon Progo.
 * This component renders a comprehensive list of work programs organized by categories,
 * including annual activities, curriculum implementation, supervision, and leadership responsibilities.
 */

import React from "react";
import Layout from "../../components/layout/Layout";

/**
 * Interface defining the structure of a program section.
 * @typedef {Object} ProgramSection
 * @property {string} title - The title of the program section.
 * @property {string[]} items - List of items/activities within the program section.
 */
interface ProgramSection {
  title: string;
  items: string[];
}

/**
 * Array containing all program sections with their respective activities.
 * This data represents the complete work program for MAN 3 Kulon Progo for the academic year 2024/2025.
 */
const PROGRAM_KERJA: ProgramSection[] = [
  {
    title: "Kegiatan Awal Tahun Pelajaran",
    items: [
      "Penerimaan Siswa Baru",
      "Kegiatan MATSAMA",
      "Menganalisis dan memenuhi Kebutuhan pendidik dan tenaga kependidikan",
      "Pembagian tugas dan pembuatan jadwal mengajar",
      "Kelengkapan alat-alat, sarana/prasarana",
      "Memubuat Kalender Pendidikan",
      "Memantau Kelengkapan Administrasi Guru",
      "Rapat koordinasi dengan Komite Madrasah",
      "Rapat Wali Siswa",
    ],
  },
  {
    title: "Menyusun Program Kerja",
    items: [
      "Merumuskan, menetapkan, dan mengembangkan visi sekolah.",
      "Merumuskan, menetapkan, dan mengembangkan misi sekolah.",
      "Merumuskan, menetapkan, dan mengembangkan tujuan sekolah.",
      "Membuat Rencana Kerja Jangka Menengah (RKJM, 4 tahun) dan Rencana Kegiatan dan Anggaran Madrasah (RKAM).",
    ],
  },
  {
    title: "Pelaksanaan Rencana Kerja",
    items: [
      "Menyusun pedoman kerja;",
      "Menyusun struktur organisasi sekolah",
      "Menyusun jadwal pelaksanaan kegiatan sekolah per semester dan Tahunan;",
      "Menyusun pengelolaan kesiswaan yang meliputi:",
      "Melaksanakan penerimaan peserta didik baru;",
      "Memberikan layanan konseling kepada peserta didik;",
      "Melaksanakan kegiatan ekstra dan kokurikuler untuk para peserta didik;",
      "Melakukan pembinaan prestasi unggulan;",
      "Melakukan pelacakan terhadap alumni",
      "Menyusun dan Melaksanakan Program 7K",
      "Menyusun KTSP,",
      "Menyusun kalender Pendidikan",
      "Menyusun Peraturan akademik",
      "Menyusun Tata tertib sekolah",
      "Menyusun kegiatan pembelajaran;",
      "Merencanakan Program penilaian hasil belajar",
      "Mengelola pendidik dan tenaga kependidikan;",
      "Mengelola sarana dan prasarana",
      "Mengelola keuangan dan pembiayaan;",
      "Mengelola budaya dan lingkungan sekolah;",
      "Memberdayakan peran serta masyarakat dan kemitraan sekolah;",
    ],
  },
  {
    title: "Supervisi dan Evaluasi",
    items: [
      "Menyusun program supervisi pendidik dan tenaga Kependidikan",
      "Melaksanakan program supervise",
      "Menindak lanjuti hasil supervise",
      "Melaksanakan Evaluasi Diri Madrasah (EDM)",
      "Melaksanakan evaluasi dan pengembangan KTSP",
      "Mengevaluasi pendayagunaan pendidik dan tenaga kependidikan.",
      "Menyiapkan kelengkapan akreditasi sekolah",
    ],
  },
  {
    title: "Kepemimpinan Sekolah",
    items: [
      "Menjabarkan visi ke dalam misi target mutu;",
      "Merumuskan tujuan dan target mutu yang akan dicapai;",
      "Menganalisis tantangan, peluang, kekuatan, dan kelemahan madrasah;",
      "Membuat rencana kerja strategis dan rencana kerja tahunan untuk pelaksanaan peningkatan mutu;",
      "Bertanggung jawab dalam membuat keputusan anggaran madrasah;",
      "Melibatkan guru, komite sekolah dalam pengambilan keputusan penting madrasah. Dalam hal sekolah/madrasah swasta, pengambilan keputusan tersebut harus melibatkan penyelenggara sekolah/madrasah;",
      "Berkomunikasi untuk menciptakan dukungan intensif dari orang tua peserta didik dan masyarakat;",
      "Menjaga dan meningkatkan motivasi kerja pendidik dan tenaga kependidikan dengan menggunakan sistem pemberian penghargaan atas prestasi dan sangsi atas pelanggaran peraturan dan kode etik;",
      "Menciptakan lingkungan pembelajaran yang efektif bagi peserta didik;",
      "Bertanggung jawab atas perencanaan partisipatif mengenai pelaksanaan kurikulum;",
      "Melaksanakan dan merumuskan program supervisi, serta memanfaatkan hasil supervisi untuk meningkatkan kinerja madrasah;",
      "Memfasilitasi pengembangan, penyebarluasan, dan pelaksanaan visi pembelajaran yang dikomunikasikan dengan baik dan didukung oleh komunitas madrasah;",
      "Membantu, membina, dan mempertahankan lingkungan madrasah dan program pembelajaran yang kondusif bagi proses belajar peserta didik dan pertumbuhan profesional para guru dan tenaga kependidikan;",
      "Menjamin manajemen organisasi dan pengoperasian sumber daya madrasah untuk menciptakan lingkungan belajar yang aman, sehat, efisien, dan efektif;",
      "Menjalin kerja sama dengan orang tua peserta didik dan masyarakat, dan komite sekolah/madrasah menanggapi kepentingan dan kebutuhan komunitas yang beragam, dan memobilisasi sumber daya masyarakat;",
      "Memberi contoh/teladan/tindakan yang bertanggung jawab;",
      "Melakukan analisis kebutuhan guru",
      "Mendelegasikan sebagian tugas dan kewenangan kepada wakil kepala sekolah sesuai dengan bidangnya.",
    ],
  },
  {
    title: "Sistem Informasi Manajemen",
    items: [
      "Mengelola sistem informasi manajemen yang memadai untuk mendukung administrasi pendidikan yang efektif, efisien dan akuntabel;",
      "Menyediakan fasilitas informasi yang efesien, efektif dan mudah diakses;",
      "Menugaskan seorang guru atau tenaga kependidikan untuk melayani permintaan informasi maupun pemberian informasi atau pengaduan dari masyarakat berkaitan dengan pengelolaan sekolah/madrasah baik secara lisan maupun tertulis dan semuanya direkam dan didokumentasikan;",
      "Melaporkan data informasi madrasah yang telah terdokumentasikan kepada KEMENAG Kab.",
      "Komunikasi antar warga sekolah/madrasah di lingkungan madrasah dilaksanakan secara efisien dan efektif.",
      "Dalam menjalankan tugas sehari – hari Kepala Madrasah dibantu oleh Wakil Kepala Madrasah, Guru, Pegawai Tata Usaha dan Tenaga Kependidikan lainnya.",
    ],
  },
  {
    title: "Kegiatan Harian",
    items: [
      "Memeriksa daftar hadir guru, pegawai dan absen siswa",
      "Menyelesaikan surat-surat dan menerima tamu",
      "Mengatasi hambatan yang timbul dalam Proses KBM",
      "Memeriksa pelaksanaan kegiatan 7 K",
      "Meneliti kebutuhan sarana kantor.",
      "Meneliti kebutuhan buku pegangan guru dan alat bantu Pelajaran",
      "Memperhatikan kebersihan kerapihan lingkungan kerja",
    ],
  },
  {
    title: "Kegiatan Mingguan",
    items: [
      "Melaksanakan upacara",
      "Memeriksa dan menandatangani buku laporan dan piket",
      "Memeriksa buku kunjungan perpustakaan",
      "Memeriksa agenda acara/surat",
      "Memeriksa keuangan Madrasah",
      "Mengadakan rapat Koordinasi dengan Wakamad/Wali Kelas",
      "Kegiatan lain-lain yang memerlukan penyelesaian",
      "Merencanakan program untuk minggu berikutnya",
    ],
  },
  {
    title: "Kegiatan Bulanan",
    items: [
      "Menyelesaikan urusan gaji/honorarium dan laporan bulanan",
      "Melaksanakan pemeriksaan secara umum, seperti buku Kas, daftar hadir, persiapan mengajar/administrasi Guru",
      "Evaluasi bulanan terhadap kegiatan yang sudah/belum dilaksanakan.",
    ],
  },
  {
    title: "Kegiatan Semester",
    items: [
      "Persiapan/pelaksanaan ulangan umum semester",
      "Perbaikan sarana/prasarana yang memungkinkan",
      "Mengontrol Kegiatan OSIS/OSIM",
      "Mengontrol kegiatan pramuka dan ekstrakurikuler",
      "Mengontrol pengisian leger, buku nilai dan buku raport",
      "Mengadakan peninjauan terhadap pembagian tugas guru",
      "Rapat berkala dengan orang tua wali dan Komite Madrasah.",
    ],
  },
  {
    title: "Kegiatan Akhir Tahun",
    items: [
      "Mengadakan evaluasi terhadap pelaksanaan KBM tahun ini, sebagai bahan pertimbangan untuk menyusun Program tahun berikutnya",
      "Persiapan/Pelaksanaan Ujian Akhir (UN/US)",
      "Kenaikan Kelas",
      "Penyusunan EDM dan ERKAM",
      "Penyusunan RAPBM untuk Tahun Pelajaran mendatang.",
      "Mengadakan Evaluasai terhadap seluruh kegiatan/Program.",
    ],
  },
];

/**
 * Component that renders the work program page for MAN 3 Kulon Progo.
 * This page displays a comprehensive list of work programs organized by categories,
 * including annual activities, curriculum implementation, supervision, and leadership responsibilities.
 */
const ProgramKerjaPage: React.FC = () => {
  return (
    <Layout>
      <div className="container mx-auto px-4 sm:px-6 py-12 max-w-4xl fade-in">
        <section className="mb-12">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2 text-center">
            Program Kerja MAN 3 Kulon Progo
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-8 text-center">
            Tahun Pelajaran 2024/2025
          </p>
          {PROGRAM_KERJA.map((section, index) => (
            <div key={`section-${index}`} className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-2">
                {section.title}
              </h2>
              <ul className="list-disc pl-6 space-y-2">
                {section.items.map((item, itemIndex) => (
                  <li
                    key={`item-${index}-${itemIndex}`}
                    className="text-gray-700 dark:text-gray-300"
                  >
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </section>
      </div>
    </Layout>
  );
};

export default ProgramKerjaPage;
