/**
 * @fileoverview Page component for creating a new gallery album.
 * This component provides a form interface for creating a new gallery album in the admin panel.
 * It handles form submission, displays loading states, and navigates to the newly created
 * album's photo management page upon successful creation.
 */

import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ChevronLeft } from "lucide-react";
import AdminLayout from "../../../components/layout/AdminLayout";
import AlbumForm from "../../../components/forms/AlbumForm";
import { useGallery } from "../../../contexts/GalleryContext";
import { useToastMessage } from "../../../hooks/useToastMessage";
import { AlbumFormData } from "../../../types/galleryTypes";

/**
 * Page component for creating a new gallery album.
 * Renders the AlbumForm, handles the submission process by calling the gallery context,
 * provides user feedback through toast notifications, and redirects the user to the new
 * album's page after successful creation.
 */
const NewAlbumPage: React.FC = () => {
  const { createAlbum } = useGallery();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const { showSuccessToast, showErrorToast } = useToastMessage();

  /**
   * Handles the form submission for creating a new album.
   * Calls the createAlbum function from the gallery context, displays a success toast,
   * and navigates to the new album's photo page. Errors are caught and displayed in an error toast.
   * @param {AlbumFormData} formData - The data for the new album.
   */
  const handleSubmit = async (formData: AlbumFormData) => {
    setIsLoading(true);
    try {
      const albumId = await createAlbum(formData);
      showSuccessToast("Album berhasil dibuat!");
      setTimeout(
        () => navigate(`/atmin/gallery/${albumId}/photos`, { replace: true }),
        1500,
      );
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Gagal membuat album";
      showErrorToast(message);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Handles the cancel action by navigating back to the gallery list page.
   */
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
