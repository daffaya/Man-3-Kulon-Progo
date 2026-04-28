/**
 * @fileoverview Article Management Page component for the admin panel.
 * This component provides a comprehensive interface for managing articles, including viewing,
 * filtering, searching, paginating, and deleting articles. It includes functionality for filtering
 * by keywords, publication status, tags, and categories. The component also handles pagination
 * and displays appropriate states for loading, empty results, and confirmation dialogs.
 */

import React, { useEffect, useState, useCallback } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { Plus, RefreshCw, X, ArrowLeft } from "lucide-react";
import ArticleTable from "../../../components/tables/ArticleTable";
import { useArticles } from "../../../contexts/ArticleContext";
import { useAuth } from "../../../contexts/AuthContext";
import { ArticleFilters } from "../../../types/articleTypes";
import { useToastMessage } from "../../../hooks/useToastMessage";
import AdminLayout from "../../../components/layout/AdminLayout";

interface AppliedFilters {
  keyword?: string;
  published?: boolean;
  featured?: boolean;
  tag?: string | string[];
  category?: string;
}

export const ALLOWED_ROLES = ["jurnalis", "super_admin"] as const;

/**
 * Checks if a user has permission to manage articles based on their login status and role.
 * @param {boolean} isLoggedIn - The user's login status.
 * @param {string | undefined} role - The user's role.
 * @returns {boolean} True if the user has management access, otherwise false.
 */
const hasEditAccess = (isLoggedIn: boolean, role?: string): boolean =>
  isLoggedIn && role
    ? ALLOWED_ROLES.includes(role as (typeof ALLOWED_ROLES)[number])
    : false;

/**
 * A page component for managing articles in the admin panel.
 * It provides functionality to view, filter, paginate, and delete articles.
 * The component handles authentication and authorization checks, ensuring only users
 * with appropriate roles can access the article management features.
 */
const ArticleManagementPage: React.FC = () => {
  const { state, deleteArticle, fetchAdminArticles, fetchAdminCategories } =
    useArticles();
  const { adminCategoriesLoading } = state;

  const [showConfirmation, setShowConfirmation] = useState(false);
  const [articleToDelete, setArticleToDelete] = useState<string | null>(null);
  const { showSuccessToast, showErrorToast } = useToastMessage();

  const { isLoggedIn, user } = useAuth();
  const navigate = useNavigate();

  if (!isLoggedIn) {
    return (
      <Navigate to="/login" state={{ redirectTo: "/atmin/articles" }} replace />
    );
  }

  const isAdminOrJurnalist = hasEditAccess(isLoggedIn, user?.role);

  if (!isAdminOrJurnalist) {
    return <Navigate to="/atmin" replace />;
  }

  const [keyword, setKeyword] = useState("");
  const [publishedStatus, setPublishedStatus] = useState<
    "all" | "published" | "draft" | "featured"
  >("all");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [selectedCategorySlug, setSelectedCategorySlug] =
    useState<string>("all");
  const [appliedFilters, setAppliedFilters] = useState<AppliedFilters>({});
  const [currentPage, setCurrentPage] = useState(1);
  const articlesPerPage = 8;
  const [debouncedKeyword, setDebouncedKeyword] = useState("");

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedKeyword(keyword);
    }, 500);

    return () => {
      clearTimeout(handler);
    };
  }, [keyword]);

  useEffect(() => {
    if (isLoggedIn && isAdminOrJurnalist) {
      const filtersWithPagination: ArticleFilters = {
        ...appliedFilters,
        page: currentPage,
        limit: articlesPerPage,
      };

      fetchAdminArticles(filtersWithPagination);
      fetchAdminCategories();
    }
  }, [
    appliedFilters,
    currentPage,
    articlesPerPage,
    isLoggedIn,
    isAdminOrJurnalist,
    fetchAdminArticles,
    fetchAdminCategories,
  ]);

  useEffect(() => {
    handleApplyFilters();
  }, [debouncedKeyword, publishedStatus, selectedTags, selectedCategorySlug]);

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (
      state.adminPagination &&
      currentPage < state.adminPagination.totalPages
    ) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handleApplyFilters = useCallback(() => {
    const filtersToApply: AppliedFilters = {
      keyword:
        debouncedKeyword.trim() !== "" ? debouncedKeyword.trim() : undefined,
      published:
        publishedStatus === "all" || publishedStatus === "featured"
          ? undefined
          : publishedStatus === "published"
            ? true
            : false,
      featured: publishedStatus === "featured" ? true : undefined,
      tag: selectedTags.length > 0 ? selectedTags : undefined,
      category:
        selectedCategorySlug !== "all" ? selectedCategorySlug : undefined,
    };

    setAppliedFilters(filtersToApply);
    setCurrentPage(1);
  }, [debouncedKeyword, publishedStatus, selectedTags, selectedCategorySlug]);

  const handleRemoveFilters = useCallback(() => {
    setKeyword("");
    setPublishedStatus("all");
    setSelectedTags([]);
    setTagInput("");
    setSelectedCategorySlug("all");
  }, []);

  const handleKeywordInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setKeyword(e.target.value);
  };

  const handleKeywordInputKeyPress = (
    e: React.KeyboardEvent<HTMLInputElement>,
  ) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleApplyFilters();
    }
  };

  const handlePublishedStatusChange = (
    e: React.ChangeEvent<HTMLSelectElement>,
  ) => {
    const newStatus = e.target.value as
      | "all"
      | "published"
      | "draft"
      | "featured";
    setPublishedStatus(newStatus);
  };

  const handleTagInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTagInput(e.target.value);
  };

  const handleTagInputKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && tagInput.trim() !== "") {
      e.preventDefault();
      if (!selectedTags.includes(tagInput.trim())) {
        const updatedTags = [...selectedTags, tagInput.trim()];
        setSelectedTags(updatedTags);
        setTagInput("");
      }
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    const updatedTags = selectedTags.filter((tag) => tag !== tagToRemove);
    setSelectedTags(updatedTags);
  };

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newCategorySlug = e.target.value;
    setSelectedCategorySlug(newCategorySlug);
  };

  const handleDeleteClick = (id: string) => {
    setArticleToDelete(id);
    setShowConfirmation(true);
  };

  const confirmDelete = useCallback(async () => {
    if (articleToDelete) {
      try {
        await deleteArticle(articleToDelete);
        const filtersWithPagination = {
          ...appliedFilters,
          page: currentPage,
          limit: articlesPerPage,
        };
        fetchAdminArticles(filtersWithPagination);
        setShowConfirmation(false);
        setArticleToDelete(null);

        showSuccessToast("Artikel berhasil dihapus");
      } catch (error) {
        showErrorToast("Gagal menghapus artikel");
        console.error("Error deleting article:", error);
      }
    }
  }, [
    articleToDelete,
    deleteArticle,
    fetchAdminArticles,
    appliedFilters,
    currentPage,
    articlesPerPage,
    showSuccessToast,
    showErrorToast,
  ]);

  const cancelDelete = () => {
    setShowConfirmation(false);
    setArticleToDelete(null);
  };

  const articlesToDisplay = state.adminArticles;
  const hasActiveFilters =
    appliedFilters.keyword ||
    appliedFilters.published !== undefined ||
    appliedFilters.featured !== undefined ||
    (Array.isArray(appliedFilters.tag) && appliedFilters.tag.length > 0) ||
    appliedFilters.category;

  if (
    !state.adminLoading &&
    articlesToDisplay.length === 0 &&
    hasActiveFilters
  ) {
    return (
      <AdminLayout>
        <div className="container mx-auto px-4 sm:px-6 py-12 text-center">
          <div className="card p-12">
            <p className="text-xl text-secondary">
              Tidak ada artikel yang cocok dengan filter.
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
        </div>
      </AdminLayout>
    );
  }

  if (
    !state.adminLoading &&
    articlesToDisplay.length === 0 &&
    !hasActiveFilters
  ) {
    return (
      <AdminLayout>
        <div className="container mx-auto px-4 sm:px-6 py-12 text-center">
          <div className="card p-12">
            <p className="text-xl text-secondary">
              Belum ada artikel yang ditemukan.
            </p>
            <Link
              to="/atmin/articles/new"
              className="mt-4 inline-block btn btn-primary flex items-center justify-center mx-auto w-fit"
            >
              <Plus size={18} className="mr-1" /> Buat Artikel Pertama Anda
            </Link>
          </div>
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
        <div className="flex flex-col mx-4 sm:flex-row sm:items-center sm:justify-between mb-8">
          <h1 className="text-3xl font-serif font-bold mb-4 sm:mb-0 text-foreground">
            Manajemen Artikel
          </h1>

          <div className="flex space-x-2">
            <Link
              to="/atmin/category"
              className="btn btn-secondary flex items-center"
            >
              Atur Kategori
            </Link>

            <Link
              to="/atmin/articles/new"
              className="btn btn-primary flex items-center"
            >
              <Plus size={18} className="mr-1" /> Artikel Baru
            </Link>
          </div>
        </div>

        <div className="card p-6">
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
          <div className="mb-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label
                htmlFor="tagInput"
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
                placeholder="Cari judul, konten..."
                className="form-input w-full"
              />
            </div>
            <div>
              <label
                htmlFor="publishedStatus"
                className="block text-sm font-medium mb-1 text-foreground"
              >
                Status Publikasi
              </label>
              <select
                id="publishedStatus"
                value={publishedStatus}
                onChange={handlePublishedStatusChange}
                className="form-input w-full"
              >
                <option value="all">Semua</option>
                <option value="featured">Unggulan</option>
                <option value="published">Diterbitkan</option>
                <option value="draft">Draft</option>
              </select>
            </div>
            <div>
              <label
                htmlFor="categoryFilter"
                className="block text-sm font-medium mb-1 text-foreground"
              >
                Filter Berdasarkan Kategori
              </label>
              <select
                id="categoryFilter"
                value={selectedCategorySlug}
                onChange={handleCategoryChange}
                className="form-input w-full"
              >
                <option value="all">Semua Kategori</option>
                {state.adminCategories.map((category) => (
                  <option key={category.id} value={category.slug}>
                    {category.name}
                  </option>
                ))}
              </select>
              {adminCategoriesLoading && state.adminCategories.length === 0 && (
                <p className="mt-2 text-sm text-secondary flex items-center">
                  <RefreshCw size={14} className="animate-spin mr-1" /> Memuat
                  kategori...
                </p>
              )}
            </div>
            <div className="md:col-span-2 lg:col-span-1">
              <label
                htmlFor="tagInput"
                className="block text-sm font-medium mb-1 text-foreground"
              >
                Filter Berdasarkan Tag{" "}
                <span className="text-xs text-secondary">(Tekan Enter)</span>
              </label>

              <input
                type="text"
                id="tagInput"
                value={tagInput}
                onChange={handleTagInputChange}
                onKeyPress={handleTagInputKeyPress}
                placeholder="Tambahkan tag..."
                className="form-input w-full"
              />
              <div className="mt-2 flex flex-wrap gap-2">
                {selectedTags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-[rgb(var(--color-secondary-button))] text-[rgb(var(--color-foreground))]"
                  >
                    {tag}{" "}
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(tag)}
                      className="flex-shrink-0 ml-1 h-3 w-3 rounded-full inline-flex items-center justify-center hover:bg-[rgb(var(--color-foreground))] hover:text-[rgb(var(--color-background))] focus:outline-none"
                    >
                      <span className="sr-only">Hapus tag</span>
                      <X size={10} />
                    </button>
                  </span>
                ))}
              </div>
            </div>
          </div>
          {state.adminLoading ? (
            <div className="text-center py-12">
              <RefreshCw
                size={32}
                className="mx-auto animate-spin text-accent"
              />
              <p className="mt-4 text-secondary">Memuat artikel...</p>
            </div>
          ) : (
            <ArticleTable
              articles={articlesToDisplay}
              onDelete={handleDeleteClick}
              loading={state.adminLoading}
            />
          )}
          {state.adminPagination.totalPages > 1 && (
            <div className="flex justify-center items-center mt-6 space-x-4">
              <button
                onClick={handlePreviousPage}
                disabled={isPreviousDisabled}
                className={`px-4 py-2 rounded-md transition-colors ${
                  isPreviousDisabled
                    ? "bg-[rgb(var(--color-secondary-button))] text-[rgb(var(--color-secondary))] cursor-not-allowed"
                    : "bg-[rgb(var(--color-accent))] text-white hover:bg-[rgb(var(--color-hover))]"
                }`}
              >
                Sebelumnya
              </button>
              <span className="text-foreground">
                Halaman {state.adminPagination.currentPage} dari{" "}
                {state.adminPagination.totalPages}
              </span>
              <button
                onClick={handleNextPage}
                disabled={isNextDisabled}
                className={`px-4 py-2 rounded-md transition-colors ${
                  isNextDisabled
                    ? "bg-[rgb(var(--color-secondary-button))] text-[rgb(var(--color-secondary))] cursor-not-allowed"
                    : "bg-[rgb(var(--color-accent))] text-white hover:bg-[rgb(var(--color-hover))]"
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
          <div className="card p-6 max-w-md w-full">
            <h3 className="text-xl font-bold mb-4 text-foreground">
              Konfirmasi Hapus
            </h3>
            <p className="mb-6 text-secondary">
              Apakah Anda yakin ingin menghapus artikel ini? Tindakan ini tidak
              dapat dibatalkan.
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

export default ArticleManagementPage;
