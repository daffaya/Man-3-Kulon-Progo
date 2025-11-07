// frontend/src/pages/admin/gallery/AlbumPhotosPage.tsx
import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { ChevronLeft, Upload, Settings, Eye, X, Edit } from "lucide-react"; // Tambahkan Edit icon
import AdminLayout from "../../../components/layout/AdminLayout";
import { useGallery } from "../../../contexts/GalleryContext";
import { useToastMessage } from "../../../hooks/useToastMessage";
import PhotoGrid from "../../../components/gallery/PhotoGrid";
import GalleryUpload from "../../../components/gallery/GalleryUpload";
import AlbumCoverSelector from "../../../components/gallery/AlbumCoverSelector";
import PhotoLightbox from "../../../components/gallery/PhotoLightBox";
import AlbumForm from "../../../components/forms/AlbumForm"; // Tambahkan import AlbumForm
import { AlbumFormData } from "../../../types/galleryTypes"; // Tambahkan import type

/**
 * Page component for managing photos in an album.
 */
const AlbumPhotosPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const {
    state,
    fetchAlbumById,
    uploadPhotos,
    setAlbumCover,
    deletePhoto,
    updateAlbum,
  } = useGallery(); // Tambahkan updateAlbum
  const { currentAlbum, currentPhotos, loading } = state;
  const navigate = useNavigate();
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showCoverSelector, setShowCoverSelector] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false); // Tambahkan state untuk edit modal
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const [isUpdating, setIsUpdating] = useState(false); // Tambahkan state untuk loading update
  const { showSuccessToast, showErrorToast } = useToastMessage();

  useEffect(() => {
    if (id) {
      fetchAlbumById(id);
    }
  }, [id, fetchAlbumById]);

  const handlePhotoClick = (photo: any) => {
    // Find the index of the clicked photo
    const index = currentPhotos.findIndex((p: any) => p.id === photo.id);
    if (index !== -1) {
      setCurrentPhotoIndex(index);
      setLightboxOpen(true);
    }
  };

  const handlePhotoDelete = async (photoId: string) => {
    try {
      await deletePhoto(photoId);
      showSuccessToast("Foto berhasil dihapus");
    } catch (error) {
      showErrorToast("Gagal menghapus foto");
    }
  };

  const handleUpload = async (files: File[]) => {
    console.log("handleUpload called with files:", files);
    if (!id) {
      console.log("No album id found");
      return;
    }

    try {
      console.log("Calling uploadPhotos with albumId:", id);
      await uploadPhotos(id, files);
      console.log("Upload completed successfully");
      setShowUploadModal(false);
      showSuccessToast("Foto berhasil diupload");
    } catch (error) {
      console.error("Upload error:", error);
      showErrorToast("Gagal mengupload foto");
    }
  };

  const handleCoverSelect = async (photoId: string) => {
    if (!id) return;

    try {
      await setAlbumCover(id, photoId);
      setShowCoverSelector(false);
      showSuccessToast("Cover album berhasil diperbarui");
    } catch (error) {
      showErrorToast("Gagal mengubah cover album");
    }
  };

  // Tambahkan fungsi untuk handle edit album
  const handleEditAlbum = async (formData: AlbumFormData) => {
    if (!id) return;

    setIsUpdating(true);
    try {
      await updateAlbum(id, formData);
      setShowEditModal(false);
      showSuccessToast("Album berhasil diperbarui");
    } catch (error) {
      showErrorToast("Gagal memperbarui album");
    } finally {
      setIsUpdating(false);
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="container max-w-6xl mx-auto px-4 sm:px-6 py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent mx-auto"></div>
            <p className="mt-4">Loading album...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  if (!currentAlbum) {
    return (
      <AdminLayout>
        <div className="container max-w-6xl mx-auto px-4 sm:px-6 py-12 text-center">
          <h1 className="text-2xl font-bold mb-4">Album tidak ditemukan</h1>
          <Link to="/atmin/gallery" className="text-accent hover:underline">
            Kembali ke Manajemen Galeri
          </Link>
        </div>
      </AdminLayout>
    );
  }

  // Prepare initial data for edit form
  const initialData: AlbumFormData = {
    title: currentAlbum.title,
    description: currentAlbum.description,
    cover_photo_id: currentAlbum.cover_photo_id,
  };

  return (
    <AdminLayout>
      <div className="container max-w-6xl mx-auto px-4 sm:px-6 py-12">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Link
                to="/atmin/gallery"
                className="mr-4 text-gray-600 dark:text-gray-400 hover:text-accent dark:hover:text-accent transition-colors"
              >
                <ChevronLeft size={20} />
              </Link>
              <div>
                <h1 className="text-3xl font-serif font-bold">
                  {currentAlbum.title}
                </h1>
                <p className="text-gray-600 dark:text-gray-400">
                  Kelola foto dalam album
                </p>
              </div>
            </div>

            <div className="flex space-x-2">
              {/* Tambahkan tombol Edit Album */}
              <button
                onClick={() => setShowEditModal(true)}
                className="btn btn-secondary flex items-center"
              >
                <Edit size={18} className="mr-1" />
                Edit Album
              </button>
              <button
                onClick={() => setShowUploadModal(true)}
                className="btn btn-primary flex items-center"
              >
                <Upload size={18} className="mr-1" />
                Upload Foto
              </button>
              <button
                onClick={() => setShowCoverSelector(true)}
                className="btn btn-secondary flex items-center"
              >
                <Settings size={18} className="mr-1" />
                Cover Album
              </button>
            </div>
          </div>
        </div>

        {/* Photos Grid */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
          {currentPhotos.length > 0 ? (
            <PhotoGrid
              key={`photos-${currentPhotos.length}-${
                currentAlbum?.updated_at || ""
              }`}
              photos={currentPhotos}
              onPhotoClick={handlePhotoClick}
              onPhotoDelete={handlePhotoDelete}
              showDeleteButton={true}
            />
          ) : (
            <div className="text-center py-12">
              <Eye size={48} className="mx-auto text-gray-400 mb-4" />
              <h3 className="text-xl font-medium text-gray-600 dark:text-gray-400 mb-2">
                Belum ada foto di album ini
              </h3>
              <p className="text-gray-500 dark:text-gray-400 mb-4">
                Upload foto untuk mengisi album ini
              </p>
              <button
                onClick={() => setShowUploadModal(true)}
                className="btn btn-primary"
              >
                Upload Foto Sekarang
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold">Upload Foto</h3>
                <button
                  onClick={() => setShowUploadModal(false)}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  <X size={24} />
                </button>
              </div>
              <GalleryUpload
                onUpload={handleUpload}
                maxFiles={10}
                maxSize={10}
              />
            </div>
          </div>
        </div>
      )}

      {/* Edit Album Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold">Edit Album</h3>
                <button
                  onClick={() => setShowEditModal(false)}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  <X size={24} />
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
        </div>
      )}

      {/* Cover Selector Modal */}
      {showCoverSelector && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold">Pilih Cover Album</h3>
                <button
                  onClick={() => setShowCoverSelector(false)}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  <X size={24} />
                </button>
              </div>
              <AlbumCoverSelector
                photos={currentPhotos}
                currentCoverId={currentAlbum.cover_photo_id}
                onCoverSelect={handleCoverSelect}
                isEditMode={true}
              />
            </div>
          </div>
        </div>
      )}

      {/* Photo Lightbox */}
      <PhotoLightbox
        photos={currentPhotos}
        currentPhotoIndex={currentPhotoIndex}
        isOpen={lightboxOpen}
        onClose={() => setLightboxOpen(false)}
        onPrevious={() => setCurrentPhotoIndex((prev) => Math.max(0, prev - 1))}
        onNext={() =>
          setCurrentPhotoIndex((prev) =>
            Math.min(currentPhotos.length - 1, prev + 1)
          )
        }
      />
    </AdminLayout>
  );
};

export default AlbumPhotosPage;
