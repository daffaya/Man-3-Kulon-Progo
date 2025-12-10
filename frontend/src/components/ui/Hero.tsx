/**
 * @fileoverview Hero section component for the MAN 3 Kulon Progo website.
 * This component displays a full-screen hero section with a background image,
 * welcome message, description text, and call-to-action buttons for student registration.
 */
import React from "react";

/**
 * Component that renders the hero section for the school's landing page.
 * Displays a welcoming message with call-to-action buttons for prospective students.
 */
const Hero: React.FC = () => {
  return (
    <section className="relative min-h-[80vh] w-full overflow-hidden pt-16 md:pt-20 lg:pt-24 pb-16 md:pb-20 lg:pb-24">
      {/* Background Image with Overlay */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url(/MAN_3_1.jpg)" }}
        aria-hidden="true"
      >
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-black/70"></div>
      </div>

      {/* Siswa Cut-out */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
        <div className="h-full flex justify-end items-end">
          <div className="relative">
            <img
              src="/Siswa_ZI.png"
              alt=""
              className="w-[90vw] sm:w-[80vw] md:w-[70vw] lg:w-[60vw] xl:w-[55vw] 2xl:w-[50vw]
                         drop-shadow-2xl object-contain
                         translate-y-0"
            />
            <div className="absolute -inset-6 -z-10">
              <div className="w-full h-full bg-emerald-500/25 rounded-full blur-3xl"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Side Gradient */}
      <div
        className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/30 to-transparent"
        aria-hidden="true"
      ></div>

      {/* Content Container */}
      <div className="relative z-10 flex h-full items-center">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl md:pl-12 lg:pl-16 text-white">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-6 md:mb-8 leading-tight">
              MAN 3 Kulon Progo
              <br />
              <span className="text-accent">
                Menuju Wilayah Birokrasi
                <br /> Bersih dan Melayani
              </span>
            </h1>

            <p className="text-base sm:text-lg lg:text-xl text-white mb-6 md:mb-8 lg:mb-12 leading-relaxed max-w-2xl drop-shadow-md">
              Dengan semangat integritas, kami wujudkan madrasah yang bersih
              dari korupsi, transparan, akuntabel, dan memberikan pelayanan
              publik yang prima sesuai nilai-nilai Islam Rahmatan lil 'Alamin.
            </p>

            <div className="flex flex-col sm:flex-row flex-wrap gap-4">
              <a
                href="/layanan/zona-integritas"
                className="inline-block"
                aria-label="Lihat Komitmen Zona Integritas"
              >
                <button className="btn-primary text-white font-bold py-4 px-10 rounded-xl text-lg shadow-lg transform hover:scale-105 transition duration-300 w-full sm:w-auto">
                  Lihat Komitmen Zona Integritas
                </button>
              </a>
              <a
                href="/layanan/sedum"
                className="inline-block"
                aria-label="Laporkan Pengaduan"
              >
                <button className="bg-transparent border-2 border-white hover:bg-white hover:text-gray-900 text-white font-semibold py-4 px-10 rounded-xl text-lg transition duration-300 w-full sm:w-auto">
                  Laporkan Pengaduan
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
