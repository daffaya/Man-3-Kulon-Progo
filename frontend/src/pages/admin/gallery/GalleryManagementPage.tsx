// frontend/src/pages/admin/gallery/GalleryManagementPage.tsx
import React, { useEffect, useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { Plus, RefreshCw, X, ArrowLeft } from "lucide-react";
import { useGallery } from "../../../contexts/GalleryContext";
import { useAuth } from "../../../contexts/AuthContext";
import { useToastMessage } from "../../../hooks/useToastMessage";
import AlbumList from "../../../components/gallery/AlbumList";
import AdminLayout from "../../../components/layout/AdminLayout";

export const ALLOWED_ROLES = [
  "super_admin",
  "jurnalis",
  "pengelola_bmn",
  "guru_bk",
  "arsiparis",
] as const;

const hasEditAccess = (isLoggedIn: boolean, role?: string): boolean =>
  isLoggedIn && role
    ? ALLOWED_ROLES.includes(role as (typeof ALLOWED_ROLES)[number])
    : false;

const GalleryManagementPage: React.FC = () => {
  const { state, deleteAlbum, fetchAdminAlbums } = useGallery();
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [albumToDelete, setAlbumToDelete] = useState<string | null>(null);
  const { showSuccessToast, showErrorToast } = useToastMessage();

  const { isLoggedIn, user } = useAuth();
  const navigate = useNavigate();

  if (!isLoggedIn) {
    return (
      <Navigate to="/login" state={{ redirectTo: "/atmin/gallery" }} replace />
    );
  }

  const hasGalleryAccess = hasEditAccess(isLoggedIn, user?.role);

  if (!hasGalleryAccess) {
    return <Navigate to="/atmin" replace />;
  }

  const [keyword, setKeyword] = useState("");
  const [appliedFilters, setAppliedFilters] = useState<{ keyword?: string }>(
    {}
  );
  const [currentPage, setCurrentPage] = useState(1);
  const albumsPerPage = 10;
  const [debouncedKeyword, setDebouncedKeyword] = useState("");

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedKeyword(keyword);
    }, 500);
    return () => clearTimeout(handler);
  }, [keyword]);

  useEffect(() => {
    if (isLoggedIn && hasGalleryAccess) {
      const filtersWithPagination = {
        ...appliedFilters,
        page: currentPage,
        limit: albumsPerPage,
      };
      fetchAdminAlbums(filtersWithPagination);
    }
  }, [
    appliedFilters,
    currentPage,
    isLoggedIn,
    hasGalleryAccess,
    fetchAdminAlbums,
  ]);

  useEffect(() => {
    handleApplyFilters();
  }, [debouncedKeyword]);

  const handlePreviousPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const handleNextPage = () => {
    if (
      state.adminPagination &&
      currentPage < state.adminPagination.totalPages
    ) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handleApplyFilters = () => {
    const filtersToApply = {
      keyword:
        debouncedKeyword.trim() !== "" ? debouncedKeyword.trim() : undefined,
    };
    setAppliedFilters(filtersToApply);
    setCurrentPage(1);
  };

  const handleRemoveFilters = () => {
    setKeyword("");
  };

  const handleKeywordInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setKeyword(e.target.value);
  };

  const handleKeywordInputKeyPress = (
    e: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleApplyFilters();
    }
  };

  const handleDeleteClick = (id: string) => {
    setAlbumToDelete(id);
    setShowConfirmation(true);
  };

  const confirmDelete = async () => {
    if (albumToDelete) {
      try {
        await deleteAlbum(albumToDelete);
        const filtersWithPagination = {
          ...appliedFilters,
          page: currentPage,
          limit: albumsPerPage,
        };
        fetchAdminAlbums(filtersWithPagination);
        setShowConfirmation(false);
        setAlbumToDelete(null);
        showSuccessToast("Album berhasil dihapus");
      } catch (error) {
        showErrorToast("Gagal menghapus album");
        console.error("Error deleting album:", error);
      }
    }
  };

  const cancelDelete = () => {
    setShowConfirmation(false);
    setAlbumToDelete(null);
  };

  const albumsToDisplay = state.adminAlbums;
  const hasActiveFilters = appliedFilters.keyword;

  if (!state.adminLoading && albumsToDisplay.length === 0 && hasActiveFilters) {
    return (
      <AdminLayout>
        <div className="container mx-auto px-4 sm:px-6 py-12 text-center">
          <p className="text-xl text-secondary">
            Tidak ada album yang cocok dengan filter.
          </p>
          {hasActiveFilters && (
            <button
              onClick={handleRemoveFilters}
              className="mt-4 btn btn-secondary text-sm"
            >
              <X size={16} className="mr-1" /> Hapus Filter
            </button>
          )}
        </div>
      </AdminLayout>
    );
  }

  if (
    !state.adminLoading &&
    albumsToDisplay.length === 0 &&
    !hasActiveFilters
  ) {
    return (
      <AdminLayout>
        <div className="container mx-auto px-4 sm:px-6 py-12 text-center">
          <p className="text-xl text-secondary">
            Belum ada album yang ditemukan.
          </p>
          <Link
            to="/atmin/gallery/new"
            className="mt-4 btn btn-primary flex items-center mx-auto w-fit"
          >
            <Plus size={18} className="mr-1" /> Buat Album Pertama Anda
          </Link>
        </div>
      </AdminLayout>
    );
  }

  const isPreviousDisabled =
    state.adminLoading || state.adminPagination.currentPage <= 1;
  const isNextDisabled =
    state.adminLoading ||
    state.adminPagination.currentPage >= state.adminPagination.totalPages;

  return (
    <AdminLayout>
      <div className="container mx-auto px-4 sm:px-6 py-12 fade-in">
        <Link
          to="/atmin"
          className="text-sm text-secondary hover:text-accent flex items-center mb-4 transition-colors"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Kembali ke admin dashboard
        </Link>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
          <h1 className="text-3xl font-serif font-bold text-foreground mb-4 sm:mb-0">
            Manajemen Galeri
          </h1>
          <div className="flex space-x-2">
            <Link
              to="/atmin/gallery/new"
              className="btn btn-primary flex items-center"
            >
              <Plus size={18} className="mr-1" /> Album Baru
            </Link>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
            {hasActiveFilters && (
              <button
                onClick={handleRemoveFilters}
                className="btn btn-secondary text-primary py-1 text-sm"
              >
                Hapus Filter
              </button>
            )}
          </div>
          <div className="mb-6 grid grid-cols-1 gap-4">
            <div>
              <label
                htmlFor="keyword"
                className="block text-sm font-medium mb-1 text-foreground"
              >
                Cari Kata Kunci{" "}
                <span className="text-xs text-secondary">(Tekan Enter)</span>
              </label>
              <input
                type="text"
                id="keyword"
                value={keyword}
                onChange={handleKeywordInputChange}
                onKeyPress={handleKeywordInputKeyPress}
                placeholder="Cari judul album..."
                className="form-input w-full"
              />
            </div>
          </div>

          {state.adminLoading ? (
            <div className="text-center py-12">
              <RefreshCw
                size={32}
                className="mx-auto animate-spin text-accent"
              />
              <p className="mt-4 text-secondary">Memuat album...</p>
            </div>
          ) : (
            <AlbumList
              albums={albumsToDisplay}
              loading={state.adminLoading}
              onDelete={handleDeleteClick}
              showDeleteButton={true}
              isAdmin={true}
            />
          )}

          {state.adminPagination.totalPages > 1 && (
            <div className="flex justify-center items-center mt-6 space-x-4">
              <button
                onClick={handlePreviousPage}
                disabled={isPreviousDisabled}
                className={`btn btn-secondary text-sm ${
                  isPreviousDisabled ? "opacity-50 cursor-not-allowed" : ""
                }`}
              >
                Sebelumnya
              </button>
              <span className="text-secondary">
                Halaman {state.adminPagination.currentPage} dari{" "}
                {state.adminPagination.totalPages}
              </span>
              <button
                onClick={handleNextPage}
                disabled={isNextDisabled}
                className={`btn btn-secondary text-sm ${
                  isNextDisabled ? "opacity-50 cursor-not-allowed" : ""
                }`}
              >
                Berikutnya
              </button>
            </div>
          )}
        </div>

        {showConfirmation && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="card p-6 max-w-md w-full">
              <h3 className="text-xl font-bold text-foreground mb-4">
                Konfirmasi Hapus
              </h3>
              <p className="mb-6 text-secondary">
                Apakah Anda yakin ingin menghapus album ini? Semua foto di dalam
                album juga akan dihapus. Tindakan ini tidak dapat dibatalkan.
              </p>
              <div className="flex justify-end space-x-4">
                <button onClick={cancelDelete} className="btn btn-secondary">
                  Batal
                </button>
                <button onClick={confirmDelete} className="btn btn-danger">
                  Hapus
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default GalleryManagementPage;
