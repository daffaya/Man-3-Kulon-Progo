import React, { useEffect, useRef, useState } from "react";

interface Props {
  src: string;
  alt?: string;
  isOpen: boolean;
  onClose: () => void;
}

const ImageZoomModal: React.FC<Props> = ({ src, alt, isOpen, onClose }) => {
  const [zoomed, setZoomed] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });

  const dragging = useRef(false);
  const moved = useRef(false); // Untuk membedakan drag vs click
  const start = useRef({ x: 0, y: 0 });

  useEffect(() => {
    if (!isOpen) return;

    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    document.addEventListener("keydown", handleEsc);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleEsc);
      document.body.style.overflow = "auto";
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // Fungsi Zoom (hanya berjalan jika BUKAN drag)
  const toggleZoom = (e: React.MouseEvent) => {
    e.stopPropagation();

    // Jika user baru saja melakukan drag, abaikan klik ini
    if (moved.current) return;

    setZoomed((z) => !z);
    setPosition({ x: 0, y: 0 });
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    // Hanya bisa drag jika sedang zoom
    if (!zoomed) return;

    dragging.current = true;
    moved.current = false; // Reset status gerakan
    start.current = {
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!dragging.current) return;

    // Tandai bahwa terjadi pergerakan (drag)
    moved.current = true;

    setPosition({
      x: e.clientX - start.current.x,
      y: e.clientY - start.current.y,
    });
  };

  const handleMouseUp = () => {
    dragging.current = false;
  };

  // Handler untuk klik background (backdrop)
  const handleBackdropClick = (e: React.MouseEvent) => {
    // Jika user baru saja drag, jangan tutup modal
    if (moved.current) {
      moved.current = false; // Reset untuk interaksi berikutnya
      return;
    }
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-6 overflow-auto"
      onClick={handleBackdropClick}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      <button
        onClick={onClose}
        className="fixed top-6 right-6 z-50 text-white text-4xl hover:text-gray-300"
      >
        ×
      </button>

      <img
        src={src}
        alt={alt}
        draggable={false}
        onClick={toggleZoom}
        onMouseDown={handleMouseDown}
        style={{
          transform: `translate(${position.x}px, ${position.y}px) scale(${
            zoomed ? 2 : 1
          })`,
          transition: dragging.current ? "none" : "transform 0.25s ease",
          transformOrigin: "center center",
        }}
        className={`max-w-full max-h-[90vh] object-contain select-none ${
          zoomed ? "cursor-grab active:cursor-grabbing" : "cursor-zoom-in"
        }`}
      />
    </div>
  );
};

export default ImageZoomModal;
