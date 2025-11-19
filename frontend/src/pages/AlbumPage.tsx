/**
 * @fileoverview AlbumPage component for displaying a photo album from the gallery.
 * This component renders a detailed view of a photo album with its cover image, metadata,
 * and a grid of photos. It includes functionality for viewing photos in a lightbox,
 * sharing the album, and copying links.
 */

import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useGallery } from "../contexts/GalleryContext";
import { useToastMessage } from "../hooks/useToastMessage";
import PhotoGrid from "../components/gallery/PhotoGrid";
import PhotoLightbox from "../components/gallery/PhotoLightBox";
import {
  ArrowLeft,
  Calendar,
  Image,
  Share2,
  Copy,
  Download,
  Heart,
  Eye,
} from "lucide-react";
import { formatDate } from "../lib/utils";
import Layout from "../components/layout/Layout";
import ImageWithFallback from "../components/ui/ImageWithFallback";

/**
 * Component that renders a detailed view of a photo album from the gallery.
 * It displays the album's cover image, metadata, and a grid of photos with lightbox functionality.
 * Also includes features for sharing the album and copying links.
 */
const AlbumPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const { state, fetchPublicAlbumById, clearCurrentAlbum } = useGallery();
  const { currentAlbum, currentPhotos, loading } = state;
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  const [viewCount, setViewCount] = useState(0);
  const { showErrorToast, showSuccessToast } = useToastMessage();

  useEffect(() => {
    document.title = currentAlbum
      ? `${currentAlbum.title} - Galeri Foto - MAN 3 Kulon Progo`
      : "Album - Galeri Foto - MAN 3 Kulon Progo";
  }, [currentAlbum]);

  useEffect(() => {
    if (slug) fetchPublicAlbumById(slug);
    return () => clearCurrentAlbum();
  }, [slug, fetchPublicAlbumById, clearCurrentAlbum]);

  useEffect(() => {
    if (currentAlbum) {
      setViewCount(Math.floor(Math.random() * 500) + 100);
    }
  }, [currentAlbum]);

  /**
   * Opens the lightbox at the specified photo index.
   * @param {any} photo - The photo object that was clicked.
   * @param {number} index - The index of the photo in the photos array.
   */
  const handlePhotoClick = (photo: any, index: number) => {
    setCurrentPhotoIndex(index);
    setLightboxOpen(true);
  };

  /**
   * Navigates to the previous photo in the lightbox.
   */
  const handlePrevious = () => {
    setCurrentPhotoIndex((prev) => Math.max(0, prev - 1));
  };

  /**
   * Navigates to the next photo in the lightbox.
   */
  const handleNext = () => {
    setCurrentPhotoIndex((prev) =>
      Math.min(currentPhotos.length - 1, prev + 1)
    );
  };

  /**
   * Copies the current album URL to the clipboard.
   */
  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      showSuccessToast("Tautan album telah disalin!");
    } catch {
      showErrorToast("Gagal menyalin tautan.");
    }
  };

  /**
   * Opens WhatsApp with a pre-filled message to share the album.
   */
  const handleShareWhatsApp = () => {
    const text = `Lihat album foto ${currentAlbum?.title} di MAN 3 Kulon Progo: ${window.location.href}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank");
  };

  /**
   * Toggles the like status of the album and shows a toast notification.
   */
  const handleLike = () => {
    setIsLiked(!isLiked);
    showSuccessToast(
      isLiked ? "Anda telah membatalkan suka" : "Anda menyukai album ini"
    );
  };

  /**
   * Shows a toast notification indicating the download feature is coming soon.
   */
  const handleDownload = () => {
    showSuccessToast("Fitur unduh akan segera tersedia");
  };

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen bg-background">
          <div className="relative h-72 md:h-96 bg-semibackground animate-pulse"></div>
          <div className="container max-w-4xl mx-auto px-4 -mt-12 relative z-10">
            <div className="card p-6 md:p-8 animate-pulse">
              <div className="h-6 bg-semibackground rounded w-1/4 mb-4"></div>
              <div className="h-6 bg-semibackground rounded w-1/4"></div>
              <div className="flex gap-3 mt-6">
                <div className="h-10 bg-semibackground rounded w-32"></div>
                <div className="h-10 bg-semibackground rounded w-40"></div>
              </div>
            </div>
          </div>
          <div className="container max-w-6xl mx-auto px-4 sm:px-6 py-12">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {[...Array(8)].map((_, i) => (
                <div
                  key={i}
                  className="aspect-square bg-semibackground rounded-lg animate-pulse"
                ></div>
              ))}
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (!currentAlbum) {
    return (
      <Layout>
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="text-center max-w-md mx-auto px-4">
            <div className="w-24 h-24 mx-auto mb-6 bg-semibackground rounded-full flex items-center justify-center">
              <Image size={40} className="text-secondary/50" />
            </div>
            <h1 className="text-2xl font-bold mb-4 text-foreground">
              Album tidak ditemukan
            </h1>
            <p className="text-secondary mb-6">
              Maaf, album yang Anda cari tidak tersedia atau telah dihapus.
            </p>
            <Link
              to="/galeri"
              className="btn btn-primary inline-flex items-center gap-2"
            >
              <ArrowLeft size={16} /> Kembali ke Galeri
            </Link>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-background">
        <div className="relative h-72 md:h-96 overflow-hidden group">
          <ImageWithFallback
            src={
              currentAlbum.cover_image_url ||
              currentAlbum.cover_thumbnail_url ||
              "/placeholder-image.jpg"
            }
            alt={currentAlbum.title}
            className="w-full h-full object-cover transform scale-105 group-hover:scale-110 transition-transform duration-1000"
            fallback="/placeholder-image.jpg"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>

          <Link
            to="/galeri"
            className="absolute top-4 left-4 z-10 btn btn-secondary backdrop-blur-md text-white bg-white/20 hover:bg-white/30"
          >
            <ArrowLeft size={16} /> Kembali
          </Link>

          <div className="absolute bottom-0 left-0 right-0 p-6 md:p-10 text-white">
            <div className="container max-w-4xl mx-auto px-4 mb-4">
              <h1 className="text-3xl md:text-5xl font-serif font-bold mb-3 drop-shadow-lg">
                {currentAlbum.title}
              </h1>
              {currentAlbum.description && (
                <p className="text-white text-lg leading-normal whitespace-normal max-w-none">
                  {currentAlbum.description}
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="container max-w-4xl mx-auto px-4 -mt-8 relative z-10">
          <div className="card p-6 md:p-8">
            <div className="flex flex-wrap justify-between items-center pb-6 border-b border-semibackground/20">
              <div className="flex items-center gap-6 text-sm">
                <div className="flex items-center gap-2 text-secondary">
                  <Image size={18} className="text-accent" />
                  <span className="font-medium">
                    {currentAlbum.photo_count} foto
                  </span>
                </div>
                <div className="flex items-center gap-2 text-secondary">
                  <Calendar size={18} className="text-accent" />
                  <span className="font-medium">
                    {formatDate(currentAlbum.created_at)}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-3 mt-6">
              <button
                onClick={handleCopyLink}
                className="btn btn-secondary text-sm flex items-center gap-2"
              >
                <Copy size={16} /> Salin tautan
              </button>
              <button
                onClick={handleShareWhatsApp}
                className="btn btn-primary text-sm flex items-center gap-2 bg-green-500 hover:bg-green-600"
              >
                <Share2 size={16} /> Bagikan via WhatsApp
              </button>
            </div>
          </div>
        </div>

        <div className="container max-w-6xl mx-auto px-4 sm:px-6 py-12">
          {currentPhotos.length > 0 ? (
            <>
              <div className="mb-8 text-center">
                <h2 className="text-2xl font-serif font-bold text-foreground mb-2">
                  Koleksi Foto
                </h2>
                <p className="text-secondary max-w-2xl mx-auto">
                  Jelajahi momen-momen berharga yang telah kami abadikan dalam
                  album ini
                </p>
              </div>
              <PhotoGrid
                photos={currentPhotos}
                onPhotoClick={handlePhotoClick}
              />
            </>
          ) : (
            <div className="text-center py-20">
              <div className="w-28 h-28 mx-auto mb-6 bg-semibackground rounded-full flex items-center justify-center">
                <Image size={40} className="text-secondary/50" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">
                Belum ada foto di album ini
              </h3>
              <p className="text-secondary max-w-md mx-auto">
                Silakan kembali lagi nanti untuk melihat foto-foto terbaru dari
                kegiatan sekolah.
              </p>
            </div>
          )}
        </div>

        <PhotoLightbox
          photos={currentPhotos}
          currentPhotoIndex={currentPhotoIndex}
          isOpen={lightboxOpen}
          onClose={() => setLightboxOpen(false)}
          onPrevious={handlePrevious}
          onNext={handleNext}
        />
      </div>
    </Layout>
  );
};

export default AlbumPage;
