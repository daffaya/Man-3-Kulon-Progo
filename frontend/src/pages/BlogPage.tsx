import React, {
  useState,
  useEffect,
  useMemo,
  useCallback,
  useRef,
} from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import Layout from "../components/layout/Layout";
import ArticleList from "../components/article/ArticleList";

import { useArticles } from "../contexts/ArticleContext";
import { RefreshCw, X } from "lucide-react";

import { Article, ArticleFilters, Category } from "../types/articleTypes";

const throttle = (func: (...args: any[]) => void, limit: number) => {
  let inThrottle: boolean;
  return function (this: any, ...args: any[]) {
    const context = this;
    if (!inThrottle) {
      func.apply(context, args);
      inThrottle = true;
      setTimeout(() => {
        inThrottle = false;
      }, limit);
    }
  };
};

const BlogPage: React.FC = () => {
  const {
    publicArticlesData,
    loading,
    fetchPublicArticles,
    publicTags,
    publicTagsLoading,

    publicCategories,
    publicCategoriesLoading,
    fetchPublicCategories,
  } = useArticles();

  const location = useLocation();
  const navigate = useNavigate();

  const [activeTag, setActiveTag] = useState<string | null>(null);

  const [activeCategorySlug, setActiveCategorySlug] = useState<string | null>(
    null
  );

  const [currentPage, setCurrentPage] = useState(1);
  const articlesPerPage = 9;

  const [articlesToDisplay, setArticlesToDisplay] = useState<Article[]>([]);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const isFetchingMoreRef = useRef(false);

  useEffect(() => {
    console.log("[BlogPage useEffect] Fetching public categories...");
    fetchPublicCategories();
  }, [fetchPublicCategories]);

  useEffect(() => {
    console.log(
      "[BlogPage useEffect] Location search changed. Checking URL params..."
    );
    const params = new URLSearchParams(location.search);
    const tagParam = params.get("tag");
    const categoryParam = params.get("category");

    const tagFromUrl = tagParam ? decodeURIComponent(tagParam) : null;

    const categoryFromUrl = categoryParam
      ? decodeURIComponent(categoryParam)
      : null;

    if (tagFromUrl !== activeTag) {
      console.log(
        `[BlogPage useEffect] Tag filter changed from "${activeTag}" to "${tagFromUrl}".`
      );
      setActiveTag(tagFromUrl);
      setCurrentPage(1);
      setArticlesToDisplay([]);
    }

    if (categoryFromUrl !== activeCategorySlug) {
      console.log(
        `[BlogPage useEffect] Category filter changed from "${activeCategorySlug}" to "${categoryFromUrl}".`
      );
      setActiveCategorySlug(categoryFromUrl);
      setCurrentPage(1);
      setArticlesToDisplay([]);
    }
  }, [location.search, activeTag, activeCategorySlug]);

  useEffect(() => {
    console.log(
      `[BlogPage useEffect] Fetching articles for page ${currentPage} with tag "${activeTag}" and category "${activeCategorySlug}"...`
    );

    const filters: ArticleFilters = {
      page: currentPage,
      limit: articlesPerPage,
      tag: activeTag ?? undefined,
      category: activeCategorySlug ?? undefined,
      published: true,
    };

    if (currentPage > 1) {
      setLoadingMore(true);
      isFetchingMoreRef.current = true;
    }

    fetchPublicArticles(filters)
      .then((data) => {
        console.log(
          "[BlogPage useEffect] Fetch public articles completed.",
          data
        );
      })
      .catch((error) => {
        console.error(
          "[BlogPage useEffect] Error fetching public articles:",
          error
        );

        if (loadingMore) {
          setLoadingMore(false);
        }
        isFetchingMoreRef.current = false;
        setHasMore(false);
      });
  }, [
    currentPage,
    activeTag,
    activeCategorySlug,
    fetchPublicArticles,
    articlesPerPage,
  ]);

  useEffect(() => {
    console.log(
      "[BlogPage useEffect] publicArticlesData or loading status changed."
    );

    if (publicArticlesData) {
      console.log(
        `[BlogPage useEffect] Processing data for page ${publicArticlesData.currentPage}.`
      );

      if (publicArticlesData.currentPage === 1) {
        console.log(
          "[BlogPage useEffect] Setting articlesToDisplay for page 1."
        );
        setArticlesToDisplay(publicArticlesData.articles);
      } else {
        console.log(
          "[BlogPage useEffect] Appending articles for subsequent pages."
        );

        const newArticlesToAdd = publicArticlesData.articles.filter(
          (newArt) =>
            !articlesToDisplay.some(
              (existingArt) => existingArt.id === newArt.id
            )
        );

        if (newArticlesToAdd.length > 0) {
          setArticlesToDisplay((prevArticles) => {
            const updatedList = [...prevArticles, ...newArticlesToAdd];

            return updatedList;
          });
        } else {
          console.log("[BlogPage useEffect] No new unique articles to add.");
        }
      }

      setHasMore(
        publicArticlesData.currentPage < publicArticlesData.totalPages
      );
      console.log(
        `[BlogPage useEffect] Has more pages: ${
          publicArticlesData.currentPage < publicArticlesData.totalPages
        }`
      );

      if (loadingMore) {
        console.log("[BlogPage useEffect] Finished loading more.");
        setLoadingMore(false);
      }
      isFetchingMoreRef.current = false;
    } else if (!loading && !loadingMore) {
      console.log(
        "[BlogPage useEffect] Loading finished, no publicArticlesData."
      );
      setArticlesToDisplay([]);
      setHasMore(false);
      isFetchingMoreRef.current = false;
    }
  }, [publicArticlesData, loading]);

  useEffect(() => {
    console.log("[BlogPage useEffect] Setting up scroll listener.");
    const handleScroll = () => {
      const isAtBottom =
        window.innerHeight + window.scrollY >= document.body.offsetHeight - 200;

      if (
        isAtBottom &&
        !loading &&
        !loadingMore &&
        !isFetchingMoreRef.current &&
        hasMore
      ) {
        console.log(
          "[BlogPage handleScroll] Reached bottom, loading next page."
        );
        setCurrentPage((prevPage) => prevPage + 1);
      }
    };

    const throttledHandleScroll = throttle(handleScroll, 200);

    window.addEventListener("scroll", throttledHandleScroll);

    return () => {
      console.log("[BlogPage useEffect] Cleaning up scroll listener.");
      window.removeEventListener("scroll", throttledHandleScroll);
    };
  }, [loading, loadingMore, hasMore]);

  const allTags = useMemo(() => {
    return publicTags.sort();
  }, [publicTags]);

  const applyFilters = useCallback(
    (tag: string | null, categorySlug: string | null) => {
      console.log(
        `[BlogPage applyFilters] Applying tag: "${tag}", category: "${categorySlug}"`
      );

      setActiveTag(tag);
      setActiveCategorySlug(categorySlug);

      setCurrentPage(1);
      setArticlesToDisplay([]);

      const params = new URLSearchParams();
      if (tag) {
        params.set("tag", encodeURIComponent(tag));
      }
      if (categorySlug) {
        params.set("category", encodeURIComponent(categorySlug));
      }
      const newUrl = `${location.pathname}${
        params.toString() ? `?${params.toString()}` : ""
      }`;

      navigate(newUrl, { replace: true });
    },
    [location.pathname, navigate]
  );

  const handleTagClick = (tag: string) => {
    console.log(`[BlogPage] Tag "${tag}" clicked.`);

    applyFilters(tag, null);
  };

  const clearTagFilter = () => {
    console.log("[BlogPage] Clearing tag filter.");

    applyFilters(null, activeCategorySlug);
  };

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    console.log("[BlogPage] Category filter changed to:", e.target.value);
    const newCategorySlug = e.target.value === "all" ? null : e.target.value;

    applyFilters(null, newCategorySlug);
  };

  const handleClearAllFilters = () => {
    console.log("[BlogPage] Clearing all filters.");

    applyFilters(null, null);
  };

  if (
    (loading && articlesToDisplay.length === 0) ||
    publicTagsLoading ||
    publicCategoriesLoading
  ) {
    return (
      <Layout>
        <div className="container mx-auto px-4 sm:px-6 py-12 text-center">
          <RefreshCw size={32} className="mx-auto animate-spin text-accent" />
          {publicTagsLoading ? (
            <p className="mt-4">Loading tags...</p>
          ) : publicCategoriesLoading ? (
            <p className="mt-4">Loading categories...</p>
          ) : (
            <p className="mt-4">Loading articles...</p>
          )}
        </div>
      </Layout>
    );
  }

  if (
    !loading &&
    articlesToDisplay.length === 0 &&
    (activeTag || activeCategorySlug)
  ) {
    return (
      <Layout>
        <div className="container mx-auto px-4 sm:px-6 py-12 text-center">
          {activeTag ? (
            <p className="text-xl text-gray-600 dark:text-gray-400">
              No articles found with tag "{activeTag}".
            </p>
          ) : activeCategorySlug ? (
            <p className="text-xl text-gray-600 dark:text-gray-400">
              No articles found in category "
              {publicCategories.find((cat) => cat.slug === activeCategorySlug)
                ?.name || activeCategorySlug}
              ".
            </p>
          ) : (
            <p className="text-xl text-gray-600 dark:text-gray-400">
              No articles found matching filters.
            </p>
          )}

          {/* Tombol Clear Filter (muncul jika ada filter aktif) */}
          {(activeTag || activeCategorySlug) && (
            <button
              onClick={() => {
                handleClearAllFilters();
              }}
              className="mt-4 text-accent hover:underline flex items-center justify-center mx-auto"
            >
              <X size={16} className="mr-1" /> Clear All Filters
            </button>
          )}
        </div>
      </Layout>
    );
  }

  if (
    !loading &&
    articlesToDisplay.length === 0 &&
    !activeTag &&
    !activeCategorySlug
  ) {
    return (
      <Layout>
        <div className="container mx-auto px-4 sm:px-6 py-12 text-center">
          <p className="text-xl text-gray-600 dark:text-gray-400">
            No articles found yet. Check back later!
          </p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 sm:px-6 py-12 fade-in">
        <div className="text-center mb-6">
          <h1 className="text-4xl md:text-5xl font-serif font-bold mb-4">
            Articles
          </h1>
          {/* --- TAMPILKAN FILTER AKTIF DI SINI --- */}
          {/* Kondisi ini akan menampilkan UI filter aktif jika state activeTag atau activeCategorySlug memiliki nilai */}
          {activeTag || activeCategorySlug ? (
            <div className="flex flex-col items-center">
              <p className="text-lg text-gray-600 dark:text-gray-400 mb-4">
                You're now reading articles filtered by:
              </p>
              {/* Tampilkan filter tag aktif */}
              {activeTag && (
                <div className="inline-flex items-center px-4 py-2 bg-accent text-white rounded-full mb-2">
                  {" "}
                  {/* Tambahkan mb-2 untuk spasi */}
                  {activeTag}
                  <button
                    onClick={clearTagFilter}
                    className="ml-2 p-1 hover:bg-white/20 rounded-full"
                    aria-label="Clear tag filter"
                  >
                    <X size={14} />
                  </button>
                </div>
              )}

              {/* PERUBAHAN: Tampilkan filter kategori aktif */}
              {activeCategorySlug && (
                <div className="inline-flex items-center px-4 py-2 bg-accent   text-secondary-foreground rounded-full mb-2">
                  {" "}
                  {/* Gunakan warna lain */}
                  Category:{" "}
                  {publicCategories.find(
                    (cat) => cat.slug === activeCategorySlug
                  )?.name || activeCategorySlug}
                  <button
                    onClick={() => {
                      applyFilters(activeTag, null);
                    }}
                    className="ml-2 p-1 hover:bg-black/20 rounded-full"
                    aria-label="Clear category filter"
                  >
                    <X size={14} />
                  </button>
                </div>
              )}
              {/* Tombol Clear All Filters */}
              {(activeTag || activeCategorySlug) && (
                <button
                  onClick={() => {
                    handleClearAllFilters();
                    setActiveCategorySlug(null);
                  }}
                  className="mt-2 text-gray-600 dark:text-gray-400 hover:underline flex items-center justify-center mx-auto"
                >
                  <X size={16} className="mr-1" /> Clear All Filters
                </button>
              )}
            </div>
          ) : (
            <p className="text-lg text-gray-600 dark:text-gray-400">
              Explore my thoughts and ideas. Browse all articles or filter by
              topic to find what resonates with you.
            </p>
          )}
          {/* --- AKHIR TAMPILKAN FILTER AKTIF --- */}
        </div>

        {/* PERUBAHAN: Tambahkan UI Filter Dropdown Kategori */}
        <div className="mb-6 flex justify-center">
          {" "}
          {/* Atur layout filter */}
          <div className="w-full max-w-xs">
            {" "}
            {/* Batasi lebar dropdown */}
            <label htmlFor="categoryFilter" className="sr-only">
              Filter by Category
            </label>
            <select
              id="categoryFilter"
              value={activeCategorySlug || "all"}
              onChange={handleCategoryChange}
              className="form-input w-full"
            >
              <option value="all">All Categories</option>
              {/* Tampilkan daftar kategori dari context */}
              {publicCategories.map((category) => (
                <option key={category.id} value={category.slug}>
                  {" "}
                  {/* Gunakan slug sebagai value */}
                  {category.name}
                </option>
              ))}
            </select>
            {/* Indikator loading untuk kategori (jika belum dimuat) */}
            {publicCategoriesLoading && publicCategories.length === 0 && (
              <p className="mt-2 text-sm text-gray-500 dark:text-gray-400 flex items-center justify-center">
                <RefreshCw size={14} className="animate-spin mr-1" /> Loading
                categories...
              </p>
            )}
          </div>
          {/* Layout Filter Tags */}
        </div>

        <div className="mb-16">
          {" "}
          <div className="flex flex-wrap gap-2 justify-center">
            {" "}
            {allTags.map((tag) => (
              <Link
                key={tag}
                to={`/blog?tag=${encodeURIComponent(tag)}`}
                onClick={(e) => {
                  e.preventDefault();
                  handleTagClick(tag);
                }}
                className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                  activeTag === tag
                    ? "bg-accent text-white"
                    : "bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200"
                }`}
              >
                {tag}{" "}
              </Link>
            ))}{" "}
          </div>{" "}
        </div>

        <ArticleList
          key={`${activeTag || "all"}-${activeCategorySlug || "all"}-${
            articlesToDisplay.length
          }`}
          articles={articlesToDisplay}
          loading={false}
        />

        {loadingMore && (
          <div className="flex justify-center items-center mt-8">
            <RefreshCw size={24} className="animate-spin text-accent" />
            <p className="ml-2 text-gray-600 dark:text-gray-400">
              Loading more articles...
            </p>
          </div>
        )}

        {!loading &&
          !loadingMore &&
          articlesToDisplay.length > 0 &&
          !hasMore && (
            <div className="flex justify-center items-center mt-8">
              <p className="text-gray-600 dark:text-gray-400">
                You've reached the end!
              </p>
            </div>
          )}
      </div>
    </Layout>
  );
};

export default BlogPage;
