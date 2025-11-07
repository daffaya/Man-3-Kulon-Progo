// frontend/src/components/gallery/AlbumCoverSelector.tsx
import React from "react";
import { Photo } from "../../types/galleryTypes";
import ImageWithFallback from "../ui/ImageWithFallback";
import { Check } from "lucide-react";

interface AlbumCoverSelectorProps {
  photos: Photo[];
  currentCoverId: string | null;
  onCoverSelect: (photoId: string) => void;
  isEditMode: boolean;
}

const AlbumCoverSelector: React.FC<AlbumCoverSelectorProps> = ({
  photos,
  currentCoverId,
  onCoverSelect,
  isEditMode,
}) => {
  return (
    <div className="space-y-4">
      {photos.length === 0 ? (
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          Belum ada foto di album ini
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {photos.map((photo) => (
            <div
              key={photo.id}
              className={`relative aspect-square rounded-lg overflow-hidden cursor-pointer transition-all duration-200 ${
                isEditMode ? "hover:ring-2 hover:ring-accent" : ""
              } ${
                currentCoverId === photo.id
                  ? "ring-2 ring-accent ring-offset-2 ring-offset-white dark:ring-offset-gray-900"
                  : ""
              }`}
              onClick={() => isEditMode && onCoverSelect(photo.id)}
            >
              <ImageWithFallback
                src={photo.thumbnail_url}
                alt={photo.alt_text || photo.title}
                className="w-full h-full object-cover"
                fallback="/placeholder-image.jpg"
              />

              {/* Cover Badge */}
              {currentCoverId === photo.id && (
                <div className="absolute top-2 right-2 bg-accent text-white px-2 py-1 rounded text-xs font-medium flex items-center gap-1">
                  <Check size={12} />
                  Cover
                </div>
              )}

              {/* Edit Mode Overlay */}
              {isEditMode && (
                <div className="absolute inset-0 bg-black/20 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
                  <span className="text-white text-sm font-medium bg-black/50 px-3 py-1 rounded">
                    Jadikan Cover
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {isEditMode && (
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Klik pada foto untuk menjadikannya cover album
        </p>
      )}
    </div>
  );
};

export default AlbumCoverSelector;
