/**
 * @fileoverview Halaman "Tulis artikel" — editor artikel baru (mockup v2).
 */
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import AdminLayout from "../../../components/layout/AdminLayout";
import ArticleForm from "../../../components/forms/ArticleForm";
import { useArticles } from "../../../contexts/ArticleContext";
import { ArticleFormData } from "../../../types/articleTypes";
import { useToastMessage } from "../../../hooks/useToastMessage";
import { invalidateAdminSummary } from "../../../hooks/useAdminSummary";

const NewArticlePage: React.FC = () => {
  const { createArticle } = useArticles();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const { showSuccessToast, showErrorToast } = useToastMessage();

  const handleSubmit = async (
    formData: ArticleFormData,
    file?: File,
  ): Promise<boolean> => {
    setIsLoading(true);
    try {
      await createArticle(formData, file);
      invalidateAdminSummary();
      showSuccessToast(
        formData.published ? "Artikel berhasil diterbitkan!" : "Draf berhasil disimpan!",
      );
      navigate("/atmin/articles", { replace: true });
      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Gagal membuat artikel";
      if (message.startsWith("NETWORK_UNCERTAIN:")) {
        showErrorToast(message.replace("NETWORK_UNCERTAIN:", ""));
        invalidateAdminSummary();
        navigate("/atmin/articles", { replace: true });
        return true;
      }
      showErrorToast(message);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AdminLayout>
      <ArticleForm onSubmit={handleSubmit} isLoading={isLoading} />
    </AdminLayout>
  );
};

export default NewArticlePage;
