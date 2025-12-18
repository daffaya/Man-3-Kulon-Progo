/**
 * @fileoverview Carousel component for displaying a slideshow of images with text overlays.
 * This component renders an automatic carousel with manual navigation controls,
 * featuring images with headlines and descriptions. It includes pause functionality
 * and transitions between slides.
 */

import { ChevronLeft, ChevronRight } from "lucide-react";
import React, { useEffect, useState } from "react";

/**
 * Component that displays an automatic carousel with manual navigation controls.
 * Features automatic sliding every 5 seconds with pause capability,
 * manual navigation buttons, and smooth transitions between slides.
 */
const Carousel: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [isPaused, setIsPaused] = useState<boolean>(false);

  const slides = [
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
        "Kontingen MAN 3 Kulon Progo meraih Juara 1 Pawai Semarak 80 Tahun Indonesia Merdeka dengan sendratari 'Laskar Godhong Lumbu'.",
    },
    {
      src: "/Slider3.jpeg",
      headline: "Tata Kelola Unggul dan Efisien",
      description:
        "Peringkat 2 se-Madrasah Aliyah dalam capaian kinerja anggaran terbaik tahun 2024 dengan nilai 86,94.",
    },
  ];

  /**
   * Advances to the next slide in the carousel.
   * Wraps around to the first slide when reaching the end.
   */
  const goToNextSlide = (): void => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % slides.length);
  };

  /**
   * Moves to the previous slide in the carousel.
   * Wraps around to the last slide when at the beginning.
   */
  const goToPrevSlide = (): void => {
    setCurrentIndex(
      (prevIndex) => (prevIndex - 1 + slides.length) % slides.length
    );
  };

  useEffect(() => {
    if (!isPaused) {
      const interval = setInterval(() => {
        goToPrevSlide();
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [isPaused]);

  return (
    <section className="py-8 bg-semibackground dark:bg-semibackground shadow-md">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="relative">
          <div className="hs-carousel relative overflow-hidden w-full h-[480px] bg-white rounded-lg">
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
                    alt={`Slide ${index + 1}`}
                    className="w-full h-full object-cover object-center"
                    style={{ objectFit: "cover", objectPosition: "center" }}
                  />
                  <div className="absolute inset-0 bg-black/50" />
                  <div className="absolute">
                    <h2 className=" text-white text-2xl font-bold text-center z-10 mb-2">
                      {slide.headline}
                    </h2>

                    <p className="text-white text-center z-10">
                      {slide.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Slider Navigation */}
          <button
            onClick={goToPrevSlide}
            className="absolute top-1/2 left-0 transform -translate-y-1/2 px-4 py-2 text-white font-bold rounded-full focus:outline-none hover:bg-hover z-20"
            aria-label="Slide sebelumnya"
          >
            &#8592;
          </button>
          <button
            onClick={goToNextSlide}
            className="absolute top-1/2 right-0 transform -translate-y-1/2 px-4 py-2 text-white font-bold rounded-full focus:outline-none hover:bg-hover z-20"
            aria-label="Slide berikutnya"
          >
            &#8594;
          </button>
        </div>
      </div>
    </section>
  );
};

export default Carousel;
