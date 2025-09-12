import React, { useEffect, useState } from "react";

const Carousel: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState<number>(0);

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

  const nextSlide = (): void => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % slides.length);
  };

  const prevSlide = (): void => {
    setCurrentIndex(
      (prevIndex) => (prevIndex - 1 + slides.length) % slides.length
    );
  };

  // Inside the Carousel component, add useEffect for autoplay
  useEffect(() => {
    const interval = setInterval(() => {
      prevSlide();
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const [isPaused, setIsPaused] = useState<boolean>(false);

  // Update useEffect to respect pause state
  useEffect(() => {
    if (!isPaused) {
      const interval = setInterval(() => {
        prevSlide();
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [isPaused]);

  return (
    <section className="py-8 bg-semibackground dark:bg-semibackground shadow-md">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="relative">
          {/* Carousel body */}
          <div className="hs-carousel relative overflow-hidden w-full h-[480px] bg-white rounded-lg">
            {/* Slide */}
            <div
              className="flex transition-transform duration-500"
              style={{ transform: `translateX(-${currentIndex * 100}%)` }}
            >
              {slides.map((slide, index) => (
                <div
                  key={index}
                  className="flex-shrink-0 w-full h-[480px] relative flex justify-center items-center"
                >
                  {/* Image */}
                  <img
                    src={slide.src}
                    alt={`Slide ${index + 1}`}
                    className="w-full h-full object-cover object-center"
                    style={{ objectFit: "cover", objectPosition: "center" }}
                  />
                  {/* Black transparent overlay */}
                  <div className="absolute inset-0 bg-black/50" />
                  {/* Text on top */}
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

          {/* Prev Button */}
          <button
            onClick={prevSlide}
            className="absolute top-1/2 left-0 transform -translate-y-1/2 px-4 py-2 text-white font-bold rounded-full focus:outline-none hover:bg-gray-800 z-20"
          >
            &#8592;
          </button>

          {/* Next Button */}
          <button
            onClick={nextSlide}
            className="absolute top-1/2 right-0 transform -translate-y-1/2 px-4 py-2 text-white font-bold rounded-full focus:outline-none hover:bg-gray-800 z-20"
          >
            &#8594;
          </button>
        </div>
      </div>
    </section>
  );
};

export default Carousel;
