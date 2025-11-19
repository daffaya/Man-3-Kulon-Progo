/**
 * @fileoverview PhotoLightbox component for displaying photos in a modal overlay.
 * This component provides a full-screen lightbox view for photos with navigation controls,
 * download functionality, and keyboard navigation support.
 */

import React, { useState, useEffect } from "react";
import { Photo } from "../../types/galleryTypes";
import ImageWithFallback from "../ui/ImageWithFallback";
import { X, ChevronLeft, ChevronRight, Download } from "lucide-react";

/**
 * Props for the PhotoLightbox component
 */
interface PhotoLightboxProps {
  /** Array of photo objects to display in the lightbox */
  photos: Photo[];
  /** Index of the currently displayed photo */
  currentPhotoIndex: number;
  /** Whether the lightbox is currently open */
  isOpen: boolean;
  /** Callback function to close the lightbox */
  onClose: () => void;
  /** Callback function to navigate to the previous photo */
  onPrevious?: () => void;
  /** Callback function to navigate to the next photo */
  onNext?: () => void;
}

/**
 * PhotoLightbox component that displays photos in a full-screen modal overlay.
 * Provides navigation controls, download functionality, and keyboard navigation support.
 * Handles loading and error states for images.
 *
 * @param {PhotoLightboxProps} props - The component props
 * @returns {JSX.Element | null} The rendered lightbox or null if not open
 */
const PhotoLightbox: React.FC<PhotoLightboxProps> = ({
  photos,
  currentPhotoIndex,
  isOpen,
  onClose,
  onPrevious,
  onNext,
}) => {
  const [currentIndex, setCurrentIndex] = useState(currentPhotoIndex);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    setCurrentIndex(currentPhotoIndex);
  }, [currentPhotoIndex]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      switch (e.key) {
        case "Escape":
          onClose();
          break;
        case "ArrowLeft":
          onPrevious?.();
          break;
        case "ArrowRight":
          onNext?.();
          break;
        default:
          break;
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose, onPrevious, onNext]);

  if (!isOpen || photos.length === 0) return null;

  const currentPhoto = photos[currentIndex];

  /**
   * Handles downloading the current photo
   */
  const handleDownload = () => {
    if (currentPhoto) {
      const link = document.createElement("a");
      link.href = currentPhoto.image_url;
      link.download = currentPhoto.title || `photo-${currentIndex + 1}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  /**
   * Handles image loading errors
   */
  const handleImageError = () => {
    if (!imageError) {
      setImageError(true);
    }
  };

  /**
   * Resets error state and attempts to reload the image
   */
  const handleRetry = () => {
    setImageError(false);
    setImageLoaded(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[rgb(var(--color-foreground)/0.9)] backdrop-blur-sm">
      <button
        onClick={onClose}
        className="absolute top-4 right-4 text-[rgb(var(--color-background))] hover:text-[rgb(var(--color-secondary))] transition-colors z-10"
        aria-label="Tutup"
      >
        <X size={32} />
      </button>

      {photos.length > 1 && (
        <>
          <button
            onClick={() => {
              onPrevious?.();
              setImageError(false);
              setImageLoaded(false);
            }}
            className="absolute left-4 top-1/2 transform -translate-y-1/2 text-[rgb(var(--color-background))] hover:text-[rgb(var(--color-secondary))] transition-colors disabled:opacity-50 disabled:cursor-not-allowed z-10"
            disabled={currentIndex === 0}
            aria-label="Foto sebelumnya"
          >
            <ChevronLeft size={48} />
          </button>
          <button
            onClick={() => {
              onNext?.();
              setImageError(false);
              setImageLoaded(false);
            }}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 text-[rgb(var(--color-background))] hover:text-[rgb(var(--color-secondary))] transition-colors disabled:opacity-50 disabled:cursor-not-allowed z-10"
            disabled={currentIndex === photos.length - 1}
            aria-label="Foto berikutnya"
          >
            <ChevronRight size={48} />
          </button>
        </>
      )}

      <div className="relative max-w-7xl max-h-[90vh] mx-auto p-4">
        {!imageLoaded && !imageError && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[rgb(var(--color-background))]"></div>
          </div>
        )}

        {imageError ? (
          <div className="flex items-center justify-center h-96 bg-[rgb(var(--color-semi-background))] rounded-lg">
            <div className="text-center text-[rgb(var(--color-foreground))]">
              <p className="text-lg mb-2">Gagal memuat foto</p>
              <button
                onClick={handleRetry}
                className="text-[rgb(var(--color-accent))] hover:underline"
              >
                Coba lagi
              </button>
            </div>
          </div>
        ) : (
          <ImageWithFallback
            src={currentPhoto.image_url}
            alt={currentPhoto.alt_text || currentPhoto.title}
            className="max-w-full max-h-[85vh] object-contain mx-auto rounded-lg"
            fallback="/placeholder-image.jpg"
            onLoad={() => setImageLoaded(true)}
            onError={handleImageError}
          />
        )}

        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-[rgb(var(--color-foreground)/0.8)] to-transparent p-6 text-[rgb(var(--color-background))]">
          <h3 className="text-xl font-semibold mb-2">
            {currentPhoto.title || `Foto ${currentIndex + 1}`}
          </h3>
          {currentPhoto.description && (
            <p className="text-[rgb(var(--color-secondary))] mb-2">
              {currentPhoto.description}
            </p>
          )}
          <div className="flex items-center justify-between">
            <span className="text-sm text-[rgb(var(--color-secondary))]">
              {currentIndex + 1} dari {photos.length}
            </span>
            <button
              onClick={handleDownload}
              className="flex items-center gap-2 text-[rgb(var(--color-background))] hover:text-[rgb(var(--color-secondary))] transition-colors"
              aria-label="Download foto"
            >
              <Download size={20} />
              <span>Download</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PhotoLightbox;
