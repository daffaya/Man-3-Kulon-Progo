// src/pages/layanan/pmbm/components/PmbmHero.tsx

import React, { useEffect, useRef, useState } from "react";
import { ArrowRight, ClipboardList, Info } from "lucide-react";
import type { PmbmConfig } from "../usePmbmConfig";

interface PmbmHeroProps {
  config: PmbmConfig;
}

const PmbmHero: React.FC<PmbmHeroProps> = ({ config }) => {
  const { PENDAFTARAN_DITUTUP, GELOMBANG_AKTIF, REGISTRATION_LINK } = config;

  const parallaxRef = useRef<HTMLDivElement>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (parallaxRef.current) {
        parallaxRef.current.style.transform = `translateY(${window.scrollY * 0.5}px)`;
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    setIsLoaded(true);

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <section
      className="relative h-screen w-full overflow-hidden flex items-center justify-center"
      aria-label="Hero PMBM"
    >
      <div
        ref={parallaxRef}
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url(/Hero.jpg)" }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-black/70" />
      </div>

      <div
        className={`relative z-10 container max-w-6xl mx-auto px-4 sm:px-6 text-center md:text-left transition-all duration-1000 ${
          isLoaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
        }`}
      >
        <div className="max-w-3xl mx-auto md:mx-0">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white mb-4 leading-tight">
            PMBM MAN 3 Kulon Progo
            <br />
            <span className="text-accent">TA 2026/2027</span>
          </h1>
          <p className="text-lg sm:text-xl text-white/90 mb-2 max-w-xl mx-auto md:mx-0">
            Penerimaan Murid Baru Madrasah secara online.
          </p>
          <p className="text-sm text-white/60 mb-8">
            {PENDAFTARAN_DITUTUP
              ? "Pendaftaran saat ini sedang ditutup."
              : `Gelombang ${GELOMBANG_AKTIF} sedang dibuka.`}
          </p>

          <div className="flex flex-col sm:flex-row flex-wrap gap-3">
            <a
              href={REGISTRATION_LINK}
              className={`inline-flex items-center justify-center gap-2 font-semibold text-lg px-8 py-4 rounded-full transition-all duration-300 ${
                PENDAFTARAN_DITUTUP
                  ? "btn-secondary"
                  : "btn-primary shadow-lg hover:shadow-xl transform hover:-translate-y-1 group"
              }`}
            >
              {PENDAFTARAN_DITUTUP ? (
                <>
                  <Info size={20} /> Lihat Info Pendaftaran
                </>
              ) : (
                <>
                  Daftar Sekarang — Gelombang {GELOMBANG_AKTIF}{" "}
                  <ArrowRight
                    size={20}
                    className="group-hover:translate-x-1 transition-transform"
                  />
                </>
              )}
            </a>

            <a
              href="/layanan/pmbm/status"
              className="inline-flex items-center justify-center gap-2 bg-white/10 backdrop-blur-sm text-white font-semibold text-lg px-8 py-4 rounded-full transition-all duration-300 border border-white/20 hover:bg-white/20 hover:border-white/40"
            >
              <ClipboardList size={20} />
              Cek Status Pendaftaran
            </a>
          </div>
        </div>
      </div>

      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 text-white animate-bounce">
        <svg
          width="30"
          height="30"
          viewBox="0 0 30 30"
          fill="none"
          aria-hidden="true"
        >
          <path
            d="M15 20L8 13L9.4 11.6L15 17.2L20.6 11.6L22 13L15 20Z"
            fill="white"
          />
        </svg>
      </div>
    </section>
  );
};

export default PmbmHero;
