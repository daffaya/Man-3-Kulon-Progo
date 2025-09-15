import React from "react";
import Layout from "../../components/layout/Layout";

const VISION =
  "ADILUHUNG (Agamis, Dinamis, Ilmiah, Terampil, Unggul) dan Berwawasan Lingkungan";

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

const LONG_TERM_GOAL =
  "Menjadi madrasah yang berkualitas, bermartabat, memiliki keunggulan dan kompetensi serta berwawasan lingkungan.";

const SHORT_TERM_GOALS = [
  "Dapat menjadi madrasah pilihan siswa lulusan SMP/MTs",
  "Dapat melaksanakan proses pembelajaran dengan lancar dan baik sesuai perkembangan dan tuntutan zaman",
  "Dapat mewujudkan lingkungan yang kondusif untuk proses pembelajaran",
  "Dapat mencetak lulusan yang cerdas, beriman, bertaqwa, terampil dan islami",
];

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

const VisiMisiPage: React.FC = () => {
  return (
    <Layout>
      <div className="container mx-auto px-4 sm:px-6 py-12 max-w-4xl fade-in">
        <section className="mb-8 text-justify">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2 text-center">
            Visi
          </h1>
          <p className="text-center">{VISION}</p>
        </section>

        <section className="mb-8 text-justify">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2 text-center">
            Misi
          </h1>
          {MISSION_ITEMS.map((mission, index) => (
            <ListSection
              key={index}
              title={mission.title}
              items={mission.items}
            />
          ))}
        </section>

        <section className="mb-8 text-justify">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4 text-center">
            Tujuan dan Strategi
          </h1>
          <div className="mb-4">
            <h5 className="font-semibold mb-2">Tujuan Jangka Panjang:</h5>
            <p>{LONG_TERM_GOAL}</p>
          </div>
          <div>
            <h5 className="font-semibold mb-2">Tujuan Jangka Pendek:</h5>
            <ul className="list-disc list-inside ml-4">
              {SHORT_TERM_GOALS.map((goal, index) => (
                <li key={index}>{goal}</li>
              ))}
            </ul>
          </div>
        </section>

        <div>
          <h2 className="text-xl font-bold mb-2">
            Strategi Pelaksanaan Visi dan Misi:
          </h2>
          <ul className="list-disc list-inside ml-4 space-y-1">
            {STRATEGIES.map((strategy, index) => (
              <li key={index}>{strategy}</li>
            ))}
          </ul>
        </div>
      </div>
    </Layout>
  );
};

export default VisiMisiPage;
