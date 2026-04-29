/**
 * @fileoverview SejarahPage — migrated to CMS.
 * Fetches content dynamically from site_contents (page: sejarah, section: content).
 */

import React from "react";
import Layout from "../../components/layout/Layout";
import { useCmsSection } from "../../hooks/useCmsPage";

interface SejarahContent {
  paragraphs: string[];
}

const FALLBACK: SejarahContent = {
  paragraphs: [
    "Sejarah berdirinya MAN 3 Kulon Progo tidak akan terlepas dari kondisi umat yang berada di wilayah Kulon Progo bagian utara, Kecamatan Nanggulan, Samigaluh dan Kalibawang merupakan home base bagi kaum non muslim, sehingga secara umum, pada daerah ini kaum non muslim relatif lebih banyak.",
    "Sebagai langkah antisipasi pada tahun 1984, Pengawas Pendidikan Islam di Kulon Progo Utara, Drs. Abdul Mukti bersama-sama dengan beberapa Tokoh dan Guru Agama Islam berniat mendirikan Madrasah Aliyah.",
    "Berdirilah Madrasah Aliyah Swasta (MAS) Kalibawang pada tahun 1984. Setahun kemudian, tahun 1985 berubah menjadi Madrasah Aliyah Filial MAN Wates 1 di Kalibawang.",
    "Melalui SK Menteri Agama No 515 A tahun 1995, MAN Kalibawang Filial MAN Wates I dinegerikan menjadi MAN I Kalibawang.",
    "Berdasarkan SK Kepala Kantor Wilayah Kemenag DIY No. 68 Tahun 2017, sejak 1 Februari 2017, madrasah berubah nama menjadi MAN 3 Kulon Progo.",
    "Saat ini MAN 3 Kulon Progo mendapat amanah untuk menjadi Madrasah Plus Keterampilan berwawasan lingkungan.",
    "Adapun Pengembangan Bidang Keagamaan kini MAN 3 Kulon Progo telah berhasil mendirikan Boarding Madrasah dengan Program Unggulan Tahfidz dan Kajian Kitab.",
  ],
};

const SejarahPage: React.FC = () => {
  const { data, loading } = useCmsSection<SejarahContent>("sejarah", "content");

  const paragraphs: string[] = data?.paragraphs ?? FALLBACK.paragraphs;

  return (
    <Layout>
      <div className="container mx-auto px-4 sm:px-6 py-12 max-w-4xl fade-in">
        <section className="mb-12 text-justify">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4 text-center">
            Sejarah Sekolah
          </h1>

          {loading ? (
            <div className="space-y-4">
              {[...Array(7)].map((_, i) => (
                <div key={i} className="space-y-2">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-5/6" />
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-4/6" />
                </div>
              ))}
            </div>
          ) : (
            paragraphs.map((paragraph, index) => (
              <p key={`history-${index}`} className="mb-4">
                {paragraph}
              </p>
            ))
          )}
        </section>
      </div>
    </Layout>
  );
};

export default SejarahPage;
