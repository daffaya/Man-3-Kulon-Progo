/**
 * @fileoverview PMBMPage — Landing page pendaftaran siswa baru (PMBM)
 * @module pages/layanan/PmbmPage
 */

import React, { useState, useCallback } from "react";
import { ClipboardList, ArrowRight } from "lucide-react";
import Layout from "../../components/layout/Layout";
import ImageZoomModal from "../../components/modals/ImageZoomModal";
import Accordion from "../../components/ui/Accordion";
import Section from "../../components/ui/Section";

import { PENDAFTARAN_DITUTUP, GELOMBANG_AKTIF } from "./pmbm/pmbmConfig";
import { FAQ_DATA, REGISTRATION_LINK } from "./pmbm/pmbmData";

// Child Components
import PmbmHero from "./pmbm/components/PmbmHero";
import PmbmJalurSection from "./pmbm/components/PmbmJalurSection";
import PmbmJadwalSection from "./pmbm/components/PmbmJadwalSection";
import PmbmSyaratSection from "./pmbm/components/PmbmSyaratSection";
import PmbmSopSection from "./pmbm/components/PmbmSopSection";
import PmbmAlurSection from "./pmbm/components/PmbmAlurSection";
import PmbmKontakSection from "./pmbm/components/PmbmKontakSection";
import PmbmFloatingCta from "./pmbm/components/PmbmFloatingCta";

const PmbmPage: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  const handleCloseModal = useCallback(() => setIsModalOpen(false), []);
  const handleOpenModal = useCallback(() => setIsModalOpen(true), []);

  return (
    <Layout>
      <PmbmFloatingCta />
      <PmbmHero />

      <PmbmJalurSection />

      <Section id="tentang" title="Tentang PMBM MAN 3 Kulon Progo" bg="semi">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-lg leading-relaxed text-secondary mb-6">
            MAN 3 Kulon Progo membuka Penerimaan Murid Baru Madrasah (PMBM)
            Tahun Ajaran 2026/2027 bagi putra-putri terbaik bangsa yang siap
            tumbuh menjadi generasi berilmu, berakhlak mulia, dan berdaya saing
            global.
          </p>
          <p className="text-lg leading-relaxed text-secondary">
            Pendaftaran dapat dilakukan dari mana saja melalui sistem online
            kami.{" "}
            <strong className="text-accent">
              Segera daftarkan diri dan jadilah bagian dari keluarga besar MAN 3
              Kulon Progo!
            </strong>
          </p>
        </div>
      </Section>

      <PmbmJadwalSection />
      <PmbmSyaratSection />

      {/* Komponen SOP dikirimi fungsi untuk membuka modal */}
      <PmbmSopSection onOpenModal={handleOpenModal} />

      <PmbmAlurSection />

      <Section id="faq" title="Pertanyaan Umum (FAQ)" bg="semi">
        <div className="max-w-4xl mx-auto">
          <Accordion data={FAQ_DATA} />
          <p className="text-center mt-6 text-secondary">
            Masih ada pertanyaan? Jangan ragu menghubungi tim PMBM kami.
          </p>
        </div>
      </Section>

      <PmbmKontakSection />

      {/* Final CTA */}
      <section className="py-16 bg-gradient-to-r from-accent/10 to-accent/5">
        <div className="container max-w-6xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="text-3xl md:text-5xl font-serif font-bold mb-4 text-foreground">
            {PENDAFTARAN_DITUTUP
              ? "Pantau Terus Informasi PMBM"
              : `Daftar Sekarang — Gelombang ${GELOMBANG_AKTIF}`}
          </h2>
          <p className="text-lg md:text-xl text-secondary mb-10 max-w-2xl mx-auto">
            {PENDAFTARAN_DITUTUP
              ? "Ikuti media sosial dan website kami untuk informasi terbaru."
              : "Jangan lewatkan kesempatan menjadi bagian dari MAN 3 Kulon Progo."}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href={REGISTRATION_LINK}
              className={`inline-flex items-center justify-center gap-2 font-semibold text-lg px-10 py-5 rounded-full transition-all duration-300 ${
                PENDAFTARAN_DITUTUP
                  ? "btn-secondary"
                  : "btn-primary shadow-lg hover:shadow-xl transform hover:-translate-y-1 group"
              }`}
            >
              {PENDAFTARAN_DITUTUP ? (
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
        src="/SOP_PMBM.png"
        alt="SOP PMBM MAN 3 Kulon Progo"
        isOpen={isModalOpen}
        onClose={handleCloseModal}
      />
    </Layout>
  );
};

export default PmbmPage;
