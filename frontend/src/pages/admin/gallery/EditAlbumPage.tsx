// frontend/src/pages/admin/gallery/EditAlbumPage.tsx
import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { ChevronLeft } from "lucide-react";
import AdminLayout from "../../../components/layout/AdminLayout";
import AlbumForm from "../../../components/forms/AlbumForm";
import { useGallery } from "../../../contexts/GalleryContext";
import { useToastMessage } from "../../../hooks/useToastMessage";
import { AlbumFormData } from "../../../types/galleryTypes";

/**
 * Page component for editing an existing album.
 * Handles album update and displays toast notifications for success or error.
 */
const EditAlbumPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { state, fetchAlbumById, updateAlbum } = useGallery();
  const { currentAlbum, loading } = state;
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const { showSuccessToast, showErrorToast } = useToastMessage();

  useEffect(() => {
    if (id) {
      fetchAlbumById(id);
    }
  }, [id, fetchAlbumById]);

  /**
   * Handle album form submission.
   * @param formData Data from the album form
   */
  const handleSubmit = async (formData: AlbumFormData) => {
    if (!id) return;

    setIsLoading(true);

    try {
      await updateAlbum(id, formData);
      showSuccessToast("Album berhasil diperbarui!");
      setTimeout(() => navigate("/atmin/gallery", { replace: true }), 1500);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Gagal memperbarui album";
      showErrorToast(message);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Handle cancel button click.
   * Navigate back to the gallery management page.
   */
  const handleCancel = () => {
    navigate("/atmin/gallery");
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="container max-w-4xl mx-auto px-4 sm:px-6 py-12">
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
        <div className="container max-w-4xl mx-auto px-4 sm:px-6 py-12 text-center">
          <h1 className="text-2xl font-bold mb-4">Album tidak ditemukan</h1>
          <Link to="/atmin/gallery" className="text-accent hover:underline">
            Kembali ke Manajemen Galeri
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
      <div className="container max-w-4xl mx-auto px-4 sm:px-6 py-12 fade-in">
        <div className="mb-8">
          <div className="flex items-center">
            <Link
              to="/atmin/gallery"
              className="mr-4 text-gray-600 dark:text-gray-400 hover:text-accent dark:hover:text-accent transition-colors"
            >
              <ChevronLeft size={20} />
            </Link>
            <h1 className="text-3xl font-serif font-bold">Edit Album</h1>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
          <AlbumForm
            initialData={initialData}
            onSubmit={handleSubmit}
            isLoading={isLoading}
            onCancel={handleCancel} // Tambahkan properti onCancel
          />
        </div>
      </div>
    </AdminLayout>
  );
};

export default EditAlbumPage;
