// frontend/src/api/categoryApi.ts

import { Category, CategoryFormData } from "../types/articleTypes";

/** The base URL for the API, configurable via environment variables. */
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001/api";

/**
 * Retrieves the authentication headers required for API requests.
 * Includes the Content-Type and a Bearer token if available in localStorage.
 * @returns An object containing the necessary request headers.
 */
const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

/**
 * Handles the API response, checking for errors and parsing the JSON body.
 * Throws an error with a message from the response body if the request was not successful.
 * @param response - The fetch API Response object.
 * @returns A promise that resolves to the parsed JSON data.
 */
const handleResponse = async (response: Response) => {
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || "Something went wrong");
  }
  return response.json();
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
    const response = await fetch(`${API_URL}/atmin/categories`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  /**
   * Creates a new category by sending the provided data to the API.
   * @param categoryData - The data for the new category.
   * @returns A promise that resolves to the newly created Category object.
   */
  createCategory: async (categoryData: CategoryFormData): Promise<Category> => {
    const response = await fetch(`${API_URL}/atmin/categories`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(categoryData),
    });
    const data = await handleResponse(response);
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
    const response = await fetch(`${API_URL}/atmin/categories/${id}`, {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify(categoryData),
    });
    const data = await handleResponse(response);
    return data.category;
  },

  /**
   * Deletes a category by its ID.
   * @param id - The ID of the category to delete.
   * @returns A promise that resolves when the category is successfully deleted.
   */
  deleteCategory: async (id: number): Promise<void> => {
    const response = await fetch(`${API_URL}/atmin/categories/${id}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    });
    await handleResponse(response);
  },
};

export default categoryApi;
