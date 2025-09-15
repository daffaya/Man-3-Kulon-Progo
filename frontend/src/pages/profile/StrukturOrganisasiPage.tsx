import React from "react";
import Layout from "../../components/layout/Layout";

const ORGANIZATION_STRUCTURE = [
  {
    position: "Kepala Madrasah",
    details: [
      { label: "Nama", value: "Nurhayanti, S.Pd., M.Sc." },
      { label: "Pangkat Golongan", value: "Pembina, VI/a" },
      { label: "Pendidikan Terakhir", value: "S2" },
    ],
  },
  {
    position: "Kepala Tata Usaha",
    details: [
      { label: "Nama", value: "Yudhi Santosa, S.Pd" },
      { label: "Pangkat Golongan", value: "Penata Tk. I, III/d" },
      { label: "Pendidikan Terakhir", value: "S1" },
    ],
  },
];

const StrukturOrganisasiPage: React.FC = () => {
  return (
    <Layout>
      <div className="container mx-auto px-4 sm:px-6 py-12 max-w-4xl fade-in">
        <section className="mb-12">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-8 text-center">
            Struktur Organisasi
          </h1>
          {ORGANIZATION_STRUCTURE.map((role, index) => (
            <div
              key={`role-${index}`}
              className={`mb-8 ${
                index > 0
                  ? "border-t pt-6 border-gray-300 dark:border-gray-600"
                  : ""
              }`}
            >
              <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-4">
                {role.position}
              </h2>
              <ul>
                {role.details.map((detail, detailIndex) => (
                  <li key={`detail-${index}-${detailIndex}`} className="mb-2">
                    <span className="font-medium">{detail.label}:</span>{" "}
                    {detail.value}
                  </li>
                ))}
              </ul>
            </div>
          ))}

          <img src="/strukturorganisasi.jpg" alt="Tabel Struktur Organisasi" />
        </section>
      </div>
    </Layout>
  );
};

export default StrukturOrganisasiPage;
