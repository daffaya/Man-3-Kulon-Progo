// src/pages/layanan/pmbm/components/PmbmFloatingCta.tsx

import React from "react";
import { ArrowRight, Info } from "lucide-react";
import type { PmbmConfig } from "../usePmbmConfig";

interface PmbmFloatingCtaProps {
  config: PmbmConfig;
}

const PmbmFloatingCta: React.FC<PmbmFloatingCtaProps> = ({ config }) => {
  const { PENDAFTARAN_DITUTUP, REGISTRATION_LINK } = config;
  const href = PENDAFTARAN_DITUTUP ? "/layanan/pmbm" : REGISTRATION_LINK;

  return (
    <a
      href={href}
      className="fixed bottom-6 right-6 z-50 md:hidden bg-accent text-white p-4 rounded-full shadow-lg hover:scale-110 transition-all duration-300 flex items-center justify-center group"
      aria-label={PENDAFTARAN_DITUTUP ? "Info Pendaftaran" : "Daftar Sekarang"}
    >
      {PENDAFTARAN_DITUTUP ? (
        <Info size={24} />
      ) : (
        <ArrowRight
          size={24}
          className="group-hover:translate-x-1 transition-transform"
        />
      )}
      <span className="absolute right-full mr-3 bg-primary text-white text-sm px-3 py-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
        {PENDAFTARAN_DITUTUP ? "Info Pendaftaran" : "Daftar Sekarang"}
      </span>
    </a>
  );
};

export default PmbmFloatingCta;
