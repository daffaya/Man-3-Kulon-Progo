// backend/src/frontend/src/pages/EditArticle.tsx
import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate, Link } from "react-router-dom"; // Import Link
import Layout from "../../../components/layout/Layout";
import { useArticles } from "../../../contexts/ArticleContext";
// Import Article dan ArticleFormData
import { Article, ArticleFormData } from "../../../types/articleTypes";
import ArticleForm from "../../../components/forms/ArticleForm"; // Import ArticleForm
import { RefreshCw, X, ChevronLeft, ArrowLeft } from "lucide-react"; // Import icons
import AdminLayout from "../../../components/layout/AdminLayout";
import { useAuth } from "../../../contexts/AuthContext";

export const ALLOWED_ROLES = ["jurnalis", "super_admin"] as const;
const hasEditAccess = (isLoggedIn: boolean, role?: string): boolean =>
  isLoggedIn && role
    ? ALLOWED_ROLES.includes(role as (typeof ALLOWED_ROLES)[number])
    : false;

const EditArticle: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { fetchAdminArticleById, updateExistingArticle } = useArticles();
  const [articleData, setArticleData] = useState<Article | null>(null);
  const { isLoggedIn, logout, token, user } = useAuth();

  const isAdminOrJurnalist = hasEditAccess(isLoggedIn, user?.role);

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

      setLoading(false); // Selesai loading setelah fetch artikel
    };

    loadArticle();
  }, [id, fetchAdminArticleById]);

  const handleSubmit = async (formData: ArticleFormData) => {
    if (!id) return;

    setSaving(true);
    setError(null);

    console.log(
      `[EditArticle] Submitting updates for article ID ${id}. Received formData from form:`,
      formData
    ); // Log data yang diterima dari form

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
        {isAdminOrJurnalist && (
          <div className="flex items-center mb-4">
            <Link
              to="/atmin/articles"
              className="text-sm text-gray-600 dark:text-gray-400 hover:text-primary dark:hover:text-primary flex items-center"
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
            </Link>
            <h1 className="text-3xl font-serif font-bold mx-4">Edit Artikel</h1>
          </div>
        )}

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
