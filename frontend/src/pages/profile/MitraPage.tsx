/**
 * @fileoverview MitraPage — migrated to CMS.
 * Fetches content from site_contents (page: mitra, section: content).
 */

import React from "react";
import Layout from "../../components/layout/Layout";
import { useCmsSection } from "../../hooks/useCmsPage";

interface PartnerItem {
  name: string;
  institution: string;
  cooperation: string;
}

interface MitraContent {
  partners: PartnerItem[];
}

const FALLBACK: MitraContent = {
  partners: [
    {
      name: "Puskesmas Kalibawang",
      institution: "Instansi Pemerintah",
      cooperation: "Pelayanan Kesehatan",
    },
    {
      name: "Polsek Kalibawang",
      institution: "Instansi Pemerintah",
      cooperation: "Pembinaan Mental",
    },
    {
      name: "Koramil Kalibawang",
      institution: "Instansi Pemerintah",
      cooperation: "Bela Negara Baik",
    },
    {
      name: "Kalyanamitra, lembaga peduli anak",
      institution: "Lembaga Swadaya Masyarakat",
      cooperation: "Sosial dan Pendidikan",
    },
    {
      name: "Kebun binatang Gembiraloka",
      institution: "Dunia Usaha",
      cooperation: "Edukasi dan Rekreasi",
    },
    {
      name: "KPPN Wates Kulon Progo",
      institution: "Instansi Pemerintah",
      cooperation: "Penyalur/pembayar dana DIPA",
    },
    {
      name: "BRI Kantor Cabang Kulon Progo",
      institution: "Dunia Usaha (BUMN)",
      cooperation: "Keuangan",
    },
    {
      name: "KPP Pratama",
      institution: "Instansi Pemerintah",
      cooperation: "Pajak",
    },
    {
      name: "Dinas Tenaga Kerja Sosial dan Transmigrasi",
      institution: "Instansi Pemerintah",
      cooperation:
        "Pembinaan, informasi dan Penempatan kerja bagi alumni Madrasah",
    },
    {
      name: "PT. Sukses Mandiri Utama",
      institution: "Dunia Usaha (Perusahaan Jasa)",
      cooperation: "Informasi dan penempatan kerja",
    },
    {
      name: "PT. Sumbiri",
      institution: "Dunia Usaha (Perusahaan Manufaktur)",
      cooperation: "Informasi dan penempatan kerja",
    },
    {
      name: "PT. Telkom Indonesia",
      institution: "Dunia Usaha (Perusahaan BUMN)",
      cooperation: "Layanan telpon dan internet",
    },
    {
      name: "CV. Jogja Medianet",
      institution: "Dunia Usaha",
      cooperation: "Layanan internet",
    },
    {
      name: "PAY Sulton Salim",
      institution: "Yayasan",
      cooperation: "Pendidikan",
    },
    {
      name: "PP. Nurul Huda",
      institution: "Lembaga Pendidikan",
      cooperation: "Pendidikan Pesantren",
    },
    {
      name: "Bambu Asri",
      institution: "Dunia Usaha",
      cooperation: "Pelatihan keterampilan",
    },
    {
      name: "PP An Najwa Ngluar Magelang",
      institution: "Lembaga Pendidikan",
      cooperation: "Pendidikan Pesantren",
    },
    {
      name: "BLK Ansor KP",
      institution: "Organisasi Masyarakat",
      cooperation: "Pelatihan Keterampilan",
    },
  ],
};

const MitraPage: React.FC = () => {
  const { data, loading } = useCmsSection<MitraContent>("mitra", "content");

  const partners: PartnerItem[] = data?.partners ?? FALLBACK.partners;

  return (
    <Layout>
      <div className="container mx-auto px-4 sm:px-6 py-12 max-w-5xl fade-in">
        <section className="mb-12">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-8 text-center">
            Daftar Mitra MAN 3 Kulon Progo
          </h1>
          <div className="overflow-x-auto">
            <table className="min-w-full border-collapse border border-gray-300 dark:border-gray-600">
              <thead>
                <tr className="bg-gray-100 dark:bg-gray-700">
                  <th className="border border-gray-300 dark:border-gray-600 px-4 py-2 text-center text-gray-800 dark:text-gray-200">
                    No
                  </th>
                  <th className="border border-gray-300 dark:border-gray-600 px-4 py-2 text-center text-gray-800 dark:text-gray-200">
                    Nama Mitra
                  </th>
                  <th className="border border-gray-300 dark:border-gray-600 px-4 py-2 text-center text-gray-800 dark:text-gray-200">
                    Instansi/Lembaga/Dunia Usaha
                  </th>
                  <th className="border border-gray-300 dark:border-gray-600 px-4 py-2 text-center text-gray-800 dark:text-gray-200">
                    Bentuk Kerja Sama
                  </th>
                </tr>
              </thead>
              <tbody>
                {loading
                  ? [...Array(8)].map((_, i) => (
                      <tr key={i}>
                        {[...Array(4)].map((_, j) => (
                          <td
                            key={j}
                            className="border border-gray-300 dark:border-gray-600 px-4 py-2"
                          >
                            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                          </td>
                        ))}
                      </tr>
                    ))
                  : partners.map((partner, index) => (
                      <tr
                        key={index}
                        className={
                          index % 2 === 0
                            ? "bg-white dark:bg-gray-800"
                            : "bg-gray-50 dark:bg-gray-900"
                        }
                      >
                        <td className="border border-gray-300 dark:border-gray-600 px-4 py-2 text-center">
                          {index + 1}
                        </td>
                        <td className="border border-gray-300 dark:border-gray-600 px-4 py-2">
                          {partner.name}
                        </td>
                        <td className="border border-gray-300 dark:border-gray-600 px-4 py-2">
                          {partner.institution}
                        </td>
                        <td className="border border-gray-300 dark:border-gray-600 px-4 py-2">
                          {partner.cooperation}
                        </td>
                      </tr>
                    ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </Layout>
  );
};

export default MitraPage;
