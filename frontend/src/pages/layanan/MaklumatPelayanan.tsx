/**
 * @fileoverview MaklumatPelayananPage component for displaying service announcement image.
 */

import React, { useState } from "react";
import Layout from "../../components/layout/Layout";
import { Scroll, ZoomIn } from "lucide-react";
import ImageZoomModal from "../../components/modals/ImageZoomModal";

/**
 * Maklumat Pelayanan Page
 * Displays the service announcement image with zoom functionality.
 */
const MaklumatPelayananPage: React.FC = () => {
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);

  return (
    <Layout>
      <div className="min-h-screen bg-semibackground py-12">
        <div className="container max-w-6xl mx-auto px-4 sm:px-6">
          {/* Header Section */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-accent/10 rounded-full mb-4">
              <Scroll className="text-accent" size={32} />
            </div>
            <h1 className="text-4xl md:text-5xl font-serif font-bold mb-4 text-foreground">
              Maklumat Pelayanan
            </h1>
            <p className="text-lg text-secondary max-w-3xl mx-auto">
              Standar layanan dan komitmen kami dalam melayani masyarakat dengan
              baik, transparan, dan profesional.
            </p>
          </div>

          {/* Image Display Section */}
          <section className="mb-16">
            <div className="bg-background border border-border rounded-lg p-6 shadow-sm">
              <p className="text-secondary mb-4 text-sm">
                Berikut adalah dokumen Maklumat Pelayanan MAN 3 Kulon Progo.
              </p>

              <div
                className="relative w-full overflow-hidden rounded-md border border-gray-200 cursor-zoom-in group"
                onClick={() => setIsImageModalOpen(true)}
              >
                <img
                  src="/maklumat_pelayanan.jpeg"
                  alt="Maklumat Pelayanan MAN 3 Kulon Progo"
                  className="w-full h-auto object-contain transition-transform duration-300 group-hover:scale-105"
                />

                {/* Zoom Overlay Icon */}
                <div className="absolute top-4 right-4 bg-black/50 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                  <ZoomIn size={20} />
                </div>
              </div>

              <p className="text-xs text-gray-500 mt-2 text-center">
                *Klik gambar untuk memperbesar
              </p>
            </div>
          </section>
        </div>
      </div>

      {/* Modal for Zooming Image */}
      <ImageZoomModal
        src="/maklumat_pelayanan.jpeg"
        alt="Maklumat Pelayanan MAN 3 Kulon Progo"
        isOpen={isImageModalOpen}
        onClose={() => setIsImageModalOpen(false)}
      />
    </Layout>
  );
};

export default MaklumatPelayananPage;
