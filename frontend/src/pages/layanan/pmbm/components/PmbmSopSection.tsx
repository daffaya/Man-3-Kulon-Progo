// src/pages/layanan/pmbm/components/PmbmSopSection.tsx

import React from "react";
import { FileText, ZoomIn } from "lucide-react";
import Section from "../../../../components/ui/Section";

interface PmbmSopSectionProps {
  imageUrl: string;
  onOpenModal: () => void;
}

const PmbmSopSection: React.FC<PmbmSopSectionProps> = ({
  imageUrl,
  onOpenModal,
}) => {
  return (
    <Section
      id="sop"
      title="Dokumen Prosedur (SOP)"
      bg="semi"
      titleIcon={<FileText className="text-accent" />}
    >
      <div className="max-w-4xl mx-auto">
        <div className="bg-background border border-border rounded-lg p-6 shadow-sm">
          <p className="text-secondary mb-4 text-sm text-center">
            Berikut adalah dokumen Standard Operating Procedure (SOP) PMBM MAN 3
            Kulon Progo.
          </p>
          <div
            className="relative w-full overflow-hidden rounded-md border border-gray-200 cursor-zoom-in group"
            onClick={onOpenModal}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onOpenModal();
              }
            }}
            aria-label="Klik untuk memperbesar gambar SOP PMBM"
          >
            <img
              src={imageUrl}
              alt="SOP PMBM MAN 3 Kulon Progo"
              className="w-full h-auto object-contain transition-transform duration-300 group-hover:scale-105"
              loading="lazy"
            />
            <div className="absolute top-4 right-4 bg-black/50 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
              <ZoomIn size={20} />
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-2 text-center">
            *Klik gambar untuk memperbesar
          </p>
        </div>
      </div>
    </Section>
  );
};

export default PmbmSopSection;
