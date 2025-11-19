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

/**
 * The base URL for the backend API, retrieved from environment variables.
 * Defaults to "http://localhost:3001" for local development.
 * @type {string}
 */
const API_URL = import.meta.env.VITE_BACKEND_API_URL || "http://localhost:3001";

/**
 * Retrieves the authorization headers for API requests.
 * Checks localStorage for a JWT token and includes it in the headers if present.
 * @returns {Record<string, string>} The authorization headers.
 */
const getAuthHeaders = (): Record<string, string> => {
  const token = localStorage.getItem("token");
  return {
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

/**
 * Handles the response from a fetch API call.
 * Checks if the response is OK and parses the JSON body.
 * Throws an error with a message from the response body if the response is not OK.
 * @param {Response} response - The response object from a fetch call.
 * @returns {Promise<any>} A promise that resolves with the parsed JSON data.
 * @throws {Error} If the response status is not OK.
 */
const handleResponse = async (response: Response): Promise<any> => {
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || "Something went wrong");
  }
  return response.json();
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

    const response = await fetch(`${API_URL}/api/atmin/articles`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: data,
    });

    const result = await handleResponse(response);
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

    const response = await fetch(`${API_URL}/api/atmin/articles?${params}`, {
      headers: getAuthHeaders(),
    });

    return handleResponse(response);
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

    const response = await fetch(`${API_URL}/api/articles?${params}`);
    return handleResponse(response);
  },

  /**
   * Fetches a single article by its ID for administrative purposes.
   * @param {string} id - The ID of the article to fetch.
   * @returns {Promise<Article>} A promise that resolves with the requested article.
   * @throws {Error} If the API request fails.
   */
  getArticleById: async (id: string): Promise<Article> => {
    const response = await fetch(`${API_URL}/api/atmin/articles/${id}`, {
      headers: getAuthHeaders(),
    });

    const data = await handleResponse(response);
    return data.article || data;
  },

  /**
   * Fetches a single article by its slug for public viewing.
   * @param {string} slug - The slug of the article to fetch.
   * @returns {Promise<Article>} A promise that resolves with the requested article.
   * @throws {Error} If the API request fails.
   */
  getArticleBySlug: async (slug: string): Promise<Article> => {
    const response = await fetch(`${API_URL}/api/articles/slug/${slug}`);
    const data = await handleResponse(response);
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

    const response = await fetch(`${API_URL}/api/atmin/articles/${id}`, {
      method: "PUT",
      headers: getAuthHeaders(),
      body: data,
    });

    const result = await handleResponse(response);
    return result.article || result;
  },

  /**
   * Deletes an article by its ID.
   * @param {string} id - The ID of the article to delete.
   * @returns {Promise<void>} A promise that resolves when the article is successfully deleted.
   * @throws {Error} If the API request fails.
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
