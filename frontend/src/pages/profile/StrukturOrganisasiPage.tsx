/**
 * @fileoverview StrukturOrganisasiPage — migrated to CMS.
 * Fetches content from site_contents (page: struktur-organisasi, section: content).
 */

import React from "react";
import Layout from "../../components/layout/Layout";
import { useCmsSection } from "../../hooks/useCmsPage";

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────

interface PositionDetail {
  label: string;
  value: string;
}

interface OrganizationPosition {
  title: string;
  details: PositionDetail[];
}

interface StrukturContent {
  image_url: string;
  positions: OrganizationPosition[];
}

// ─────────────────────────────────────────────
// Fallback
// ─────────────────────────────────────────────

const FALLBACK: StrukturContent = {
  image_url: "/strukturorganisasi.jpg",
  positions: [
    {
      title: "Kepala Madrasah",
      details: [
        { label: "Nama", value: "Syaefulani, S.Ag., M.Pd" },
        { label: "Pangkat Golongan", value: "Pembina, IV/a" },
        { label: "Pendidikan Terakhir", value: "S2" },
      ],
    },
    {
      title: "Kepala Tata Usaha",
      details: [
        { label: "Nama", value: "Yudhi Santosa, S.Pd" },
        { label: "Pangkat Golongan", value: "Penata Tk. I, III/d" },
        { label: "Pendidikan Terakhir", value: "S1" },
      ],
    },
  ],
};

// ─────────────────────────────────────────────
// Page
// ─────────────────────────────────────────────

const StrukturOrganisasiPage: React.FC = () => {
  const { data, loading } = useCmsSection<StrukturContent>(
    "struktur-organisasi",
    "content",
  );

  const image_url = data?.image_url ?? FALLBACK.image_url;
  const positions: OrganizationPosition[] =
    data?.positions ?? FALLBACK.positions;

  return (
    <Layout>
      <div className="container mx-auto px-4 sm:px-6 py-12 max-w-4xl fade-in">
        <section className="mb-12">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-8 text-center">
            Struktur Organisasi
          </h1>

          {loading ? (
            <div className="space-y-8">
              {[...Array(2)].map((_, i) => (
                <div key={i} className="space-y-2">
                  <div className="h-6 w-48 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                  {[...Array(3)].map((_, j) => (
                    <div
                      key={j}
                      className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-3/4"
                    />
                  ))}
                </div>
              ))}
            </div>
          ) : (
            <>
              {positions.map((role, index) => (
                <div
                  key={`role-${index}`}
                  className={`mb-8 ${
                    index > 0
                      ? "border-t pt-6 border-gray-300 dark:border-gray-600"
                      : ""
                  }`}
                >
                  <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-4">
                    {role.title}
                  </h2>
                  <ul>
                    {(role.details ?? []).map((detail, detailIndex) => (
                      <li
                        key={`detail-${index}-${detailIndex}`}
                        className="mb-2"
                      >
                        <span className="font-medium">{detail.label}:</span>{" "}
                        {detail.value}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}

              <img
                src={image_url}
                alt="Tabel Struktur Organisasi"
                className="w-full h-auto mt-4"
              />
            </>
          )}
        </section>
      </div>
    </Layout>
  );
};

export default StrukturOrganisasiPage;
