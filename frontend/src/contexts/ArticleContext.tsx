// frontend/src/contexts/ArticleContext.tsx

import React, {
  createContext,
  useContext,
  useReducer,
  useEffect,
  useCallback,
} from "react";
import articleApi from "../api/articleApi";
import categoryApi from "../api/categoryApi";
import {
  Article,
  ArticleFormData,
  Category,
  CategoryFormData,
  ArticleFilters,
  PaginationData,
} from "../types/articleTypes";
import { useAuth } from "./AuthContext"; // Tambahkan import ini

/**
 * Represents the state structure for articles, categories, tags, loading states, errors, and pagination.
 */
interface ArticleState {
  articles: Article[];
  adminArticles: Article[];
  currentArticle: Article | null;
  categories: Category[];
  adminCategories: Category[];
  tags: string[];
  loading: boolean;
  adminLoading: boolean;
  categoriesLoading: boolean;
  adminCategoriesLoading: boolean;
  tagsLoading: boolean;
  error: string | null;
  adminError: string | null;
  pagination: {
    totalArticles: number;
    totalPages: number;
    currentPage: number;
    articlesPerPage: number;
  };
  adminPagination: {
    totalArticles: number;
    totalPages: number;
    currentPage: number;
    articlesPerPage: number;
  };
}

/**
 * Defines all possible actions that can be dispatched to the articleReducer.
 */
type ArticleAction =
  | { type: "FETCH_ARTICLES_REQUEST" }
  | {
      type: "FETCH_ARTICLES_SUCCESS";
      payload: { articles: Article[]; pagination: any };
    }
  | { type: "FETCH_ARTICLES_FAILURE"; payload: string }
  | { type: "FETCH_ADMIN_ARTICLES_REQUEST" }
  | { type: "FETCH_ARTICLE_BY_SLUG_REQUEST" }
  | { type: "FETCH_ARTICLE_BY_SLUG_SUCCESS"; payload: Article }
  | { type: "FETCH_ARTICLE_BY_SLUG_FAILURE"; payload: string }
  | {
      type: "FETCH_ADMIN_ARTICLES_SUCCESS";
      payload: { articles: Article[]; pagination: any };
    }
  | { type: "FETCH_ADMIN_ARTICLES_FAILURE"; payload: string }
  | { type: "FETCH_CATEGORIES_REQUEST" }
  | { type: "FETCH_CATEGORIES_SUCCESS"; payload: Category[] }
  | { type: "FETCH_CATEGORIES_FAILURE"; payload: string }
  | { type: "FETCH_ADMIN_CATEGORIES_REQUEST" }
  | { type: "FETCH_ADMIN_CATEGORIES_SUCCESS"; payload: Category[] }
  | { type: "FETCH_ADMIN_CATEGORIES_FAILURE"; payload: string }
  | { type: "FETCH_TAGS_REQUEST" }
  | { type: "FETCH_TAGS_SUCCESS"; payload: string[] }
  | { type: "FETCH_TAGS_FAILURE"; payload: string }
  | { type: "FETCH_ARTICLE_BY_ID_SUCCESS"; payload: Article }
  | { type: "CREATE_ARTICLE_SUCCESS"; payload: Article }
  | { type: "UPDATE_ARTICLE_SUCCESS"; payload: Article }
  | { type: "DELETE_ARTICLE_SUCCESS"; payload: string }
  | { type: "CREATE_CATEGORY_SUCCESS"; payload: Category }
  | { type: "UPDATE_CATEGORY_SUCCESS"; payload: Category }
  | { type: "DELETE_CATEGORY_SUCCESS"; payload: number };

const initialState: ArticleState = {
  articles: [],
  adminArticles: [],
  currentArticle: null,
  categories: [],
  adminCategories: [],
  tags: [],
  loading: false,
  adminLoading: false,
  categoriesLoading: false,
  adminCategoriesLoading: false,
  tagsLoading: false,
  error: null,
  adminError: null,
  pagination: {
    totalArticles: 0,
    totalPages: 0,
    currentPage: 1,
    articlesPerPage: 10,
  },
  adminPagination: {
    totalArticles: 0,
    totalPages: 0,
    currentPage: 1,
    articlesPerPage: 10,
  },
};

/**
 * Reducer function to manage article-related state based on dispatched actions.
 * @param state - The current state.
 * @param action - The action to be performed.
 * @returns The new state after applying the action.
 */
const articleReducer = (
  state: ArticleState,
  action: ArticleAction
): ArticleState => {
  switch (action.type) {
    case "FETCH_ARTICLES_REQUEST":
      return { ...state, loading: true, error: null };
    case "FETCH_ARTICLES_SUCCESS":
      return {
        ...state,
        loading: false,
        articles: action.payload.articles,
        pagination: action.payload.pagination,
      };
    case "FETCH_ARTICLES_FAILURE":
      return { ...state, loading: false, error: action.payload };
    case "FETCH_ADMIN_ARTICLES_REQUEST":
      return { ...state, adminLoading: true, adminError: null };
    case "FETCH_ADMIN_ARTICLES_SUCCESS":
      return {
        ...state,
        adminLoading: false,
        adminArticles: action.payload.articles,
        adminPagination: action.payload.pagination,
      };
    case "FETCH_ADMIN_ARTICLES_FAILURE":
      return { ...state, adminLoading: false, adminError: action.payload };
    case "FETCH_CATEGORIES_REQUEST":
      return { ...state, categoriesLoading: true, error: null };
    case "FETCH_CATEGORIES_SUCCESS":
      return { ...state, categoriesLoading: false, categories: action.payload };
    case "FETCH_CATEGORIES_FAILURE":
      return { ...state, categoriesLoading: false, error: action.payload };
    case "FETCH_ADMIN_CATEGORIES_REQUEST":
      return { ...state, adminCategoriesLoading: true, adminError: null };
    case "FETCH_ADMIN_CATEGORIES_SUCCESS":
      return {
        ...state,
        adminCategoriesLoading: false,
        adminCategories: action.payload,
      };
    case "FETCH_ADMIN_CATEGORIES_FAILURE":
      return {
        ...state,
        adminCategoriesLoading: false,
        adminError: action.payload,
      };
    case "FETCH_TAGS_REQUEST":
      return { ...state, tagsLoading: true, error: null };
    case "FETCH_TAGS_SUCCESS":
      return { ...state, tagsLoading: false, tags: action.payload };
    case "FETCH_TAGS_FAILURE":
      return { ...state, tagsLoading: false, error: action.payload };
    case "FETCH_ARTICLE_BY_ID_SUCCESS":
      return { ...state, currentArticle: action.payload };
    case "FETCH_ARTICLE_BY_SLUG_SUCCESS":
      return { ...state, currentArticle: action.payload };
    case "CREATE_ARTICLE_SUCCESS":
      return {
        ...state,
        adminArticles: [action.payload, ...state.adminArticles],
      };
    case "UPDATE_ARTICLE_SUCCESS":
      return {
        ...state,
        adminArticles: state.adminArticles.map((article) =>
          article.id === action.payload.id ? action.payload : article
        ),
        currentArticle: action.payload,
      };
    case "DELETE_ARTICLE_SUCCESS":
      return {
        ...state,
        adminArticles: state.adminArticles.filter(
          (article) => article.id !== action.payload
        ),
      };
    case "CREATE_CATEGORY_SUCCESS":
      return {
        ...state,
        adminCategories: [...state.adminCategories, action.payload],
      };
    case "UPDATE_CATEGORY_SUCCESS":
      return {
        ...state,
        adminCategories: state.adminCategories.map((category) =>
          category.id === action.payload.id ? action.payload : category
        ),
      };
    case "DELETE_CATEGORY_SUCCESS":
      return {
        ...state,
        adminCategories: state.adminCategories.filter(
          (category) => category.id !== action.payload
        ),
      };
    default:
      return state;
  }
};

/**
 * Defines the shape of the context value, including the state and all action functions.
 */
interface ArticleContextType {
  state: ArticleState;
  fetchArticles: (filters?: ArticleFilters) => Promise<void>;
  fetchArticleBySlug: (slug: string) => Promise<Article | null>;
  fetchAdminArticles: (filters?: ArticleFilters) => Promise<void>;
  fetchCategories: () => Promise<void>;
  fetchAdminCategories: () => Promise<void>;
  fetchTags: () => Promise<void>;
  fetchArticleById: (id: string) => Promise<Article | undefined>;
  createArticle: (formData: ArticleFormData, file?: File) => Promise<void>;
  updateArticle: (
    id: string,
    formData: ArticleFormData,
    file?: File
  ) => Promise<Article>;
  deleteArticle: (id: string) => Promise<void>;
  createCategory: (categoryData: CategoryFormData) => Promise<Category>;
  updateCategory: (
    id: number,
    categoryData: Partial<CategoryFormData>
  ) => Promise<Category>;
  deleteCategory: (id: number) => Promise<void>;
}

const ArticleContext = createContext<ArticleContextType | undefined>(undefined);

/**
 * Normalizes tag data from various formats (string, array, object) into a clean array of strings.
 * @param tags - The tag data to normalize.
 * @returns An array of normalized tag strings.
 */
const normalizeTags = (tags: any): string[] => {
  if (!tags) {
    return [];
  }

  if (Array.isArray(tags)) {
    return tags
      .map((tag) => String(tag).trim())
      .filter((tag) => tag.length > 0);
  }

  if (typeof tags === "string") {
    try {
      const parsed = JSON.parse(tags);
      if (Array.isArray(parsed)) {
        return parsed
          .map((tag) => String(tag).trim())
          .filter((tag) => tag.length > 0);
      }
    } catch (e) {
      // If not valid JSON, split by comma
      return tags
        .split(",")
        .map((tag) => tag.trim())
        .filter((tag) => tag.length > 0);
    }
  }

  // If object, convert its values to an array
  if (typeof tags === "object" && tags !== null) {
    return Object.values(tags)
      .map((tag) => String(tag).trim())
      .filter((tag) => tag.length > 0);
  }

  return [];
};

/**
 * Provider component that manages the article state and provides functions to interact with it.
 * @param children - The child components that will have access to the context.
 */
export const ArticleProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [state, dispatch] = useReducer(articleReducer, initialState);
  const { user } = useAuth(); // Tambahkan ini

  /**
   * Fetches public articles from the API with optional filters.
   * @param filters - Optional filters to apply to the query.
   */
  const fetchArticles = useCallback(async (filters: ArticleFilters = {}) => {
    dispatch({ type: "FETCH_ARTICLES_REQUEST" });
    try {
      const data = await articleApi.getPublicArticles(filters);

      const normalizedArticles = data.articles.map((article) => ({
        ...article,
        tags: normalizeTags(article.tags),
      }));

      dispatch({
        type: "FETCH_ARTICLES_SUCCESS",
        payload: {
          articles: normalizedArticles,
          pagination: {
            totalArticles: data.totalArticles,
            totalPages: data.totalPages,
            currentPage: data.currentPage,
            articlesPerPage: data.articlesPerPage,
          },
        },
      });
    } catch (error) {
      dispatch({
        type: "FETCH_ARTICLES_FAILURE",
        payload:
          error instanceof Error ? error.message : "An unknown error occurred",
      });
    }
  }, []);

  /**
   * Fetches a single public article by its slug.
   * @param slug - The slug of the article to fetch.
   * @returns The normalized article data or null if not found.
   */
  const fetchArticleBySlug = useCallback(
    async (slug: string): Promise<Article | null> => {
      dispatch({ type: "FETCH_ARTICLE_BY_SLUG_REQUEST" });
      try {
        const response = await fetch(
          `${
            import.meta.env.VITE_BACKEND_API_URL || "http://localhost:3001"
          }/api/articles/${slug}`
        );

        if (!response.ok) {
          const error = await response.text();
          throw new Error(error || "Article not found");
        }

        const article = await response.json();
        const normalizedArticle = {
          ...article,
          tags: normalizeTags(article.tags),
        };

        dispatch({
          type: "FETCH_ARTICLE_BY_SLUG_SUCCESS",
          payload: normalizedArticle,
        });

        // Optional: update state.articles also
        if (state.articles.length < 10) {
          fetchArticles({ limit: 20 });
        }

        return normalizedArticle;
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Failed to load article";
        dispatch({ type: "FETCH_ARTICLE_BY_SLUG_FAILURE", payload: message });
        return null;
      }
    },
    [state.articles.length, fetchArticles]
  );

  /**
   * Fetches all public categories from the API.
   */
  const fetchCategories = useCallback(async () => {
    dispatch({ type: "FETCH_CATEGORIES_REQUEST" });
    try {
      const response = await fetch(
        `${
          import.meta.env.VITE_BACKEND_API_URL || "http://localhost:3001"
        }/api/categories`
      );
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to fetch categories");
      }

      dispatch({ type: "FETCH_CATEGORIES_SUCCESS", payload: data });
    } catch (error) {
      dispatch({
        type: "FETCH_CATEGORIES_FAILURE",
        payload:
          error instanceof Error ? error.message : "An unknown error occurred",
      });
    }
  }, []);

  /**
   * Fetches all public tags from the API.
   */
  const fetchTags = useCallback(async () => {
    dispatch({ type: "FETCH_TAGS_REQUEST" });
    try {
      const response = await fetch(
        `${
          import.meta.env.VITE_BACKEND_API_URL || "http://localhost:3001"
        }/api/tags`
      );
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to fetch tags");
      }

      dispatch({ type: "FETCH_TAGS_SUCCESS", payload: data });
    } catch (error) {
      dispatch({
        type: "FETCH_TAGS_FAILURE",
        payload:
          error instanceof Error ? error.message : "An unknown error occurred",
      });
    }
  }, []);

  /**
   * Fetches admin articles from the API with optional filters.
   * @param filters - Optional filters to apply to the query.
   */
  const fetchAdminArticles = useCallback(
    async (filters: ArticleFilters = {}) => {
      dispatch({ type: "FETCH_ADMIN_ARTICLES_REQUEST" });
      try {
        const data = await articleApi.getAdminArticles(filters);

        const normalizedArticles = data.articles.map((article) => ({
          ...article,
          tags: normalizeTags(article.tags),
        }));

        dispatch({
          type: "FETCH_ADMIN_ARTICLES_SUCCESS",
          payload: {
            articles: normalizedArticles,
            pagination: {
              totalArticles: data.totalArticles,
              totalPages: data.totalPages,
              currentPage: data.currentPage,
              articlesPerPage: data.articlesPerPage,
            },
          },
        });
      } catch (error) {
        dispatch({
          type: "FETCH_ADMIN_ARTICLES_FAILURE",
          payload:
            error instanceof Error
              ? error.message
              : "An unknown error occurred",
        });
      }
    },
    []
  );

  /**
   * Fetches admin categories from the API.
   */
  const fetchAdminCategories = useCallback(async () => {
    dispatch({ type: "FETCH_ADMIN_CATEGORIES_REQUEST" });
    try {
      const data = await categoryApi.getAdminCategories();
      dispatch({ type: "FETCH_ADMIN_CATEGORIES_SUCCESS", payload: data });
    } catch (error) {
      dispatch({
        type: "FETCH_ADMIN_CATEGORIES_FAILURE",
        payload:
          error instanceof Error ? error.message : "An unknown error occurred",
      });
    }
  }, []);

  /**
   * Fetches a single article by its ID.
   * @param id - The ID of the article to fetch.
   * @returns The normalized article data or undefined if not found.
   */
  const fetchArticleById = useCallback(
    async (id: string): Promise<Article | undefined> => {
      try {
        const data = await articleApi.getArticleById(id);

        const normalizedData = {
          ...data,
          tags: normalizeTags(data.tags),
        };

        dispatch({
          type: "FETCH_ARTICLE_BY_ID_SUCCESS",
          payload: normalizedData,
        });
        return normalizedData;
      } catch (error) {
        return undefined;
      }
    },
    []
  );

  /**
   * Creates a new article.
   * @param formData - The data for the new article.
   * @param file - Optional image file for the article.
   */
  const createArticle = useCallback(
    async (formData: ArticleFormData, file?: File) => {
      try {
        // Get current user data
        const authorData = {
          name: user?.full_name || user?.username || "Penulis Pena",
          avatar: user?.avatar || "/logo.png",
        };

        // Add author data to form data
        const articleDataWithAuthor = {
          ...formData,
          author: authorData,
        };

        const newArticle = await articleApi.createArticle(
          articleDataWithAuthor,
          file
        );

        const normalizedData = {
          ...newArticle,
          tags: normalizeTags(newArticle.tags),
        };

        dispatch({ type: "CREATE_ARTICLE_SUCCESS", payload: normalizedData });
      } catch (error) {
        throw error;
      }
    },
    [user] // Tambahkan dependency
  );

  /**
   * Updates an existing article.
   * @param id - The ID of the article to update.
   * @param formData - The updated data for the article.
   * @param file - Optional new image file for the article.
   * @returns The updated and normalized article data.
   */
  const updateArticle = useCallback(
    async (
      id: string,
      formData: ArticleFormData,
      file?: File
    ): Promise<Article> => {
      try {
        // Get current user data
        const authorData = {
          name: user?.full_name || user?.username || "Penulis Pena",
          avatar: user?.avatar || "/logo.png",
        };

        // Add author data to form data
        const articleDataWithAuthor = {
          ...formData,
          author: authorData,
        };

        const updatedArticle = await articleApi.updateArticle(
          id,
          articleDataWithAuthor,
          file
        );

        const normalizedData = {
          ...updatedArticle,
          tags: normalizeTags(updatedArticle.tags),
        };

        dispatch({ type: "UPDATE_ARTICLE_SUCCESS", payload: normalizedData });
        return normalizedData;
      } catch (error) {
        throw error;
      }
    },
    [user] // Tambahkan dependency
  );

  /**
   * Deletes an article by its ID.
   * @param id - The ID of the article to delete.
   */
  const deleteArticle = useCallback(async (id: string) => {
    try {
      await articleApi.deleteArticle(id);
      dispatch({ type: "DELETE_ARTICLE_SUCCESS", payload: id });
    } catch (error) {
      throw error;
    }
  }, []);

  /**
   * Creates a new category.
   * @param categoryData - The data for the new category.
   * @returns The newly created category.
   */
  const createCategory = useCallback(
    async (categoryData: CategoryFormData): Promise<Category> => {
      try {
        const newCategory = await categoryApi.createCategory(categoryData);
        dispatch({ type: "CREATE_CATEGORY_SUCCESS", payload: newCategory });
        return newCategory;
      } catch (error) {
        throw error;
      }
    },
    []
  );

  /**
   * Updates an existing category.
   * @param id - The ID of the category to update.
   * @param categoryData - The updated data for the category.
   * @returns The updated category.
   */
  const updateCategory = useCallback(
    async (
      id: number,
      categoryData: Partial<CategoryFormData>
    ): Promise<Category> => {
      try {
        const updatedCategory = await categoryApi.updateCategory(
          id,
          categoryData
        );
        dispatch({ type: "UPDATE_CATEGORY_SUCCESS", payload: updatedCategory });
        return updatedCategory;
      } catch (error) {
        throw error;
      }
    },
    []
  );

  /**
   * Deletes a category by its ID.
   * @param id - The ID of the category to delete.
   */
  const deleteCategory = useCallback(async (id: number): Promise<void> => {
    try {
      await categoryApi.deleteCategory(id);
      dispatch({ type: "DELETE_CATEGORY_SUCCESS", payload: id });
    } catch (error) {
      throw error;
    }
  }, []);

  return (
    <ArticleContext.Provider
      value={{
        state,
        fetchArticles,
        fetchArticleBySlug,
        fetchAdminArticles,
        fetchCategories,
        fetchAdminCategories,
        fetchTags,
        fetchArticleById,
        createArticle,
        updateArticle,
        deleteArticle,
        createCategory,
        updateCategory,
        deleteCategory,
      }}
    >
      {children}
    </ArticleContext.Provider>
  );
};

/**
 * Custom hook to easily access the ArticleContext.
 * @throws An error if used outside of an ArticleProvider.
 * @returns The ArticleContext value.
 */
export const useArticles = () => {
  const context = useContext(ArticleContext);
  if (!context) {
    throw new Error("useArticles must be used within an ArticleProvider");
  }
  return context;
};
