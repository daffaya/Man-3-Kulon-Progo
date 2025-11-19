/**
 * @fileoverview Edit Album Page component for the admin panel.
 * This component provides a form to edit the details of an existing photo album,
 * such as its title, description, and cover photo. It fetches the current album data
 * and allows an admin to update it.
 */

import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { ChevronLeft, ArrowLeft } from "lucide-react";
import AdminLayout from "../../../components/layout/AdminLayout";
import AlbumForm from "../../../components/forms/AlbumForm";
import { useGallery } from "../../../contexts/GalleryContext";
import { useToastMessage } from "../../../hooks/useToastMessage";
import { AlbumFormData } from "../../../types/galleryTypes";

/**
 * Component that renders the page for editing an existing photo album.
 * It fetches the album data using the ID from the URL parameters and pre-fills a form.
 * On submission, it updates the album via the GalleryContext.
 */
const EditAlbumPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { state, fetchAlbumById, updateAlbum } = useGallery();
  const { currentAlbum, loading } = state;
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { showSuccessToast, showErrorToast } = useToastMessage();

  useEffect(() => {
    if (id) {
      fetchAlbumById(id);
    }
  }, [id, fetchAlbumById]);

  /**
   * Handles the form submission to update the album.
   * Sends the form data to the API via the context and navigates back on success.
   * @param {AlbumFormData} formData - The updated album data.
   */
  const handleSubmit = async (formData: AlbumFormData) => {
    if (!id) return;

    setIsSubmitting(true);
    try {
      await updateAlbum(id, formData);
      showSuccessToast("Album berhasil diperbarui!");
      setTimeout(() => navigate("/atmin/gallery"), 1200);
    } catch (err: any) {
      showErrorToast(err.message || "Gagal memperbarui album");
    } finally {
      setIsSubmitting(false);
    }
  };

  /**
   * Handles the cancel action by navigating back to the gallery management page.
   */
  const handleCancel = () => {
    navigate("/atmin/gallery");
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="container max-w-6xl mx-auto px-4 py-12 text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 border-4 border-accent/20 border-t-accent rounded-full animate-spin" />
          <p className="mt-4 text-secondary">Memuat data album...</p>
        </div>
      </AdminLayout>
    );
  }

  if (!currentAlbum) {
    return (
      <AdminLayout>
        <div className="container max-w-6xl mx-auto px-4 py-12 text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">
            Album Tidak Ditemukan
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
        <div className="flex items-center mb-8">
          <button
            onClick={() => navigate(`/atmin/gallery/${id}/photos`)}
            className="text-secondary hover:text-accent flex items-center mr-4 transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h1 className="text-3xl font-serif font-bold text-foreground">
            Edit Album
          </h1>
        </div>

        <div className="card p-6">
          <AlbumForm
            initialData={initialData}
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            isLoading={isSubmitting}
          />
        </div>
      </div>
    </AdminLayout>
  );
};

export default EditAlbumPage;
