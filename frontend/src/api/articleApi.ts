// frontend/src/api/articleApi.ts

import {
  Article,
  ArticleFormData,
  ArticleFilters,
  PaginationData,
} from "../types/articleTypes";

const API_URL = import.meta.env.VITE_BACKEND_API_URL || "http://localhost:3001";

/**
 * Mengambil header Authorization jika token tersedia di localStorage.
 */
const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  return {
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

/**
 * Menangani response dari fetch API.
 * @param response Response dari fetch
 * @throws Error jika response tidak OK
 * @returns Data JSON
 */
const handleResponse = async (response: Response) => {
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || "Something went wrong");
  }
  return response.json();
};

const articleApi = {
  /**
   * Membuat artikel baru dengan optional file upload.
   * @param formData Data artikel
   * @param file File cover (opsional)
   * @returns Artikel yang dibuat
   */
  createArticle: async (
    formData: ArticleFormData,
    file?: File
  ): Promise<Article> => {
    const data = new FormData();
    console.log("Auth headers:", getAuthHeaders());
    Object.entries(formData).forEach(([key, value]) => {
      if (key === "author" || key === "tags") {
        data.append(key, JSON.stringify(value));
      } else if (value !== null && value !== undefined) {
        data.append(key, value as string);
      }
    });

    if (file) data.append("coverImageFile", file);

    const response = await fetch(`${API_URL}/api/atmin/articles`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: data,
    });

    const result = await handleResponse(response);
    return result.article || result;
  },

  /**
   * Mengambil artikel untuk admin dengan filter.
   * @param filters Filter artikel
   * @returns Data artikel dengan pagination
   */
  getAdminArticles: async (
    filters: ArticleFilters = {}
  ): Promise<PaginationData<Article>> => {
    const params = new URLSearchParams();

    if (filters.keyword) params.append("keyword", filters.keyword);
    if (filters.published !== undefined)
      params.append("published", filters.published.toString());
    if (filters.featured !== undefined)
      params.append("featured", filters.featured.toString());
    if (filters.tag) {
      if (Array.isArray(filters.tag)) {
        filters.tag.forEach((tag) => params.append("tag", tag));
      } else {
        params.append("tag", filters.tag);
      }
    }
    if (filters.category) params.append("category", filters.category);
    if (filters.page) params.append("page", filters.page.toString());
    if (filters.limit) params.append("limit", filters.limit.toString());

    const response = await fetch(`${API_URL}/api/atmin/articles?${params}`, {
      headers: getAuthHeaders(),
    });

    return handleResponse(response);
  },

  /**
   * Mengambil artikel publik dengan filter.
   * @param filters Filter artikel
   * @returns Data artikel dengan pagination
   */
  getPublicArticles: async (
    filters: ArticleFilters = {}
  ): Promise<PaginationData<Article>> => {
    const params = new URLSearchParams();

    if (filters.keyword) params.append("keyword", filters.keyword);
    if (filters.tag) {
      if (Array.isArray(filters.tag)) {
        filters.tag.forEach((tag) => params.append("tag", tag));
      } else {
        params.append("tag", filters.tag);
      }
    }
    if (filters.category) params.append("category", filters.category);
    if (filters.page) params.append("page", filters.page.toString());
    if (filters.limit) params.append("limit", filters.limit.toString());

    const response = await fetch(`${API_URL}/api/articles?${params}`);
    return handleResponse(response);
  },

  /**
   * Mengambil artikel berdasarkan ID (admin).
   * @param id ID artikel
   * @returns Artikel
   */
  getArticleById: async (id: string): Promise<Article> => {
    const response = await fetch(`${API_URL}/api/atmin/articles/${id}`, {
      headers: getAuthHeaders(),
    });

    const data = await handleResponse(response);
    return data.article || data;
  },

  /**
   * Mengambil artikel berdasarkan slug (publik).
   * @param slug Slug artikel
   * @returns Artikel
   */
  getArticleBySlug: async (slug: string): Promise<Article> => {
    const response = await fetch(`${API_URL}/api/articles/slug/${slug}`);
    const data = await handleResponse(response);
    return data.article || data;
  },

  /**
   * Memperbarui artikel dengan optional file upload.
   * @param id ID artikel
   * @param formData Data artikel
   * @param file File cover (opsional)
   * @returns Artikel yang diperbarui
   */
  updateArticle: async (
    id: string,
    formData: ArticleFormData,
    file?: File
  ): Promise<Article> => {
    const data = new FormData();

    Object.entries(formData).forEach(([key, value]) => {
      if (key === "author" || key === "tags") {
        data.append(key, JSON.stringify(value));
      } else if (value !== null && value !== undefined) {
        data.append(key, String(value));
      }
    });

    if (file) data.append("coverImageFile", file);

    const response = await fetch(`${API_URL}/api/atmin/articles/${id}`, {
      method: "PUT",
      headers: getAuthHeaders(),
      body: data,
    });

    const result = await handleResponse(response);
    return result.article || result;
  },

  /**
   * Menghapus artikel berdasarkan ID.
   * @param id ID artikel
   */
  deleteArticle: async (id: string): Promise<void> => {
    const response = await fetch(`${API_URL}/api/atmin/articles/${id}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    });

    await handleResponse(response);
  },
};

export default articleApi;
