// backend/src/frontend/src/pages/AdminDashboard.tsx
import React, { useContext, useEffect, useState, useCallback } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { Plus, RefreshCw, X } from "lucide-react";
import Layout from "../../components/layout/Layout";
import ArticleTable from "../../components/admin/ArticleTable";
// PERUBAHAN: Import useArticles dan useAuth
import { useArticles } from "../../contexts/ArticleContext";
import { useAuth } from "../../contexts/AuthContext";
// PERUBAHAN: Import tipe ArticleFilters dan Category
import { ArticleFilters, Category } from "../../types";

// PERUBAHAN: Update interface AppliedFilters untuk menyertakan category
interface AppliedFilters {
  keyword?: string;
  published?: boolean;
  featured?: boolean;
  tag?: string | string[];
  category?: string; // Tambahkan filter category (berdasarkan slug)
}

const AdminDashboard: React.FC = () => {
  // PERUBAHAN: Ambil adminCategories dan loading kategori dari useArticles
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
  const { isLoggedIn, logout, token } = useAuth();
  const [showLogoutConfirmation, setShowLogoutConfirmation] = useState(false);
  const navigate = useNavigate();

  const [keyword, setKeyword] = useState("");

  const [publishedStatus, setPublishedStatus] = useState<
    "all" | "published" | "draft" | "featured"
  >("all");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");

  // PERUBAHAN: State untuk filter kategori yang dipilih (simpan slug)
  const [selectedCategorySlug, setSelectedCategorySlug] =
    useState<string>("all"); // Default 'all' // PERUBAHAN: Update tipe AppliedFilters

  const [appliedFilters, setAppliedFilters] = useState<AppliedFilters>({});

  const [currentPage, setCurrentPage] = useState(1);
  const articlesPerPage = 10; // Debounce keyword input

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
    const filtersWithPagination: ArticleFilters = {
      // Gunakan tipe ArticleFilters
      ...appliedFilters,
      page: currentPage,
      limit: articlesPerPage,
    };

    console.log(
      "[AdminDashboard useEffect] Dependencies changed. Preparing to fetch with:",
      filtersWithPagination
    );

    if (isLoggedIn && token) {
      console.log(
        "[AdminDashboard useEffect] User logged in. Fetching admin articles..."
      );
      fetchAdminArticles(filtersWithPagination);
    } else {
      console.log(
        "[AdminDashboard useEffect] User not logged in or token not available. Skipping admin articles fetch."
      );
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
      `[AdminDashboard useEffect] Debounced keyword changed to: "${debouncedKeyword}". Applying filters.`
    );
    handleApplyFilters(); // Panggil apply filters saat debounced keyword berubah
  }, [debouncedKeyword]); // Dependency: debouncedKeyword

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      console.log(
        "[AdminDashboard] Navigating to previous page:",
        currentPage - 1
      );
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (adminArticlesData && currentPage < adminArticlesData.totalPages) {
      console.log("[AdminDashboard] Navigating to next page:", currentPage + 1);
      setCurrentPage(currentPage + 1);
    }
  };

  // --- Handler untuk Apply Filters ---
  const handleApplyFilters = useCallback(() => {
    console.log("[AdminDashboard] Applying filters...");

    const filtersToApply: AppliedFilters = {
      // Gunakan debouncedKeyword untuk filter keyword
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
      // PERUBAHAN: Tambahkan filter category jika bukan 'all'
      category:
        selectedCategorySlug !== "all" ? selectedCategorySlug : undefined,
    };

    console.log(
      "[AdminDashboard handleApplyFilters] Filters to apply:",
      filtersToApply
    );

    setAppliedFilters(filtersToApply);
    setCurrentPage(1); // Reset ke halaman 1 setiap kali filter diterapkan
  }, [debouncedKeyword, publishedStatus, selectedTags, selectedCategorySlug]); // PERUBAHAN: Tambahkan selectedCategorySlug ke dependency

  // --- Handler untuk Remove Filters ---
  const handleRemoveFilters = useCallback(() => {
    console.log("[AdminDashboard] Removing filters...");

    setKeyword(""); // setDebouncedKeyword(""); // Debounced keyword akan diupdate oleh useEffect
    setPublishedStatus("all");
    setSelectedTags([]);
    setTagInput("");
    // PERUBAHAN: Reset filter kategori
    setSelectedCategorySlug("all"); // setAppliedFilters({}); // appliedFilters akan diupdate oleh handleApplyFilters // setCurrentPage(1); // setCurrentPage akan diupdate oleh handleApplyFilters

    // Panggil handleApplyFilters tanpa filter aktif
    handleApplyFilters();
  }, [handleApplyFilters]); // Dependency: handleApplyFilters

  // --- Handler Input Filter ---
  const handleKeywordInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setKeyword(e.target.value);
    // PERUBAHAN: Jangan langsung panggil handleApplyFilters di sini
    // Debounced keyword effect yang akan memanggilnya
  };

  const handleKeywordInputKeyPress = (
    e: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (e.key === "Enter") {
      e.preventDefault();
      // PERUBAHAN: Jangan langsung panggil handleApplyFilters di sini
      // Debounced keyword effect yang akan memanggilnya
      // Pastikan debouncedKeyword sudah update jika user langsung Enter setelah ketik
      // Ini bisa diatasi dengan memicu update debouncedKeyword secara manual atau mengandalkan debounce timeout
      // Untuk kesederhanaan, kita biarkan debounce effect yang memanggil.
      // Atau, bisa panggil handleApplyFilters() di sini tapi pastikan 'keyword' state sudah terbaru.
      // Pilihan saat ini: Biarkan debounce effect yang memanggil.
    }
  };

  const handlePublishedStatusChange = (
    e: React.ChangeEvent<HTMLSelectElement>
  ) => {
    console.log(
      "[AdminDashboard handlePublishedStatusChange] New selected status:",
      e.target.value
    );

    const newStatus = e.target.value as
      | "all"
      | "published"
      | "draft"
      | "featured";
    setPublishedStatus(newStatus);

    // PERUBAHAN: Panggil handleApplyFilters setelah state diupdate
    // handleApplyFilters akan membaca state terbaru (keyword, newStatus, selectedTags, selectedCategorySlug) // const filtersToApply: AppliedFilters = { ... }; // Hapus pembuatan objek filters di sini // console.log("[AdminDashboard handlePublishedStatusChange] Applying filters directly:", filtersToApply); // Hapus log ini // setAppliedFilters(filtersToApply); // Hapus ini // setCurrentPage(1); // Hapus ini
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

        // PERUBAHAN: Panggil handleApplyFilters setelah state diupdate
        // handleApplyFilters akan membaca state terbaru (keyword, publishedStatus, updatedTags, selectedCategorySlug) // const filtersToApply: AppliedFilters = { ... }; // Hapus pembuatan objek filters di sini // setAppliedFilters(filtersToApply); // Hapus ini // setCurrentPage(1); // Hapus ini
      }
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    const updatedTags = selectedTags.filter((tag) => tag !== tagToRemove);
    setSelectedTags(updatedTags);

    // PERUBAHAN: Panggil handleApplyFilters setelah state diupdate
    // handleApplyFilters akan membaca state terbaru (keyword, publishedStatus, updatedTags, selectedCategorySlug) // const filtersToApply: AppliedFilters = { ... }; // Hapus pembuatan objek filters di sini // setAppliedFilters(filtersToApply); // Hapus ini // setCurrentPage(1); // Hapus ini
  };

  // PERUBAHAN: Handler untuk perubahan dropdown kategori
  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    console.log(
      "[AdminDashboard handleCategoryChange] New selected category slug:",
      e.target.value
    );
    const newCategorySlug = e.target.value; // Nilai adalah slug
    setSelectedCategorySlug(newCategorySlug);

    // PERUBAHAN: Panggil handleApplyFilters setelah state diupdate
    // handleApplyFilters akan membaca state terbaru (keyword, publishedStatus, selectedTags, newCategorySlug)
    // const filtersToApply: AppliedFilters = { ... }; // Hapus pembuatan objek filters di sini
    // setAppliedFilters(filtersToApply); // Hapus ini
    // setCurrentPage(1); // Hapus ini
  };

  // --- useEffect untuk Memicu Apply Filters saat Filter Lain Berubah ---
  // Ini menggantikan panggilan handleApplyFilters() di dalam handler perubahan filter
  useEffect(() => {
    // Cek apakah ada perubahan yang signifikan pada state filter (selain keyword yang sudah di-debounce)
    // Atau panggil saja handleApplyFilters setiap kali salah satu dependency berubah
    console.log(
      "[AdminDashboard useEffect] Filter state changed. Applying filters..."
    );
    handleApplyFilters();
  }, [publishedStatus, selectedTags, selectedCategorySlug]); // Dependency: state filter (kecuali keyword)

  const handleDeleteClick = (id: string) => {
    setArticleToDelete(id);
    setShowConfirmation(true);
  };

  const confirmDelete = useCallback(async () => {
    if (articleToDelete) {
      console.log(
        "[AdminDashboard] Confirming delete for article ID:",
        articleToDelete
      );
      const success = await removeArticle(articleToDelete);
      if (success) {
        console.log(
          "[AdminDashboard] Article deleted successfully. Re-fetching list..."
        );

        const filtersWithPagination = {
          ...appliedFilters,
          page: currentPage,
          limit: articlesPerPage,
        };
        fetchAdminArticles(filtersWithPagination);
      } else {
        console.error("[AdminDashboard] Failed to delete article.");
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

  const handleLogout = () => {
    setShowLogoutConfirmation(true);
  };

  const confirmLogout = () => {
    logout();
    setShowLogoutConfirmation(false);
  };

  const cancelLogout = () => {
    setShowLogoutConfirmation(false);
  };

  const articlesToDisplay = adminArticlesData?.articles || [];

  const isPreviousDisabled =
    adminLoading || (adminArticlesData?.currentPage ?? 0) <= 1;
  const isNextDisabled =
    adminLoading ||
    (adminArticlesData
      ? adminArticlesData.currentPage >= adminArticlesData.totalPages
      : undefined);

  // Tampilkan loading state awal untuk artikel atau kategori
  // Jika adminArticlesData belum ada DAN adminLoading true, atau adminCategories belum ada DAN adminCategoriesLoading true
  if (
    (!adminArticlesData && adminLoading) ||
    !adminCategories ||
    (adminCategories.length === 0 && adminCategoriesLoading)
  ) {
    return (
      <Layout>
        {" "}
        <div className="container mx-auto px-4 sm:px-6 py-12 text-center">
          {" "}
          <RefreshCw size={32} className="mx-auto animate-spin text-accent" />
          <p className="mt-4">
            Loading data...
          </p> {/* Pesan loading umum */}{" "}
        </div>{" "}
      </Layout>
    );
  }

  const hasActiveFilters =
    appliedFilters.keyword ||
    appliedFilters.published !== undefined ||
    appliedFilters.featured !== undefined ||
    (Array.isArray(appliedFilters.tag) && appliedFilters.tag.length > 0) ||
    appliedFilters.category; // PERUBAHAN: Tambahkan cek filter kategori // Tampilkan pesan jika tidak ada artikel setelah loading selesai DAN ada filter aktif

  if (!adminLoading && articlesToDisplay.length === 0 && hasActiveFilters) {
    return (
      <Layout>
        {" "}
        <div className="container mx-auto px-4 sm:px-6 py-12 text-center">
          {" "}
          <p className="text-xl text-gray-600 dark:text-gray-400">
            No articles found matching filters.{" "}
          </p>
          {/* Tampilkan tombol Remove Filter jika ada filter aktif */}{" "}
          {hasActiveFilters && (
            <button
              onClick={handleRemoveFilters}
              className="mt-4 text-accent hover:underline flex items-center justify-center mx-auto"
            >
              <X size={16} className="mr-1" /> Remove Filters{" "}
            </button>
          )}{" "}
        </div>{" "}
      </Layout>
    );
  }

  // Tampilkan pesan jika tidak ada artikel sama sekali (tidak ada filter aktif)
  if (!adminLoading && articlesToDisplay.length === 0 && !hasActiveFilters) {
    return (
      <Layout>
        <div className="container mx-auto px-4 sm:px-6 py-12 text-center">
          <p className="text-xl text-gray-600 dark:text-gray-400">
            No articles found yet.
          </p>
          <Link
            to="/atmin/new"
            className="mt-4 inline-block btn btn-primary flex items-center justify-center mx-auto w-fit"
          >
            <Plus size={18} className="mr-1" /> Create Your First Article
          </Link>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      {" "}
      <div className="container mx-auto px-4 sm:px-6 py-12 fade-in">
        {/* Header utama dashboard */}{" "}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
          {" "}
          <h1 className="text-3xl font-serif font-bold mb-4 sm:mb-0">
            Admin Dashboard{" "}
          </h1>{" "}
          <Link
            to="/atmin/new"
            className="btn btn-primary flex items-center justify-center sm:justify-start"
          >
            <Plus size={18} className="mr-1" /> New Article{" "}
          </Link>{" "}
        </div>{" "}
        <div className="bg-white dark:bg-semibackground rounded-xl shadow-md p-6">
          {" "}
          {/* BAGIAN HEADER MANAGE ARTICLES YANG AKAN DIBAGI 2 KOLOM */}{" "}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
            {" "}
            {/* PERUBAHAN: Tambahkan flex-col/row untuk responsif */}{" "}
            {/* Kolom Kiri: Judul */}{" "}
            <h2 className="text-xl font-bold mb-4 sm:mb-0">Manage Articles</h2>{" "}
            {/* PERUBAHAN: Tambahkan mb untuk mobile */}{" "}
            {/* Kolom Kanan: Tombol-tombol */}{" "}
            <div className="flex items-center space-x-4">
              {" "}
              {/* Tampilkan tombol Remove Filter hanya jika ada filter aktif */}{" "}
              {hasActiveFilters && (
                <button
                  onClick={handleRemoveFilters}
                  className="btn btn-secondary py-1 text-sm"
                >
                  Remove Filters{" "}
                </button>
              )}{" "}
              {/* Tombol Apply Filters (tidak perlu lagi karena filter diterapkan saat state berubah) */}{" "}
              {/* <button
        onClick={handleApplyFilters}
        className="btn btn-primary py-1 text-sm"
       >
        Apply Filters
       </button> */}
              {/* Tombol Logout */}{" "}
              <button
                className="text-sm text-error cursor-pointer"
                onClick={handleLogout}
              >
                Logout{" "}
              </button>{" "}
            </div>{" "}
          </div>
          {/* UI FILTER DAN SEARCH */}{" "}
          <div className="mb-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {" "}
            {/* PERUBAHAN: grid 3 kolom di lg */} {/* Search Keyword */}{" "}
            <div>
              {" "}
              <label
                htmlFor="keyword"
                className="block text-sm font-medium mb-1"
              >
                Search Keyword{" "}
              </label>{" "}
              <input
                type="text"
                id="keyword"
                value={keyword}
                onChange={handleKeywordInputChange}
                onKeyPress={handleKeywordInputKeyPress}
                placeholder="Search title, content..."
                className="form-input w-full"
              />{" "}
            </div>
            {/* Filter Published Status */}{" "}
            <div>
              {" "}
              <label
                htmlFor="publishedStatus"
                className="block text-sm font-medium mb-1"
              >
                Published Status{" "}
              </label>{" "}
              <select
                id="publishedStatus"
                value={publishedStatus}
                onChange={handlePublishedStatusChange} // Panggil handler baru
                className="form-input w-full"
              >
                <option value="all">All</option>{" "}
                <option value="featured">Featured</option>{" "}
                <option value="published">Published</option>{" "}
                <option value="draft">Draft</option>{" "}
              </select>{" "}
            </div>
            {/* PERUBAHAN: Filter Category */}
            <div>
              <label
                htmlFor="categoryFilter"
                className="block text-sm font-medium mb-1"
              >
                Filter by Category
              </label>
              <select
                id="categoryFilter"
                value={selectedCategorySlug}
                onChange={handleCategoryChange} // Panggil handler baru
                className="form-input w-full"
              >
                <option value="all">All Categories</option>
                {/* Tampilkan daftar kategori dari context */}
                {adminCategories.map((category) => (
                  <option key={category.id} value={category.slug}>
                    {" "}
                    {/* Gunakan slug sebagai value */}
                    {category.name}
                  </option>
                ))}
              </select>
              {/* Indikator loading untuk kategori (jika belum dimuat) */}
              {adminCategoriesLoading && adminCategories.length === 0 && (
                <p className="mt-2 text-sm text-gray-500 dark:text-gray-400 flex items-center">
                  <RefreshCw size={14} className="animate-spin mr-1" /> Loading
                  categories...
                </p>
              )}
            </div>
            {/* Filter Tags */}{" "}
            {/* PERUBAHAN: Pindahkan filter tags ke baris baru jika layout 3 kolom */}{" "}
            <div className="md:col-span-2 lg:col-span-1">
              {" "}
              {/* PERUBAHAN: Ambil 2 kolom di md, 1 di lg */}{" "}
              <label
                htmlFor="tagInput"
                className="block text-sm font-medium mb-1"
              >
                Filter by Tag (Press Enter to add){" "}
              </label>{" "}
              <input
                type="text"
                id="tagInput"
                value={tagInput}
                onChange={handleTagInputChange}
                onKeyPress={handleTagInputKeyPress} // Panggil handler baru
                placeholder="Add tag..."
                className="form-input w-full"
              />
              {/* Tampilkan tag yang dipilih */}{" "}
              <div className="mt-2 flex flex-wrap gap-2">
                {" "}
                {selectedTags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300"
                  >
                    {tag}{" "}
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(tag)} // Panggil handler baru
                      className="flex-shrink-0 ml-1 h-3 w-3 rounded-full inline-flex items-center justify-center text-white hover:bg-primary-dark hover:text-gray-200 focus:outline-none focus:bg-primary-dark"
                    >
                      {" "}
                      <span className="sr-only">Remove tag</span>
                      <X size={10} />{" "}
                    </button>{" "}
                  </span>
                ))}{" "}
              </div>{" "}
            </div>{" "}
          </div>{" "}
          {/* Tombol Apply dan Remove Filter (dipindahkan ke header Manage Articles) */}{" "}
          <ArticleTable
            articles={articlesToDisplay}
            onDelete={handleDeleteClick}
            loading={adminLoading}
          />
          {/* KONTROL PAGINATION ADMIN */}{" "}
          {adminArticlesData && adminArticlesData.totalPages > 1 && (
            <div className="flex justify-center items-center mt-6 space-x-4">
              {" "}
              <button
                onClick={handlePreviousPage}
                disabled={isPreviousDisabled}
                className={`px-4 py-2 rounded-md transition-colors ${
                  isPreviousDisabled
                    ? "bg-gray-200 dark:bg-gray-700 text-gray-500 cursor-not-allowed"
                    : "bg-accent text-white hover:bg-accent-dark"
                }`}
              >
                Previous{" "}
              </button>{" "}
              <span className="text-gray-700 dark:text-gray-300">
                Page {adminArticlesData.currentPage} of {adminArticlesData.totalPages}{" "}
              </span>{" "}
              <button
                onClick={handleNextPage}
                disabled={isNextDisabled}
                className={`px-4 py-2 rounded-md transition-colors ${
                  isNextDisabled
                    ? "bg-gray-200 dark:bg-gray-700 text-gray-500 cursor-not-allowed"
                    : "bg-accent text-white hover:bg-accent-dark"
                }`}
              >
                Next{" "}
              </button>{" "}
            </div>
          )}{" "}
        </div>
        {/* Delete Confirmation Modal */}{" "}
        {showConfirmation && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            {" "}
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full">
              {" "}
              <h3 className="text-xl font-bold mb-4">Confirm Deletion</h3>{" "}
              <p className="mb-6 text-gray-600 dark:text-gray-400">
                Are you sure you want to delete this article? This action cannot
                be undone.{" "}
              </p>{" "}
              <div className="flex justify-end space-x-4">
                {" "}
                <button onClick={cancelDelete} className="btn btn-secondary">
                  Cancel{" "}
                </button>{" "}
                <button onClick={confirmDelete} className="btn btn-danger">
                  Delete{" "}
                </button>{" "}
              </div>{" "}
            </div>{" "}
          </div>
        )}
        {/* Logout Confirmation Modal */}{" "}
        {showLogoutConfirmation && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            {" "}
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full">
              {" "}
              <h3 className="text-xl font-bold mb-4">Confirm Logout</h3>{" "}
              <p className="mb-6 text-gray-600 dark:text-gray-400">
                Are you sure you want to log out?{" "}
              </p>{" "}
              <div className="flex justify-end space-x-4">
                {" "}
                <button onClick={cancelLogout} className="btn btn-secondary">
                  Cancel{" "}
                </button>{" "}
                <button onClick={confirmLogout} className="btn btn-danger">
                  Logout{" "}
                </button>{" "}
              </div>{" "}
            </div>{" "}
          </div>
        )}{" "}
      </div>{" "}
    </Layout>
  );
};

export default AdminDashboard;
