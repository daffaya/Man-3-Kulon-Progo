// frontend/src/pages/admin/gallery/NewAlbumPage.tsx
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ChevronLeft } from "lucide-react";
import AdminLayout from "../../../components/layout/AdminLayout";
import AlbumForm from "../../../components/forms/AlbumForm";
import { useGallery } from "../../../contexts/GalleryContext";
import { useToastMessage } from "../../../hooks/useToastMessage";
import { AlbumFormData } from "../../../types/galleryTypes";

const NewAlbumPage: React.FC = () => {
  const { createAlbum } = useGallery();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const { showSuccessToast, showErrorToast } = useToastMessage();

  const handleSubmit = async (formData: AlbumFormData) => {
    setIsLoading(true);
    try {
      const albumId = await createAlbum(formData);
      showSuccessToast("Album berhasil dibuat!");
      setTimeout(
        () => navigate(`/atmin/gallery/${albumId}/photos`, { replace: true }),
        1500
      );
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Gagal membuat album";
      showErrorToast(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    navigate("/atmin/gallery");
  };

  return (
    <AdminLayout>
      <div className="container mx-auto px-4 sm:px-6 py-12 fade-in">
        <div className="mb-8">
          <Link
            to="/atmin/gallery"
            className="text-sm text-secondary hover:text-accent flex items-center mb-4 transition-colors"
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Kembali ke gallery
          </Link>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <h1 className="text-3xl font-serif font-bold text-foreground mb-4 sm:mb-0">
              Buat Album Baru
            </h1>
          </div>
        </div>

        <div className="card">
          <AlbumForm
            onSubmit={handleSubmit}
            isLoading={isLoading}
            onCancel={handleCancel}
          />
        </div>
      </div>
    </AdminLayout>
  );
};

export default NewAlbumPage;
