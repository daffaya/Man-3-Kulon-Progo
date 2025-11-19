/**
 * @fileoverview SaranaPrasaranaPage component for displaying facilities and infrastructure information.
 * This component renders a table showing the availability and condition of various facilities
 * at MAN 3 Kulon Progo, including classrooms, laboratories, and other facilities.
 */

import React from "react";
import Layout from "../../components/layout/Layout";

/**
 * Interface defining the structure for facility data.
 * @interface
 */
interface FacilityData {
  no: number;
  type: string;
  availability: string;
  condition: string;
}

/**
 * Constant array containing facility data with their details.
 */
const FACILITY_LIST: FacilityData[] = [
  {
    no: 1,
    type: "Ruang kelas (14 ruang)",
    availability: "Ada",
    condition: "Baik",
  },
  {
    no: 2,
    type: "Ruang perpustakaan (2 ruang)",
    availability: "Ada",
    condition: "Baik",
  },
  {
    no: 3,
    type: "Ruang Laboratorium Biologi (2 ruang)",
    availability: "Ada",
    condition: "Baik",
  },
  {
    no: 4,
    type: "Ruang Laboratorium Fisika",
    availability: "Ada",
    condition: "Baik",
  },
  {
    no: 5,
    type: "Ruang Laboratorium Kimia",
    availability: "Ada",
    condition: "Baik",
  },
  {
    no: 6,
    type: "Ruang Laboratorium Komputer (2 ruang)",
    availability: "Ada",
    condition: "Baik",
  },
  {
    no: 7,
    type: "Ruang Laboratorium Bahasa",
    availability: "Ada",
    condition: "Baik",
  },
  {
    no: 8,
    type: "Ruang Pimpinan (2 ruang)",
    availability: "Ada",
    condition: "Baik",
  },
  { no: 9, type: "Ruang guru", availability: "Ada", condition: "Baik" },
  {
    no: 10,
    type: "Ruang Tata Usaha, PTSP (2 ruang)",
    availability: "Ada",
    condition: "Baik",
  },
  {
    no: 11,
    type: "Tempat ibadah / Masjid",
    availability: "Ada",
    condition: "Baik",
  },
  { no: 12, type: "Ruang Konseling", availability: "Ada", condition: "Baik" },
  { no: 13, type: "Ruang UKS", availability: "Ada", condition: "Baik" },
  { no: 14, type: "Jamban (14 ruang)", availability: "Ada", condition: "Baik" },
  { no: 15, type: "Gudang", availability: "Ada", condition: "Baik" },
  { no: 16, type: "Ruang sirkulasi", availability: "Ada", condition: "Baik" },
  {
    no: 17,
    type: "Tempat bermain / Olahraga (4)",
    availability: "Ada",
    condition: "Baik",
  },
  { no: 18, type: "Kantin", availability: "Ada", condition: "Baik" },
  { no: 19, type: "Ruang PTSP", availability: "Ada", condition: "Baik" },
  { no: 20, type: "Parkir", availability: "Ada", condition: "Baik" },
  { no: 21, type: "Ruang Komite", availability: "Ada", condition: "Baik" },
  { no: 22, type: "Tempat wudlu", availability: "Ada", condition: "Baik" },
  {
    no: 23,
    type: "Akses Internet Hotspot Area",
    availability: "Ada",
    condition: "Baik",
  },
  { no: 24, type: "Mobil Dinas", availability: "Ada", condition: "Baik" },
  {
    no: 25,
    type: "Washtafel luar ruangan / untuk cuci tangan",
    availability: "Ada",
    condition: "Baik",
  },
];

/**
 * Component that displays a table of facilities and infrastructure at MAN 3 Kulon Progo.
 * Renders a responsive table with facility details including type, availability, and condition.
 */
const SaranaPrasaranaPage: React.FC = () => {
  return (
    <Layout>
      <div className="container mx-auto px-4 sm:px-6 py-12 max-w-5xl fade-in">
        <section className="mb-12">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-8 text-center">
            Sarana dan Prasarana MAN 3 Kulon Progo
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
                    className="border border-gray-300 dark:border-gray-600 px-4 py-2 text-left text-gray-800 dark:text-gray-200"
                    scope="col"
                  >
                    Jenis Prasarana
                  </th>
                  <th
                    className="border border-gray-300 dark:border-gray-600 px-4 py-2 text-center text-gray-800 dark:text-gray-200"
                    scope="col"
                  >
                    Ketersediaan
                  </th>
                  <th
                    className="border border-gray-300 dark:border-gray-600 px-4 py-2 text-center text-gray-800 dark:text-gray-200"
                    scope="col"
                  >
                    Kondisi
                  </th>
                </tr>
              </thead>
              <tbody>
                {FACILITY_LIST.map((facility, index) => (
                  <tr
                    key={`facility-${index}`}
                    className={
                      index % 2 === 0
                        ? "bg-white dark:bg-gray-800"
                        : "bg-gray-50 dark:bg-gray-900"
                    }
                  >
                    <td className="border border-gray-300 dark:border-gray-600 px-4 py-2 text-center">
                      {facility.no}
                    </td>
                    <td className="border border-gray-300 dark:border-gray-600 px-4 py-2">
                      {facility.type}
                    </td>
                    <td className="border border-gray-300 dark:border-gray-600 px-4 py-2 text-center">
                      {facility.availability}
                    </td>
                    <td className="border border-gray-300 dark:border-gray-600 px-4 py-2 text-center">
                      {facility.condition}
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

export default SaranaPrasaranaPage;
