/**
 * @fileoverview ProgramKerjaPage — migrated to CMS.
 * Fetches content from site_contents (page: program-kerja, section: content).
 */

import React from "react";
import Layout from "../../components/layout/Layout";
import { useCmsSection } from "../../hooks/useCmsPage";

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────

interface ProgramSection {
  title: string;
  items: string[];
}

interface ProgramKerjaContent {
  tahun_ajaran: string;
  sections: ProgramSection[];
}

// ─────────────────────────────────────────────
// Fallback
// ─────────────────────────────────────────────

const FALLBACK: ProgramKerjaContent = {
  tahun_ajaran: "2024/2025",
  sections: [
    {
      title: "Kegiatan Awal Tahun Pelajaran",
      items: ["Penerimaan Siswa Baru", "Kegiatan MATSAMA"],
    },
  ],
};

// ─────────────────────────────────────────────
// Page
// ─────────────────────────────────────────────

const ProgramKerjaPage: React.FC = () => {
  const { data, loading } = useCmsSection<ProgramKerjaContent>(
    "program-kerja",
    "content",
  );

  const tahun_ajaran = data?.tahun_ajaran ?? FALLBACK.tahun_ajaran;
  const sections: ProgramSection[] = data?.sections ?? FALLBACK.sections;

  return (
    <Layout>
      <div className="container mx-auto px-4 sm:px-6 py-12 max-w-4xl fade-in">
        <section className="mb-12">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2 text-center">
            Program Kerja MAN 3 Kulon Progo
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-8 text-center">
            Tahun Pelajaran {loading ? "..." : tahun_ajaran}
          </p>

          {loading ? (
            <div className="space-y-8">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="space-y-2">
                  <div className="h-6 w-64 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                  {[...Array(4)].map((_, j) => (
                    <div
                      key={j}
                      className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"
                      style={{ width: `${90 - j * 5}%` }}
                    />
                  ))}
                </div>
              ))}
            </div>
          ) : (
            sections.map((section, index) => (
              <div key={`section-${index}`} className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-2">
                  {section.title}
                </h2>
                <ul className="list-disc pl-6 space-y-2">
                  {(section.items ?? []).map((item, itemIndex) => (
                    <li
                      key={`item-${index}-${itemIndex}`}
                      className="text-gray-700 dark:text-gray-300"
                    >
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))
          )}
        </section>
      </div>
    </Layout>
  );
};

export default ProgramKerjaPage;
