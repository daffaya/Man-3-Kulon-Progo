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
 * Handles article submission and displays toast notifications for success or error.
 */
const NewArticlePage: React.FC = () => {
  const { createArticle } = useArticles();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const { showSuccessToast, showErrorToast } = useToastMessage();

  /**
   * Handle article form submission.
   * @param formData Data from the article form
   * @param file Optional file attachment
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
              className="mr-4 text-gray-600 dark:text-gray-400 hover:text-accent dark:hover:text-accent transition-colors"
            >
              <ChevronLeft size={20} />
            </Link>
            <h1 className="text-3xl font-serif font-bold">
              Create New Article
            </h1>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
          <ArticleForm onSubmit={handleSubmit} isLoading={isLoading} />
        </div>
      </div>
    </AdminLayout>
  );
};

export default NewArticlePage;
