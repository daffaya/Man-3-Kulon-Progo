/**
 * @fileoverview SiswaPage — migrated to CMS.
 * Fetches content from site_contents (page: siswa, section: content).
 */

import React from "react";
import Layout from "../../components/layout/Layout";
import { useCmsSection } from "../../hooks/useCmsPage";

interface StudentRow {
  status: string;
  male: number;
  female: number;
}

interface SiswaContent {
  tahun_ajaran: string;
  data: StudentRow[];
}

const FALLBACK: SiswaContent = {
  tahun_ajaran: "2025/2026",
  data: [
    { status: "Kelas X", male: 132, female: 263 },
    { status: "Kelas XI", male: 134, female: 189 },
    { status: "Kelas XII", male: 122, female: 221 },
  ],
};

const SiswaPage: React.FC = () => {
  const { data, loading } = useCmsSection<SiswaContent>("siswa", "content");

  const tahun_ajaran = data?.tahun_ajaran ?? FALLBACK.tahun_ajaran;
  const rows: StudentRow[] = data?.data ?? FALLBACK.data;

  const totalMale = rows.reduce((sum, row) => sum + Number(row.male), 0);
  const totalFemale = rows.reduce((sum, row) => sum + Number(row.female), 0);
  const total = totalMale + totalFemale;

  return (
    <Layout>
      <div className="container mx-auto px-4 sm:px-6 py-12 max-w-4xl fade-in">
        <section className="mb-12" aria-labelledby="page-heading">
          <h1
            id="page-heading"
            className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-8 text-center"
          >
            Peserta Didik
          </h1>

          <div className="mb-12">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                Rekapitulasi Peserta Didik
              </h2>
              {!loading && (
                <p className="text-gray-600 dark:text-gray-400">
                  Tahun Pelajaran {tahun_ajaran}
                </p>
              )}
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full border-collapse border border-gray-300 dark:border-gray-600">
                <thead>
                  <tr className="bg-gray-100 dark:bg-gray-700">
                    <th className="border border-gray-300 dark:border-gray-600 px-4 py-2 text-left text-gray-800 dark:text-gray-200">
                      Kelas
                    </th>
                    <th
                      className="border border-gray-300 dark:border-gray-600 px-4 py-2 text-center text-gray-800 dark:text-gray-200"
                      aria-label="Laki-laki"
                    >
                      L
                    </th>
                    <th
                      className="border border-gray-300 dark:border-gray-600 px-4 py-2 text-center text-gray-800 dark:text-gray-200"
                      aria-label="Perempuan"
                    >
                      P
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    [...Array(3)].map((_, i) => (
                      <tr key={i}>
                        {[...Array(3)].map((_, j) => (
                          <td
                            key={j}
                            className="border border-gray-300 dark:border-gray-600 px-4 py-2"
                          >
                            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                          </td>
                        ))}
                      </tr>
                    ))
                  ) : (
                    <>
                      {rows.map((row, index) => (
                        <tr
                          key={index}
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
                          TOTAL PESERTA DIDIK
                        </td>
                        <td
                          className="border border-gray-300 dark:border-gray-600 px-4 py-3 text-center"
                          colSpan={2}
                        >
                          {total}
                        </td>
                      </tr>
                    </>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      </div>
    </Layout>
  );
};

export default SiswaPage;
