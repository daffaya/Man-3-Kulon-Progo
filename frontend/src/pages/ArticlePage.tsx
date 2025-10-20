import React, { useContext, useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { ChevronLeft, Edit } from "lucide-react";
import Layout from "../components/layout/Layout";
import ArticleContent from "../components/article/ArticleContent";
import ArticleCard from "../components/article/ArticleCard";
import { useArticles } from "../contexts/ArticleContext";

import { Article } from "../types/articleTypes";

const ArticlePage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const { getPublicArticleBySlug, getPublishedArticles, loading } =
    useArticles();
  const [article, setArticle] = useState<Article | undefined>(undefined);
  const [relatedArticles, setRelatedArticles] = useState<Article[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    if (!slug) {
      console.warn(
        "[ArticlePage useEffect] Slug is missing. Redirecting to blog."
      );
      navigate("/blog", { replace: true });
      return;
    }

    console.log(
      `[ArticlePage useEffect] Attempting to get article by slug: ${slug}`
    );
    const currentArticle = getPublicArticleBySlug(slug);

    if (!currentArticle) {
      console.warn(
        `[ArticlePage useEffect] Article with slug "${slug}" not found in context state. Redirecting to blog.`
      );
      navigate("/blog", { replace: true });
      return;
    }

    console.log("[ArticlePage useEffect] Article found:", currentArticle);
    setArticle(currentArticle);

    const allPublishedArticles = getPublishedArticles();
    if (currentArticle && allPublishedArticles.length > 0) {
      console.log("[ArticlePage useEffect] Finding related articles...");
      const articles = allPublishedArticles.filter(
        (a) =>
          a.id !== currentArticle.id &&
          a.tags &&
          Array.isArray(a.tags) &&
          currentArticle.tags &&
          Array.isArray(currentArticle.tags) &&
          a.tags.some((tag) => currentArticle.tags.includes(tag))
      );
      console.log(
        `[ArticlePage useEffect] Found ${articles.length} potential related articles.`
      );
      setRelatedArticles(articles.slice(0, 3));
    } else {
      console.log(
        "[ArticlePage useEffect] No related articles found or no published articles available."
      );
      setRelatedArticles([]);
    }

    window.scrollTo(0, 0);
  }, [slug, getPublicArticleBySlug, navigate, getPublishedArticles]);

  if (loading || !article) {
    return (
      <Layout>
        {" "}
        <div className="container-narrow py-20 text-center">
          {" "}
          {loading ? <p>Loading article...</p> : <p>Article not found.</p>}{" "}
        </div>{" "}
      </Layout>
    );
  }

  return (
    <Layout>
      {" "}
      <div className="container-narrow max-w-3xl py-4 slide-up">
        {" "}
        <div className="mb-4">
          {" "}
          <div className="flex items-center justify-between mb-4">
            {" "}
            <Link
              to="/blog"
              className="flex items-center text-gray-600 dark:text-gray-400 hover:text-accent dark:hover:text-accent transition-colors"
            >
              <ChevronLeft size={20} /> <span>Back to articles</span>{" "}
            </Link>{" "}
          </div>
          {/* PERUBAHAN: Tampilkan Kategori Artikel */}
          {article.category && (
            <div className="ml-5 mb-6 text-sm text-gray-600 dark:text-gray-400 hover:text-accent dark:hover:text-accent transition-colors">
              Category:{" "}
              {/* Opsional: Buat link ke halaman blog dengan filter kategori */}
              <Link
                to={`/blog?category=${encodeURIComponent(
                  article.category.slug
                )}`}
                className="text-accent hover:underline"
              >
                {article.category.name} {/* Tampilkan nama kategori */}
              </Link>
            </div>
          )}{" "}
        </div>
        {/* Komponen untuk menampilkan konten artikel */}
        <ArticleContent article={article} />
        {/* Bagian Artikel Terkait */}{" "}
        {relatedArticles.length > 0 && (
          <div className="mt-16">
            {" "}
            <h3 className="text-2xl font-serif font-bold mb-6">
              Related Articles{" "}
            </h3>{" "}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
              {" "}
              {relatedArticles.map((relatedArticle) => (
                <ArticleCard key={relatedArticle.id} article={relatedArticle} />
              ))}{" "}
            </div>{" "}
          </div>
        )}{" "}
      </div>{" "}
    </Layout>
  );
};

export default ArticlePage;
