/**
 * @fileoverview VisiMisiPage — migrated to CMS.
 * Fetches content from site_contents (page: visi-misi, sections: visi, misi, tujuan, strategi).
 */

import React from "react";
import Layout from "../../components/layout/Layout";
import { useCmsPage } from "../../hooks/useCmsPage";

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────

interface MisiItem {
  title: string;
  points: string[];
}

interface VisiMisiData {
  visi: { text: string };
  misi: { items: MisiItem[] };
  tujuan: { jangka_panjang: string; jangka_pendek: string[] };
  strategi: { items: string[] };
}

// ─────────────────────────────────────────────
// Fallback
// ─────────────────────────────────────────────

const FALLBACK: VisiMisiData = {
  visi: {
    text: "ADILUHUNG (Agamis, Dinamis, Ilmiah, Terampil, Unggul) dan Berwawasan Lingkungan",
  },
  misi: {
    items: [
      {
        title: "Agamis:",
        points: ["Meningkatkan Pemahaman Agama Islam", "Memiliki Akhlak mulia"],
      },
      {
        title: "Dinamis:",
        points: [
          "Memiliki jiwa kewirausahaan yang tangguh",
          "Mampu mengikuti perubahan zaman",
        ],
      },
      {
        title: "Ilmiah:",
        points: [
          "Menanamkan rasa ingin tahu",
          "Mampu berpikir ilmiah",
          "Mampu bersikap ilmiah",
        ],
      },
      {
        title: "Terampil:",
        points: [
          "Menguasai ilmu pengetahuan dan teknologi",
          "Memiliki kecakapan hidup",
        ],
      },
      {
        title: "Unggul:",
        points: [
          "Memiliki prestasi akademik",
          "Memiliki prestasi non-akademik",
        ],
      },
      {
        title: "Berwawasan Lingkungan:",
        points: [
          "Mewujudkan lingkungan madrasah yang bersih, sehat, indah, asri dan nyaman",
          "Menumbuhkan kecintaan terhadap lingkungan",
          "Menumbuhkan kebiasaan hidup hemat air, listrik, alat tulis kantor dan menjaga sumber daya alam",
        ],
      },
    ],
  },
  tujuan: {
    jangka_panjang:
      "Menjadi madrasah yang berkualitas, bermartabat, memiliki keunggulan dan kompetensi serta berwawasan lingkungan.",
    jangka_pendek: [
      "Dapat menjadi madrasah pilihan siswa lulusan SMP/MTs",
      "Dapat melaksanakan proses pembelajaran dengan lancar dan baik sesuai perkembangan dan tuntutan zaman",
      "Dapat mewujudkan lingkungan yang kondusif untuk proses pembelajaran",
      "Dapat mencetak lulusan yang cerdas, beriman, bertaqwa, terampil dan islami",
    ],
  },
  strategi: {
    items: [
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
    ],
  },
};

// ─────────────────────────────────────────────
// Sub-components
// ─────────────────────────────────────────────

const ListSection: React.FC<{ title: string; items: string[] }> = ({
  title,
  items,
}) => (
  <div className="mb-2">
    <h5 className="mb-2">{title}</h5>
    <ul className="list-disc list-inside ml-4">
      {items.map((item, index) => (
        <li key={index}>{item}</li>
      ))}
    </ul>
  </div>
);

const SkeletonBlock: React.FC<{ lines?: number }> = ({ lines = 3 }) => (
  <div className="space-y-2 mb-6">
    {[...Array(lines)].map((_, i) => (
      <div
        key={i}
        className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"
        style={{ width: `${100 - i * 10}%` }}
      />
    ))}
  </div>
);

// ─────────────────────────────────────────────
// Page
// ─────────────────────────────────────────────

const VisiMisiPage: React.FC = () => {
  const { data, loading } = useCmsPage<VisiMisiData>("visi-misi");

  // Merge per section — aman meski sebagian section gagal
  const visi = data?.visi ?? FALLBACK.visi;
  const misi = data?.misi ?? FALLBACK.misi;
  const tujuan = data?.tujuan ?? FALLBACK.tujuan;
  const strategi = data?.strategi ?? FALLBACK.strategi;

  return (
    <Layout>
      <div className="container mx-auto px-4 sm:px-6 py-12 max-w-4xl fade-in">
        {/* Visi */}
        <section className="mb-8 text-justify">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2 text-center">
            Visi
          </h1>
          {loading ? (
            <SkeletonBlock lines={2} />
          ) : (
            <p className="text-center">{visi.text}</p>
          )}
        </section>

        {/* Misi */}
        <section className="mb-8 text-justify">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2 text-center">
            Misi
          </h1>
          {loading ? (
            <SkeletonBlock lines={6} />
          ) : (
            (misi.items ?? []).map((mission, index) => (
              <ListSection
                key={index}
                title={mission.title}
                items={mission.points ?? []}
              />
            ))
          )}
        </section>

        {/* Tujuan */}
        <section className="mb-8 text-justify">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4 text-center">
            Tujuan dan Strategi
          </h1>
          {loading ? (
            <SkeletonBlock lines={4} />
          ) : (
            <>
              <div className="mb-4">
                <h5 className="font-semibold mb-2">Tujuan Jangka Panjang:</h5>
                <p>{tujuan.jangka_panjang}</p>
              </div>
              <div>
                <h5 className="font-semibold mb-2">Tujuan Jangka Pendek:</h5>
                <ul className="list-disc list-inside ml-4">
                  {(tujuan.jangka_pendek ?? []).map((goal, index) => (
                    <li key={index}>{goal}</li>
                  ))}
                </ul>
              </div>
            </>
          )}
        </section>

        {/* Strategi */}
        <section className="mb-8">
          <h2 className="text-xl font-bold mb-2">
            Strategi Pelaksanaan Visi dan Misi:
          </h2>
          {loading ? (
            <SkeletonBlock lines={5} />
          ) : (
            <ul className="list-disc list-inside ml-4 space-y-1">
              {(strategi.items ?? []).map((strategy, index) => (
                <li key={index}>{strategy}</li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </Layout>
  );
};

export default VisiMisiPage;
