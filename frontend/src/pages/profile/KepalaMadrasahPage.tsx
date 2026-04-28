/**
 * @fileoverview KepalaMadrasahPage component for displaying the periodization
 * of MAN 3 Kulon Progo leadership.
 */

import React from "react";
import Layout from "../../components/layout/Layout";

interface PeriodisasiItem {
  tahun: string;
  namaMadrasah: string;
  kepala: string;
  kepalaTU: string;
}

const PERIODISASI: PeriodisasiItem[] = [
  {
    tahun: "1985 s.d 1987",
    namaMadrasah: "MAS Kalibawang",
    kepala: "Drs. Muzilanto",
    kepalaTU: "-",
  },
  {
    tahun: "1987 s.d 1995",
    namaMadrasah: "MAN Kalibawang Filial MAN Wates I",
    kepala: "Drs. Muzilanto",
    kepalaTU: "-",
  },
  {
    tahun: "1995 s.d 2002",
    namaMadrasah: "MAN I Kalibawang",
    kepala: "Drs. Muzilanto",
    kepalaTU: "Sulit Zamhari (1996 s.d. 1999)",
  },
  {
    tahun: "2002 s.d 2008",
    namaMadrasah: "MAN I Kalibawang",
    kepala: "Drs. Jazim",
    kepalaTU: "Sudiyono (1999 s.d. 2007)",
  },
  {
    tahun: "2008 s.d 2011",
    namaMadrasah: "MAN I Kalibawang",
    kepala: "Drs. H. Ahmad Dahlan, M.A.",
    kepalaTU: "Legiman (2007 s.d. 2009); Kiran (2009 s.d. 2011)",
  },
  {
    tahun: "2011 s.d 2014",
    namaMadrasah: "MAN I Kalibawang",
    kepala: "Drs. H. Suharyanto, M.A.",
    kepalaTU: "Sugeng Riyanto, S.Sos.",
  },
  {
    tahun: "2014 s.d 2017",
    namaMadrasah: "MAN I Kalibawang",
    kepala: "Drs. H. Mardi Santosa",
    kepalaTU: "H. Agus Widodo, S.H., M.A.",
  },
  {
    tahun: "2017 s.d 2019",
    namaMadrasah: "MAN 3 Kulon Progo",
    kepala: "Drs. H. Soir, MSI",
    kepalaTU: "H. Agus Widodo, S.H., M.A.",
  },
  {
    tahun: "2020 s.d 2023",
    namaMadrasah: "MAN 3 Kulon Progo",
    kepala: "Moh. Fadil Afif, Lc",
    kepalaTU: "H. Agus Widodo, S.H., M.A.; H. Sarna, S.Pd.I",
  },
  {
    tahun: "2023 s.d ....",
    namaMadrasah: "MAN 3 Kulon Progo",
    kepala: "Syaefulani, S.Ag., M.Pd",
    kepalaTU: "H. Sarna, S.Pd.I (2019 s.d. 2023); Yudhi Santosa, S.Pd.",
  },
];

const KepalaMadrasahPage: React.FC = () => {
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
                {PERIODISASI.map((item, index) => (
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
                      {item.namaMadrasah}
                    </td>
                    <td className="border border-gray-300 dark:border-gray-600 px-4 py-2">
                      {item.kepala}
                    </td>
                    <td className="border border-gray-300 dark:border-gray-600 px-4 py-2">
                      {item.kepalaTU}
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
