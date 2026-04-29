/**
 * @fileoverview KepalaMadrasahPage — migrated to CMS.
 * Fetches periodisasi data from site_contents (page: kepala-madrasah, section: content).
 */

import React from "react";
import Layout from "../../components/layout/Layout";
import { useCmsSection } from "../../hooks/useCmsPage";

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────

interface PeriodisasiItem {
  tahun: string;
  nama_madrasah: string;
  kepala: string;
  kepala_tu: string;
}

interface KepalaMadrasahContent {
  periodisasi: PeriodisasiItem[];
}

// ─────────────────────────────────────────────
// Fallback
// ─────────────────────────────────────────────

const FALLBACK: KepalaMadrasahContent = {
  periodisasi: [
    {
      tahun: "1985 s.d 1987",
      nama_madrasah: "MAS Kalibawang",
      kepala: "Drs. Muzilanto",
      kepala_tu: "-",
    },
    {
      tahun: "1987 s.d 1995",
      nama_madrasah: "MAN Kalibawang Filial MAN Wates I",
      kepala: "Drs. Muzilanto",
      kepala_tu: "-",
    },
    {
      tahun: "1995 s.d 2002",
      nama_madrasah: "MAN I Kalibawang",
      kepala: "Drs. Muzilanto",
      kepala_tu: "Sulit Zamhari (1996 s.d. 1999)",
    },
    {
      tahun: "2002 s.d 2008",
      nama_madrasah: "MAN I Kalibawang",
      kepala: "Drs. Jazim",
      kepala_tu: "Sudiyono (1999 s.d. 2007)",
    },
    {
      tahun: "2008 s.d 2011",
      nama_madrasah: "MAN I Kalibawang",
      kepala: "Drs. H. Ahmad Dahlan, M.A.",
      kepala_tu: "Legiman (2007 s.d. 2009); Kiran (2009 s.d. 2011)",
    },
    {
      tahun: "2011 s.d 2014",
      nama_madrasah: "MAN I Kalibawang",
      kepala: "Drs. H. Suharyanto, M.A.",
      kepala_tu: "Sugeng Riyanto, S.Sos.",
    },
    {
      tahun: "2014 s.d 2017",
      nama_madrasah: "MAN I Kalibawang",
      kepala: "Drs. H. Mardi Santosa",
      kepala_tu: "H. Agus Widodo, S.H., M.A.",
    },
    {
      tahun: "2017 s.d 2019",
      nama_madrasah: "MAN 3 Kulon Progo",
      kepala: "Drs. H. Soir, MSI",
      kepala_tu: "H. Agus Widodo, S.H., M.A.",
    },
    {
      tahun: "2020 s.d 2023",
      nama_madrasah: "MAN 3 Kulon Progo",
      kepala: "Moh. Fadil Afif, Lc",
      kepala_tu: "H. Agus Widodo, S.H., M.A.; H. Sarna, S.Pd.I",
    },
    {
      tahun: "2023 s.d ....",
      nama_madrasah: "MAN 3 Kulon Progo",
      kepala: "Syaefulani, S.Ag., M.Pd",
      kepala_tu: "H. Sarna, S.Pd.I (2019 s.d. 2023); Yudhi Santosa, S.Pd.",
    },
  ],
};

// ─────────────────────────────────────────────
// Page
// ─────────────────────────────────────────────

const KepalaMadrasahPage: React.FC = () => {
  const { data, loading } = useCmsSection<KepalaMadrasahContent>(
    "kepala-madrasah",
    "content",
  );

  const periodisasi: PeriodisasiItem[] =
    data?.periodisasi ?? FALLBACK.periodisasi;

  return (
    <Layout>
      <div className="container mx-auto px-4 sm:px-6 py-12 max-w-5xl fade-in">
        <section className="mb-12">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2 text-center">
            Kepala Madrasah
          </h1>
          <p className="text-center text-gray-600 dark:text-gray-400 mb-8">
            Periodisasi Pimpinan MAN 3 Kulon Progo
          </p>

          <div className="overflow-x-auto">
            <table className="min-w-full border-collapse border border-gray-300 dark:border-gray-600">
              <thead>
                <tr className="bg-gray-100 dark:bg-gray-700">
                  <th className="border border-gray-300 dark:border-gray-600 px-4 py-2 text-left text-gray-800 dark:text-gray-200">
                    Tahun
                  </th>
                  <th className="border border-gray-300 dark:border-gray-600 px-4 py-2 text-left text-gray-800 dark:text-gray-200">
                    Nama Madrasah
                  </th>
                  <th className="border border-gray-300 dark:border-gray-600 px-4 py-2 text-left text-gray-800 dark:text-gray-200">
                    Kepala Madrasah
                  </th>
                  <th className="border border-gray-300 dark:border-gray-600 px-4 py-2 text-left text-gray-800 dark:text-gray-200">
                    Kepala Tata Usaha
                  </th>
                </tr>
              </thead>
              <tbody>
                {loading
                  ? // Skeleton rows
                    [...Array(10)].map((_, i) => (
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
                  : periodisasi.map((item, index) => (
                      <tr
                        key={index}
                        className={
                          index % 2 === 0
                            ? "bg-white dark:bg-gray-800"
                            : "bg-gray-50 dark:bg-gray-900"
                        }
                      >
                        <td className="border border-gray-300 dark:border-gray-600 px-4 py-2 whitespace-nowrap">
                          {item.tahun}
                        </td>
                        <td className="border border-gray-300 dark:border-gray-600 px-4 py-2">
                          {item.nama_madrasah}
                        </td>
                        <td className="border border-gray-300 dark:border-gray-600 px-4 py-2">
                          {item.kepala}
                        </td>
                        <td className="border border-gray-300 dark:border-gray-600 px-4 py-2">
                          {item.kepala_tu}
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

export default KepalaMadrasahPage;
