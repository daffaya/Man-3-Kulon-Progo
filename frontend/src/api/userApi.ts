/**
 * @fileoverview User API client for managing user profiles, authentication, and admin operations.
 * This module provides functions to interact with the backend API for user-related operations
 * including profile management, avatar uploads, user CRUD operations, and password changes.
 */

import { User, UserProfileData, UserFormData } from "../types/userTypes";

/**
 * The base URL for the backend API.
 * Defaults to localhost:3001 if not specified in environment variables.
 */
const API_URL = import.meta.env.VITE_BACKEND_API_URL || "http://localhost:3001";

/**
 * API client object for user-related operations.
 */
const userApi = {
  /**
   * Creates authorization headers for API requests.
   * @returns {Record<string, string>} Headers object with authorization token if available.
   */
  getAuthHeaders: (): Record<string, string> => {
    const token = localStorage.getItem("token");
    if (token) {
      return { Authorization: `Bearer ${token}` };
    }
    return {};
  },

  /**
   * Handles API responses, especially error cases.
   * @param {Response} response - The fetch API response object.
   * @returns {Promise<any>} Promise that resolves to the JSON response data.
   * @throws {Error} If the response is not ok, with appropriate error handling for 401 status.
   */
  handleResponse: async (response: Response): Promise<any> => {
    if (!response.ok) {
      if (response.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        window.dispatchEvent(new CustomEvent("unauthorized"));
        throw new Error("Unauthorized: Please login again");
      }

      const errorData = await response.json().catch(() => ({}));
      const errorMessage = errorData.message || "Something went wrong";
      throw new Error(errorMessage);
    }
    return response.json();
  },

  /**
   * Retrieves the current user's profile information.
   * @returns {Promise<User>} Promise that resolves to the user profile data.
   */
  getUserProfile: async (): Promise<User> => {
    const response = await fetch(`${API_URL}/api/users/profile`, {
      headers: userApi.getAuthHeaders(),
    });
    const data = await userApi.handleResponse(response);

    // Ensure avatar URL is complete
    if (data.data && data.data.avatar && !data.data.avatar.startsWith("http")) {
      data.data.avatar = `${API_URL}${data.data.avatar}`;
    }

    return data.data;
  },

  /**
   * Updates the current user's profile information.
   * @param {UserProfileData} profileData - The updated profile data.
   * @returns {Promise<User>} Promise that resolves to the updated user profile data.
   */
  updateUserProfile: async (profileData: UserProfileData): Promise<User> => {
    const headers = {
      "Content-Type": "application/json",
      ...userApi.getAuthHeaders(),
    };

    const response = await fetch(`${API_URL}/api/users/profile`, {
      method: "PUT",
      headers,
      body: JSON.stringify(profileData),
    });

    if (!response.ok) {
      if (response.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        window.dispatchEvent(new CustomEvent("unauthorized"));
        throw new Error("Unauthorized: Please login again");
      }

      const errorData = await response.json().catch(() => ({}));
      const errorMessage = errorData.message || "Something went wrong";
      throw new Error(errorMessage);
    }

    const data = await response.json();

    if (!data.data) {
      throw new Error("Invalid response structure");
    }

    // Ensure avatar URL is complete
    if (data.data.avatar && !data.data.avatar.startsWith("http")) {
      data.data.avatar = `${API_URL}${data.data.avatar}`;
    }

    return data.data;
  },

  /**
   * Uploads a user's avatar image.
   * @param {File} file - The image file to upload.
   * @returns {Promise<{ avatar: string }>} Promise that resolves to the avatar URL.
   */
  uploadAvatar: async (file: File): Promise<{ avatar: string }> => {
    const formData = new FormData();
    formData.append("avatar", file);

    const response = await fetch(`${API_URL}/api/users/profile/avatar`, {
      method: "POST",
      headers: userApi.getAuthHeaders(),
      body: formData,
    });
    return userApi.handleResponse(response);
  },

  /**
   * Updates a user's avatar by URL.
   * @param {string} avatarUrl - The URL of the avatar image.
   * @returns {Promise<{ avatar: string }>} Promise that resolves to the updated avatar URL.
   */
  updateAvatarByUrl: async (avatarUrl: string): Promise<{ avatar: string }> => {
    const response = await fetch(`${API_URL}/api/users/profile/avatar`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        ...userApi.getAuthHeaders(),
      },
      body: JSON.stringify({ avatarUrl }),
    });
    return userApi.handleResponse(response);
  },

  /**
   * Retrieves all users (admin function).
   * @returns {Promise<{ success: boolean; data: User[] }>} Promise that resolves to the list of users.
   */
  getAllUsers: async (): Promise<{ success: boolean; data: User[] }> => {
    const response = await fetch(`${API_URL}/api/users/users`, {
      headers: userApi.getAuthHeaders(),
    });
    return userApi.handleResponse(response);
  },

  /**
   * Creates a new user (admin function).
   * @param {UserFormData} userData - The data for the new user.
   * @returns {Promise<{ success: boolean; data: User; message: string }>} Promise that resolves to the created user data.
   */
  createUser: async (
    userData: UserFormData
  ): Promise<{ success: boolean; data: User; message: string }> => {
    const response = await fetch(`${API_URL}/api/users/users`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...userApi.getAuthHeaders(),
      },
      body: JSON.stringify(userData),
    });
    return userApi.handleResponse(response);
  },

  /**
   * Updates a user (admin function).
   * @param {number} id - The ID of the user to update.
   * @param {UserFormData} userData - The updated user data.
   * @returns {Promise<{ success: boolean; data: User; message: string }>} Promise that resolves to the updated user data.
   */
  updateUser: async (
    id: number,
    userData: UserFormData
  ): Promise<{ success: boolean; data: User; message: string }> => {
    const response = await fetch(`${API_URL}/api/users/users/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        ...userApi.getAuthHeaders(),
      },
      body: JSON.stringify(userData),
    });
    return userApi.handleResponse(response);
  },

  /**
   * Changes a user's password.
   * @param {{currentPassword: string, newPassword: string}} passwords - The current and new passwords.
   * @returns {Promise<{ success: boolean; message: string }>} Promise that resolves to the operation result.
   */
  changePassword: async (passwords: {
    currentPassword: string;
    newPassword: string;
  }): Promise<{ success: boolean; message: string }> => {
    const response = await fetch(`${API_URL}/api/users/change-password`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        ...userApi.getAuthHeaders(),
      },
      body: JSON.stringify(passwords),
    });
    return userApi.handleResponse(response);
  },

  /**
   * Deletes a user (admin function).
   * @param {number} id - The ID of the user to delete.
   * @returns {Promise<{ success: boolean; message: string }>} Promise that resolves to the operation result.
   */
  deleteUser: async (
    id: number
  ): Promise<{ success: boolean; message: string }> => {
    const response = await fetch(`${API_URL}/api/users/users/${id}`, {
      method: "DELETE",
      headers: userApi.getAuthHeaders(),
    });
    return userApi.handleResponse(response);
  },
};

export default userApi;
