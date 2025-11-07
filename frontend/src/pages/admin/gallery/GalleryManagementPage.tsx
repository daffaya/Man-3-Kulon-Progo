// frontend/src/pages/admin/gallery/GalleryManagementPage.tsx
import React, { useEffect, useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { Plus, RefreshCw, X, ArrowLeft } from "lucide-react";
import { useGallery } from "../../../contexts/GalleryContext";
import { useAuth } from "../../../contexts/AuthContext";
import { useToastMessage } from "../../../hooks/useToastMessage";
import AlbumList from "../../../components/gallery/AlbumList";
import AdminLayout from "../../../components/layout/AdminLayout";

/** Roles that are permitted to access gallery management. */
export const ALLOWED_ROLES = [
  "super_admin",
  "jurnalis",
  "pengelola_bmn",
  "guru_bk",
  "arsiparis",
] as const;

/**
 * Checks if a user has permission to manage gallery based on their login status and role.
 * @param isLoggedIn - The user's login status.
 * @param role - The user's role.
 * @returns True if the user has management access, otherwise false.
 */
const hasEditAccess = (isLoggedIn: boolean, role?: string): boolean =>
  isLoggedIn && role
    ? ALLOWED_ROLES.includes(role as (typeof ALLOWED_ROLES)[number])
    : false;

/**
 * A page component for managing gallery albums in the admin panel.
 * It provides functionality to view, filter, paginate, and delete albums.
 */
const GalleryManagementPage: React.FC = () => {
  const { state, deleteAlbum, fetchAdminAlbums } = useGallery();
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [albumToDelete, setAlbumToDelete] = useState<string | null>(null);
  const { showSuccessToast, showErrorToast } = useToastMessage();

  const { isLoggedIn, user } = useAuth();
  const navigate = useNavigate();

  // Redirect ke login jika belum login
  if (!isLoggedIn) {
    return (
      <Navigate to="/login" state={{ redirectTo: "/atmin/gallery" }} replace />
    );
  }

  const hasGalleryAccess = hasEditAccess(isLoggedIn, user?.role);

  // Jika user login tapi tidak memiliki role yang sesuai, redirect ke dashboard
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

  // Effect for debouncing the keyword input to reduce API calls
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedKeyword(keyword);
    }, 500);

    return () => {
      clearTimeout(handler);
    };
  }, [keyword]);

  // Effect to fetch albums when filters or pagination change
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
    albumsPerPage,
    isLoggedIn,
    hasGalleryAccess,
    fetchAdminAlbums,
  ]);

  // Effect to automatically apply filters when keyword input changes
  useEffect(() => {
    handleApplyFilters();
  }, [debouncedKeyword]);

  /** Navigates to the previous page of albums. */
  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  /** Navigates to the next page of albums. */
  const handleNextPage = () => {
    if (
      state.adminPagination &&
      currentPage < state.adminPagination.totalPages
    ) {
      setCurrentPage(currentPage + 1);
    }
  };

  /** Constructs the filter object from input states and triggers a new search. */
  const handleApplyFilters = () => {
    const filtersToApply = {
      keyword:
        debouncedKeyword.trim() !== "" ? debouncedKeyword.trim() : undefined,
    };

    setAppliedFilters(filtersToApply);
    setCurrentPage(1);
  };

  /** Resets all filter inputs to their default values. */
  const handleRemoveFilters = () => {
    setKeyword("");
  };

  /** Updates the keyword state on input change. */
  const handleKeywordInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setKeyword(e.target.value);
  };

  /** Triggers filter application on Enter key press in the keyword input. */
  const handleKeywordInputKeyPress = (
    e: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleApplyFilters();
    }
  };

  /** Sets the album to be deleted and shows the confirmation modal. */
  const handleDeleteClick = (id: string) => {
    setAlbumToDelete(id);
    setShowConfirmation(true);
  };

  /** Deletes the selected album and refreshes the list. */
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

        // Tampilkan toast sukses
        showSuccessToast("Album berhasil dihapus");
      } catch (error) {
        // Tampilkan toast error jika terjadi kesalahan
        showErrorToast("Gagal menghapus album");
        console.error("Error deleting album:", error);
      }
    }
  };

  /** Hides the delete confirmation modal. */
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
          <p className="text-xl text-gray-600 dark:text-gray-400">
            Tidak ada album yang cocok dengan filter.
          </p>
          {hasActiveFilters && (
            <button
              onClick={handleRemoveFilters}
              className="mt-4 text-accent hover:underline flex items-center justify-center mx-auto"
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
          <p className="text-xl text-gray-600 dark:text-gray-400">
            Belum ada album yang ditemukan.
          </p>
          <Link
            to="/atmin/gallery/new"
            className="mt-4 inline-block btn btn-primary flex items-center justify-center mx-auto w-fit"
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
          className="text-sm text-gray-600 dark:text-gray-400 hover:text-primary dark:hover:text-primary flex items-center mb-4 transition-colors"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Kembali ke admin dashboard
        </Link>
        <div className="flex flex-col mx-4 sm:flex-row sm:items-center sm:justify-between mb-8">
          <h1 className="text-3xl font-serif font-bold mb-4 sm:mb-0">
            Manajemen Galeri
          </h1>

          <div className="flex space-x-2">
            {/* Tombol "Album Baru" */}
            <Link
              to="/atmin/gallery/new"
              className="btn btn-primary flex items-center"
            >
              <Plus size={18} className="mr-1" /> Album Baru
            </Link>
          </div>
        </div>

        <div className="bg-white dark:bg-semibackground rounded-xl shadow-md p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
            {hasActiveFilters && (
              <button
                onClick={handleRemoveFilters}
                className="btn btn-secondary py-1 text-sm"
              >
                Hapus Filter
              </button>
            )}
          </div>
          <div className="mb-6 grid grid-cols-1 gap-4">
            <div>
              <label
                htmlFor="keyword"
                className="block text-sm font-medium mb-1"
              >
                Cari Kata Kunci{" "}
                <span className="text-xs text-gray-500">(Tekan Enter)</span>
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
              <p className="mt-4">Memuat album...</p>
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
                className={`px-4 py-2 rounded-md transition-colors ${
                  isPreviousDisabled
                    ? "bg-gray-200 dark:bg-gray-700 text-gray-500 cursor-not-allowed"
                    : "bg-accent text-white hover:bg-accent-dark"
                }`}
              >
                Sebelumnya
              </button>
              <span className="text-gray-700 dark:text-gray-300">
                Halaman {state.adminPagination.currentPage} dari{" "}
                {state.adminPagination.totalPages}
              </span>
              <button
                onClick={handleNextPage}
                disabled={isNextDisabled}
                className={`px-4 py-2 rounded-md transition-colors ${
                  isNextDisabled
                    ? "bg-gray-200 dark:bg-gray-700 text-gray-500 cursor-not-allowed"
                    : "bg-accent text-white hover:bg-accent-dark"
                }`}
              >
                Berikutnya
              </button>
            </div>
          )}
        </div>
      </div>

      {showConfirmation && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full">
            <h3 className="text-xl font-bold mb-4">Konfirmasi Hapus</h3>
            <p className="mb-6 text-gray-600 dark:text-gray-400">
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
    </AdminLayout>
  );
};

export default GalleryManagementPage;
