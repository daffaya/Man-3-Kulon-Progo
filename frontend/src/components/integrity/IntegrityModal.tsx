// src/components/integrity/IntegrityModal.tsx
import React from "react";
import { X, ExternalLink } from "lucide-react";

interface Props {
  id: number;
  title: string;
  description: string;
  driveUrl: string;
  isOpen: boolean;
  onClose: () => void;
}

const IntegrityModal: React.FC<Props> = ({
  id,
  title,
  description,
  driveUrl,
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 transition-all"
      role="dialog"
      aria-modal="true"
      aria-labelledby={`integrity-modal-title-${id}`}
    >
      <div className="card p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto transform transition-all">
        <div className="flex justify-between items-center mb-4">
          <h3
            id={`integrity-modal-title-${id}`}
            className="text-xl font-semibold text-foreground"
          >
            {title}
          </h3>
          <button
            onClick={onClose}
            className="text-secondary hover:text-foreground p-1 rounded-full hover:bg-[rgb(var(--color-secondary-hover))] transition-colors"
            aria-label="Tutup modal"
          >
            <X size={20} />
          </button>
        </div>

        <div className="prose prose-sm max-w-none">
          <div dangerouslySetInnerHTML={{ __html: description }} />
        </div>

        <div className="mt-6 pt-4 border-t border-border">
          <h4 className="font-bold mb-3 text-foreground">Bukti Implementasi</h4>
          <a
            href={driveUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center px-4 py-2 bg-accent text-white rounded-md hover:bg-accent/90 transition-colors"
          >
            Lihat Dokumen di Google Drive
            <ExternalLink className="ml-2" size={16} />
          </a>
        </div>
      </div>
    </div>
  );
};

export default IntegrityModal;
