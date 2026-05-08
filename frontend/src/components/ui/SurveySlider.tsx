/**
 * @fileoverview SurveySlider component for displaying SPAK and SPKP survey results.
 *
 * Data fetched dynamically from CMS via useCmsSection hook.
 * Falls back to sensible defaults if CMS data is unavailable.
 *
 * Sections consumed:
 * - /api/cms/home/survey_spak
 * - /api/cms/home/survey_spkp
 */

import React, { useState, useEffect, useCallback } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useCmsSection } from "../../hooks/useCmsPage";

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────

interface SurveyData {
  title: string;
  description: string;
  score: string;
  category: string;
  year: string;
  detail_url: string;
  flyer_image: string;
}

// ─────────────────────────────────────────────
// Fallbacks
// ─────────────────────────────────────────────

const FALLBACK_SPAK: SurveyData = {
  title: "Survei Persepsi Anti Korupsi (SPAK) 2025",
  description:
    "SPAK mengukur persepsi masyarakat terhadap upaya pencegahan korupsi dan tingkat integritas di lingkungan Madrasah Aliyah Negeri 3 Kulon Progo.",
  score: "3.87",
  category: "Sangat Baik",
  year: "2025",
  detail_url:
    "https://sites.google.com/view/e-survey-man-3-kulon-progo/publikasi-spkp?authuser=0",
  flyer_image: "/SPAK_Triwulan_4.jpg",
};

const FALLBACK_SPKP: SurveyData = {
  title: "Survei Persepsi Kualitas Pelayanan (SPKP) 2025",
  description:
    "SPKP mengukur persepsi masyarakat terhadap kualitas layanan yang diberikan oleh Madrasah Aliyah Negeri 3 Kulon Progo.",
  score: "3.95",
  category: "Sangat Baik",
  year: "2025",
  detail_url:
    "https://sites.google.com/view/e-survey-man-3-kulon-progo/publikasi-spak?authuser=0",
  flyer_image: "/SPKP_Triwulan_4.jpeg",
};

// ─────────────────────────────────────────────
// SlideContent
// ─────────────────────────────────────────────

const SlideContent: React.FC<{ survey: SurveyData }> = ({ survey }) => (
  <div className="w-full flex-shrink-0">
    <div className="flex flex-col md:flex-row items-center gap-8 p-6 bg-background rounded-lg shadow-lg">
      {/* Text side */}
      <div className="md:w-1/2">
        <h3 className="text-2xl font-bold mb-4 text-foreground">
          {survey.title}
        </h3>
        <p className="text-secondary mb-6">{survey.description}</p>
        <div className="p-6 rounded-lg mb-6">
          <div className="text-center">
            <div className="text-5xl font-bold text-accent mb-2">
              {survey.score}
            </div>
            <div className="text-secondary">
              Skor {survey.year ? `Tahun ${survey.year}` : ""}
            </div>
            <div className="mt-2 text-sm text-secondary mb-8">
              Kategori: {survey.category}
            </div>
            {survey.detail_url && (
              <a
                href={survey.detail_url}
                className="btn btn-primary"
                target="_blank"
                rel="noopener noreferrer"
              >
                Lihat Detail Hasil Survei
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Image side */}
      <div className="md:w-1/2">
        <div className="bg-semibackground p-4 rounded-lg">
          <img
            src={survey.flyer_image}
            alt={`Flyer ${survey.title}`}
            className="w-full h-auto rounded-lg shadow-md"
          />
          <div className="mt-4 text-center text-sm text-secondary">
            <p>Flyer Hasil Survei {survey.title}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
);

// ─────────────────────────────────────────────
// SurveySlider
// ─────────────────────────────────────────────

const SurveySlider: React.FC = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const SLIDE_COUNT = 2;

  // ── CMS data ──
  const { data: spakData } = useCmsSection<SurveyData>("home", "survey_spak");
  const { data: spkpData } = useCmsSection<SurveyData>("home", "survey_spkp");

  const spak: SurveyData = { ...FALLBACK_SPAK, ...spakData };
  const spkp: SurveyData = { ...FALLBACK_SPKP, ...spkpData };

  // ── Navigation ──
  const goToNext = useCallback(() => {
    setCurrentSlide((prev) => (prev === SLIDE_COUNT - 1 ? 0 : prev + 1));
  }, []);

  const goToPrev = useCallback(() => {
    setCurrentSlide((prev) => (prev === 0 ? SLIDE_COUNT - 1 : prev - 1));
  }, []);

  // ── Auto-slide ──
  useEffect(() => {
    const interval = setInterval(goToNext, 5000);
    return () => clearInterval(interval);
  }, [goToNext]);

  return (
    <section className="py-12 bg-background">
      <div className="container max-w-6xl mx-auto px-4 sm:px-6">
        <div className="relative">
          {/* Track */}
          <div className="overflow-hidden rounded-xl">
            <div
              className="flex transition-transform duration-500 ease-in-out"
              style={{ transform: `translateX(-${currentSlide * 100}%)` }}
            >
              <SlideContent survey={spak} />
              <SlideContent survey={spkp} />
            </div>
          </div>

          {/* Prev / Next */}
          <button
            onClick={goToPrev}
            className="absolute left-4 top-1/2 -translate-y-1/2 bg-semibackground hover:bg-hover text-foreground rounded-full p-2 shadow-md transition-all"
            aria-label="Slide sebelumnya"
          >
            <ChevronLeft size={24} />
          </button>
          <button
            onClick={goToNext}
            className="absolute right-4 top-1/2 -translate-y-1/2 bg-semibackground hover:bg-hover text-foreground rounded-full p-2 shadow-md transition-all"
            aria-label="Slide berikutnya"
          >
            <ChevronRight size={24} />
          </button>

          {/* Indicators */}
          <div className="flex justify-center mt-6 space-x-2">
            {[0, 1].map((index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
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
