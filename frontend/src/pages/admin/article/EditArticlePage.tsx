// backend/src/frontend/src/pages/EditArticle.tsx
import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate, Link } from "react-router-dom"; // Import Link
import Layout from "../../../components/layout/Layout";
import { useArticles } from "../../../contexts/ArticleContext";
// Import Article dan ArticleFormData
import { Article, ArticleFormData } from "../../../types";
import ArticleForm from "../../../components/admin/ArticleForm"; // Import ArticleForm
import { RefreshCw, X, ChevronLeft } from "lucide-react"; // Import icons
import AdminLayout from "../../../components/layout/AdminLayout";

const EditArticle: React.FC = () => {
  const { id } = useParams<{ id: string }>(); // Ambil ID artikel dari URL
  const navigate = useNavigate();
  const {
    fetchAdminArticleById,
    updateExistingArticle,
    // Tidak perlu fetch kategori di sini lagi, ArticleForm yang akan fetch
    // adminCategories,
    // adminCategoriesLoading,
    // fetchAdminCategories,
  } = useArticles();

  // State untuk menyimpan data artikel yang diambil (untuk diteruskan ke ArticleForm)
  const [articleData, setArticleData] = useState<Article | null>(null); // State ini akan menyimpan data lengkap termasuk category object

  const [loading, setLoading] = useState(true); // Loading awal saat fetch data artikel
  const [saving, setSaving] = useState(false); // Loading saat menyimpan perubahan
  const [error, setError] = useState<string | null>(null);
  const [initialLoadError, setInitialLoadError] = useState<string | null>(null); // Error saat gagal fetch data awal

  // --- Fetch data artikel saat komponen mount atau ID berubah ---
  useEffect(() => {
    const loadArticle = async () => {
      // Hanya perlu fetch artikel di sini
      if (!id) {
        setInitialLoadError("Article ID is missing.");
        setLoading(false);
        return;
      }
      setLoading(true);
      setInitialLoadError(null);

      console.log(`[EditArticle useEffect] Fetching article ID: ${id}...`);

      // Fetch data artikel
      const fetchedArticle = await fetchAdminArticleById(id);

      if (fetchedArticle) {
        console.log(
          "[EditArticle useEffect] Fetched article data:",
          fetchedArticle
        );
        // Set state articleData dengan data artikel yang diambil
        setArticleData(fetchedArticle); // Simpan objek artikel lengkap
        console.log("[EditArticle useEffect] Article data state updated.");
      } else {
        console.error(
          `[EditArticle useEffect] Failed to fetch article with ID ${id}.`
        );
        setInitialLoadError("Failed to load article. Please check console.");
        setArticleData(null); // Set null jika gagal
      }

      // Tidak perlu memanggil fetchAdminCategories() di sini lagi
      // ArticleForm akan memanggilnya saat ArticleForm di-render

      setLoading(false); // Selesai loading setelah fetch artikel
    };

    loadArticle();
  }, [id, fetchAdminArticleById]); // Dependency array: id, fetchAdminArticleById

  // --- Handler Submit Form ---
  // Menerima formData dari ArticleForm
  const handleSubmit = async (formData: ArticleFormData) => {
    // PERUBAHAN FIX: Hapus baris e.preventDefault() karena e tidak tersedia di sini.
    // ArticleForm sudah melakukan preventDefault() sebelum memanggil onSubmit.
    // e.preventDefault(); // <--- HAPUS BARIS INI

    if (!id) return; // Pastikan ID ada

    setSaving(true); // Gunakan state saving
    setError(null);

    console.log(
      `[EditArticle] Submitting updates for article ID ${id}. Received formData from form:`,
      formData
    ); // Log data yang diterima dari form

    // Panggil fungsi updateExistingArticle dari context
    // Menggunakan formData yang diterima dari ArticleForm
    const updatedArticle = await updateExistingArticle(id, formData);

    if (updatedArticle) {
      console.log(
        `[EditArticle] Article ID ${id} updated successfully:`,
        updatedArticle
      );
      // Opsional: Redirect atau tampilkan pesan sukses
      // navigate(`/atmin/articles/${updatedArticle.id}`); // Redirect ke halaman detail artikel admin
      alert("Article updated successfully!"); // Pesan sukses
      // Opsional: Perbarui state articleData lokal jika perlu
      setArticleData(updatedArticle);
    } else {
      console.error(`[EditArticle] Failed to update article with ID ${id}.`);
      setError("Failed to update article. Please check console for details.");
    }

    setSaving(false); // Selesai saving
  };

  // Tampilkan loading state awal (fetch data artikel)
  if (loading) {
    return (
      <Layout>
        <div className="container max-w-4xl mx-auto px-4 sm:px-6 py-12 text-center">
          <RefreshCw size={32} className="mx-auto animate-spin text-accent" />
          <p className="mt-4">Loading article...</p>
        </div>
      </Layout>
    );
  }

  // Tampilkan error state awal (gagal fetch data artikel)
  if (initialLoadError) {
    return (
      <Layout>
        <div className="container max-w-4xl mx-auto px-4 sm:px-6 py-12 text-center text-error">
          <p className="text-xl font-bold mb-4">Error Loading Article</p>
          <p>{initialLoadError}</p>
        </div>
      </Layout>
    );
  }

  // Tampilkan pesan jika articleData masih null setelah loading selesai (misal ID tidak valid)
  if (!articleData) {
    return (
      <Layout>
        <div className="container max-w-4xl mx-auto px-4 sm:px-6 py-12 text-center text-gray-600 dark:text-gray-400">
          <p className="text-xl font-bold mb-4">Article Not Found</p>
          <p>The article with ID "{id}" could not be loaded.</p>
          <Link
            to="/atmin/articles"
            className="mt-4 inline-block btn btn-secondary"
          >
            Back to Dashboard
          </Link>
        </div>
      </Layout>
    );
  }

  return (
    <AdminLayout>
      <div className="container max-w-4xl mx-auto px-4 sm:px-6 py-12 fade-in">
        <div className="mb-8">
          {" "}
          <div className="flex items-center">
            {" "}
            <Link
              to="/atmin/articles"
              className="mr-4 text-gray-600 dark:text-gray-400 hover:text-accent dark:hover:text-accent transition-colors"
            >
              <ChevronLeft size={20} />{" "}
            </Link>{" "}
            <h1 className="text-3xl font-serif font-bold">Edit Article </h1>{" "}
          </div>{" "}
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
          {/* Error Message */}
          {error && (
            <div className="bg-error/10 border border-error text-error px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}
          {/* Render ArticleForm component dan teruskan data artikel serta handler submit */}
          {/* ArticleForm akan menggunakan data artikel untuk mengisi form, termasuk kategori */}{" "}
          <ArticleForm article={articleData} onSubmit={handleSubmit} />
          {/* Indikator saving */}
          {saving && (
            <div className="mt-4 text-center text-accent flex items-center justify-center">
              <RefreshCw size={18} className="animate-spin mr-2" /> Saving
              changes...
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
};

export default EditArticle;
