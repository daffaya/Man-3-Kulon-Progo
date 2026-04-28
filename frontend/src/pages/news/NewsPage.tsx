/**
 * @fileoverview NewsPage component for displaying a paginated and filterable list of news articles.
 * This component allows users to browse articles, filter by tags and categories, and navigate between pages.
 * It manages URL parameters to maintain filter state and provides a responsive layout for article viewing.
 */

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { RefreshCw, X, ChevronLeft, ChevronRight } from "lucide-react";
import Layout from "../../components/layout/Layout";
import ArticleList from "../../components/article/ArticleList";
import { useArticles } from "../../contexts/ArticleContext";
import { Article, ArticleFilters } from "../../types/articleTypes";

/**
 * Component that renders the news/articles page with filtering and pagination.
 * It fetches articles based on URL parameters for tags, categories, and page number.
 * Users can filter articles by tags and categories, and navigate through paginated results.
 */
const NewsPage: React.FC = () => {
  const { state, fetchArticles, fetchCategories, fetchTags } = useArticles();
  const {
    articles,
    pagination,
    loading,
    tags,
    tagsLoading,
    categories,
    categoriesLoading,
  } = state;

  const location = useLocation();
  const navigate = useNavigate();

  const [activeTag, setActiveTag] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const articlesPerPage = 9;

  useEffect(() => {
    fetchCategories();
    fetchTags();
  }, [fetchCategories, fetchTags]);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tagParam = params.get("tag");
    const categoryParam = params.get("category");
    const pageParam = params.get("page");

    const tag = tagParam ? decodeURIComponent(tagParam) : null;
    const category = categoryParam ? decodeURIComponent(categoryParam) : null;
    const page = pageParam ? parseInt(pageParam) : 1;

    setActiveTag(tag);
    setActiveCategory(category);
    setCurrentPage(page);
  }, [location.search]);

  useEffect(() => {
    const filters: ArticleFilters = {
      page: currentPage,
      limit: articlesPerPage,
      tag: activeTag ?? undefined,
      category: activeCategory ?? undefined,
      published: true,
    };

    fetchArticles(filters);
  }, [currentPage, activeTag, activeCategory, fetchArticles]);

  /**
   * Memoized sorted list of all tags for display.
   */
  const allTags = useMemo(() => tags.sort(), [tags]);

  /**
   * Applies filters by updating URL parameters.
   * @param {string | null} tag - The tag filter to apply.
   * @param {string | null} category - The category filter to apply.
   * @param {number} page - The page number to navigate to.
   */
  const applyFilters = useCallback(
    (tag: string | null, category: string | null, page: number = 1) => {
      const params = new URLSearchParams();
      if (tag) params.set("tag", encodeURIComponent(tag));
      if (category) params.set("category", encodeURIComponent(category));
      if (page > 1) params.set("page", page.toString());

      navigate(`${location.pathname}${params.toString() ? `?${params}` : ""}`, {
        replace: true,
      });
    },
    [navigate, location.pathname],
  );

  /**
   * Handles category filter change from the dropdown.
   * @param {React.ChangeEvent<HTMLSelectElement>} e - The select change event.
   */
  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newSlug = e.target.value === "all" ? null : e.target.value;
    applyFilters(null, newSlug, 1);
  };

  /**
   * Handles page navigation and updates URL parameters.
   * @param {number} page - The page number to navigate to.
   */
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    applyFilters(activeTag, activeCategory, page);
    window.scrollTo(0, 0);
  };

  if ((loading && articles.length === 0) || tagsLoading || categoriesLoading) {
    const message = tagsLoading
      ? "Memuat tag..."
      : categoriesLoading
        ? "Memuat kategori..."
        : "Memuat artikel...";
    return (
      <Layout>
        <div className="container mx-auto px-4 py-12 text-center">
          <RefreshCw size={32} className="mx-auto animate-spin text-accent" />
          <p className="mt-4 text-secondary">{message}</p>
        </div>
      </Layout>
    );
  }

  const noArticles = !loading && articles.length === 0;
  const hasFilters = activeTag || activeCategory;

  if (noArticles) {
    const message = hasFilters
      ? activeTag
        ? `Tidak ada artikel dengan tag "${activeTag}".`
        : `Tidak ada artikel di kategori "${
            categories.find((c) => c.slug === activeCategory)?.name ||
            activeCategory
          }".`
      : "Belum ada artikel. Cek lagi nanti ya!";

    return (
      <Layout>
        <div className="container mx-auto px-4 py-12 text-center">
          <p className="text-xl text-secondary">{message}</p>
          {hasFilters && (
            <button
              onClick={() => applyFilters(null, null, 1)}
              className="mt-4 text-accent hover:underline flex items-center justify-center mx-auto"
            >
              <X size={16} className="mr-1" /> Hapus semua filter
            </button>
          )}
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 fade-in">
        <div className="text-center mb-6">
          <h1 className="text-4xl md:text-5xl font-serif font-bold mb-4 text-foreground">
            Berita & Artikel
          </h1>

          {hasFilters ? (
            <div className="flex flex-col items-center">
              <p className="text-lg text-secondary mb-4">
                Menampilkan artikel berdasarkan filter:
              </p>
              {activeTag && (
                <div className="inline-flex items-center px-4 py-2 bg-accent text-white rounded-full mb-2">
                  {activeTag}
                  <button
                    onClick={() => applyFilters(null, activeCategory, 1)}
                    className="ml-2 p-1 hover:bg-white/20 rounded-full"
                  >
                    <X size={14} />
                  </button>
                </div>
              )}
              {activeCategory && (
                <div className="inline-flex items-center px-4 py-2 bg-accent text-white rounded-full mb-2">
                  Kategori:{" "}
                  {categories.find((c) => c.slug === activeCategory)?.name ||
                    activeCategory}
                  <button
                    onClick={() => applyFilters(activeTag, null, 1)}
                    className="ml-2 p-1 hover:bg-white/20 rounded-full"
                  >
                    <X size={14} />
                  </button>
                </div>
              )}
              <button
                onClick={() => applyFilters(null, null, 1)}
                className="mt-2 text-secondary hover:underline flex items-center justify-center mx-auto"
              >
                <X size={16} className="mr-1" /> Hapus semua filter
              </button>
            </div>
          ) : (
            <p className="text-lg text-secondary">
              Lihat semua artikel atau pilih kategori dan tag favoritmu.
            </p>
          )}
        </div>

        <div className="mb-6 flex justify-center">
          <div className="w-full max-w-xs">
            <select
              id="categoryFilter"
              value={activeCategory || "all"}
              onChange={handleCategoryChange}
              className="form-input w-full"
            >
              <option value="all">Semua Kategori</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.slug}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="mb-16 flex flex-wrap gap-2 justify-center">
          {allTags.map((tag) => (
            <Link
              key={tag}
              to={`/berita?tag=${encodeURIComponent(tag)}`}
              onClick={(e) => {
                e.preventDefault();
                applyFilters(tag, null, 1);
              }}
              className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                activeTag === tag ? "bg-accent text-white" : "btn btn-secondary"
              }`}
            >
              {tag}
            </Link>
          ))}
        </div>

        <ArticleList
          key={`${activeTag || "all"}-${
            activeCategory || "all"
          }-${currentPage}`}
          articles={articles}
          loading={loading}
        />

        {pagination && pagination.totalPages > 1 && (
          <div className="flex justify-center items-center mt-12">
            <nav className="flex items-center space-x-2">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className={`btn btn-secondary px-4 py-2 flex items-center ${
                  currentPage === 1 ? "opacity-50 cursor-not-allowed" : ""
                }`}
              >
                <ChevronLeft size={20} />
                <span className="ml-1">Sebelumnya</span>
              </button>

              <div className="flex items-center space-x-1">
                {Array.from({ length: pagination.totalPages }, (_, i) => i + 1)
                  .filter((page) => {
                    return (
                      page === 1 ||
                      page === pagination.totalPages ||
                      Math.abs(page - currentPage) <= 1
                    );
                  })
                  .map((page, index, array) => {
                    if (index > 0 && page - array[index - 1] > 1) {
                      return (
                        <React.Fragment key={`ellipsis-${page}`}>
                          <span className="px-3 py-2 text-secondary/60">
                            ...
                          </span>
                          <button
                            onClick={() => handlePageChange(page)}
                            className={`px-4 py-2 rounded-lg transition-all ${
                              currentPage === page
                                ? "btn btn-primary"
                                : "btn btn-secondary"
                            }`}
                          >
                            {page}
                          </button>
                        </React.Fragment>
                      );
                    }
                    return (
                      <button
                        key={page}
                        onClick={() => handlePageChange(page)}
                        className={`px-4 py-2 rounded-lg transition-all ${
                          currentPage === page
                            ? "btn btn-primary"
                            : "btn btn-secondary"
                        }`}
                      >
                        {page}
                      </button>
                    );
                  })}
              </div>

              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === pagination.totalPages}
                className={`btn btn-secondary px-4 py-2 flex items-center ${
                  currentPage === pagination.totalPages
                    ? "opacity-50 cursor-not-allowed"
                    : ""
                }`}
              >
                <span className="mr-1">Berikutnya</span>
                <ChevronRight size={20} />
              </button>
            </nav>
          </div>
        )}

        {pagination && (
          <div className="text-center mt-4 text-sm text-secondary/70">
            Menampilkan {articles.length} dari {pagination.totalArticles}{" "}
            artikel
            {pagination.totalPages > 1 && (
              <span>
                {" "}
                (Halaman {currentPage} dari {pagination.totalPages})
              </span>
            )}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default NewsPage;
