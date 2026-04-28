/**
 * @fileoverview Album photos page component for managing photos within a gallery album.
 * This component provides an interface for viewing, uploading, deleting, and managing
 * photos in a specific album. It includes modals for uploading photos, editing
 * album details, selecting album covers, and a lightbox for viewing photos.
 */

import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { ChevronLeft, Upload, Settings, Eye, X, Edit } from "lucide-react";
import AdminLayout from "../../../components/layout/AdminLayout";
import { useGallery } from "../../../contexts/GalleryContext";
import { useToastMessage } from "../../../hooks/useToastMessage";
import PhotoGrid from "../../../components/gallery/PhotoGrid";
import GalleryUpload from "../../../components/gallery/GalleryUpload";
import AlbumCoverSelector from "../../../components/gallery/AlbumCoverSelector";
import PhotoLightbox from "../../../components/gallery/PhotoLightBox";
import AlbumForm from "../../../components/forms/AlbumForm";
import { AlbumFormData } from "../../../types/galleryTypes";

/**
 * Page component for managing photos within a specific gallery album.
 * Provides functionality to view, upload, delete photos, edit album details,
 * select album covers, and view photos in a lightbox.
 */
const AlbumPhotosPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const {
    state,
    fetchAlbumById,
    uploadPhotos,
    setAlbumCover,
    deletePhoto,
    updateAlbum,
  } = useGallery();
  const { currentAlbum, currentPhotos, loading } = state;
  const { showSuccessToast, showErrorToast } = useToastMessage();

  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showCoverSelector, setShowCoverSelector] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    if (id) fetchAlbumById(id);
  }, [id, fetchAlbumById]);

  /**
   * Handles clicking on a photo to open it in the lightbox.
   * @param {any} photo - The photo object that was clicked
   */
  const handlePhotoClick = (photo: any) => {
    const index = currentPhotos.findIndex((p: any) => p.id === photo.id);
    if (index !== -1) {
      setCurrentPhotoIndex(index);
      setLightboxOpen(true);
    }
  };

  /**
   * Handles deleting a photo from the album.
   * @param {string} photoId - The ID of the photo to delete
   */
  const handlePhotoDelete = async (photoId: string) => {
    try {
      await deletePhoto(photoId);
      showSuccessToast("Foto berhasil dihapus");
    } catch {
      showErrorToast("Gagal menghapus foto");
    }
  };

  /**
   * Handles uploading new photos to the album.
   * @param {File[]} files - Array of files to upload
   */
  const handleUpload = async (files: File[]) => {
    if (!id) return;
    try {
      await uploadPhotos(id, files);
      setShowUploadModal(false);
      showSuccessToast("Foto berhasil diupload");
    } catch {
      showErrorToast("Gagal mengupload foto");
    }
  };

  /**
   * Handles selecting a new cover photo for the album.
   * @param {string} photoId - The ID of the photo to set as cover
   */
  const handleCoverSelect = async (photoId: string) => {
    if (!id) return;
    try {
      await setAlbumCover(id, photoId);
      setShowCoverSelector(false);
      showSuccessToast("Cover album berhasil diperbarui");
    } catch {
      showErrorToast("Gagal mengubah cover album");
    }
  };

  /**
   * Handles editing album details.
   * @param {AlbumFormData} formData - The updated album data
   */
  const handleEditAlbum = async (formData: AlbumFormData) => {
    if (!id) return;
    setIsUpdating(true);
    try {
      await updateAlbum(id, formData);
      setShowEditModal(false);
      showSuccessToast("Album berhasil diperbarui");
    } catch {
      showErrorToast("Gagal memperbarui album");
    } finally {
      setIsUpdating(false);
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="container max-w-6xl mx-auto px-4 py-12 text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 border-4 border-accent/20 border-t-accent rounded-full animate-spin" />
          <p className="mt-4 text-secondary">Memuat album...</p>
        </div>
      </AdminLayout>
    );
  }

  if (!currentAlbum) {
    return (
      <AdminLayout>
        <div className="container max-w-6xl mx-auto px-4 py-12 text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">
            Album tidak ditemukan
          </h1>
          <Link to="/atmin/gallery" className="text-accent hover:underline">
            Kembali ke Galeri
          </Link>
        </div>
      </AdminLayout>
    );
  }

  const initialData: AlbumFormData = {
    title: currentAlbum.title,
    description: currentAlbum.description,
    cover_photo_id: currentAlbum.cover_photo_id,
  };

  return (
    <AdminLayout>
      <div className="container max-w-6xl mx-auto px-4 sm:px-6 py-8 fade-in">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div className="flex items-center">
            <Link
              to="/atmin/gallery"
              className="text-secondary hover:text-accent flex items-center mr-4 transition-colors"
            >
              <ChevronLeft className="h-5 w-5" />
            </Link>
            <div>
              <h1 className="text-3xl font-serif font-bold text-foreground">
                {currentAlbum.title}
              </h1>
              <p className="text-secondary">{currentPhotos.length} foto</p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => navigate(`/atmin/gallery/${id}/edit`)}
              className="btn btn-secondary text-primary flex items-center"
            >
              <Edit className="h-5 w-5 mr-2" />
              Edit Album
            </button>
            <button
              onClick={() => setShowCoverSelector(true)}
              className="btn btn-secondary text-primary  flex items-center"
            >
              <Settings className="h-5 w-5 mr-2" />
              Cover
            </button>
            <button
              onClick={() => setShowUploadModal(true)}
              className="btn btn-primary flex items-center"
            >
              <Upload className="h-5 w-5 mr-2" />
              Upload Foto
            </button>
          </div>
        </div>

        {/* Photo Grid */}
        <div className="card p-6">
          {currentPhotos.length > 0 ? (
            <PhotoGrid
              photos={currentPhotos}
              onPhotoClick={handlePhotoClick}
              onPhotoDelete={handlePhotoDelete}
              showDeleteButton
            />
          ) : (
            <div className="text-center py-16">
              <Eye className="h-16 w-16 text-secondary/30 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-foreground mb-2">
                Belum Ada Foto
              </h3>
              <p className="text-secondary mb-6">
                Album ini masih kosong. Mulai unggah foto untuk mengisinya.
              </p>
              <button
                onClick={() => setShowUploadModal(true)}
                className="btn btn-primary"
              >
                Upload Foto Pertama
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="card max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold text-foreground">
                Upload Foto
              </h3>
              <button
                onClick={() => setShowUploadModal(false)}
                className="text-secondary hover:text-foreground"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            <GalleryUpload onUpload={handleUpload} maxFiles={10} maxSize={10} />
          </div>
        </div>
      )}

      {/* Edit Album Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="card max-w-lg w-full max-h-[90vh] overflow-y-auto p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold text-foreground">
                Edit Album
              </h3>
              <button
                onClick={() => setShowEditModal(false)}
                className="text-secondary hover:text-foreground"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            <AlbumForm
              initialData={initialData}
              onSubmit={handleEditAlbum}
              onCancel={() => setShowEditModal(false)}
              isLoading={isUpdating}
            />
          </div>
        </div>
      )}

      {/* Cover Selector Modal */}
      {showCoverSelector && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="card max-w-5xl w-full max-h-[90vh] overflow-y-auto p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold text-foreground">
                Pilih Cover Album
              </h3>
              <button
                onClick={() => setShowCoverSelector(false)}
                className="text-secondary hover:text-foreground"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            <AlbumCoverSelector
              photos={currentPhotos}
              currentCoverId={currentAlbum.cover_photo_id}
              onCoverSelect={handleCoverSelect}
              isEditMode
            />
          </div>
        </div>
      )}

      {/* Lightbox */}
      <PhotoLightbox
        photos={currentPhotos}
        currentPhotoIndex={currentPhotoIndex}
        isOpen={lightboxOpen}
        onClose={() => setLightboxOpen(false)}
        onPrevious={() => setCurrentPhotoIndex((prev) => Math.max(0, prev - 1))}
        onNext={() =>
          setCurrentPhotoIndex((prev) =>
            Math.min(currentPhotos.length - 1, prev + 1),
          )
        }
      />
    </AdminLayout>
  );
};

export default AlbumPhotosPage;
