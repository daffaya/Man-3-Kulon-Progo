import React, { useContext, useEffect, useState, useCallback } from "react";
import { Link, Navigate } from "react-router-dom";
import { Plus, RefreshCw, X, File } from "lucide-react";
import Layout from "../../../components/layout/Layout";
import ArticleTable from "../../../components/admin/ArticleTable";

import { useArticles } from "../../../contexts/ArticleContext";
import { useAuth } from "../../../contexts/AuthContext";
import { ArticleFilters } from "../../../types";

// Update interface AppliedFilters untuk menyertakan category
interface AppliedFilters {
  keyword?: string;
  published?: boolean;
  featured?: boolean;
  tag?: string | string[];
  category?: string; // Tambahkan filter category (berdasarkan slug)
}

const ArticleManagementPage: React.FC = () => {
  const {
    adminArticlesData,
    adminLoading,
    removeArticle,
    fetchAdminArticles,
    adminCategories,
    adminCategoriesLoading,
  } = useArticles();

  const [showConfirmation, setShowConfirmation] = useState(false);
  const [articleToDelete, setArticleToDelete] = useState<string | null>(null);
  const { isLoggedIn, logout, token, user } = useAuth(); // Pastikan user diimport

  const [keyword, setKeyword] = useState("");

  const [publishedStatus, setPublishedStatus] = useState<
    "all" | "published" | "draft" | "featured"
  >("all");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");

  // State untuk filter kategori yang dipilih (simpan slug)
  const [selectedCategorySlug, setSelectedCategorySlug] =
    useState<string>("all"); // Default 'all'

  const [appliedFilters, setAppliedFilters] = useState<AppliedFilters>({});

  const [currentPage, setCurrentPage] = useState(1);
  const articlesPerPage = 10;

  const [debouncedKeyword, setDebouncedKeyword] = useState("");
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedKeyword(keyword);
    }, 500);

    return () => {
      clearTimeout(handler);
    };
  }, [keyword]);

  // --- useEffect untuk Fetch Artikel Admin saat Filter/Pagination Berubah ---
  useEffect(() => {
    // Hanya fetch data jika user sudah login
    if (isLoggedIn && token) {
      const filtersWithPagination: ArticleFilters = {
        ...appliedFilters,
        page: currentPage,
        limit: articlesPerPage,
      };

      console.log(
        "[ArticleManagement useEffect] Dependencies changed. Preparing to fetch with:",
        filtersWithPagination
      );

      fetchAdminArticles(filtersWithPagination);
    }
  }, [
    appliedFilters,
    currentPage,
    articlesPerPage,
    isLoggedIn,
    token,
    fetchAdminArticles,
  ]);

  // --- useEffect untuk Memicu Apply Filters saat Debounced Keyword Berubah ---
  useEffect(() => {
    console.log(
      `[ArticleManagement useEffect] Debounced keyword changed to: "${debouncedKeyword}". Applying filters.`
    );
    handleApplyFilters();
  }, [debouncedKeyword]);

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      console.log(
        "[ArticleManagement] Navigating to previous page:",
        currentPage - 1
      );
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (adminArticlesData && currentPage < adminArticlesData.totalPages) {
      console.log(
        "[ArticleManagement] Navigating to next page:",
        currentPage + 1
      );
      setCurrentPage(currentPage + 1);
    }
  };

  const handleApplyFilters = useCallback(() => {
    console.log("[ArticleManagement] Applying filters...");

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

    console.log(
      "[ArticleManagement handleApplyFilters] Filters to apply:",
      filtersToApply
    );

    setAppliedFilters(filtersToApply);
    setCurrentPage(1);
  }, [debouncedKeyword, publishedStatus, selectedTags, selectedCategorySlug]);

  const handleRemoveFilters = useCallback(() => {
    console.log("[ArticleManagement] Removing filters...");

    setKeyword("");
    setPublishedStatus("all");
    setSelectedTags([]);
    setTagInput("");
    setSelectedCategorySlug("all");

    handleApplyFilters();
  }, [handleApplyFilters]);

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

  const handlePublishedStatusChange = (
    e: React.ChangeEvent<HTMLSelectElement>
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

  useEffect(() => {
    handleApplyFilters();
  }, [publishedStatus, selectedTags, selectedCategorySlug]);

  const handleDeleteClick = (id: string) => {
    setArticleToDelete(id);
    setShowConfirmation(true);
  };

  const confirmDelete = useCallback(async () => {
    if (articleToDelete) {
      const success = await removeArticle(articleToDelete);
      if (success) {
        const filtersWithPagination = {
          ...appliedFilters,
          page: currentPage,
          limit: articlesPerPage,
        };
        fetchAdminArticles(filtersWithPagination);
      }
      setShowConfirmation(false);
      setArticleToDelete(null);
    }
  }, [
    articleToDelete,
    removeArticle,
    fetchAdminArticles,
    appliedFilters,
    currentPage,
    articlesPerPage,
  ]);

  const cancelDelete = () => {
    setShowConfirmation(false);
    setArticleToDelete(null);
  };

  // Jika tidak ada user atau tidak login, arahkan ke halaman login
  if (!isLoggedIn || !user) {
    return <Navigate to="/atmin/login" />;
  }

  const articlesToDisplay = adminArticlesData?.articles || [];
  const hasActiveFilters =
    appliedFilters.keyword ||
    appliedFilters.published !== undefined ||
    appliedFilters.featured !== undefined ||
    (Array.isArray(appliedFilters.tag) && appliedFilters.tag.length > 0) ||
    appliedFilters.category;

  if (!adminLoading && articlesToDisplay.length === 0 && hasActiveFilters) {
    return (
      <Layout>
        <div className="container mx-auto px-4 sm:px-6 py-12 text-center">
          <p className="text-xl text-gray-600 dark:text-gray-400">
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
      </Layout>
    );
  }

  if (!adminLoading && articlesToDisplay.length === 0 && !hasActiveFilters) {
    return (
      <Layout>
        <div className="container mx-auto px-4 sm:px-6 py-12 text-center">
          <p className="text-xl text-gray-600 dark:text-gray-400">
            Belum ada artikel yang ditemukan.
          </p>
          <Link
            to="/atmin/new"
            className="mt-4 inline-block btn btn-primary flex items-center justify-center mx-auto w-fit"
          >
            <Plus size={18} className="mr-1" /> Buat Artikel Pertama Anda
          </Link>
        </div>
      </Layout>
    );
  }

  const isPreviousDisabled =
    adminLoading || (adminArticlesData?.currentPage ?? 0) <= 1;
  const isNextDisabled =
    adminLoading ||
    (adminArticlesData
      ? adminArticlesData.currentPage >= adminArticlesData.totalPages
      : undefined);

  return (
    <Layout>
      <div className="container mx-auto px-4 sm:px-6 py-12 fade-in">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
          <h1 className="text-3xl font-serif font-bold mb-4 sm:mb-0">
            Manajemen Artikel
          </h1>
          <Link
            to="/atmin/new"
            className="btn btn-primary flex items-center justify-center sm:justify-start"
          >
            <Plus size={18} className="mr-1" /> Artikel Baru
          </Link>
        </div>
        <div className="bg-white dark:bg-semibackground rounded-xl shadow-md p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
            <h2 className="text-xl font-bold mb-4 sm:mb-0">
              Manajemen Artikel
            </h2>
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
                htmlFor="keyword"
                className="block text-sm font-medium mb-1"
              >
                Cari Kata Kunci
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
                className="block text-sm font-medium mb-1"
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
                className="block text-sm font-medium mb-1"
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
                {adminCategories.map((category) => (
                  <option key={category.id} value={category.slug}>
                    {category.name}
                  </option>
                ))}
              </select>
              {adminCategoriesLoading && adminCategories.length === 0 && (
                <p className="mt-2 text-sm text-gray-500 dark:text-gray-400 flex items-center">
                  <RefreshCw size={14} className="animate-spin mr-1" /> Memuat
                  kategori...
                </p>
              )}
            </div>
            <div className="md:col-span-2 lg:col-span-1">
              <label
                htmlFor="tagInput"
                className="block text-sm font-medium mb-1"
              >
                Filter Berdasarkan Tag (Tekan Enter untuk menambah)
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
                    className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300"
                  >
                    {tag}{" "}
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(tag)}
                      className="flex-shrink-0 ml-1 h-3 w-3 rounded-full inline-flex items-center justify-center text-white hover:bg-primary-dark hover:text-gray-200 focus:outline-none focus:bg-primary-dark"
                    >
                      <span className="sr-only">Hapus tag</span>
                      <X size={10} />
                    </button>
                  </span>
                ))}
              </div>
            </div>
          </div>
          {adminLoading ? (
            <div className="text-center py-12">
              <RefreshCw
                size={32}
                className="mx-auto animate-spin text-accent"
              />
              <p className="mt-4">Memuat artikel...</p>
            </div>
          ) : (
            <ArticleTable
              articles={articlesToDisplay}
              onDelete={handleDeleteClick}
              loading={adminLoading}
            />
          )}
          {adminArticlesData && adminArticlesData.totalPages > 1 && (
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
                Halaman {adminArticlesData.currentPage} dari{" "}
                {adminArticlesData.totalPages}
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
    </Layout>
  );
};

export default ArticleManagementPage;
