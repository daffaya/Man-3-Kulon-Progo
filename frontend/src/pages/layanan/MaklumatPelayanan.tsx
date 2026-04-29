/**
 * @fileoverview MaklumatPelayananPage — migrated to CMS.
 * Fetches content dynamically from site_contents (page: maklumat-pelayanan, section: content).
 */

import React, { useState } from "react";
import Layout from "../../components/layout/Layout";
import { Scroll, ZoomIn } from "lucide-react";
import ImageZoomModal from "../../components/modals/ImageZoomModal";
import { useCmsSection } from "../../hooks/useCmsPage";

interface MaklumatContent {
  title: string;
  description: string;
  image_url: string;
}

const FALLBACK: MaklumatContent = {
  title: "Maklumat Pelayanan",
  description:
    "Standar layanan dan komitmen kami dalam melayani masyarakat dengan baik, transparan, dan profesional.",
  image_url: "/maklumat_pelayanan.jpeg",
};

const MaklumatPelayananPage: React.FC = () => {
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const { data, loading } = useCmsSection<MaklumatContent>(
    "maklumat-pelayanan",
    "content",
  );

  const content: MaklumatContent = {
    title: data?.title ?? FALLBACK.title,
    description: data?.description ?? FALLBACK.description,
    image_url: data?.image_url ?? FALLBACK.image_url,
  };

  return (
    <Layout>
      <div className="min-h-screen bg-semibackground py-12">
        <div className="container max-w-6xl mx-auto px-4 sm:px-6">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-accent/10 rounded-full mb-4">
              <Scroll className="text-accent" size={32} />
            </div>

            {loading ? (
              <div className="space-y-3 max-w-xl mx-auto">
                <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
              </div>
            ) : (
              <>
                <h1 className="text-4xl md:text-5xl font-serif font-bold mb-4 text-foreground">
                  {content.title}
                </h1>
                <p className="text-lg text-secondary max-w-3xl mx-auto">
                  {content.description}
                </p>
              </>
            )}
          </div>

          {/* Image */}
          <section className="mb-16">
            <div className="bg-background border border-border rounded-lg p-6 shadow-sm">
              <p className="text-secondary mb-4 text-sm">
                Berikut adalah dokumen Maklumat Pelayanan MAN 3 Kulon Progo.
              </p>

              {loading ? (
                <div className="w-full h-96 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
              ) : (
                <div
                  className="relative w-full overflow-hidden rounded-md border border-gray-200 cursor-zoom-in group"
                  onClick={() => setIsImageModalOpen(true)}
                >
                  <img
                    src={content.image_url}
                    alt={content.title}
                    className="w-full h-auto object-contain transition-transform duration-300 group-hover:scale-105"
                  />
                  <div className="absolute top-4 right-4 bg-black/50 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                    <ZoomIn size={20} />
                  </div>
                </div>
              )}

              <p className="text-xs text-gray-500 mt-2 text-center">
                *Klik gambar untuk memperbesar
              </p>
            </div>
          </section>
        </div>
      </div>

      <ImageZoomModal
        src={content.image_url}
        alt={content.title}
        isOpen={isImageModalOpen}
        onClose={() => setIsImageModalOpen(false)}
      />
    </Layout>
  );
};

export default MaklumatPelayananPage;
