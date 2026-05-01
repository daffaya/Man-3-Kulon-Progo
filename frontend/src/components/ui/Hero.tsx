// src/components/ui/Hero.tsx

/**
 * @fileoverview Hero — migrated to CMS.
 * Content fetched from site_contents (page: home, section: hero).
 */

import React from "react";
import { useCmsSection } from "../../hooks/useCmsPage";

interface CtaButton {
  text: string;
  url: string;
}

interface HeroContent {
  title: string;
  subtitle: string;
  description: string;
  bg_image: string;
  siswa_image: string;
  cta_primary: CtaButton;
  cta_secondary: CtaButton;
}

const FALLBACK: HeroContent = {
  title: "MAN 3 Kulon Progo",
  subtitle: "Menuju Wilayah Birokrasi Bersih dan Melayani",
  description:
    "Dengan semangat integritas, kami wujudkan madrasah yang bersih dari korupsi, transparan, akuntabel, dan memberikan pelayanan publik yang prima sesuai nilai-nilai Islam Rahmatan lil 'Alamin.",
  bg_image: "/MAN_3_1.jpg",
  siswa_image: "/Siswa_ZI.png",
  cta_primary: {
    text: "Lihat Komitmen Zona Integritas",
    url: "/layanan/zona-integritas",
  },
  cta_secondary: {
    text: "Hasil e-Survey",
    url: "https://sites.google.com/view/e-survey-man-3-kulon-progo/publikasi-spkp",
  },
};

const Hero: React.FC = () => {
  const { data, loading } = useCmsSection<HeroContent>("home", "hero");

  const content: HeroContent = {
    title: data?.title ?? FALLBACK.title,
    subtitle: data?.subtitle ?? FALLBACK.subtitle,
    description: data?.description ?? FALLBACK.description,
    bg_image: data?.bg_image ?? FALLBACK.bg_image,
    siswa_image: data?.siswa_image ?? FALLBACK.siswa_image,
    cta_primary: data?.cta_primary ?? FALLBACK.cta_primary,
    cta_secondary: data?.cta_secondary ?? FALLBACK.cta_secondary,
  };

  if (loading) {
    return (
      <section className="relative min-h-[80vh] w-full overflow-hidden bg-gray-900">
        <div className="absolute inset-0 animate-pulse bg-gray-800" />
      </section>
    );
  }

  return (
    <section className="relative min-h-[80vh] w-full overflow-hidden pt-16 md:pt-20 lg:pt-24 pb-16 md:pb-20 lg:pb-24">
      {/* Background */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${content.bg_image})` }}
        aria-hidden="true"
      >
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-black/70" />
      </div>

      {/* Siswa cutout */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
        <div className="h-full flex justify-end items-end">
          <div className="relative">
            <img
              src={content.siswa_image}
              alt=""
              className="w-[90vw] sm:w-[80vw] md:w-[70vw] lg:w-[60vw] xl:w-[55vw] 2xl:w-[50vw] drop-shadow-2xl object-contain"
            />
            <div className="absolute -inset-6 -z-10">
              <div className="w-full h-full bg-emerald-500/25 rounded-full blur-3xl" />
            </div>
          </div>
        </div>
      </div>

      {/* Side gradient */}
      <div
        className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/30 to-transparent"
        aria-hidden="true"
      />

      {/* Content */}
      <div className="relative z-10 flex h-full items-center">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl md:pl-12 lg:pl-16 text-white">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-6 md:mb-8 leading-tight">
              {content.title}
              <br />
              <span className="text-accent">{content.subtitle}</span>
            </h1>
            <p className="text-base sm:text-lg lg:text-xl text-white mb-6 md:mb-8 lg:mb-12 leading-relaxed max-w-2xl drop-shadow-md">
              {content.description}
            </p>
            <div className="flex flex-col sm:flex-row flex-wrap gap-4">
              <a
                href={content.cta_primary.url}
                className="inline-block"
                aria-label={content.cta_primary.text}
              >
                <button className="btn-primary text-white font-bold py-4 px-10 rounded-xl text-lg shadow-lg transform hover:scale-105 transition duration-300 w-full sm:w-auto">
                  {content.cta_primary.text}
                </button>
              </a>
              <a
                href={content.cta_secondary.url}
                className="inline-block"
                aria-label={content.cta_secondary.text}
              >
                <button className="bg-transparent border-2 border-white hover:bg-white hover:text-gray-900 text-white font-semibold py-4 px-10 rounded-xl text-lg transition duration-300 w-full sm:w-auto">
                  {content.cta_secondary.text}
                </button>
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
