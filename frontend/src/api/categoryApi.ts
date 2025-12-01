/**
 * @fileoverview API service functions for category management.
 * This module provides functions to interact with the backend category API,
 * including fetching, creating, updating, and deleting categories.
 */

import { Category, CategoryFormData } from "../types/articleTypes";
import { apiFetch } from "../lib/api";

/**
 * Retrieves the authentication token from localStorage.
 * @returns {string | null} The JWT token if present, otherwise null.
 */
const getAuthToken = (): string | null => {
  return localStorage.getItem("token");
};

/**
 * An object containing methods for interacting with the category API endpoints.
 */
const categoryApi = {
  /**
   * Fetches all categories from the admin endpoint.
   * @returns A promise that resolves to an array of Category objects.
   */
  getAdminCategories: async (): Promise<Category[]> => {
    const token = getAuthToken();
    const data = await apiFetch("/atmin/categories", {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    return data.categories || data;
  },

  /**
   * Creates a new category by sending the provided data to the API.
   * @param categoryData - The data for the new category.
   * @returns A promise that resolves to the newly created Category object.
   */
  createCategory: async (categoryData: CategoryFormData): Promise<Category> => {
    const token = getAuthToken();
    const data = await apiFetch("/atmin/categories", {
      method: "POST",
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: JSON.stringify(categoryData),
    });
    return data.category;
  },

  /**
   * Updates an existing category with the provided data.
   * @param id - The ID of the category to update.
   * @param categoryData - The partial data to update the category with.
   * @returns A promise that resolves to the updated Category object.
   */
  updateCategory: async (
    id: number,
    categoryData: Partial<CategoryFormData>
  ): Promise<Category> => {
    const token = getAuthToken();
    const data = await apiFetch(`/atmin/categories/${id}`, {
      method: "PUT",
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: JSON.stringify(categoryData),
    });
    return data.category;
  },

  /**
   * Deletes a category by its ID.
   * @param id - The ID of the category to delete.
   * @returns A promise that resolves when the category is successfully deleted.
   */
  deleteCategory: async (id: number): Promise<void> => {
    const token = getAuthToken();
    await apiFetch(`/atmin/categories/${id}`, {
      method: "DELETE",
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
  },
};

export default categoryApi;
