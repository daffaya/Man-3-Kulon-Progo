// frontend/src/pages/NewsPage.tsx

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { RefreshCw, X, ChevronLeft, ChevronRight } from "lucide-react";
import Layout from "../components/layout/Layout";
import ArticleList from "../components/article/ArticleList";
import { useArticles } from "../contexts/ArticleContext";
import { Article, ArticleFilters } from "../types/articleTypes";

/**
 * The main page for displaying a list of articles.
 * It provides filtering by category and tag, pagination, and handles URL synchronization for filter states.
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
  const articlesPerPage = 15;

  /**
   * Fetches categories and tags from the API once when the component mounts.
   */
  useEffect(() => {
    fetchCategories();
    fetchTags();
  }, [fetchCategories, fetchTags]);

  /**
   * Synchronizes the component's filter state with the URL query parameters.
   * This runs whenever the URL search string changes.
   */
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

  /**
   * Fetches articles from the API whenever the active filters or the current page change.
   */
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
   * A memoized, alphabetically sorted list of all available tags.
   */
  const allTags = useMemo(() => tags.sort(), [tags]);

  /**
   * Updates the URL with the specified filter parameters and navigates.
   * @param tag - The tag to filter by.
   * @param category - The category slug to filter by.
   * @param page - The page number to navigate to.
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
    [navigate, location.pathname]
  );

  /**
   * Handles the change event for the category filter dropdown.
   * @param e - The change event from the select element.
   */
  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newSlug = e.target.value === "all" ? null : e.target.value;
    applyFilters(null, newSlug, 1);
  };

  /**
   * Handles navigation to a new page, updates the state, and scrolls to the top.
   * @param page - The page number to navigate to.
   */
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    applyFilters(activeTag, activeCategory, page);
    window.scrollTo(0, 0);
  };

  if ((loading && articles.length === 0) || tagsLoading || categoriesLoading) {
    const message = tagsLoading
      ? "Loading tags..."
      : categoriesLoading
      ? "Loading categories..."
      : "Loading articles...";
    return (
      <Layout>
        <div className="container mx-auto px-4 py-12 text-center">
          <RefreshCw size={32} className="mx-auto animate-spin text-accent" />
          <p className="mt-4">{message}</p>
        </div>
      </Layout>
    );
  }

  const noArticles = !loading && articles.length === 0;
  const hasFilters = activeTag || activeCategory;

  if (noArticles) {
    const message = hasFilters
      ? activeTag
        ? `No articles found with tag "${activeTag}".`
        : `No articles found in category "${
            categories.find((c) => c.slug === activeCategory)?.name ||
            activeCategory
          }".`
      : "No articles found yet. Check back later!";

    return (
      <Layout>
        <div className="container mx-auto px-4 py-12 text-center">
          <p className="text-xl text-gray-600 dark:text-gray-400">{message}</p>
          {hasFilters && (
            <button
              onClick={() => applyFilters(null, null, 1)}
              className="mt-4 text-accent hover:underline flex items-center justify-center mx-auto"
            >
              <X size={16} className="mr-1" /> Clear All Filters
            </button>
          )}
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-12 fade-in">
        <div className="text-center mb-6">
          <h1 className="text-4xl md:text-5xl font-serif font-bold mb-4">
            Articles
          </h1>

          {hasFilters ? (
            <div className="flex flex-col items-center">
              <p className="text-lg text-gray-600 dark:text-gray-400 mb-4">
                You're now viewing filtered articles:
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
                  Category:{" "}
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
                className="mt-2 text-gray-600 dark:text-gray-400 hover:underline flex items-center justify-center mx-auto"
              >
                <X size={16} className="mr-1" /> Clear All Filters
              </button>
            </div>
          ) : (
            <p className="text-lg text-gray-600 dark:text-gray-400">
              Explore my thoughts and ideas. Browse all articles or filter by
              topic.
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
              <option value="all">All Categories</option>
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
                activeTag === tag
                  ? "bg-accent text-white"
                  : "bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200"
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
                className={`flex items-center px-4 py-2 rounded-lg ${
                  currentPage === 1
                    ? "text-gray-400 cursor-not-allowed"
                    : "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
                }`}
              >
                <ChevronLeft size={20} />
                <span className="ml-1">Previous</span>
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
                          <span className="px-3 py-2 text-gray-500">...</span>
                          <button
                            onClick={() => handlePageChange(page)}
                            className={`px-4 py-2 rounded-lg ${
                              currentPage === page
                                ? "bg-accent text-white"
                                : "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
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
                        className={`px-4 py-2 rounded-lg ${
                          currentPage === page
                            ? "bg-accent text-white"
                            : "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
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
                className={`flex items-center px-4 py-2 rounded-lg ${
                  currentPage === pagination.totalPages
                    ? "text-gray-400 cursor-not-allowed"
                    : "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
                }`}
              >
                <span className="mr-1">Next</span>
                <ChevronRight size={20} />
              </button>
            </nav>
          </div>
        )}

        {pagination && (
          <div className="text-center mt-4 text-sm text-gray-600 dark:text-gray-400">
            Showing {articles.length} of {pagination.totalArticles} articles
            {pagination.totalPages > 1 && (
              <span>
                {" "}
                (Page {currentPage} of {pagination.totalPages})
              </span>
            )}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default NewsPage;
