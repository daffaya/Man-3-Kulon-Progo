// frontend/src/pages/HomePage.tsx

import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import Layout from "../components/layout/Layout";
import ArticleCard from "../components/article/ArticleCard";
import { useArticles } from "../contexts/ArticleContext";
import Carousel from "../components/ui/Carousel";
import Hero from "../components/ui/Hero";

/**
 * HomePage component.
 * Displays a hero section, featured articles, and recent articles.
 * Fetches articles from the ArticleContext on mount.
 */
const HomePage: React.FC = () => {
  const { state, fetchArticles } = useArticles();
  const { articles, loading } = state;

  useEffect(() => {
    fetchArticles({ limit: 10 });
  }, [fetchArticles]);

  if (loading) {
    return (
      <Layout>
        <div className="text-center py-12">
          <p>Loading articles...</p>
        </div>
      </Layout>
    );
  }

  const featuredArticles = articles.filter((article) => article.featured);
  const recentArticles = articles.slice(0, 6);

  return (
    <Layout>
      <Carousel />
      <Hero />

      {featuredArticles.length > 0 && (
        <section className="pt-12 md:pt-20 pb-10 md:pb-16">
          <div className="container max-w-6xl mx-auto px-4 sm:px-6">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-2xl md:text-3xl font-serif font-bold">
                Artikel Unggulan
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-4">
              {featuredArticles.map((article) => (
                <ArticleCard key={article.id} article={article} />
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="pt-12 md:pt-20 pb-10 md:pb-16">
        <div className="container max-w-6xl mx-auto px-4 sm:px-6">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl md:text-3xl font-serif font-bold">
              Berita Terbaru
            </h2>
            <Link
              to="/berita"
              className="flex items-center text-accent hover:underline font-medium"
            >
              Lihat Semua
              <ChevronRight size={18} />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-4">
            {recentArticles.map((article) => (
              <ArticleCard key={article.id} article={article} />
            ))}
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default HomePage;
