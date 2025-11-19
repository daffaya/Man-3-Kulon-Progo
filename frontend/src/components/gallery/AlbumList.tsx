/**
 * @fileoverview AlbumList component for displaying a grid of album cards.
 * This component handles loading and empty states, and renders a list of AlbumCard components.
 * It supports customization through props for grid columns, visibility of certain UI elements, and admin actions.
 */

import React from "react";
import { Album } from "../../types/galleryTypes";
import AlbumCard from "./AlbumCard";
import { RefreshCw, Image } from "lucide-react";

/**
 * Props for the AlbumList component.
 */
interface AlbumListProps {
  /** An array of album objects to display. */
  albums: Album[];
  /** The number of columns in the grid layout. Defaults to 3. */
  columns?: 1 | 2 | 3 | 4;
  /** Indicates whether the albums are currently being loaded. */
  loading: boolean;
  /** Whether to show the album description on the card. Defaults to false. */
  showDescription?: boolean;
  /** Whether to show the delete button on each card. Defaults to false. */
  showDeleteButton?: boolean;
  /** Whether to display admin-specific controls. Defaults to false. */
  isAdmin?: boolean;
  /** Callback function to handle album deletion. */
  onDelete?: (id: string) => void;
}

/**
 * AlbumList component that renders a responsive grid of AlbumCard components.
 * It displays a loading spinner while fetching data and an empty state message if no albums are found.
 *
 * @param {AlbumListProps} props - The component props.
 * @returns {JSX.Element} The rendered list of albums or a loading/empty state.
 */
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
      <div className="card p-12 text-center">
        <RefreshCw
          size={32}
          className="mx-auto animate-spin text-[rgb(var(--color-accent))]"
        />
        <p className="mt-4 text-secondary">Loading albums...</p>
      </div>
    );
  }

  if (albums.length === 0) {
    return (
      <div className="card p-12 text-center">
        <Image size={48} className="mx-auto text-secondary mb-4" />
        <h3 className="text-xl font-medium text-foreground mb-2">
          Belum ada album
        </h3>
        <p className="text-secondary">
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
