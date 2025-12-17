/**
 * @fileoverview GuruStafPage component for displaying teacher and staff data in tabular format.
 * This component renders two tables showing the breakdown of teachers and staff by gender
 * and employment status (PNS, P3K, Non-PNS) for the current academic year.
 */

import React from "react";
import Layout from "../../components/layout/Layout";

/**
 * Interface defining the structure for staff data.
 * @interface
 */
interface StaffData {
  status: string;
  male: number;
  female: number;
}

/**
 * Interface defining the structure for detailed staff/teacher data.
 * @interface
 */
interface Tendik {
  no: number;
  nama: string;
  nip: string;
  gender: "L" | "P";
  status: "PNS" | "PPPK" | "CPNS";
  jabatan: string;
}

/**
 * Props interface for the RecapTable component.
 * @interface
 */
interface RecapTableProps {
  title: string;
  tahunAjaran: string;
  data: StaffData[];
  totalLabel: string;
}

/**
 * Constant array containing teacher data breakdown by status and gender.
 */
const TEACHER_RECAP: StaffData[] = [
  { status: "Guru PNS", male: 14, female: 11 },
  { status: "Guru P3K", male: 2, female: 4 },
  { status: "Guru Non PNS", male: 0, female: 0 },
];

/**
 * Constant array containing staff data breakdown by status and gender.
 */
const STAFF_RECAP: StaffData[] = [
  { status: "Staf PNS", male: 4, female: 4 },
  { status: "Staf P3K", male: 3, female: 1 },
  { status: "Staf Non PNS", male: 0, female: 0 },
];

/**
 * Constant array containing all detailed teacher and staff data.
 */
const ALL_TENDIK_DATA: Tendik[] = [
  {
    no: 1,
    nama: "Budi Santosa, S.Pd",
    nip: "196708041995121004",
    gender: "L",
    status: "PNS",
    jabatan: "Guru Pendidikan Sejarah",
  },
  {
    no: 2,
    nama: "Drs. Parwanto, MA.",
    nip: "196702281993031005",
    gender: "L",
    status: "PNS",
    jabatan: "Guru SKI",
  },
  {
    no: 3,
    nama: "Nur Ridho, S.Pd.",
    nip: "196910151996011001",
    gender: "L",
    status: "PNS",
    jabatan: "Guru Fisika",
  },
  {
    no: 4,
    nama: "Nuryadi, S.Pd",
    nip: "197008101997031001",
    gender: "L",
    status: "PNS",
    jabatan: "Guru Matematika",
  },
  {
    no: 5,
    nama: "Tri Handayani, S.Pd., M.Pd.",
    nip: "197004261998032001",
    gender: "P",
    status: "PNS",
    jabatan: "Guru Biologi / Waka Sarpras",
  },
  {
    no: 6,
    nama: "Asliman, S.Ag",
    nip: "196901011998031006",
    gender: "L",
    status: "PNS",
    jabatan: "Guru Sosiologi",
  },
  {
    no: 7,
    nama: "Drs. Ismiyono",
    nip: "196704081998031002",
    gender: "L",
    status: "PNS",
    jabatan: "Guru Bahasa Indonesia",
  },
  {
    no: 8,
    nama: "Drs. Suwata Hariyadi",
    nip: "196801011998031020",
    gender: "L",
    status: "PNS",
    jabatan: "Guru BK",
  },
  {
    no: 9,
    nama: "Muhammad Hadiyuddin, S.Ag.",
    nip: "196902131998031001",
    gender: "L",
    status: "PNS",
    jabatan: "Guru Bahasa Inggris",
  },
  {
    no: 10,
    nama: "Siti Jauharoh, S.Ag.",
    nip: "196903251999032001",
    gender: "P",
    status: "PNS",
    jabatan: "Guru Matematika",
  },
  {
    no: 11,
    nama: "Pujiastuti, S.Pd.",
    nip: "197210232001122001",
    gender: "P",
    status: "PNS",
    jabatan: "Guru Kewirausahaan/Seni",
  },
  {
    no: 12,
    nama: "Nurhayanti, S.Pd., M.Sc.",
    nip: "197507222003122005",
    gender: "P",
    status: "PNS",
    jabatan: "Kepala Madrasah",
  },
  {
    no: 13,
    nama: "Umyun Khabbibah, S.Ag.",
    nip: "197410032005012004",
    gender: "P",
    status: "PNS",
    jabatan: "Guru Bahasa Arab",
  },
  {
    no: 14,
    nama: "Yudhi Santosa, S.Pd.",
    nip: "197805152007101002",
    gender: "L",
    status: "PNS",
    jabatan: "Kepala TU",
  },
  {
    no: 15,
    nama: "Suyamta",
    nip: "196809251993031004",
    gender: "L",
    status: "PNS",
    jabatan: "Pengolah Anggaran",
  },
  {
    no: 16,
    nama: "Nurimah, S.Pd.",
    nip: "197406052005012003",
    gender: "P",
    status: "PNS",
    jabatan: "Guru Geografi",
  },
  {
    no: 17,
    nama: "Wahyuni Karyaningrum, S.Pd.",
    nip: "197412282007012025",
    gender: "P",
    status: "PNS",
    jabatan: "Guru Kimia",
  },
  {
    no: 18,
    nama: "Dr. Ali Asmu'i, S.Ag., M.Pd.",
    nip: "197407222007101002",
    gender: "L",
    status: "PNS",
    jabatan: "Guru Al-Qur'an Hadis",
  },
  {
    no: 19,
    nama: "Suprapta, S.Pd.",
    nip: "197309272005011006",
    gender: "L",
    status: "PNS",
    jabatan: "Guru PJOK",
  },
  {
    no: 20,
    nama: "Suminar, SP",
    nip: "197507072007102004",
    gender: "P",
    status: "PNS",
    jabatan: "Pengelola BMN",
  },
  {
    no: 21,
    nama: "Tri Agung Nugroho, S.Pd.",
    nip: "197606112014121002",
    gender: "L",
    status: "PNS",
    jabatan: "Guru Ekonomi",
  },
  {
    no: 22,
    nama: "Roudlotul Husniyah",
    nip: "196912161990012001",
    gender: "P",
    status: "PNS",
    jabatan: "Admin Perpustakaan",
  },
  {
    no: 23,
    nama: "Nursalim, S.Ag.",
    nip: "196807192014111002",
    gender: "L",
    status: "PNS",
    jabatan: "Guru Fikih",
  },
  {
    no: 24,
    nama: "Fajar Shodiq Kurniawan, S.S.",
    nip: "198603232019031016",
    gender: "L",
    status: "CPNS",
    jabatan: "Guru SKI",
  },
  {
    no: 25,
    nama: "Aji Uji Hantara, S.Hum.",
    nip: "199407122019031009",
    gender: "L",
    status: "CPNS",
    jabatan: "Guru SKI",
  },
  {
    no: 26,
    nama: "Isti Wulandari, S.Pd.",
    nip: "199109282019032022",
    gender: "P",
    status: "CPNS",
    jabatan: "Guru Matematika",
  },
  {
    no: 27,
    nama: "Ambar Mujiarti, S.Si.",
    nip: "198609242019032010",
    gender: "P",
    status: "CPNS",
    jabatan: "Guru Matematika",
  },
  {
    no: 28,
    nama: "Sugiya",
    nip: "196902032007011044",
    gender: "L",
    status: "PNS",
    jabatan: "Bendahara",
  },
  {
    no: 29,
    nama: "Agung Budiaji, S.IP",
    nip: "197911022023211009",
    gender: "L",
    status: "PPPK",
    jabatan: "Arsiparis",
  },
  {
    no: 30,
    nama: "Tita Septivianin Mardiyanto, A.Md.S.I.Ak.",
    nip: "199709222022032001",
    gender: "P",
    status: "PNS",
    jabatan: "Pengolah Anggaran",
  },
  {
    no: 31,
    nama: "Rini Dwi Hastuti, S.Pd.T.",
    nip: "198109222009012007",
    gender: "P",
    status: "PNS",
    jabatan: "Guru Prakarya",
  },
  {
    no: 32,
    nama: "Wagiyanto, S.Pd.",
    nip: "197211262022211002",
    gender: "L",
    status: "PPPK",
    jabatan: "Guru Kewirausahaan",
  },
  {
    no: 33,
    nama: "Supriyatun, S.Pd.I.",
    nip: "197702282022212006",
    gender: "P",
    status: "PPPK",
    jabatan: "Guru Biologi",
  },
  {
    no: 34,
    nama: "Sri Mulyaningsih, S.Pd.",
    nip: "198509282023212031",
    gender: "P",
    status: "PPPK",
    jabatan: "Guru Bahasa Indonesia",
  },
  {
    no: 35,
    nama: "Uji Nindya Dian Shinta, S.I.Pust.",
    nip: "198803022023212041",
    gender: "P",
    status: "PPPK",
    jabatan: "Pengelola Perpustakaan",
  },
  {
    no: 36,
    nama: "Tulus Tri Nugroho, S.Pd.",
    nip: "199412182023211013",
    gender: "L",
    status: "PPPK",
    jabatan: "Guru Akidah Akhlaq",
  },
  {
    no: 37,
    nama: "Lukluk Kholishoh, S.Pd.",
    nip: "198810132023212036",
    gender: "P",
    status: "PPPK",
    jabatan: "Guru Bahasa Inggris",
  },
  {
    no: 38,
    nama: "Dewi Masitoh, S.Sos.I.",
    nip: "198305012023212028",
    gender: "P",
    status: "PPPK",
    jabatan: "Guru Muatan Lokal",
  },
  {
    no: 39,
    nama: "Sylva Lundia Amararatri, S.Pd",
    nip: "199707262025052005",
    gender: "P",
    status: "CPNS",
    jabatan: "Guru Seni Budaya",
  },
  {
    no: 40,
    nama: "Wijiwardani, S.Pd",
    nip: "199710102025052009",
    gender: "P",
    status: "CPNS",
    jabatan: "Guru BK",
  },
  {
    no: 41,
    nama: "Daffa Pasya Al Ghifary, S.Kom",
    nip: "200110212025051009",
    gender: "L",
    status: "CPNS",
    jabatan: "Pranata Komputer",
  },
  {
    no: 42,
    nama: "Rohmanu Intoyo",
    nip: "197308012025211019",
    gender: "L",
    status: "PPPK",
    jabatan: "Operator Layanan Operasional",
  },
  {
    no: 43,
    nama: "Rovik Rismanta",
    nip: "199507112025211042",
    gender: "L",
    status: "PPPK",
    jabatan: "Pengadministrasi Perkantoran",
  },
];

/**
 * Component that renders a table showing staff/teacher data by status and gender.
 * Calculates totals dynamically and displays them in a summary row.
 * @param {RecapTableProps} props - The component props.
 */
const RecapTable: React.FC<RecapTableProps> = ({
  title,
  tahunAjaran,
  data,
  totalLabel,
}) => {
  const totalMale = data.reduce((sum, row) => sum + row.male, 0);
  const totalFemale = data.reduce((sum, row) => sum + row.female, 0);
  const total = totalMale + totalFemale;

  return (
    <div className="mb-12">
      <div className="flex justify-between items-center mb-4">
        <h2
          id="page-heading"
          className="text-2xl font-bold text-gray-900 dark:text-gray-100"
        >
          {title}
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Tahun Pelajaran {tahunAjaran}
        </p>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full border-collapse border border-gray-300 dark:border-gray-600">
          <caption className="sr-only">{title}</caption>
          <thead>
            <tr className="bg-gray-100 dark:bg-gray-700">
              <th
                className="border border-gray-300 dark:border-gray-600 px-4 py-2 text-left text-gray-800 dark:text-gray-200"
                scope="col"
              >
                Status
              </th>
              <th
                className="border border-gray-300 dark:border-gray-600 px-4 py-2 text-center text-gray-800 dark:text-gray-200"
                scope="col"
                aria-label="Male count"
              >
                L
              </th>
              <th
                className="border border-gray-300 dark:border-gray-600 px-4 py-2 text-center text-gray-800 dark:text-gray-200"
                scope="col"
                aria-label="Female count"
              >
                P
              </th>
            </tr>
          </thead>
          <tbody>
            {data.map((row, index) => (
              <tr
                key={`${title.toLowerCase().replace(/\s+/g, "-")}-${index}`}
                className={
                  index % 2 === 0
                    ? "bg-white dark:bg-gray-800"
                    : "bg-gray-50 dark:bg-gray-900"
                }
              >
                <td className="border border-gray-300 dark:border-gray-600 px-4 py-2 font-medium">
                  {row.status}
                </td>
                <td className="border border-gray-300 dark:border-gray-600 px-4 py-2 text-center">
                  {row.male}
                </td>
                <td className="border border-gray-300 dark:border-gray-600 px-4 py-2 text-center">
                  {row.female}
                </td>
              </tr>
            ))}
            <tr className="font-bold bg-blue-50 dark:bg-blue-900/30">
              <td className="border border-gray-300 dark:border-gray-600 px-4 py-3">
                {totalLabel}
              </td>
              <td
                className="border border-gray-300 dark:border-gray-600 px-4 py-3 text-center"
                colSpan={2}
              >
                {total}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};
/**
 * Component that renders a detailed table of all teachers and staff.
 * @param {object} props - The component props.
 * @param {Tendik[]} props.data - The array of teacher and staff data.
 */
const DetailTendikTable: React.FC<{ data: Tendik[] }> = ({ data }) => {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full border-collapse border border-gray-300 dark:border-gray-600">
        <thead>
          <tr className="bg-gray-100 dark:bg-gray-700">
            <th
              className="border border-gray-300 dark:border-gray-600 px-4 py-2 text-left text-gray-800 dark:text-gray-200"
              scope="col"
            >
              No
            </th>
            <th
              className="border border-gray-300 dark:border-gray-600 px-4 py-2 text-left text-gray-800 dark:text-gray-200"
              scope="col"
            >
              Nama
            </th>
            <th
              className="border border-gray-300 dark:border-gray-600 px-4 py-2 text-left text-gray-800 dark:text-gray-200"
              scope="col"
            >
              NIP
            </th>
            <th
              className="border border-gray-300 dark:border-gray-600 px-4 py-2 text-center text-gray-800 dark:text-gray-200"
              scope="col"
            >
              L/P
            </th>
            <th
              className="border border-gray-300 dark:border-gray-600 px-4 py-2 text-center text-gray-800 dark:text-gray-200"
              scope="col"
            >
              Status
            </th>
            <th
              className="border border-gray-300 dark:border-gray-600 px-4 py-2 text-left text-gray-800 dark:text-gray-200"
              scope="col"
            >
              Jabatan
            </th>
          </tr>
        </thead>
        <tbody>
          {data.map((item, index) => (
            <tr
              key={item.nip}
              className={
                index % 2 === 0
                  ? "bg-white dark:bg-gray-800"
                  : "bg-gray-50 dark:bg-gray-900"
              }
            >
              <td className="border border-gray-300 dark:border-gray-600 px-4 py-2 text-center">
                {item.no}
              </td>
              <td className="border border-gray-300 dark:border-gray-600 px-4 py-2">
                {item.nama}
              </td>
              <td className="border border-gray-300 dark:border-gray-600 px-4 py-2 font-mono text-xs">
                {item.nip}
              </td>
              <td className="border border-gray-300 dark:border-gray-600 px-4 py-2 text-center">
                {item.gender}
              </td>
              <td className="border border-gray-300 dark:border-gray-600 px-4 py-2 text-center">
                {item.status}
              </td>
              <td className="border border-gray-300 dark:border-gray-600 px-4 py-2">
                {item.jabatan}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

/**
 * Main page component that displays teacher and staff data in two separate tables.
 * Uses the RecapTable component to render the data for both teachers and staff.
 */
const GuruStafPage: React.FC = () => {
  return (
    <Layout>
      <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mx-2 text-center">
        Guru dan Staf
      </h1>
      <div className="container mx-auto px-4 sm:px-6 py-12 max-w-6xl fade-in">
        {" "}
        {/* Mengubah max-width agar lebih lebar */}
        <section className="mb-12" aria-labelledby="page-heading">
          <RecapTable
            title="Rekapitulasi Pengajar (Guru)"
            tahunAjaran="2025/2026"
            data={TEACHER_RECAP}
            totalLabel="TOTAL GURU"
          />
          <hr
            className="my-8 border-gray-300 dark:border-gray-600"
            aria-hidden="true"
          />
          <RecapTable
            title="Rekapitulasi Staf"
            tahunAjaran="2025/2026"
            data={STAFF_RECAP}
            totalLabel="TOTAL STAF"
          />
          <hr
            className="my-8 border-gray-300 dark:border-gray-600"
            aria-hidden="true"
          />

          {/* New Section Tendik*/}
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
              Daftar Guru dan Tenaga Kependidikan
            </h2>
            <DetailTendikTable data={ALL_TENDIK_DATA} />
          </div>
        </section>
      </div>
    </Layout>
  );
};

export default GuruStafPage;
