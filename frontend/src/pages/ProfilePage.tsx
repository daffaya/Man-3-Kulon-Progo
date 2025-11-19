/**
 * @fileoverview ProfilePage component displaying comprehensive information about MAN 3 Kulon Progo.
 * This component renders the school's history, vision, mission, goals, strategies, and contact information.
 * It's organized into several sections with reusable sub-components for better maintainability.
 */

import React from "react";
import Layout from "../components/layout/Layout";
import { Link } from "react-router-dom";
import { Mail, Github, Twitter, Linkedin } from "lucide-react";

/**
 * Array containing the school's historical information in chronological order.
 */
const SCHOOL_HISTORY = [
  "Sejarah berdirinya MAN 3 Kulon Progo tidak akan terlepas dari kondisi umat yang berada di wilayah Kulon Progo bagian utara, Kecamatan Nanggulan, Samigaluh dan Kalibawang merupakan home base bagi kaum non muslim, sehingga secara umum, pada daerah ini kaum non muslim relatif lebih banyak.",
  "Sebagai langkah antisipasi pada tahun 1984, Pengawas Pendidikan Islam di Kulon Progo Utara, Drs. Abdul Mukti bersama-sama dengan beberapa Tokoh dan Guru Agama Islam, seperti H. Muh. Karsidi (Penilik Guru Pendidikan Agama Islam Kalibawang), Drs. Muzilanto (SMP Muh. Kalibawang), S. Siswo Pranoto (Ka. SD. Dekso I), H.A. Priharsoyo (Guru SD Sokorini), H.Yasmin, B.A. (Ka. SD Muh. Bendo), Mujono (Kepala KUA Kecamatan Kalibawang), H. Mahmud (Staf KUA Kalibawang), H. Kasil Subekti, S.H. ( Staf Kantor Kecamatan Kalibawang), berniat mendirikan Madrasah Aliyah. Pada saat itu Camat Kalibawang, Adam Nurjati menyetujui rencana pendirian Madrasah Aliyah di Kalibawang. Namun dengan catatan Madrasah Aliyah itu harus negeri.",
  "Rencana tersebut didukung oleh para Guru dan Kepala SD, SMP, SLTA se-Kecamatan Kalibawang, Ka. Bag. Agama empat desa se-Kecamatan Kalibawang. Berdirilah Madrasah Aliyah Swasta (MAS) Kalibawang pada tahun 1984 di tanah pekarangan Bapak Hadi Siswanto dengan ruang kantor, rumah Beliau. Setahun kemudian, tahun 1985 berubah menjadi Madrasah Aliyah Filial MAN Wates 1 di Kalibawang. Tahun 1989 Madrasah berpindah lokasi ke Kompleks Masjid Sulton Agung Kalibawang.",
  "Melalui SK Menteri Agama No 515 A tahun 1995 tertanggal 25 November 1995, MAN Kalibawang Filial MAN Wates I dinegerikan sehingga berubah status dan nama menjadi MAN I Kalibawang.",
  "Berdasarkan SK Kepala Kantor Wilayah Kemenag DIY No. 68 Tahun 2017, tertanggal 27 Januari 2017, sejak tanggal 1 Februari 2017, madrasah kita berubah nama semula MAN 1 Kalibawang menjadi MAN 3 Kulon Progo.",
  "Seiring dengan perkembangan kebutuhan dan tuntutan zaman, untuk memberi bekal peserta didik, saat ini MAN 3 Kulon Progo mendapat amanah untuk menjadi Madrasah Plus Keterampilan berwawasan lingkungan yang dilengkapi dengan Laboratorium Keterampilan, Bursa Kerja Khusus dari Dinas Tenaga Kerja, Sekolah Adiwiyata dari Kementerian Lingkungan Hidup serta Madrasah Tanggap Bencana dari instansi terkait.",
  "Adapun Pengembangan Bidang Keagamaan kini MAN 3 Kulon Progo telah berhasil mendirikan Boarding Madrasah dengan Program Unggulan Tahfidz dan Kajian Kitab.",
];

/**
 * The school's vision statement.
 */
const VISION =
  "ADILUHUNG (Agamis, Dinamis, Ilmiah, Terampil, Unggul) dan Berwawasan Lingkungan";

/**
 * Array containing the school's mission items, organized by categories.
 */
const MISSION_ITEMS = [
  {
    title: "Agamis:",
    items: ["Meningkatkan Pemahaman Agama Islam", "Memiliki Akhlak mulia"],
  },
  {
    title: "Dinamis:",
    items: [
      "Memiliki jiwa kewirausahaan yang tangguh",
      "Mampu mengikuti perubahan zaman",
    ],
  },
  {
    title: "Ilmiah:",
    items: [
      "Menanamkan rasa ingin tahu",
      "Mampu berpikir ilmiah",
      "Mampu bersikap ilmiah",
    ],
  },
  {
    title: "Terampil:",
    items: [
      "Menguasai ilmu pengetahuan dan teknologi",
      "Memiliki kecakapan hidup",
    ],
  },
  {
    title: "Unggul:",
    items: ["Memiliki prestasi akademik", "Memiliki prestasi non-akademik"],
  },
  {
    title: "Berwawasan Lingkungan:",
    items: [
      "Mewujudkan lingkungan madrasah yang bersih, sehat, indah, asri dan nyaman",
      "Menumbuhkan kecintaan terhadap lingkungan",
      "Menumbuhkan kebiasaan hidup hemat air, listrik, alat tulis kantor dan menjaga sumber daya alam",
    ],
  },
];

/**
 * The school's long-term goal statement.
 */
const LONG_TERM_GOAL =
  "Menjadi madrasah yang berkualitas, bermartabat, memiliki keunggulan dan kompetensi serta berwawasan lingkungan.";

/**
 * Array containing the school's short-term goals.
 */
const SHORT_TERM_GOALS = [
  "Dapat menjadi madrasah pilihan siswa lulusan SMP/MTs",
  "Dapat melaksanakan proses pembelajaran dengan lancar dan baik sesuai perkembangan dan tuntutan zaman",
  "Dapat mewujudkan lingkungan yang kondusif untuk proses pembelajaran",
  "Dapat mencetak lulusan yang cerdas, beriman, bertaqwa, terampil dan islami",
];

/**
 * Array containing the school's implementation strategies.
 */
const STRATEGIES = [
  "Sosialisasi visi misi ke seluruh civitas akademik, komite, orang tua/wali siswa dan lingkungan",
  "Meningkatkan koordinasi semua stakeholder dan pihak lain yang terkait",
  "Penambahan jam, pengayaan intensif dan pengembangan kompetensi pada mata pelajaran yang terkait dengan Ujian Nasional dan Ujian Masuk Perguruan Tinggi",
  "Intensifikasi Program Remidial",
  "Latihan Dasar Metodologi Ilmiah dan Penyusunan Karya Tulis Siswa",
  "Praktek Laboratorium dengan jam khusus (IPA, IPS, Agama, Bahasa)",
  "Kegiatan ekstrakurikuler",
  "Berpartisipasi aktif dalam berbagai kegiatan lomba, baik lokal, regional maupun nasional",
  "Peningkatan Kompetensi Guru melalui lokakarya/workshop, diklat dan studi banding",
  "Melengkapi sarana dan prasarana pembelajaran sesuai perkembangan zaman",
];

/**
 * Reusable card component for content sections.
 * @param children - Content to be rendered inside the card
 * @param className - Additional CSS classes for styling
 */
const Card = React.memo(
  ({
    children,
    className = "",
  }: {
    children: React.ReactNode;
    className?: string;
  }) => (
    <div
      className={`card p-6 space-y-4 leading-relaxed text-justify ${className}`}
    >
      {children}
    </div>
  )
);

/**
 * Component for rendering section headers with consistent styling.
 * @param title - The title text to display
 * @param className - Additional CSS classes for styling
 */
const SectionHeader: React.FC<{ title: string; className?: string }> = ({
  title,
  className = "",
}) => (
  <h3
    className={`text-center font-serif font-bold text-foreground ${className}`}
  >
    {title}
  </h3>
);

/**
 * Component for displaying images with responsive sizing and styling.
 * @param src - Image source URL
 * @param alt - Alt text for accessibility
 */
const ImageContainer: React.FC<{ src: string; alt: string }> = ({
  src,
  alt,
}) => (
  <div
    className="w-full sm:w-3/4 md:w-3/5 lg:w-1/2 mx-auto overflow-hidden rounded-xl shadow-xl"
    role="img"
    aria-label={alt}
  >
    <img src={src} alt={alt} className="w-full h-auto object-cover" />
  </div>
);

/**
 * Component for rendering list sections with a title and bullet points.
 * @param title - The section title
 * @param items - Array of list items to display
 */
const ListSection: React.FC<{ title: string; items: string[] }> = ({
  title,
  items,
}) => (
  <div className="mb-2">
    <h5 className="mb-2 font-semibold text-foreground">{title}</h5>
    <ul className="list-disc list-inside ml-4 text-secondary">
      {items.map((item, index) => (
        <li key={index}>{item}</li>
      ))}
    </ul>
  </div>
);

/**
 * Component for displaying the school's history section.
 */
const SchoolHistory: React.FC = () => (
  <Card>
    <h3 className="text-center text-foreground">Sejarah</h3>
    {SCHOOL_HISTORY.map((paragraph, index) => (
      <p key={`history-${index}`} className="text-secondary">
        {paragraph}
      </p>
    ))}
  </Card>
);

/**
 * Component for displaying the school's vision, mission, goals, and strategies.
 */
const VisionMission: React.FC = () => (
  <Card>
    <section className="text-center mb-4">
      <h3 className="mb-2 text-foreground">VISI</h3>
      <p className="text-secondary">{VISION}</p>
    </section>
    <section className="mb-4">
      <h3 className="text-center mb-2 text-foreground">MISI</h3>
      <div className="space-y-2">
        {MISSION_ITEMS.map((mission, index) => (
          <ListSection
            key={index}
            title={mission.title}
            items={mission.items}
          />
        ))}
      </div>
    </section>

    <div>
      <h3 className="text-center font-bold mb-2 text-foreground">
        TUJUAN DAN STRATEGI
      </h3>
      <div className="space-y-4">
        <div>
          <h5 className="font-semibold underline text-foreground">
            Tujuan Jangka Panjang:
          </h5>
          <p className="text-secondary">{LONG_TERM_GOAL}</p>
        </div>
        <div>
          <h5 className="font-semibold underline text-foreground">
            Tujuan Jangka Pendek:
          </h5>
          <ul className="list-disc list-inside ml-4 text-secondary">
            {SHORT_TERM_GOALS.map((goal, index) => (
              <li key={index}>{goal}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>

    <div className="mt-6">
      <h2 className="text-xl font-bold mb-2 text-foreground">
        Strategi Pelaksanaan Visi dan Misi:
      </h2>
      <ul className="list-disc list-inside ml-4 space-y-1 text-secondary">
        {STRATEGIES.map((strategy, index) => (
          <li key={index}>{strategy}</li>
        ))}
      </ul>
    </div>
  </Card>
);

/**
 * Component for displaying the contact section with a call-to-action.
 */
const ContactSection: React.FC = () => (
  <section className="py-10 bg-semibackground/50 rounded-xl px-8 text-center">
    <h2 className="text-2xl font-serif font-bold mb-4 text-foreground">
      Ingin Berkontribusi?
    </h2>
    <p className="text-lg text-secondary mb-6 max-w-xl mx-auto">
      Kami terbuka untuk kolaborasi, kunjungan, atau pertanyaan terkait
      pendidikan dan pengembangan madrasah.
    </p>
    <Link to="/kontak" className="btn btn-primary">
      Hubungi Kami
    </Link>
  </section>
);

/**
 * Main component for the school profile page.
 * Displays comprehensive information about MAN 3 Kulon Progo including history,
 * vision, mission, goals, strategies, and contact information.
 */
const ProfilePage: React.FC = () => {
  return (
    <Layout>
      <div className="container mx-auto px-4 sm:px-6 py-12 max-w-4xl fade-in">
        <section className="mb-12">
          <SectionHeader title="Tentang Kami" className="mb-4 text-2xl" />
          <ImageContainer src="/MAN3_1.png" alt="MAN 3 Kulon Progo" />
          <div className="mt-8">
            <SchoolHistory />
          </div>
          <div className="mt-8">
            <VisionMission />
          </div>
        </section>
        <ContactSection />
      </div>
    </Layout>
  );
};

export default ProfilePage;
