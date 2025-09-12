// backend/src/frontend/src/pages/NewArticlePage.tsx
import React, { useContext } from "react"; // useContext mungkin tidak lagi diperlukan jika hanya pakai useArticles
import { Link, useNavigate } from "react-router-dom";
import { ChevronLeft } from "lucide-react";
import Layout from "../../components/layout/Layout";
import ArticleForm from "../../components/admin/ArticleForm"; // Import ArticleForm
import { ArticleContext, useArticles } from "../../contexts/ArticleContext"; // Import useArticles
import { ArticleFormData } from "../../types"; // Import ArticleFormData
import { generateSlug, calculateReadingTime } from "../../lib/utils"; // Import helper functions

const NewArticlePage: React.FC = () => {
  const { createNewArticle } = useArticles(); // Gunakan useArticles hook
  const navigate = useNavigate();

  // Fungsi handleSubmit menerima formData dari ArticleForm
  const handleSubmit = async (formData: ArticleFormData) => {
    console.log(
      "[NewArticlePage] Handling form submission. Received formData:",
      formData
    ); // Log data yang diterima dari form

    // Slug dan ReadingTime dihitung di frontend sebelum dikirim
    const slug = generateSlug(formData.title);
    const readingTime = calculateReadingTime(formData.content);

    const articleDataToSend = {
      ...formData, // formData sudah termasuk category_id yang dipilih dari form
      slug, // Timpa slug yang mungkin ada di formData (meskipun ArticleFormData Omit slug)
      readingTime, // Timpa readingTime yang mungkin ada di formData (meskipun ArticleFormData Omit readingTime)
    };

    console.log(
      "[NewArticlePage] Sending data to createNewArticle:",
      articleDataToSend
    ); // Log data yang akan dikirim ke context

    const newArticle = await createNewArticle(articleDataToSend);

    if (newArticle) {
      console.log("[NewArticlePage] Article created successfully:", newArticle);
      navigate("/atmin", { replace: true }); // Redirect ke daftar artikel admin
    } else {
      console.error("[NewArticlePage] Failed to create new article");
      // TODO: Tampilkan pesan error ke user
    }
  };

  return (
    <Layout>
      <div className="container max-w-4xl mx-auto px-4 sm:px-6 py-12 fade-in">
        <div className="mb-8">
          <div className="flex items-center">
            <Link
              to="/atmin"
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
          {/* Render ArticleForm component dan teruskan handler submit */}
          <ArticleForm onSubmit={handleSubmit} />
        </div>
      </div>
    </Layout>
  );
};

export default NewArticlePage;
