/**
 * @fileoverview Page component for creating a new article.
 * This component provides a form interface for users to create and submit new articles.
 * It handles the submission process, displays loading states, and shows toast notifications
 * for success or error feedback before navigating back to the articles list.
 */

import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ChevronLeft } from "lucide-react";
import AdminLayout from "../../../components/layout/AdminLayout";
import ArticleForm from "../../../components/forms/ArticleForm";
import { useArticles } from "../../../contexts/ArticleContext";
import { ArticleFormData } from "../../../types/articleTypes";
import { useToastMessage } from "../../../hooks/useToastMessage";

/**
 * Page component for creating a new article.
 * Renders a form for article creation and handles the submission logic,
 * including loading states and user feedback via toast notifications.
 */
const NewArticlePage: React.FC = () => {
  const { createArticle } = useArticles();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const { showSuccessToast, showErrorToast } = useToastMessage();

  /**
   * Handles the submission of the article creation form.
   * Calls the createArticle function, shows appropriate toast notifications,
   * and navigates back to the articles list upon success.
   * @param {ArticleFormData} formData - The data from the article form.
   * @param {File} [file] - An optional image file for the article cover.
   */
  const handleSubmit = async (formData: ArticleFormData, file?: File) => {
    setIsLoading(true);

    try {
      await createArticle(formData, file);
      showSuccessToast("Artikel berhasil dibuat!");
      setTimeout(() => navigate("/atmin/articles", { replace: true }), 1500);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Gagal membuat artikel";
      showErrorToast(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AdminLayout>
      <div className="container max-w-4xl mx-auto px-4 sm:px-6 py-12 fade-in">
        <div className="mb-8">
          <div className="flex items-center">
            <Link
              to="/atmin/articles"
              className="mr-4 text-secondary hover:text-accent transition-colors"
            >
              <ChevronLeft size={20} />
            </Link>
            <h1 className="text-3xl font-serif font-bold text-foreground">
              Buat Artikel Baru
            </h1>
          </div>
        </div>

        <div className="card p-6">
          <ArticleForm onSubmit={handleSubmit} isLoading={isLoading} />
        </div>
      </div>
    </AdminLayout>
  );
};

export default NewArticlePage;
