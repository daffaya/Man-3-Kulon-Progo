// src/pages/layanan/PmbmPage.tsx

/**
 * @fileoverview PmbmPage — migrated to CMS.
 * Orchestrates all PMBM data fetching and passes to child components via props.
 * No child component imports directly from pmbmConfig or pmbmData anymore.
 */

import React, { useState, useCallback } from "react";
import { ClipboardList, ArrowRight } from "lucide-react";
import Layout from "../../components/layout/Layout";
import ImageZoomModal from "../../components/modals/ImageZoomModal";
import Accordion from "../../components/ui/Accordion";
import Section from "../../components/ui/Section";

import { usePmbmConfig } from "./pmbm/usePmbmConfig";
import { useCmsPage } from "../../hooks/useCmsPage";

// Child Components
import PmbmHero from "./pmbm/components/PmbmHero";
import PmbmJalurSection from "./pmbm/components/PmbmJalurSection";
import PmbmJadwalSection from "./pmbm/components/PmbmJadwalSection";
import PmbmSyaratSection from "./pmbm/components/PmbmSyaratSection";
import PmbmSopSection from "./pmbm/components/PmbmSopSection";
import PmbmAlurSection from "./pmbm/components/PmbmAlurSection";
import PmbmKontakSection from "./pmbm/components/PmbmKontakSection";
import PmbmFloatingCta from "./pmbm/components/PmbmFloatingCta";

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────

interface FaqItem {
  question: string;
  answer: string;
}

interface PmbmCmsData {
  tentang: { description: string; description2: string; cta_bold: string };
  jalur_g1: { items: { nama: string; deskripsi: string; syarat: string[] }[] };
  jalur_g2: { deskripsi: string; syarat: string[] };
  jadwal_g1: { items: { label: string; value: string }[] };
  jadwal_g2: { items: { label: string; value: string }[] };
  alur_g1: { items: { nomor: number; judul: string; deskripsi: string }[] };
  alur_g2: { items: { nomor: number; judul: string; deskripsi: string }[] };
  syarat_umum: { items: string[] };
  data_siswa: { items: string[] };
  data_ortu: { items: string[] };
  dokumen_prestasi: { items: string[] };
  sop: { image_url: string };
  faq: { items: FaqItem[] };
  kontak: {
    email: string;
    contacts: { nama: string; wa: string; display: string }[];
  };
}

// ─────────────────────────────────────────────
// Fallback FAQ
// ─────────────────────────────────────────────

const FALLBACK_FAQ: FaqItem[] = [
  {
    question: "Ada berapa gelombang pendaftaran?",
    answer: "PMBM MAN 3 Kulon Progo TA 2026/2027 membuka dua gelombang.",
  },
  {
    question: "Bagaimana cara mengecek status pendaftaran?",
    answer:
      "Kamu bisa cek status pendaftaran secara online melalui halaman Status Pendaftaran di website ini.",
  },
];

// ─────────────────────────────────────────────
// Page
// ─────────────────────────────────────────────

const PmbmPage: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const handleCloseModal = useCallback(() => setIsModalOpen(false), []);
  const handleOpenModal = useCallback(() => setIsModalOpen(true), []);

  // Config dari CMS — gelombang, batas tanggal, PENDAFTARAN_DITUTUP
  const { config, loading: configLoading } = usePmbmConfig();

  // Semua konten dari CMS dalam 1 request
  const { data, loading: dataLoading } = useCmsPage<PmbmCmsData>("pmbm");

  const loading = configLoading || dataLoading;

  // Extract data dengan fallback aman
  const tentang = data?.tentang;
  const jalurG1 = data?.jalur_g1?.items ?? [];
  const jalurG2 = data?.jalur_g2 ?? { deskripsi: "", syarat: [] };
  const jadwalG1 = data?.jadwal_g1?.items ?? [];
  const jadwalG2 = data?.jadwal_g2?.items ?? [];
  const alurG1 = data?.alur_g1?.items ?? [];
  const alurG2 = data?.alur_g2?.items ?? [];
  const syaratUmum = data?.syarat_umum?.items ?? [];
  const sopImage = data?.sop?.image_url ?? "/SOP_PMBM.png";
  const faqItems = data?.faq?.items ?? FALLBACK_FAQ;
  const kontak = data?.kontak ?? { email: "", contacts: [] };

  return (
    <Layout>
      <PmbmFloatingCta config={config} />
      <PmbmHero config={config} />

      <PmbmJalurSection config={config} jalurG1={jalurG1} jalurG2={jalurG2} />

      {/* Tentang */}
      <Section id="tentang" title="Tentang PMBM MAN 3 Kulon Progo" bg="semi">
        <div className="max-w-4xl mx-auto text-center">
          {loading ? (
            <div className="space-y-3">
              <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
              <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-4/5 mx-auto" />
            </div>
          ) : (
            <>
              <p className="text-lg leading-relaxed text-secondary mb-6">
                {tentang?.description ??
                  "MAN 3 Kulon Progo membuka Penerimaan Murid Baru Madrasah (PMBM) Tahun Ajaran 2026/2027."}
              </p>
              <p className="text-lg leading-relaxed text-secondary">
                {tentang?.description2 ??
                  "Pendaftaran dapat dilakukan dari mana saja melalui sistem online kami."}{" "}
                <strong className="text-accent">
                  {tentang?.cta_bold ??
                    "Segera daftarkan diri dan jadilah bagian dari keluarga besar MAN 3 Kulon Progo!"}
                </strong>
              </p>
            </>
          )}
        </div>
      </Section>

      <PmbmJadwalSection
        config={config}
        jadwalG1={jadwalG1}
        jadwalG2={jadwalG2}
      />

      <PmbmSyaratSection
        syaratUmum={data?.syarat_umum?.items ?? []}
        dataSiswa={data?.data_siswa?.items ?? []}
        dataOrtu={data?.data_ortu?.items ?? []}
        dokumenPrestasi={data?.dokumen_prestasi?.items ?? []}
      />

      <PmbmSopSection imageUrl={sopImage} onOpenModal={handleOpenModal} />

      <PmbmAlurSection config={config} alurG1={alurG1} alurG2={alurG2} />

      {/* FAQ */}
      <Section id="faq" title="Pertanyaan Umum (FAQ)" bg="semi">
        <div className="max-w-4xl mx-auto">
          {loading ? (
            <div className="space-y-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="card p-6">
                  <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-3/4" />
                </div>
              ))}
            </div>
          ) : (
            <>
              <Accordion data={faqItems} />
              <p className="text-center mt-6 text-secondary">
                Masih ada pertanyaan? Jangan ragu menghubungi tim PMBM kami.
              </p>
            </>
          )}
        </div>
      </Section>

      <PmbmKontakSection email={kontak.email} contacts={kontak.contacts} />

      {/* Final CTA */}
      <section className="py-16 bg-gradient-to-r from-accent/10 to-accent/5">
        <div className="container max-w-6xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="text-3xl md:text-5xl font-serif font-bold mb-4 text-foreground">
            {config.PENDAFTARAN_DITUTUP
              ? "Pantau Terus Informasi PMBM"
              : `Daftar Sekarang — Gelombang ${config.GELOMBANG_AKTIF}`}
          </h2>
          <p className="text-lg md:text-xl text-secondary mb-10 max-w-2xl mx-auto">
            {config.PENDAFTARAN_DITUTUP
              ? "Ikuti media sosial dan website kami untuk informasi terbaru."
              : "Jangan lewatkan kesempatan menjadi bagian dari MAN 3 Kulon Progo."}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href={config.REGISTRATION_LINK}
              className={`inline-flex items-center justify-center gap-2 font-semibold text-lg px-10 py-5 rounded-full transition-all duration-300 ${
                config.PENDAFTARAN_DITUTUP
                  ? "btn-secondary"
                  : "btn-primary shadow-lg hover:shadow-xl transform hover:-translate-y-1 group"
              }`}
            >
              {config.PENDAFTARAN_DITUTUP ? (
                "Lihat Info Pendaftaran"
              ) : (
                <>
                  Daftar Sekarang{" "}
                  <ArrowRight
                    size={20}
                    className="group-hover:translate-x-1 transition-transform"
                  />
                </>
              )}
            </a>
            <a
              href="/layanan/pmbm/status"
              className="inline-flex items-center justify-center gap-3 btn-secondary font-semibold text-lg px-10 py-5 rounded-full transition-all duration-300"
            >
              <ClipboardList size={22} />
              Cek Status Pendaftaran
            </a>
          </div>
        </div>
      </section>

      <ImageZoomModal
        src={sopImage}
        alt="SOP PMBM MAN 3 Kulon Progo"
        isOpen={isModalOpen}
        onClose={handleCloseModal}
      />
    </Layout>
  );
};

export default PmbmPage;
