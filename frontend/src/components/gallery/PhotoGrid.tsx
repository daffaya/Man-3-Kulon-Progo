/**
 * @fileoverview React component for displaying a responsive grid of photos.
 * This component renders photos in a grid layout with hover effects, view/delete buttons,
 * and optional selection functionality. It supports different interaction modes based on props.
 */

import React, { useState } from "react";
import { Photo } from "../../types/galleryTypes";
import ImageWithFallback from "../ui/ImageWithFallback";
import { X } from "lucide-react";

/**
 * Props for the PhotoGrid component
 * @interface PhotoGridProps
 */
interface PhotoGridProps {
  /** Array of photo objects to display in the grid */
  photos: Photo[];
  /** Optional function called when a photo is clicked, receives photo and index */
  onPhotoClick?: (photo: Photo, index: number) => void;
  /** Optional function called when a photo delete button is clicked */
  onPhotoDelete?: (photoId: string) => void;
  /** Whether to show delete buttons on photos */
  showDeleteButton?: boolean;
  /** Whether photos can be selected with checkboxes */
  selectable?: boolean;
  /** Optional function called when a photo selection changes */
  onPhotoSelect?: (photoId: string) => void;
  /** Array of selected photo IDs */
  selectedPhotos?: string[];
}

/**
 * Photo grid component for displaying photos in a responsive grid layout.
 * Features hover effects, view/delete buttons, and optional selection functionality.
 * Each photo is displayed with its thumbnail and optional title overlay.
 *
 * @param {PhotoGridProps} props - The component props
 * @returns {JSX.Element} The rendered photo grid
 */
const PhotoGrid: React.FC<PhotoGridProps> = ({
  photos,
  onPhotoClick,
  onPhotoDelete,
  showDeleteButton = false,
  selectable = false,
  onPhotoSelect,
  selectedPhotos = [],
}) => {
  const [hoveredPhoto, setHoveredPhoto] = useState<string | null>(null);

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
      {photos.map((photo, index) => (
        <div
          key={`${photo.id}`}
          className="relative group aspect-square overflow-hidden rounded-lg bg-gray-100 dark:bg-gray-800 cursor-pointer"
          onMouseEnter={() => setHoveredPhoto(photo.id)}
          onMouseLeave={() => setHoveredPhoto(null)}
          onClick={() => onPhotoClick?.(photo, index)}
        >
          {/* Photo */}
          <ImageWithFallback
            src={photo.thumbnail_url}
            alt={photo.alt_text || photo.title}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            fallback="/placeholder-image.jpg"
          />

          {/* Overlay */}
          <div
            className={`absolute inset-0 bg-black/50 transition-opacity duration-300 ${
              hoveredPhoto === photo.id ? "opacity-100" : "opacity-0"
            }`}
          >
            {/* Delete Button */}
            {showDeleteButton && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onPhotoDelete?.(photo.id);
                }}
                className="absolute top-2 right-2 bg-red-600 text-white p-1.5 rounded-full hover:bg-red-700 transition-colors"
                aria-label="Hapus foto"
              >
                <X size={16} />
              </button>
            )}

            {/* Selection Checkbox */}
            {selectable && (
              <div className="absolute top-2 left-2">
                <input
                  type="checkbox"
                  checked={selectedPhotos.includes(photo.id)}
                  onChange={(e) => {
                    e.stopPropagation();
                    onPhotoSelect?.(photo.id);
                  }}
                  className="w-5 h-5 text-accent bg-white border-gray-300 rounded focus:ring-accent"
                />
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default PhotoGrid;
