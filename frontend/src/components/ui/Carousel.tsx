// src/components/ui/Carousel.tsx

/**
 * @fileoverview Carousel — migrated to CMS.
 * Slides now fetched from site_collections (type: slider).
 */

import { ChevronLeft, ChevronRight } from "lucide-react";
import React, { useEffect, useState } from "react";
import { useCmsCollection } from "../../hooks/useCmsPage";

interface SlideItem {
  src: string;
  headline: string;
  description: string;
}

const FALLBACK_SLIDES: SlideItem[] = [
  {
    src: "/Slider1.jpg",
    headline: "Prestasi Gemilang di Bidang Olahraga",
    description:
      "Kontingen Shorinji Kempo MAN 3 Kulon Progo meraih Juara 1 dan 2 dalam Kejuaraan Pelajar Kabupaten Kulon Progo 2025.",
  },
  {
    src: "/Slider2.jpeg",
    headline: "Keunggulan Seni dan Budaya",
    description:
      "Kontingen MAN 3 Kulon Progo meraih Juara 1 Pawai Semarak 80 Tahun Indonesia Merdeka.",
  },
  {
    src: "/Slider3.jpeg",
    headline: "Tata Kelola Unggul dan Efisien",
    description:
      "Peringkat 2 se-Madrasah Aliyah dalam capaian kinerja anggaran terbaik tahun 2024 dengan nilai 86,94.",
  },
];

const Carousel: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [isPaused, setIsPaused] = useState<boolean>(false);

  const { data, loading } = useCmsCollection<SlideItem>("slider");
  const slides = data && data.length > 0 ? data : FALLBACK_SLIDES;

  const goToNextSlide = () =>
    setCurrentIndex((prev) => (prev + 1) % slides.length);

  const goToPrevSlide = () =>
    setCurrentIndex((prev) => (prev - 1 + slides.length) % slides.length);

  useEffect(() => {
    if (!isPaused && !loading) {
      const interval = setInterval(goToNextSlide, 5000);
      return () => clearInterval(interval);
    }
  }, [isPaused, loading, slides.length]);

  // Reset index kalau jumlah slides berubah setelah fetch
  useEffect(() => {
    setCurrentIndex(0);
  }, [slides.length]);

  if (loading) {
    return (
      <section className="py-8 bg-semibackground shadow-md">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="w-full h-[480px] bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse" />
        </div>
      </section>
    );
  }

  return (
    <section
      className="py-8 bg-semibackground dark:bg-semibackground shadow-md"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div className="container mx-auto px-4 sm:px-6">
        <div className="relative">
          <div className="overflow-hidden w-full h-[480px] bg-white rounded-lg">
            <div
              className="flex transition-transform duration-500"
              style={{ transform: `translateX(-${currentIndex * 100}%)` }}
            >
              {slides.map((slide, index) => (
                <div
                  key={index}
                  className="flex-shrink-0 w-full h-[480px] relative flex justify-center items-center"
                >
                  <img
                    src={slide.src}
                    alt={slide.headline}
                    className="w-full h-full object-cover object-center"
                  />
                  <div className="absolute inset-0 bg-black/50" />
                  <div className="absolute px-8 text-center">
                    <h2 className="text-white text-2xl font-bold mb-2">
                      {slide.headline}
                    </h2>
                    <p className="text-white">{slide.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Navigation buttons */}
          <button
            onClick={goToPrevSlide}
            className="absolute top-1/2 left-0 transform -translate-y-1/2 px-4 py-2 text-white font-bold rounded-full focus:outline-none hover:bg-hover z-20"
            aria-label="Slide sebelumnya"
          >
            <ChevronLeft size={24} />
          </button>
          <button
            onClick={goToNextSlide}
            className="absolute top-1/2 right-0 transform -translate-y-1/2 px-4 py-2 text-white font-bold rounded-full focus:outline-none hover:bg-hover z-20"
            aria-label="Slide berikutnya"
          >
            <ChevronRight size={24} />
          </button>

          {/* Dot indicators */}
          <div className="flex justify-center mt-4 gap-2">
            {slides.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`w-2.5 h-2.5 rounded-full transition-colors ${
                  currentIndex === index ? "bg-accent" : "bg-gray-300"
                }`}
                aria-label={`Slide ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Carousel;
