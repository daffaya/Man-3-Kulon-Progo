// frontend/src/components/gallery/AlbumList.tsx
import React from "react";
import { Album } from "../../types/galleryTypes";
import AlbumCard from "./AlbumCard";
import { RefreshCw, Image } from "lucide-react";

interface AlbumListProps {
  albums: Album[];
  columns?: 1 | 2 | 3 | 4;
  loading: boolean;
  showDescription?: boolean;
  showDeleteButton?: boolean;
  isAdmin?: boolean;
  onDelete?: (id: string) => void;
}

const AlbumList: React.FC<AlbumListProps> = ({
  albums,
  columns = 3,
  loading,
  showDescription = false,
  showDeleteButton = false,
  isAdmin = false,
  onDelete,
}) => {
  if (loading) {
    return (
      <div className="text-center py-12">
        <RefreshCw size={32} className="mx-auto animate-spin text-accent" />
        <p className="mt-4 text-gray-600 dark:text-gray-400">
          Loading albums...
        </p>
      </div>
    );
  }

  if (albums.length === 0) {
    return (
      <div className="text-center py-12">
        <Image size={48} className="mx-auto text-gray-400 mb-4" />
        <h3 className="text-xl font-medium text-gray-600 dark:text-gray-400 mb-2">
          Belum ada album
        </h3>
        <p className="text-gray-500 dark:text-gray-400">
          Silakan kunjungi kembali lain waktu untuk melihat album foto terbaru.
        </p>
      </div>
    );
  }

  const gridCols = {
    1: "grid-cols-1",
    2: "grid-cols-1 md:grid-cols-2",
    3: "grid-cols-1 md:grid-cols-2 lg:grid-cols-3",
    4: "grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4",
  }[columns];

  return (
    <div className={`grid ${gridCols} gap-6 sm:gap-8`}>
      {albums.map((album) => (
        <AlbumCard
          key={album.id}
          album={album}
          showDescription={showDescription}
          showDeleteButton={showDeleteButton}
          isAdmin={isAdmin}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
};

export default AlbumList;
