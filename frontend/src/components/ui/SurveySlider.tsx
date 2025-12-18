/**
 * @fileoverview SurveySlider component for displaying SPAK and SPKP survey results
 * This component renders a carousel with two slides showing different survey results
 */

import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ChevronLeft, ChevronRight } from "lucide-react";

/**
 * SurveySlider component that displays a carousel of survey results
 * @returns {JSX.Element} The rendered SurveySlider component
 */
const SurveySlider: React.FC = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const slides = [{ title: "SPAK Survey" }, { title: "SPKP Survey" }];

  // Auto-slide functionality
  useEffect(() => {
    const interval = setInterval(() => {
      goToNextSlide();
    }, 5000); // Change slide every 5 seconds

    return () => clearInterval(interval);
  }, []);

  // Navigation functions
  const goToNextSlide = () => {
    setCurrentSlide((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
  };

  const goToPrevSlide = () => {
    setCurrentSlide((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
  };

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
  };

  return (
    <section className="py-12 bg-background">
      <div className="container max-w-6xl mx-auto px-4 sm:px-6">
        {/* Survey Slider */}
        <div className="relative">
          {/* Slider Content */}
          <div className="overflow-hidden rounded-xl">
            <div
              className="flex transition-transform duration-500 ease-in-out"
              style={{ transform: `translateX(-${currentSlide * 100}%)` }}
            >
              {/* Slide 1: SPAK Survey */}
              <div className="w-full flex-shrink-0">
                <div className="flex flex-col md:flex-row items-center gap-8 p-6 bg-background rounded-lg shadow-lg">
                  <div className="md:w-1/2">
                    <h3 className="text-2xl font-bold mb-4 text-foreground">
                      Survei Persepsi Anti Korupsi (SPAK) 2025
                    </h3>
                    <p className="text-secondary mb-6">
                      SPAK mengukur persepsi masyarakat terhadap upaya
                      pencegahan korupsi dan tingkat integritas di lingkungan
                      Madrasah Aliyah Negeri 3 KulonProgo.
                    </p>
                    <div className="p-6 rounded-lg mb-6">
                      <div className="text-center">
                        <div className="text-5xl font-bold text-accent mb-2">
                          3.87
                        </div>
                        <div className="text-secondary">
                          Skor SPAK Tahun 2025
                        </div>
                        <div className="mt-2 text-sm text-secondary mb-8">
                          Kategori: Sangat Baik
                        </div>
                        <a
                          href="https://sites.google.com/view/e-survey-man-3-kulon-progo/publikasi-spkp?authuser=0"
                          className="btn btn-primary"
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          Lihat Detail Hasil Survei
                        </a>
                      </div>
                    </div>
                  </div>
                  <div className="md:w-1/2">
                    <div className="bg-semibackground p-4 rounded-lg">
                      <img
                        src="SPAK_Triwulan_4.jpg"
                        alt="Flyer SPAK 2025"
                        className="w-full h-auto rounded-lg shadow-md"
                      />
                      <div className="mt-4 text-center text-sm text-secondary">
                        <p>Flyer Hasil Survei SPAK Tahun 2025</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Slide 2: SPKP Survey */}
              <div className="w-full flex-shrink-0">
                <div className="flex flex-col md:flex-row items-center gap-8 p-6 bg-background rounded-lg shadow-lg">
                  <div className="md:w-1/2">
                    <h3 className="text-2xl font-bold mb-4 text-foreground">
                      Survei Persepsi Kualitas Pelayanan (SPKP) 2025
                    </h3>
                    <p className="text-secondary mb-6">
                      SPKP mengukur persepsi masyarakat terhadap kualitas
                      layanan yang diberikan oleh Madrasah Aliyah Negeri 3
                      KulonProgo.
                    </p>
                    <div className="p-6 rounded-lg mb-6">
                      <div className="text-center">
                        <div className="text-5xl font-bold text-accent mb-2">
                          3.95
                        </div>
                        <div className="text-secondary">
                          Skor SPKP Tahun 2025
                        </div>
                        <div className="mt-2 text-sm text-secondary mb-8">
                          Kategori: Sangat Baik
                        </div>
                        <a
                          href="https://sites.google.com/view/e-survey-man-3-kulon-progo/publikasi-spak?authuser=0"
                          className="btn btn-primary"
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          Lihat Detail Hasil Survei
                        </a>
                      </div>
                    </div>
                  </div>
                  <div className="md:w-1/2">
                    <div className="bg-semibackground p-4 rounded-lg">
                      <img
                        src="SPKP_Triwulan_4.jpeg"
                        alt="Flyer SPKP 2025"
                        className="w-full h-auto rounded-lg shadow-md"
                      />
                      <div className="mt-4 text-center text-sm text-secondary">
                        <p>Flyer Hasil Survei SPKP Tahun 2025</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Slider Navigation */}
          <button
            onClick={goToPrevSlide}
            className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-semibackground hover:bg-hover text-foreground rounded-full p-2 shadow-md transition-all"
            aria-label="Slide sebelumnya"
          >
            <ChevronLeft size={24} />
          </button>
          <button
            onClick={goToNextSlide}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-semibackground hover:bg-hover text-foreground rounded-full p-2 shadow-md transition-all"
            aria-label="Slide berikutnya"
          >
            <ChevronRight size={24} />
          </button>

          {/* Slider Indicators */}
          <div className="flex justify-center mt-6 space-x-2">
            {slides.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`w-3 h-3 rounded-full transition-colors ${
                  currentSlide === index ? "bg-accent" : "bg-gray-300"
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

export default SurveySlider;
