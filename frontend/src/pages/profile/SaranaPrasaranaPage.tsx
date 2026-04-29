/**
 * @fileoverview SaranaPrasaranaPage — migrated to CMS.
 * Fetches content from site_contents (page: sarana-prasarana, section: content).
 */

import React from "react";
import Layout from "../../components/layout/Layout";
import { useCmsSection } from "../../hooks/useCmsPage";

interface FacilityItem {
  type: string;
  availability: string;
  condition: string;
}

interface SaranaPrasaranaContent {
  facilities: FacilityItem[];
}

const FALLBACK: SaranaPrasaranaContent = {
  facilities: [
    { type: "Ruang kelas (14 ruang)", availability: "Ada", condition: "Baik" },
    {
      type: "Ruang perpustakaan (2 ruang)",
      availability: "Ada",
      condition: "Baik",
    },
    {
      type: "Ruang Laboratorium Biologi (2 ruang)",
      availability: "Ada",
      condition: "Baik",
    },
    {
      type: "Ruang Laboratorium Fisika",
      availability: "Ada",
      condition: "Baik",
    },
    {
      type: "Ruang Laboratorium Kimia",
      availability: "Ada",
      condition: "Baik",
    },
    {
      type: "Ruang Laboratorium Komputer (2 ruang)",
      availability: "Ada",
      condition: "Baik",
    },
    {
      type: "Ruang Laboratorium Bahasa",
      availability: "Ada",
      condition: "Baik",
    },
    {
      type: "Ruang Pimpinan (2 ruang)",
      availability: "Ada",
      condition: "Baik",
    },
    { type: "Ruang guru", availability: "Ada", condition: "Baik" },
    {
      type: "Ruang Tata Usaha, PTSP (2 ruang)",
      availability: "Ada",
      condition: "Baik",
    },
    { type: "Tempat ibadah / Masjid", availability: "Ada", condition: "Baik" },
    { type: "Ruang Konseling", availability: "Ada", condition: "Baik" },
    { type: "Ruang UKS", availability: "Ada", condition: "Baik" },
    { type: "Jamban (14 ruang)", availability: "Ada", condition: "Baik" },
    { type: "Gudang", availability: "Ada", condition: "Baik" },
    { type: "Ruang sirkulasi", availability: "Ada", condition: "Baik" },
    {
      type: "Tempat bermain / Olahraga (4)",
      availability: "Ada",
      condition: "Baik",
    },
    { type: "Kantin", availability: "Ada", condition: "Baik" },
    { type: "Ruang PTSP", availability: "Ada", condition: "Baik" },
    { type: "Parkir", availability: "Ada", condition: "Baik" },
    { type: "Ruang Komite", availability: "Ada", condition: "Baik" },
    { type: "Tempat wudlu", availability: "Ada", condition: "Baik" },
    {
      type: "Akses Internet Hotspot Area",
      availability: "Ada",
      condition: "Baik",
    },
    { type: "Mobil Dinas", availability: "Ada", condition: "Baik" },
    {
      type: "Washtafel luar ruangan / untuk cuci tangan",
      availability: "Ada",
      condition: "Baik",
    },
  ],
};

const SaranaPrasaranaPage: React.FC = () => {
  const { data, loading } = useCmsSection<SaranaPrasaranaContent>(
    "sarana-prasarana",
    "content",
  );

  const facilities: FacilityItem[] = data?.facilities ?? FALLBACK.facilities;

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
                  <th className="border border-gray-300 dark:border-gray-600 px-4 py-2 text-center text-gray-800 dark:text-gray-200">
                    No
                  </th>
                  <th className="border border-gray-300 dark:border-gray-600 px-4 py-2 text-left text-gray-800 dark:text-gray-200">
                    Jenis Prasarana
                  </th>
                  <th className="border border-gray-300 dark:border-gray-600 px-4 py-2 text-center text-gray-800 dark:text-gray-200">
                    Ketersediaan
                  </th>
                  <th className="border border-gray-300 dark:border-gray-600 px-4 py-2 text-center text-gray-800 dark:text-gray-200">
                    Kondisi
                  </th>
                </tr>
              </thead>
              <tbody>
                {loading
                  ? [...Array(10)].map((_, i) => (
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
                  : facilities.map((facility, index) => (
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
