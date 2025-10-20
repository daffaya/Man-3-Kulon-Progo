import React, {
  createContext,
  useState,
  useEffect,
  ReactNode,
  useContext,
  useCallback,
} from "react";

import {
  Article,
  Category,
  PaginationData,
  ArticleFilters,
} from "../types/articleTypes";
import { useAuth } from "./AuthContext";

interface CategoryFormData {
  name: string;
  description?: string | null;
}

interface ArticleContextType {
  publicArticlesData: PaginationData<Article> | null;
  publicTags: string[];
  publicCategories: Category[];
  publicTagsLoading: boolean;
  publicCategoriesLoading: boolean;
  publicCategoriesError: string | null;
  fetchPublicArticles: (filters?: ArticleFilters) => Promise<void>;
  fetchPublicCategories: () => Promise<void>;

  adminArticlesData: PaginationData<Article> | null;
  adminLoading: boolean;
  adminCategories: Category[];
  adminCategoriesLoading: boolean;
  fetchAdminArticles: (filters?: ArticleFilters) => Promise<void>;
  fetchAdminCategories: () => Promise<void>;

  loading: boolean;

  createCategory: (categoryData: CategoryFormData) => Promise<Category | null>;
  updateCategory: (
    id: number,
    updates: Partial<CategoryFormData>
  ) => Promise<Category | null>;
  deleteCategory: (id: number) => Promise<boolean>;

  getPublicArticleBySlug: (slug: string) => Article | undefined;
  getAdminArticleById: (id: string) => Article | undefined;

  getFeaturedArticles: () => Article[];
  getPublishedArticles: () => Article[];

  createNewArticle: (
    articleData: Omit<
      Article,
      "id" | "slug" | "readingTime" | "lastModified" | "category"
    > & { category_id?: number | null }
  ) => Promise<Article | null>;
  updateExistingArticle: (
    id: string,
    updates: Partial<
      Omit<
        Article,
        "id" | "slug" | "readingTime" | "lastModified" | "category"
      > & { category_id?: number | null }
    >
  ) => Promise<Article | null>;
  removeArticle: (id: string) => Promise<boolean>;

  fetchAdminArticleById: (id: string) => Promise<Article | undefined>;
}

export const ArticleContext = createContext<ArticleContextType | undefined>(
  undefined
);

interface ArticleProviderProps {
  children: ReactNode;
}

export const ArticleProvider: React.FC<ArticleProviderProps> = ({
  children,
}) => {
  const [publicArticlesData, setPublicArticlesData] =
    useState<PaginationData<Article> | null>(null);

  const [adminArticlesData, setAdminArticlesData] =
    useState<PaginationData<Article> | null>(null);

  const [publicTags, setPublicTags] = useState<string[]>([]);

  const [adminCategories, setAdminCategories] = useState<Category[]>([]);
  const [publicCategories, setPublicCategories] = useState<Category[]>([]);

  const [loading, setLoading] = useState(true);
  const [adminLoading, setAdminLoading] = useState(true);
  const [publicTagsLoading, setPublicTagsLoading] = useState(true);

  const [adminCategoriesLoading, setAdminCategoriesLoading] = useState(true);
  const [publicCategoriesLoading, setPublicCategoriesLoading] = useState(true);

  const [publicCategoriesError, setPublicCategoriesError] = useState<
    string | null
  >(null);

  const { token, isLoggedIn, logout } = useAuth();

  const handleAuthError = useCallback(() => {
    console.error(
      "[ArticleContext] Authentication failed or token expired. Logging out."
    );
    logout();
  }, [logout]);

  const fetchAdminCategories = useCallback(async () => {
    setAdminCategoriesLoading(true);

    if (!isLoggedIn || !token) {
      console.warn(
        "[ArticleContext] User not logged in or token not available for fetching admin categories. Skipping fetch."
      );
      setAdminCategories([]);
      setAdminCategoriesLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/admin/categories", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.status === 401 || response.status === 403) {
        console.error(
          "[ArticleContext] Admin categories fetch authentication failed."
        );
        handleAuthError();
        setAdminCategories([]);
        setAdminCategoriesLoading(false);
        return;
      }

      if (!response.ok) {
        console.error(
          "[ArticleContext] Failed to fetch admin categories:",
          response.status
        );
        try {
          const errorBody = await response.text();
          console.error("Error response body:", errorBody);
        } catch (e) {
          console.error("Failed to get response body:", e);
        }
        setAdminCategories([]);
        setAdminCategoriesLoading(false);
        return;
      }

      const data = (await response.json()) as Category[];

      setAdminCategories(data);
      setAdminCategoriesLoading(false);
    } catch (error: any) {
      console.error("[ArticleContext] Error fetching admin categories:", error);
      setAdminCategories([]);
      setAdminCategoriesLoading(false);
    }
  }, [isLoggedIn, token, handleAuthError]);

  const fetchPublicCategories = useCallback(async () => {
    setPublicCategoriesLoading(true);

    try {
      const response = await fetch("/api/categories");

      if (!response.ok) {
        console.error(
          "[ArticleContext] Failed to fetch public categories:",
          response.status
        );
        try {
          const errorBody = await response.text();
          console.error("Error response body:", errorBody);
        } catch (e) {
          console.error("Failed to get response body:", e);
        }
        setPublicCategories([]);
        setPublicCategoriesLoading(false);
        return;
      }

      const data = (await response.json()) as Category[];

      setPublicCategories(data);
      setPublicCategoriesLoading(false);
    } catch (error: any) {
      console.error(
        "[ArticleContext] Error fetching public categories:",
        error
      );
      setPublicCategories([]);
      setPublicCategoriesLoading(false);
    }
  }, []);

  const createCategory = useCallback(
    async (categoryData: CategoryFormData): Promise<Category | null> => {
      if (!isLoggedIn || !token) {
        console.error(
          "[ArticleContext] User not logged in or token not available to create category."
        );
        return null;
      }

      try {
        const response = await fetch("/api/admin/categories", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(categoryData),
        });

        if (response.status === 401 || response.status === 403) {
          handleAuthError();
          return null;
        }

        if (!response.ok) {
          console.error(
            "[ArticleContext] Failed to create new category:",
            response.status
          );
          try {
            const errorData = await response.json();
            console.error("Error detail:", errorData.message);
          } catch (jsonError: any) {
            console.error("Failed to parse error response as JSON:", jsonError);
          }
          return null;
        }

        const newCategory = (await response.json()) as Category;

        return newCategory;
      } catch (error: any) {
        console.error("[ArticleContext] Error creating new category:", error);
        return null;
      }
    },
    [isLoggedIn, token, handleAuthError]
  );

  const updateCategory = useCallback(
    async (
      id: number,
      updates: Partial<CategoryFormData>
    ): Promise<Category | null> => {
      if (!isLoggedIn || !token) {
        console.error(
          "[ArticleContext] User not logged in or token not available to update category."
        );
        return null;
      }

      try {
        const response = await fetch(`/api/admin/categories/${id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(updates),
        });

        if (response.status === 401 || response.status === 403) {
          handleAuthError();
          return null;
        }

        if (!response.ok) {
          console.error(
            `[ArticleContext] Failed to update category with ID ${id}:`,
            response.status
          );
          try {
            const errorData = await response.json();
            console.error("Error detail:", errorData.message);
          } catch (jsonError: any) {
            console.error("Failed to parse error response as JSON:", jsonError);
          }
          return null;
        }

        const updatedCategory = (await response.json()) as Category;

        return updatedCategory;
      } catch (error: any) {
        console.error(
          `[ArticleContext] Error updating category with ID ${id}:`,
          error
        );
        return null;
      }
    },
    [isLoggedIn, token, handleAuthError]
  );

  const deleteCategory = useCallback(
    async (id: number): Promise<boolean> => {
      if (!isLoggedIn || !token) {
        console.error(
          "[ArticleContext] User not logged in or token not available to delete category."
        );
        return false;
      }

      try {
        const response = await fetch(`/api/admin/categories/${id}`, {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.status === 401 || response.status === 403) {
          handleAuthError();
          return false;
        }

        if (!response.ok) {
          console.error(
            `[ArticleContext] Failed to delete category with ID ${id}:`,
            response.status
          );
          try {
            const errorBody = await response.text();
            console.error("Error response body:", errorBody);
          } catch (e) {
            console.error("Failed to get response body:", e);
          }
          return false;
        }

        return true;
      } catch (error: any) {
        console.error(
          `[ArticleContext] Error deleting category with ID ${id}:`,
          error
        );
        return false;
      }
    },
    [isLoggedIn, token, handleAuthError]
  );

  const fetchPublicArticles = useCallback(
    async (filters: ArticleFilters = {}) => {
      setLoading(true);

      const queryParams = new URLSearchParams();
      if (filters.page !== undefined)
        queryParams.append("page", filters.page.toString());
      if (filters.limit !== undefined)
        queryParams.append("limit", filters.limit.toString());
      if (filters.tag) {
        if (Array.isArray(filters.tag)) {
          filters.tag.forEach((t) => queryParams.append("tag", t));
        } else {
          queryParams.append("tag", filters.tag);
        }
      }
      if (filters.keyword) queryParams.append("keyword", filters.keyword);

      if (filters.category) queryParams.append("category", filters.category);

      const baseUrl = "/api/articles/";
      const urlWithParams = `${baseUrl}${
        queryParams.toString() ? `?${queryParams.toString()}` : ""
      }`;

      try {
        const response = await fetch(urlWithParams);

        if (!response.ok) {
          console.error(
            "[ArticleContext] Failed to fetch public articles:",
            response.status
          );
          try {
            const errorBody = await response.text();
            console.error("Error response body:", errorBody);
          } catch (e) {
            console.error("Failed to get response body:", e);
          }
          setLoading(false);
          setPublicArticlesData(null);
          return;
        }

        const data = (await response.json()) as PaginationData<Article>;

        setPublicArticlesData(data);
        setLoading(false);
      } catch (error: any) {
        console.error(
          "[ArticleContext] Error fetching public articles:",
          error
        );
        setLoading(false);
        setPublicArticlesData(null);
      }
    },
    []
  );

  const fetchPublicTagsList = useCallback(async () => {
    setPublicTagsLoading(true);

    try {
      const response = await fetch("/api/tags/");

      if (!response.ok) {
        console.error(
          "[ArticleContext] Failed to fetch public tags list:",
          response.status
        );
        try {
          const errorBody = await response.text();
          console.error("Error response body:", errorBody);
        } catch (e) {
          console.error("Failed to get response body:", e);
        }
        setPublicTags([]);
        setPublicTagsLoading(false);
        return;
      }

      const tagsData = (await response.json()) as string[];

      setPublicTags(tagsData);
      setPublicTagsLoading(false);
    } catch (error: any) {
      console.error("[ArticleContext] Error fetching public tags list:", error);
      setPublicTags([]);
      setPublicTagsLoading(false);
    }
  }, []);

  const fetchAdminArticles = useCallback(
    async (filters: ArticleFilters = {}) => {
      setAdminLoading(true);

      if (!isLoggedIn || !token) {
        console.warn(
          "[ArticleContext] User not logged in or token not available for fetching admin articles. Skipping fetch."
        );
        setAdminArticlesData(null);
        setAdminLoading(false);
        return;
      }

      const queryParams = new URLSearchParams();
      if (filters.keyword) queryParams.append("keyword", filters.keyword);
      if (filters.published !== undefined) {
        queryParams.append("published", filters.published.toString());
      }
      if (filters.featured === true) {
        queryParams.append("featured", "true");
      }

      if (filters.tag) {
        if (Array.isArray(filters.tag)) {
          filters.tag.forEach((t) => queryParams.append("tag", t));
        } else {
          queryParams.append("tag", filters.tag);
        }
      }

      if (filters.category) queryParams.append("category", filters.category);

      if (filters.page !== undefined)
        queryParams.append("page", filters.page.toString());
      if (filters.limit !== undefined)
        queryParams.append("limit", filters.limit.toString());

      const baseUrl = "/api/admin/articles/";
      const urlWithParams = `${baseUrl}${
        queryParams.toString() ? `?${queryParams.toString()}` : ""
      }`;

      try {
        const response = await fetch(urlWithParams, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.status === 401 || response.status === 403) {
          console.error("[ArticleContext] Admin fetch authentication failed.");
          handleAuthError();
          setAdminArticlesData(null);
          setAdminLoading(false);
          return;
        }
        if (!response.ok) {
          console.error(
            "[ArticleContext] Failed to fetch admin articles from backend:",
            response.status
          );
          try {
            const errorBody = await response.text();
            console.error("Error response body:", errorBody);
          } catch (e) {
            console.error("Failed to get response body:", e);
          }
          setAdminLoading(false);
          setAdminArticlesData(null);
          return;
        }

        const data = (await response.json()) as PaginationData<Article>;

        setAdminArticlesData(data);
        setAdminLoading(false);
      } catch (error: any) {
        console.error(
          "[ArticleContext] Error fetching admin articles from backend:",
          error
        );
        setAdminLoading(false);
        setAdminArticlesData(null);
      }
    },
    [isLoggedIn, token, handleAuthError]
  );

  const fetchAdminArticleById = useCallback(
    async (articleId: string): Promise<Article | undefined> => {
      if (!isLoggedIn || !token || !articleId) {
        console.warn(
          "User not logged in, token, or Article ID not available to fetch specific admin article."
        );
        return undefined;
      }

      try {
        const response = await fetch(`/api/admin/articles/${articleId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.status === 401 || response.status === 403) {
          handleAuthError();
          return undefined;
        }

        if (!response.ok) {
          console.error(
            `[ArticleContext] Failed to fetch admin article with id ${articleId}:`,
            response.status
          );
          try {
            const errorBody = await response.text();
            console.error("Error response body:", errorBody);
          } catch (e) {
            console.error("Failed to get response body:", e);
          }
          return undefined;
        }

        const data = await response.json();

        return data as Article;
      } catch (error: any) {
        console.error(
          `[ArticleContext] Error fetching admin article with id ${articleId}:`,
          error
        );
        return undefined;
      }
    },
    [isLoggedIn, token, handleAuthError]
  );

  useEffect(() => {
    fetchPublicArticles({ page: 1, limit: 10 });
    fetchPublicTagsList();
    fetchPublicCategories();
  }, [fetchPublicArticles, fetchPublicTagsList, fetchPublicCategories]);

  useEffect(() => {
    if (isLoggedIn && token) {
      fetchAdminCategories();
    } else {
      setAdminCategories([]);
    }
  }, [isLoggedIn, token, fetchAdminCategories]);

  const createNewArticle = useCallback(
    async (
      articleData: Omit<
        Article,
        "id" | "slug" | "readingTime" | "lastModified" | "category"
      > & { category_id?: number | null }
    ): Promise<Article | null> => {
      if (!isLoggedIn || !token) {
        console.error(
          "[ArticleContext] User not logged in or token not available to create article."
        );
        return null;
      }

      try {
        const response = await fetch("/api/admin/articles/", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(articleData),
        });

        if (response.status === 401 || response.status === 403) {
          handleAuthError();
          return null;
        }

        if (!response.ok) {
          console.error(
            "[ArticleContext] Failed to create new article:",
            response.status
          );
          try {
            const errorData = await response.json();
            console.error("Error detail:", errorData.message);
          } catch (jsonError: any) {
            console.error("Failed to parse error response as JSON:", jsonError);
          }
          return null;
        }

        const newArticle = (await response.json()) as Article;

        return newArticle;
      } catch (error: any) {
        console.error("[ArticleContext] Error creating new article:", error);
        return null;
      }
    },
    [isLoggedIn, token, handleAuthError]
  );

  const updateExistingArticle = useCallback(
    async (
      id: string,
      updates: Partial<
        Omit<
          Article,
          "id" | "slug" | "readingTime" | "lastModified" | "category"
        > & { category_id?: number | null }
      >
    ): Promise<Article | null> => {
      if (!isLoggedIn || !token) {
        console.error(
          "[ArticleContext] User not logged in or token not available to update article"
        );
        return null;
      }

      try {
        const response = await fetch(`/api/admin/articles/${id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(updates),
        });

        if (response.status === 401 || response.status === 403) {
          handleAuthError();
          return null;
        }

        if (!response.ok) {
          console.error(
            `[ArticleContext] Failed to update article with id ${id}:`,
            response.status
          );
          try {
            const errorBody = await response.text();
            console.error("Error response body:", errorBody);
          } catch (e) {
            console.error("Failed to get response body:", e);
          }
          return null;
        }

        const updatedArticle = (await response.json()) as Article;

        return updatedArticle;
      } catch (error: any) {
        console.error(
          `[ArticleContext] Error updating article with id ${id}:`,
          error
        );
        return null;
      }
    },
    [isLoggedIn, token, handleAuthError]
  );

  const removeArticle = useCallback(
    async (id: string): Promise<boolean> => {
      if (!isLoggedIn || !token) {
        console.error(
          "[ArticleContext] User not logged in or token not available to delete article"
        );
        return false;
      }

      try {
        const response = await fetch(`/api/admin/articles/${id}`, {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.status === 401 || response.status === 403) {
          handleAuthError();
          return false;
        }

        if (!response.ok) {
          console.error(
            `[ArticleContext] Failed to delete article with id ${id}:`,
            response.status
          );
          try {
            const errorBody = await response.text();
            console.error("Error response body:", errorBody);
          } catch (e) {
            console.error("Failed to get response body:", e);
          }
          return false;
        }

        return true;
      } catch (error: any) {
        console.error(
          `[ArticleContext] Error deleting article with id ${id}:`,
          error
        );
        return false;
      }
    },
    [isLoggedIn, token, handleAuthError]
  );

  const getPublicArticleBySlug = useCallback(
    (slug: string): Article | undefined => {
      return publicArticlesData?.articles.find(
        (article) => article.slug === slug
      );
    },
    [publicArticlesData]
  );

  const getAdminArticleById = useCallback(
    (id: string): Article | undefined => {
      return adminArticlesData?.articles.find(
        (article) => String(article.id) === String(id)
      );
    },
    [adminArticlesData]
  );

  const getFeaturedArticles = useCallback((): Article[] => {
    return publicArticlesData?.articles
      ? publicArticlesData.articles
          .filter((article) => article.featured && article.published)
          .sort(
            (a, b) =>
              new Date(b.publishedDate || 0).getTime() -
              new Date(a.publishedDate || 0).getTime()
          )
      : [];
  }, [publicArticlesData]);

  const getPublishedArticles = useCallback((): Article[] => {
    return publicArticlesData?.articles
      ? publicArticlesData.articles
          .filter((article) => article.published)
          .sort(
            (a, b) =>
              new Date(b.publishedDate || 0).getTime() -
              new Date(a.publishedDate || 0).getTime()
          )
      : [];
  }, [publicArticlesData]);

  const value: ArticleContextType = {
    publicArticlesData,
    adminArticlesData,
    publicTags,

    adminCategories,
    publicCategories,

    loading,
    adminLoading,
    publicTagsLoading,

    adminCategoriesLoading,
    publicCategoriesLoading,

    fetchPublicArticles,
    fetchAdminArticles,

    fetchAdminCategories,
    fetchPublicCategories,

    createCategory,
    updateCategory,
    deleteCategory,

    getPublicArticleBySlug,
    getAdminArticleById,
    getFeaturedArticles,
    getPublishedArticles,
    createNewArticle,
    updateExistingArticle,
    removeArticle,
    fetchAdminArticleById,
    publicCategoriesError,
  };

  return (
    <ArticleContext.Provider value={value}>{children}</ArticleContext.Provider>
  );
};

export const useArticles = () => {
  const context = useContext(ArticleContext);
  if (!context) {
    throw new Error("useArticles must be used within an ArticleProvider");
  }
  return context;
};
