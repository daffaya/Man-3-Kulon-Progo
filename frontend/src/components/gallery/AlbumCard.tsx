// frontend/src/components/gallery/AlbumCard.tsx
import React from "react";
import { Link } from "react-router-dom";
import { Album } from "../../types/galleryTypes";
import { Calendar, Image, X, Settings } from "lucide-react";
import { formatDate } from "../../lib/utils";
import ImageWithFallback from "../ui/ImageWithFallback";

interface AlbumCardProps {
  album: Album;
  showDescription?: boolean;
  onDelete?: (id: string) => void;
  showDeleteButton?: boolean;
  isAdmin?: boolean; // Tambahkan prop untuk menentukan apakah ini untuk admin
}

const AlbumCard: React.FC<AlbumCardProps> = ({
  album,
  showDescription = false,
  onDelete,
  showDeleteButton = false,
  isAdmin = false, // Default false untuk public
}) => {
  const {
    id,
    title,
    slug,
    description,
    photo_count,
    cover_thumbnail_url,
    created_at,
  } = album;

  // Tentukan link berdasarkan apakah ini untuk admin atau public
  const albumLink = isAdmin ? `/atmin/gallery/${id}/photos` : `/galeri/${slug}`;

  return (
    <article className="bg-white dark:bg-semibackground rounded-xl shadow-md overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1 flex flex-col h-full relative">
      {/* Delete button for admin */}
      {showDeleteButton && onDelete && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete(album.id);
          }}
          className="absolute top-2 right-2 z-10 bg-red-600 text-white p-1.5 rounded-full hover:bg-red-700 transition-colors"
          aria-label="Hapus album"
        >
          <X size={16} />
        </button>
      )}

      <Link to={albumLink} className="block overflow-hidden aspect-[16/9]">
        <ImageWithFallback
          src={cover_thumbnail_url || "/placeholder-image.jpg"}
          alt={title}
          className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
          fallback="/placeholder-image.jpg"
        />
      </Link>

      <div className="p-5 flex flex-col flex-grow">
        <div className="flex items-start justify-between mb-3">
          <h3 className="text-xl font-serif font-bold flex-1">
            <Link
              to={albumLink}
              className="hover:text-accent transition-colors"
            >
              {title}
            </Link>
          </h3>

          <div className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-full">
            <Image size={14} />
            <span>{photo_count}</span>
          </div>
        </div>

        {showDescription && description && (
          <p className="fade-text text-gray-600 dark:text-gray-400 mb-4 text-sm">
            {description}
          </p>
        )}

        <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400 mt-auto">
          <span className="flex items-center gap-1">
            <Calendar size={14} />
            {formatDate(created_at)}
          </span>

          <Link
            to={albumLink}
            className="text-accent hover:text-accent/80 transition-colors font-medium"
          >
            {isAdmin ? "Kelola Foto" : "Lihat Album"}
          </Link>
        </div>
      </div>
    </article>
  );
};

export default AlbumCard;
