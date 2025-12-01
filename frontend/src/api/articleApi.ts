/**
 * @fileoverview API service for managing articles.
 * This module provides a set of functions to interact with the backend API endpoints
 * for creating, reading, updating, and deleting articles. It handles both public and
 * administrative operations, including file uploads for article cover images.
 * Authentication is managed using JWT tokens stored in localStorage.
 */

import {
  Article,
  ArticleFormData,
  ArticleFilters,
  PaginationData,
} from "../types/articleTypes";
import { apiFetch } from "../lib/api";

/**
 * Retrieves the authorization token from localStorage.
 * @returns {string | null} The JWT token if present, otherwise null.
 */
const getAuthToken = (): string | null => {
  return localStorage.getItem("token");
};

/**
 * An object containing functions to interact with the article API endpoints.
 */
const articleApi = {
  /**
   * Creates a new article by sending a POST request to the server.
   * Handles both form data and file uploads for the cover image.
   * @param {ArticleFormData} formData - The data for the new article.
   * @param {File} [file] - The cover image file to upload (optional).
   * @returns {Promise<Article>} A promise that resolves with the newly created article.
   * @throws {Error} If the API request fails.
   */
  createArticle: async (
    formData: ArticleFormData,
    file?: File
  ): Promise<Article> => {
    const data = new FormData();
    Object.entries(formData).forEach(([key, value]) => {
      if (key === "author" || key === "tags") {
        data.append(key, JSON.stringify(value));
      } else if (value !== null && value !== undefined) {
        data.append(key, value as string);
      }
    });

    if (file) data.append("coverImageFile", file);

    // For FormData, we need to use fetch directly to avoid Content-Type header
    const token = getAuthToken();
    const response = await fetch(
      `https://backend.man3kulonprogo.sch.id/api/atmin/articles`,
      {
        method: "POST",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: data,
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Something went wrong");
    }
    const result = await response.json();
    return result.article || result;
  },

  /**
   * Fetches a paginated list of articles for administrative purposes.
   * Supports filtering by keyword, publication status, featured status, tags, and category.
   * @param {ArticleFilters} [filters={}] - The filters to apply to the article list.
   * @returns {Promise<PaginationData<Article>>} A promise that resolves with the paginated list of articles.
   * @throws {Error} If the API request fails.
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

    const token = getAuthToken();
    return apiFetch(`/atmin/articles?${params}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
  },

  /**
   * Fetches a paginated list of articles for public viewing.
   * Supports filtering by keyword, tags, and category.
   * @param {ArticleFilters} [filters={}] - The filters to apply to the article list.
   * @returns {Promise<PaginationData<Article>>} A promise that resolves with the paginated list of articles.
   * @throws {Error} If the API request fails.
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

    return apiFetch(`/articles?${params}`);
  },

  /**
   * Fetches a single article by its ID for administrative purposes.
   * @param {string} id - The ID of the article to fetch.
   * @returns {Promise<Article>} A promise that resolves with the requested article.
   * @throws {Error} If the API request fails.
   */
  getArticleById: async (id: string): Promise<Article> => {
    const token = getAuthToken();
    const data = await apiFetch(`/atmin/articles/${id}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    return data.article || data;
  },

  /**
   * Fetches a single article by its slug for public viewing.
   * @param {string} slug - The slug of the article to fetch.
   * @returns {Promise<Article>} A promise that resolves with the requested article.
   * @throws {Error} If the API request fails.
   */
  getArticleBySlug: async (slug: string): Promise<Article> => {
    const data = await apiFetch(`/articles/${slug}`);
    return data.article || data;
  },

  /**
   * Updates an existing article by sending a PUT request to the server.
   * Handles both form data and file uploads for the cover image.
   * @param {string} id - The ID of the article to update.
   * @param {ArticleFormData} formData - The updated data for the article.
   * @param {File} [file] - The new cover image file to upload (optional).
   * @returns {Promise<Article>} A promise that resolves with the updated article.
   * @throws {Error} If the API request fails.
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

    // For FormData, we need to use fetch directly to avoid Content-Type header
    const token = getAuthToken();
    const response = await fetch(
      `https://backend.man3kulonprogo.sch.id/api/atmin/articles/${id}`,
      {
        method: "PUT",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: data,
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Something went wrong");
    }
    const result = await response.json();
    return result.article || result;
  },

  /**
   * Deletes an article by its ID.
   * @param {string} id - The ID of the article to delete.
   * @returns {Promise<void>} A promise that resolves when the article is successfully deleted.
   * @throws {Error} If the API request fails.
   */
  deleteArticle: async (id: string): Promise<void> => {
    const token = getAuthToken();
    await apiFetch(`/atmin/articles/${id}`, {
      method: "DELETE",
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
  },
};

export default articleApi;
