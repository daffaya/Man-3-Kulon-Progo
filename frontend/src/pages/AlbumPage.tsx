// frontend/src/pages/AlbumPage.tsx
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

const AlbumPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const { state, fetchPublicAlbumById, clearCurrentAlbum } = useGallery();
  const { currentAlbum, currentPhotos, loading } = state;
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  const [viewCount, setViewCount] = useState(0);
  const { showErrorToast, showSuccessToast } = useToastMessage();

  // Update document title
  useEffect(() => {
    document.title = currentAlbum
      ? `${currentAlbum.title} - Galeri Foto - MAN 3 Kulon Progo`
      : "Album - Galeri Foto - MAN 3 Kulon Progo";
  }, [currentAlbum]);

  // Fetch album data
  useEffect(() => {
    if (slug) fetchPublicAlbumById(slug);
    return () => clearCurrentAlbum();
  }, [slug, fetchPublicAlbumById, clearCurrentAlbum]);

  // Simulate view count
  useEffect(() => {
    if (currentAlbum) {
      setViewCount(Math.floor(Math.random() * 500) + 100);
    }
  }, [currentAlbum]);

  const handlePhotoClick = (photo: any, index: number) => {
    setCurrentPhotoIndex(index);
    setLightboxOpen(true);
  };

  const handlePrevious = () => {
    setCurrentPhotoIndex((prev) => Math.max(0, prev - 1));
  };

  const handleNext = () => {
    setCurrentPhotoIndex((prev) =>
      Math.min(currentPhotos.length - 1, prev + 1)
    );
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      showSuccessToast("Tautan album telah disalin!");
    } catch {
      showErrorToast("Gagal menyalin tautan.");
    }
  };

  const handleShareWhatsApp = () => {
    const text = `Lihat album foto ${currentAlbum?.title} di MAN 3 Kulon Progo: ${window.location.href}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank");
  };

  const handleLike = () => {
    setIsLiked(!isLiked);
    showSuccessToast(
      isLiked ? "Anda telah membatalkan suka" : "Anda menyukai album ini"
    );
  };

  const handleDownload = () => {
    // Implement download functionality
    showSuccessToast("Fitur unduh akan segera tersedia");
  };

  // Loading State with Skeleton
  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
          {/* Hero Skeleton */}
          <div className="relative h-72 md:h-96 bg-gray-200 dark:bg-gray-700 animate-pulse"></div>

          {/* Album Info Skeleton */}
          <div className="container max-w-4xl mx-auto px-4 -mt-12 relative z-10">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 md:p-8 animate-pulse">
              <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-4"></div>
              <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
              <div className="flex gap-3 mt-6">
                <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded w-32"></div>
                <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded w-40"></div>
              </div>
            </div>
          </div>

          {/* Photos Grid Skeleton */}
          <div className="container max-w-6xl mx-auto px-4 sm:px-6 py-12">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {[...Array(8)].map((_, i) => (
                <div
                  key={i}
                  className="aspect-square bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse"
                ></div>
              ))}
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  // Not Found
  if (!currentAlbum) {
    return (
      <Layout>
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
          <div className="text-center max-w-md mx-auto px-4">
            <div className="w-24 h-24 mx-auto mb-6 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center">
              <Image size={40} className="text-gray-400 dark:text-gray-500" />
            </div>
            <h1 className="text-2xl font-bold mb-4 text-gray-700 dark:text-gray-200">
              Album tidak ditemukan
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mb-6">
              Maaf, album yang Anda cari tidak tersedia atau telah dihapus.
            </p>
            <Link
              to="/galeri"
              className="inline-flex items-center gap-2 px-5 py-2 bg-accent hover:bg-accent/90 rounded-full text-white shadow transition-all"
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
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        {/* Hero Header with Gradient Overlay */}
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

          {/* Back Button */}
          <Link
            to="/galeri"
            className="absolute top-4 left-4 z-10 inline-flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-md rounded-full text-white shadow-lg hover:bg-white/30 transition-all"
          >
            <ArrowLeft size={16} /> Kembali
          </Link>

          {/* Title and Description */}
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

        {/* Album Info Card with Enhanced Design */}
        <div className="container max-w-4xl mx-auto px-4 -mt-8 relative z-10">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl p-6 md:p-8 border border-gray-100 dark:border-gray-700">
            {/* Stats Row */}
            <div className="flex flex-wrap justify-between items-center pb-6 border-b border-gray-100 dark:border-gray-700">
              <div className="flex items-center gap-6 text-sm">
                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                  <Image size={18} className="text-accent" />
                  <span className="font-medium">
                    {currentAlbum.photo_count} foto
                  </span>
                </div>
                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                  <Calendar size={18} className="text-accent" />
                  <span className="font-medium">
                    {formatDate(currentAlbum.created_at)}
                  </span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-3">
              <button
                onClick={handleCopyLink}
                className="flex items-center gap-2 text-sm px-4 py-2 rounded-md bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-600 hover:bg-gray-200 dark:hover:bg-gray-600 transition-all"
              >
                <Copy size={16} /> Salin tautan
              </button>
              <button
                onClick={handleShareWhatsApp}
                className="flex items-center gap-2 text-sm px-4 py-2 rounded-md bg-green-500 hover:bg-green-600 text-white transition-all shadow-md hover:shadow-lg"
              >
                <Share2 size={16} /> Bagikan via WhatsApp
              </button>
            </div>
          </div>
        </div>

        {/* Photos Grid with Enhanced Design */}
        <div className="container max-w-6xl mx-auto px-4 sm:px-6 py-12">
          {currentPhotos.length > 0 ? (
            <>
              <div className="mb-8 text-center">
                <h2 className="text-2xl font-serif font-bold text-gray-800 dark:text-gray-200 mb-2">
                  Koleksi Foto
                </h2>
                <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
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
              <div className="w-28 h-28 mx-auto mb-6 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
                <Image size={40} className="text-gray-400 dark:text-gray-500" />
              </div>
              <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Belum ada foto di album ini
              </h3>
              <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto">
                Silakan kembali lagi nanti untuk melihat foto-foto terbaru dari
                kegiatan sekolah.
              </p>
            </div>
          )}
        </div>

        {/* Photo Lightbox */}
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
