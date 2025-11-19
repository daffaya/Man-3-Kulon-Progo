/**
 * @fileoverview MitraPage component for displaying a list of MAN 3 Kulon Progo's partners.
 * This component renders a table showing partner institutions, their types, and cooperation forms.
 */

import React from "react";
import Layout from "../../components/layout/Layout";

/**
 * Interface defining the structure for partner data.
 * @interface
 */
interface PartnerData {
  no: number;
  name: string;
  institution: string;
  cooperation: string;
}

/**
 * Constant array containing partner data with their details.
 */
const PARTNER_LIST: PartnerData[] = [
  {
    no: 1,
    name: "Puskesmas Kalibawang",
    institution: "Instansi Pemerintah",
    cooperation: "Pelayanan Kesehatan",
  },
  {
    no: 2,
    name: "Polsek Kalibawang",
    institution: "Instansi Pemerintah",
    cooperation: "Pembinaan Mental",
  },
  {
    no: 3,
    name: "Koramil Kalibawang",
    institution: "Instansi Pemerintah",
    cooperation: "Bela Negara Baik",
  },
  {
    no: 4,
    name: "Kalyanamitra, lembaga peduli anak",
    institution: "Lembaga Swadaya Masyarakat",
    cooperation: "Sosial dan Pendidikan",
  },
  {
    no: 5,
    name: "Kebun binatang Gembiraloka",
    institution: "Dunia Usaha",
    cooperation: "Edukasi dan Rekreasi",
  },
  {
    no: 6,
    name: "KPPN Wates Kulon Progo",
    institution: "Instansi Pemerintah",
    cooperation: "Penyalur/pembayar dana DIPA",
  },
  {
    no: 7,
    name: "BRI Kantor Cabang Kulon Progo",
    institution: "Dunia Usaha (BUMN)",
    cooperation: "Keuangan",
  },
  {
    no: 8,
    name: "KPP Pratama",
    institution: "Instansi Pemerintah",
    cooperation: "Pajak",
  },
  {
    no: 9,
    name: "Dinas Tenaga Kerja Sosial dan Transmigrasi",
    institution: "Instansi Pemerintah",
    cooperation:
      "Pembinaan, informasi dan Penempatan kerja bagi alumni Madrasah",
  },
  {
    no: 10,
    name: "PT. Sukses Mandiri Utama",
    institution: "Dunia Usaha (Perusahaan Jasa)",
    cooperation: "Informasi dan penempatan kerja",
  },
  {
    no: 11,
    name: "PT. Sumbiri",
    institution: "Dunia Usaha (Perusahaan Manufaktur)",
    cooperation: "Informasi dan penempatan kerja",
  },
  {
    no: 12,
    name: "PT. Telkom Indonesia",
    institution: "Dunia Usaha (Perusahaan BUMN)",
    cooperation: "Layanan telpon dan internet",
  },
  {
    no: 13,
    name: "CV. Jogja Medianet",
    institution: "Dunia Usaha",
    cooperation: "Layanan internet",
  },
  {
    no: 14,
    name: "PAY Sulton Salim",
    institution: "Yayasan",
    cooperation: "Pendidikan",
  },
  {
    no: 15,
    name: "PP. Nurul Huda",
    institution: "Lembaga Pendidikan",
    cooperation: "Pendidikan Pesantren",
  },
  {
    no: 16,
    name: "Bambu Asri",
    institution: "Dunia Usaha",
    cooperation: "Pelatihan keterampilan",
  },
  {
    no: 17,
    name: "PP An Najwa Ngluar Magelang",
    institution: "Lembaga Pendidikan",
    cooperation: "Pendidikan Pesantren",
  },
  {
    no: 18,
    name: "BLK Ansor KP",
    institution: "Organisasi Masyarakat",
    cooperation: "Pelatihan Keterampilan",
  },
];

/**
 * Component that displays a table of MAN 3 Kulon Progo's partners.
 * Renders a responsive table with partner details including name, institution type,
 * and form of cooperation.
 */
const MitraPage: React.FC = () => {
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
                  <th
                    className="border border-gray-300 dark:border-gray-600 px-4 py-2 text-center text-gray-800 dark:text-gray-200"
                    scope="col"
                  >
                    No
                  </th>
                  <th
                    className="border border-gray-300 dark:border-gray-600 px-4 py-2 text-center text-gray-800 dark:text-gray-200"
                    scope="col"
                  >
                    Nama Mitra
                  </th>
                  <th
                    className="border border-gray-300 dark:border-gray-600 px-4 py-2 text-center text-gray-800 dark:text-gray-200"
                    scope="col"
                  >
                    Instansi/Lembaga/Dunia Usaha
                  </th>
                  <th
                    className="border border-gray-300 dark:border-gray-600 px-4 py-2 text-center text-gray-800 dark:text-gray-200"
                    scope="col"
                  >
                    Bentuk Kerja Sama
                  </th>
                </tr>
              </thead>
              <tbody>
                {PARTNER_LIST.map((partner, index) => (
                  <tr
                    key={`partner-${index}`}
                    className={
                      index % 2 === 0
                        ? "bg-white dark:bg-gray-800"
                        : "bg-gray-50 dark:bg-gray-900"
                    }
                  >
                    <td className="border border-gray-300 dark:border-gray-600 px-4 py-2 text-center">
                      {partner.no}
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
