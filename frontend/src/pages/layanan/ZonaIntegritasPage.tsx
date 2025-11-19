/**
 * @fileoverview ZonaIntegritasPage component for displaying integrity zone information.
 * This component provides information about the 6 areas of integrity zone development,
 * allows users to view detailed information about each area in a modal, and provides
 * contact information for complaints and feedback.
 */

import React, { useState } from "react";
import Layout from "../../components/layout/Layout";
import {
  Shield,
  MessageSquare,
  Mail,
  Phone,
  RotateCw,
  Settings,
  Users,
  BarChart3,
  Search,
  HeartHandshake,
} from "lucide-react";
import IntegrityAreaCard from "../../components/integrity/IntegrityAreaCard";

/**
 * Type definition for integrity area data structure.
 */
type Area = {
  id: number;
  title: string;
  description: string;
  icon: React.ReactNode;
  fullDescription: string;
  driveUrl: string;
};

/**
 * Array containing all integrity areas with their details.
 */
const integrityAreas: Area[] = [
  {
    id: 1,
    title: "Manajemen Perubahan",
    description:
      "Pengelolaan perubahan untuk mencapai tujuan pembangunan Zona Integritas",
    icon: <RotateCw size={24} />,
    fullDescription: `
<p class="mb-4">Berdasarkan PERMENPAN-RB Nomor 90 Tahun 2021, Manajemen perubahan bertujuan untuk mengubah secara sistematis dan konsisten mekanisme kerja, pola pikir (mind set), serta budaya kerja (culture set) individu pada unit kerja yang dibangun, menjadi lebih baik sesuai dengan tujuan dan sasaran pembangunan zona integritas menuju WBK/WBBM, dengan penekanan pada nilai ASN Berakhlak (berorientasi pelayanan, akuntabel, kompeten, harmonis, loyal, adaptif, kolaboratif).</p>

<h5 class="font-bold mb-2">Target yang ingin dicapai:</h5>
<ul class="list-disc pl-5 mb-4 space-y-1">
  <li>Meningkatnya komitmen seluruh jajaran pimpinan dan pegawai unit kerja dalam membangun Zona Integritas menuju WBK/WBBM</li>
  <li>Terjadinya perubahan pola pikir dan budaya kerja pada unit kerja yang diusulkan sebagai Zona Integritas menuju WBK/WBBM</li>
  <li>Menurunnya resiko kegagalan yang disebabkan kemungkinan timbulnya resistensi terhadap perubahan</li>
  <li>Implementasi nilai Core Value ASN Berakhlak dalam lingkungan kerja</li>
</ul>

<h5 class="font-bold mb-2">Indikator yang perlu dilakukan:</h5>
<ol class="list-decimal pl-5 space-y-2">
  <li><strong>Penyusunan Tim Kerja</strong> - Unit kerja telah membentuk tim untuk melakukan pembangunan Zona Integritas menuju WBK/WBBM; penentuan anggota tim selain pimpinan dipilih melalui prosedur/mekanisme yang jelas</li>
  <li><strong>Dokumen Rencana Pembangunan</strong> - Dokumen rencana kerja pembangunan ZI telah disusun dan memuat target-target prioritas yang relevan; terdapat mekanisme atau media untuk mensosialisasikan pembangunan Zona Integritas menuju WBK/WBBM</li>
  <li><strong>Pemantauan dan Evaluasi</strong> - Seluruh kegiatan pembangunan ZI telah dilaksanakan sesuai target yang direncanakan; terdapat monitoring dan evaluasi terhadap pembangunan Zona Integritas menuju WBK/WBBM; hasil monitoring dan evaluasi telah ditindaklanjuti</li>
  <li><strong>Perubahan Pola Pikir dan Budaya Kerja</strong> - Pimpinan berperan sebagai role model dan agen perubahan telah ditetapkan; budaya kerja dan pola pikir telah dibangun di lingkungan organisasi; anggota organisasi terlibat dalam pembangunan Zona Integritas menuju WBK/WBBM</li>
</ol>`.trim(),
    driveUrl: "https://drive.google.com/drive/folders/your-folder-id-1",
  },
  {
    id: 2,
    title: "Penataan Tatalaksana",
    description:
      "Penyederhanaan dan penguatan prosedur kerja yang efektif dan efisien",
    icon: <Settings size={24} />,
    fullDescription: `
<p class="mb-4">Penataan tatalaksana bertujuan untuk meningkatkan efisiensi dan efektivitas sistem, proses, dan prosedur kerja yang jelas, efektif, efisien, dan terukur pada Zona Integritas Menuju WBK/WBBM (PERMENPAN-RB Nomor 90 Tahun 2021), dengan integrasi transformasi digital melalui SPBE.</p>

<h5 class="font-bold mb-2">Target yang ingin dicapai:</h5>
<ul class="list-disc pl-5 mb-4 space-y-1">
  <li>Meningkatnya penggunaan teknologi informasi dalam proses penyelenggaraan manajemen pemerintahan</li>
  <li>Meningkatnya efisiensi dan efektivitas proses manajemen pemerintahan</li>
  <li>Meningkatnya kinerja di Zona Integritas menuju WBK/WBBM</li>
  <li>Penyederhanaan posisi dan integrasi SPBE untuk layanan lebih cepat</li>
</ul>

<h5 class="font-bold mb-2">Indikator yang perlu dilakukan:</h5>
<ol class="list-decimal pl-5 space-y-2">
  <li><strong>Prosedur Operasional Tetap (SOP) Kegiatan Utama</strong> - SOP mengacu pada peta proses bisnis; SOP telah diterapkan dan dievaluasi; termasuk inovasi dalam proses</li>
  <li><strong>Sistem Pemerintahan Berbasis Elektronik (SPBE)</strong> - Sistem pengukuran kinerja, kepegawaian, dan pelayanan publik berbasis TI; monitoring periodik penggunaan TI</li>
  <li><strong>Keterbukaan Informasi Publik</strong> - Kebijakan keterbukaan informasi publik telah diterapkan; monitoring dan evaluasi pelaksanaan kebijakan keterbukaan informasi publik</li>
</ol>`.trim(),
    driveUrl: "https://drive.google.com/drive/folders/your-folder-id-2",
  },
  {
    id: 3,
    title: "Penataan Sistem Manajemen SDM",
    description:
      "Pengelolaan sumber daya manusia yang berbasis kinerja dan kompetensi",
    icon: <Users size={24} />,
    fullDescription: `
<p class="mb-4">Penataan sistem manajemen SDM aparatur bertujuan untuk meningkatkan profesionalisme SDM aparatur pada Zona Integritas Menuju WBK/WBBM (PERMENPAN-RB Nomor 90 Tahun 2021), melalui perencanaan berbasis analisis beban kerja dan pengurangan gap kompetensi.</p>

<h5 class="font-bold mb-2">Target yang ingin dicapai:</h5>
<ul class="list-disc pl-5 mb-4 space-y-1">
  <li>Meningkatnya ketaatan terhadap pengelolaan SDM aparatur</li>
  <li>Meningkatnya transparansi dan akuntabilitas pengelolaan SDM aparatur</li>
  <li>Meningkatnya disiplin SDM aparatur</li>
  <li>Meningkatnya efektivitas manajemen SDM aparatur</li>
  <li>Meningkatnya profesionalisme SDM aparatur</li>
  <li>Pengurangan gap kompetensi &lt;25% melalui pengembangan berbasis TNA</li>
</ul>

<h5 class="font-bold mb-2">Indikator yang perlu dilakukan:</h5>
<ol class="list-decimal pl-5 space-y-2">
  <li><strong>Perencanaan Kebutuhan Pegawai</strong> - Rencana kebutuhan pegawai sesuai rasio beban kerja dan kualifikasi; monitoring dan evaluasi rencana</li>
  <li><strong>Pola Mutasi Internal</strong> - Kebijakan mutasi internal ditetapkan dan diterapkan; monitoring terhadap pola rotasi</li>
  <li><strong>Pengembangan Pegawai Berbasis Kompetensi</strong> - Analisis Kebutuhan Pelatihan (TNA); rencana pengembangan terkait kinerja; kesempatan diklat untuk seluruh pegawai; monitoring hasil</li>
  <li><strong>Penetapan Kinerja Individu</strong> - Penilaian kinerja terkait organisasi; ukuran sesuai indikator level atas; pengukuran periodik; implementasi hasil untuk mutasi/karir</li>
  <li><strong>Penegakan Aturan Disiplin/Kode Etik</strong> - Pelaksanaan aturan disiplin/kode etik/kode perilaku; pengurangan pelanggaran disiplin</li>
  <li><strong>Sistem Informasi Kepegawaian</strong> - Sistem informasi kepegawaian dimutakhirkan secara berkala dan terintegrasi</li>
</ol>`.trim(),
    driveUrl: "https://drive.google.com/drive/folders/your-folder-id-3",
  },
  {
    id: 4,
    title: "Penguatan Akuntabilitas",
    description: "Peningkatan pertanggungjawaban kinerja instansi pemerintah",
    icon: <BarChart3 size={24} />,
    fullDescription: `
<p class="mb-4">Akuntabilitas kinerja adalah perwujudan kewajiban suatu instansi pemerintah untuk mempertanggungjawabkan keberhasilan/kegagalan pelaksanaan program dan kegiatan dalam mencapai misi dan tujuan organisasi (PERMENPAN-RB Nomor 90 Tahun 2021), dengan kerangka logis dari organisasi hingga individu.</p>

<h5 class="font-bold mb-2">Target yang ingin dicapai:</h5>
<ul class="list-disc pl-5 mb-4 space-y-1">
  <li>Meningkatnya kinerja instansi pemerintah (≥100% pencapaian)</li>
  <li>Meningkatnya akuntabilitas instansi pemerintah</li>
  <li>Reward/punishment berdasarkan perjanjian kinerja</li>
</ul>

<h5 class="font-bold mb-2">Indikator yang perlu dilakukan:</h5>
<ol class="list-decimal pl-5 space-y-2">
  <li><strong>Keterlibatan Pimpinan</strong> - Pimpinan terlibat langsung dalam penyusunan perencanaan, penetapan kinerja, dan pemantauan berkala</li>
  <li><strong>Pengelolaan Akuntabilitas Kinerja</strong> - Dokumen perencanaan berorientasi hasil dengan indikator SMART; laporan kinerja tepat waktu; sistem informasi kinerja; peningkatan kapasitas SDM akuntabilitas; kaskade ukuran kinerja hingga individu</li>
</ol>`.trim(),
    driveUrl: "https://drive.google.com/drive/folders/your-folder-id-4",
  },
  {
    id: 5,
    title: "Penguatan Pengawasan",
    description: "Peningkatan efektivitas sistem pengawasan intern dan ekstern",
    icon: <Search size={24} />,
    fullDescription: `
<p class="mb-4">Penguatan pengawasan bertujuan untuk meningkatkan penyelenggaraan pemerintahan yang bersih dan bebas KKN pada masing-masing instansi pemerintah (Peraturan MENPAN-RB No. 90 /2021), dengan penekanan pada pencegahan korupsi dan kepatuhan LHKPN/LHKASN.</p>

<h5 class="font-bold mb-2">Target yang ingin dicapai:</h5>
<ul class="list-disc pl-5 mb-4 space-y-1">
  <li>Meningkatnya kepatuhan terhadap pengelolaan keuangan negara</li>
  <li>Meningkatnya efektivitas pengelolaan keuangan negara</li>
  <li>Meningkatnya status opini BPK terhadap pengelolaan keuangan negara</li>
  <li>Menurunnya tingkat penyalahgunaan wewenang</li>
  <li>Tingkat kepatuhan LHKPN/LHKASN 100%</li>
</ul>

<h5 class="font-bold mb-2">Indikator yang perlu dilakukan:</h5>
<ol class="list-decimal pl-5 space-y-2">
  <li><strong>Pengendalian Gratifikasi</strong> - Kampanye publik tentang pengendalian gratifikasi; implementasi terintegrasi dalam prosedur</li>
  <li><strong>Penerapan Sistem Pengawasan Internal Pemerintah (SPIP)</strong> - Lingkungan pengendalian dibangun; penilaian risiko; kegiatan pengendalian; komunikasi SPI kepada pihak terkait</li>
  <li><strong>Pengaduan Masyarakat</strong> - Kebijakan pengaduan diterapkan; tindak lanjut hasil; monitoring dan evaluasi</li>
  <li><strong>Whistle Blowing System</strong> - Sistem whistle blowing diterapkan; evaluasi periodik; tindak lanjut hasil</li>
  <li><strong>Penanganan Benturan Kepentingan</strong> - Identifikasi benturan kepentingan; sosialisasi; implementasi; evaluasi dan tindak lanjut</li>
  <li><strong>Penyampaian Laporan Harta Kekayaan pegawai</strong> - Tingkat kepatuhan LHKPN ke KPK dan LHKASN via SiHARKA</li>
</ol>`.trim(),
    driveUrl: "https://drive.google.com/drive/folders/your-folder-id-5",
  },
  {
    id: 6,
    title: "Peningkatan Kualitas Pelayanan Publik",
    description:
      "Optimalisasi pelayanan publik yang berkualitas dan berorientasi pada kepuasan",
    icon: <HeartHandshake size={24} />,
    fullDescription: `
<p class="mb-4">Menurut Peraturan MENPAN-RB Nomor 90 Tahun 2021, peningkatan kualitas pelayanan publik merupakan suatu upaya untuk meningkatkan kualitas dan inovasi pelayanan publik pada masing-masing instansi pemerintah secara berkala sesuai kebutuhan dan harapan masyarakat, dengan integrasi SP4N-Lapor! dan inovasi layanan.</p>

<h5 class="font-bold mb-2">Target yang ingin dicapai:</h5>
<ul class="list-disc pl-5 mb-4 space-y-1">
  <li>Meningkatnya kualitas pelayanan publik (lebih cepat, lebih murah, lebih aman, dan lebih mudah dijangkau)</li>
  <li>Meningkatnya jumlah unit pelayanan yang memperoleh standardisasi pelayanan internasional</li>
  <li>Meningkatnya indeks kepuasan masyarakat terhadap penyelenggaraan pelayanan publik</li>
  <li>Resolusi pengaduan responsif melalui integrasi nasional</li>
</ul>

<h5 class="font-bold mb-2">Indikator yang perlu dilakukan:</h5>
<ol class="list-decimal pl-5 space-y-2">
  <li><strong>Standar Pelayanan</strong> - Kebijakan standar pelayanan; pemakluman standar; SOP pelaksanaan; reviu dan perbaikan dengan stakeholder</li>
  <li><strong>Budaya Pelayanan Prima</strong> - Sosialisasi/pelatihan etik dan capacity building; akses informasi pelayanan; reward/punishment dan kompensasi; sarana terintegrasi; inovasi pelayanan unik dan replikable</li>
  <li><strong>Penilaian Kepuasan Terhadap Pelayanan</strong> - Survei kepuasan ≥4 kali/tahun; hasil survei terbuka; tindak lanjut hasil; integrasi pengaduan dengan SP4N-Lapor! dan database terintegrasi</li>
</ol>`.trim(),
    driveUrl: "https://drive.google.com/drive/folders/your-folder-id-6",
  },
];

/**
 * Props interface for the IntegrityModal component.
 */
interface ModalProps {
  area: Area | null;
  onClose: () => void;
}

/**
 * Modal component that displays detailed information about an integrity area.
 * Includes the full description and a link to supporting evidence documents.
 * @param area - The integrity area data to display
 * @param onClose - Function to close the modal
 */
const IntegrityModal: React.FC<ModalProps> = ({ area, onClose }) => {
  if (!area) return null;

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={handleBackdropClick}
    >
      <div className="max-h-[90vh] w-full max-w-5xl overflow-y-auto rounded-lg bg-background p-12 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-2xl font-bold text-foreground">{area.title}</h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
            aria-label="Tutup"
          >
            ×
          </button>
        </div>

        <div
          className="prose prose-sm dark:prose-invert max-w-none text-foreground"
          dangerouslySetInnerHTML={{ __html: area.fullDescription }}
        />

        <div className="mt-6 flex justify-center">
          <a
            href={area.driveUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2 rounded btn-primary"
          >
            Bukti Eviden
          </a>
        </div>
      </div>
    </div>
  );
};

/**
 * Main component for the Zona Integritas page.
 * Displays information about integrity zones, allows users to explore detailed information
 * about each area, and provides contact information for complaints and feedback.
 */
const ZonaIntegritasPage: React.FC = () => {
  const [selectedArea, setSelectedArea] = useState<Area | null>(null);

  /**
   * Handles click on an integrity area card.
   * @param id - The ID of the clicked area
   */
  const handleAreaClick = (id: number) => {
    const area = integrityAreas.find((a) => a.id === id);
    if (area) setSelectedArea(area);
  };

  /**
   * Closes the modal by resetting the selected area.
   */
  const closeModal = () => setSelectedArea(null);

  return (
    <Layout>
      <div className="min-h-screen bg-semibackground py-12">
        <div className="container max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-16">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-accent/10 rounded-full mb-4">
              <Shield className="text-accent" size={32} />
            </div>
            <h1 className="text-4xl md:text-5xl font-serif font-bold mb-4 text-foreground">
              Zona Integritas
            </h1>
            <p className="text-lg text-secondary max-w-3xl mx-auto">
              Zona Integritas merupakan predikat yang diberikan kepada instansi
              pemerintah yang pimpinan dan jajarannya mempunyai komitmen untuk
              mewujudkan WBK/WBBM melalui reformasi birokrasi, khususnya dalam
              hal pencegahan korupsi dan peningkatan kualitas pelayanan publik.
            </p>
          </div>

          <section className="mb-16">
            <h2 className="text-2xl md:text-3xl font-serif font-bold mb-8 text-foreground">
              6 Area Pembangunan Zona Integritas
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {integrityAreas.map((area) => (
                <IntegrityAreaCard
                  key={area.id}
                  id={area.id}
                  title={area.title}
                  description={area.description}
                  icon={area.icon}
                  onClick={() => handleAreaClick(area.id)}
                />
              ))}
            </div>
          </section>

          <section className="mb-16" id="pengaduan">
            <h2 className="text-2xl md:text-3xl font-serif font-bold mb-8 text-foreground flex items-center">
              <MessageSquare className="mr-2 text-accent" />
              Layanan Pengaduan
            </h2>
            <div className="bg-background border border-border rounded-lg p-6">
              <p className="text-secondary mb-6">
                MAN 3 Kulon Progo menyediakan layanan pengaduan untuk menerima
                masukan, saran, dan laporan terkait pelayanan dan dugaan
                pelanggaran integritas.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <a
                  href="mailto:man3kulonprogo@gmail.com"
                  className="flex items-center p-4 bg-accent/5 hover:bg-accent/10 rounded-lg transition-colors"
                >
                  <Mail className="text-accent mr-3" size={20} />
                  <div>
                    <div className="font-medium text-foreground">Email</div>
                    <div className="text-sm text-secondary">
                      man3kulonprogo@gmail.com
                    </div>
                  </div>
                </a>

                <a
                  href="https://wa.me/6281328233869"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center p-4 bg-accent/5 hover:bg-accent/10 rounded-lg transition-colors"
                >
                  <Phone className="text-accent mr-3" size={20} />
                  <div>
                    <div className="font-medium text-foreground">WhatsApp</div>
                    <div className="text-sm text-secondary">0813-2823-3869</div>
                  </div>
                </a>
              </div>
            </div>
          </section>
        </div>
      </div>

      <IntegrityModal area={selectedArea} onClose={closeModal} />
    </Layout>
  );
};

export default ZonaIntegritasPage;
