/**
 * @fileoverview EditArticle page component for modifying existing articles.
 * This component provides an interface for authorized users (jurnalis, super_admin)
 * to edit existing articles. It fetches article data based on the URL parameter,
 * handles form submissions for updates, and manages loading/error states.
 * The component includes permission checks and appropriate redirects.
 */

import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import Layout from "../../../components/layout/Layout";
import { useArticles } from "../../../contexts/ArticleContext";
import { ArticleFormData } from "../../../types/articleTypes";
import ArticleForm from "../../../components/forms/ArticleForm";
import { RefreshCw, ChevronLeft } from "lucide-react";
import AdminLayout from "../../../components/layout/AdminLayout";
import { useAuth } from "../../../contexts/AuthContext";
import { useToastMessage } from "../../../hooks/useToastMessage";
import articleApi from "../../../api/articleApi";

/** Roles that are permitted to edit articles. */
export const ALLOWED_ROLES = ["jurnalis", "super_admin"] as const;

/**
 * Checks if a user has permission to edit articles based on their login status and role.
 * @param {boolean} isLoggedIn - The user's login status.
 * @param {string | undefined} role - The user's role.
 * @returns {boolean} True if the user has edit access, otherwise false.
 */
const hasEditAccess = (isLoggedIn: boolean, role?: string): boolean =>
  isLoggedIn && role
    ? ALLOWED_ROLES.includes(role as (typeof ALLOWED_ROLES)[number])
    : false;

/**
 * Page component for editing an existing article.
 * Fetches article data on mount, provides a form for editing,
 * and handles the update submission process.
 */
const EditArticle: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { state, updateArticle } = useArticles();
  const { isLoggedIn, user } = useAuth();
  const { showSuccessToast, showErrorToast } = useToastMessage();

  const isAdminOrJurnalis = hasEditAccess(isLoggedIn, user?.role);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [initialLoadError, setInitialLoadError] = useState<string | null>(null);
  const [article, setArticle] = useState<any>(null);

  useEffect(() => {
    /**
     * Loads the article data from the API based on the ID from the URL.
     * Validates the ID format and handles loading and error states.
     */
    const loadArticle = async () => {
      if (!id) {
        setInitialLoadError("Article ID is missing.");
        setLoading(false);
        return;
      }

      const uuidRegex =
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      if (!uuidRegex.test(id)) {
        setInitialLoadError("Invalid article ID. ID must be a valid UUID.");
        setLoading(false);
        return;
      }

      setLoading(true);
      setInitialLoadError(null);

      try {
        const fetchedArticle = await articleApi.getArticleById(id);

        const formattedArticle = {
          ...fetchedArticle,
          coverImage: fetchedArticle.coverImage || "",
        };

        setArticle(formattedArticle);
      } catch (err) {
        setInitialLoadError("Failed to load article.");
      } finally {
        setLoading(false);
      }
    };

    loadArticle();
  }, [id]);

  /**
   * Handles the form submission to update the article.
   * @param {ArticleFormData} formData - The updated article data.
   * @param {File | undefined} file - An optional new image file for the article.
   */
  const handleSubmit = async (formData: ArticleFormData, file?: File) => {
    if (!id) return;

    setSaving(true);
    setError(null);

    try {
      const updatedArticle = await updateArticle(id, formData, file);
      showSuccessToast("Artikel berhasil diperbarui!");
      setTimeout(() => navigate("/atmin/articles"), 1500);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to update article";
      setError(message);
      showErrorToast(message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="container max-w-4xl mx-auto px-4 sm:px-6 py-12 text-center">
          <RefreshCw size={32} className="mx-auto animate-spin text-accent" />
          <p className="mt-4 text-secondary">Loading article...</p>
        </div>
      </Layout>
    );
  }

  if (initialLoadError) {
    return (
      <Layout>
        <div className="container max-w-4xl mx-auto px-4 sm:px-6 py-12 text-center">
          <div className="card p-12">
            <p className="text-xl font-bold mb-4 text-error">
              Error Loading Article
            </p>
            <p className="text-secondary mb-4">{initialLoadError}</p>
            <Link
              to="/atmin/articles"
              className="inline-block btn btn-secondary"
            >
              Back to Dashboard
            </Link>
          </div>
        </div>
      </Layout>
    );
  }

  if (!article) {
    return (
      <Layout>
        <div className="container max-w-4xl mx-auto px-4 sm:px-6 py-12 text-center">
          <div className="card p-12">
            <p className="text-xl font-bold mb-4 text-foreground">
              Article Not Found
            </p>
            <p className="text-secondary mb-4">
              The article with ID "{id}" could not be loaded.
            </p>
            <Link
              to="/atmin/articles"
              className="inline-block btn btn-secondary"
            >
              Back to Dashboard
            </Link>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <AdminLayout>
      <div className="container max-w-4xl mx-auto px-4 sm:px-6 py-12 fade-in">
        {isAdminOrJurnalis && (
          <div className="flex items-center mb-4">
            <Link
              to="/atmin/articles"
              className="text-sm text-secondary hover:text-accent flex items-center transition-colors"
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Kembali ke Manajemen Artikel
            </Link>
          </div>
        )}

        <div className="card p-6">
          <h1 className="text-3xl font-serif font-bold mb-6 text-foreground">
            Edit Artikel
          </h1>

          {error && (
            <div className="bg-[rgb(var(--color-error),0.1)] border border-[rgb(var(--color-error))] text-[rgb(var(--color-error))] px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}

          <ArticleForm
            article={article}
            onSubmit={handleSubmit}
            isLoading={saving}
          />
        </div>
      </div>
    </AdminLayout>
  );
};

export default EditArticle;
