import React from "react";

const Hero: React.FC = () => {
  return (
    <section className="relative h-screen w-full overflow-hidden">
      {/* Background Image with Dimming Overlay */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url(/Hero.jpg)" }}
      >
        <div className="absolute inset-0 bg-black bg-opacity-50"></div>
      </div>

      {/* Content Container */}
      <div className="relative z-10 flex h-full items-center">
        <div className="container mx-4 px-4 sm:px-4 md:px-8 lg:px-16">
          <div className="max-w-2xl pl-4 md:pl-8 lg:pl-12">
            {/* Main Heading */}
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-8 leading-tight">
              Selamat Datang di MAN 3 Kulon Progo!
            </h1>

            {/* Description Text */}
            <p className="text-md md:text-xl text-white mb-12 leading-relaxed">
              Madrasah top di Kulon Progo yang nggak cuma ngajarin iman dan
              ilmu, tapi juga bikin kamu jago berprestasi dan peduli lingkungan!
              Siap gabung bareng talenta kece, asah skill masa depan, dan
              wujudkan mimpi besar dengan semangat kebersamaan?
            </p>

            {/* Call-to-Action Button */}
            <a href="/layanan/ppdb">
              <button className="btn-primary text-white font-semi-bold py-3 px-8 rounded-lg text-lg transition duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50">
                Daftarkan Dirimu Sekarang
              </button>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
