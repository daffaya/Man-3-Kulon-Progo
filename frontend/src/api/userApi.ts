/**
 * @fileoverview User API client for managing user profiles, authentication, and admin operations.
 * This module provides functions to interact with the backend API for user-related operations
 * including profile management, avatar uploads, user CRUD operations, and password changes.
 */

import { User, UserProfileData, UserFormData } from "../types/userTypes";
import { apiFetch } from "../lib/api";

/**
 * Retrieves the authentication token from localStorage.
 * @returns {string | null} The JWT token if present, otherwise null.
 */
const getAuthToken = (): string | null => {
  return localStorage.getItem("token");
};

/**
 * Handles unauthorized responses by clearing token and user data.
 * @throws {Error} Always throws an unauthorized error.
 */
const handleUnauthorized = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  window.dispatchEvent(new CustomEvent("unauthorized"));
  throw new Error("Unauthorized: Please login again");
};

/**
 * The base URL for the backend API.
 */
const API_URL = "https://backend.man3kulonprogo.sch.id";

/**
 * API client object for user-related operations.
 */
const userApi = {
  /**
   * Retrieves the current user's profile information.
   * @returns {Promise<User>} Promise that resolves to the user profile data.
   */
  getUserProfile: async (): Promise<User> => {
    try {
      const token = getAuthToken();
      const data = await apiFetch("/users/profile", {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });

      // Ensure avatar URL is complete
      if (
        data.data &&
        data.data.avatar &&
        !data.data.avatar.startsWith("http")
      ) {
        data.data.avatar = `${API_URL}${data.data.avatar}`;
      }

      return data.data;
    } catch (error: any) {
      if (
        error.message.includes("401") ||
        error.message.includes("Unauthorized")
      ) {
        handleUnauthorized();
      }
      throw error;
    }
  },

  /**
   * Updates the current user's profile information.
   * @param {UserProfileData} profileData - The updated profile data.
   * @returns {Promise<User>} Promise that resolves to the updated user profile data.
   */
  updateUserProfile: async (profileData: UserProfileData): Promise<User> => {
    try {
      const token = getAuthToken();
      const data = await apiFetch("/users/profile", {
        method: "PUT",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: JSON.stringify(profileData),
      });

      if (!data.data) {
        throw new Error("Invalid response structure");
      }

      // Ensure avatar URL is complete
      if (data.data.avatar && !data.data.avatar.startsWith("http")) {
        data.data.avatar = `${API_URL}${data.data.avatar}`;
      }

      return data.data;
    } catch (error: any) {
      if (
        error.message.includes("401") ||
        error.message.includes("Unauthorized")
      ) {
        handleUnauthorized();
      }
      throw error;
    }
  },

  /**
   * Uploads a user's avatar image.
   * @param {File} file - The image file to upload.
   * @returns {Promise<{ avatar: string }>} Promise that resolves to the avatar URL.
   */
  uploadAvatar: async (file: File): Promise<{ avatar: string }> => {
    const formData = new FormData();
    formData.append("avatar", file);

    // For FormData, we need to use fetch directly to avoid Content-Type header
    const token = getAuthToken();
    const response = await fetch(
      `https://backend.man3kulonprogo.sch.id/api/users/profile/avatar`,
      {
        method: "POST",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: formData,
      }
    );

    if (!response.ok) {
      if (response.status === 401) {
        handleUnauthorized();
      }
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || "Something went wrong");
    }

    return response.json();
  },

  /**
   * Updates a user's avatar by URL.
   * @param {string} avatarUrl - The URL of the avatar image.
   * @returns {Promise<{ avatar: string }>} Promise that resolves to the updated avatar URL.
   */
  updateAvatarByUrl: async (avatarUrl: string): Promise<{ avatar: string }> => {
    try {
      const token = getAuthToken();
      return await apiFetch("/users/profile/avatar", {
        method: "PUT",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: JSON.stringify({ avatarUrl }),
      });
    } catch (error: any) {
      if (
        error.message.includes("401") ||
        error.message.includes("Unauthorized")
      ) {
        handleUnauthorized();
      }
      throw error;
    }
  },

  /**
   * Retrieves all users (admin function).
   * @returns {Promise<{ success: boolean; data: User[] }>} Promise that resolves to the list of users.
   */
  getAllUsers: async (): Promise<{ success: boolean; data: User[] }> => {
    try {
      const token = getAuthToken();
      return await apiFetch("/users/users", {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
    } catch (error: any) {
      if (
        error.message.includes("401") ||
        error.message.includes("Unauthorized")
      ) {
        handleUnauthorized();
      }
      throw error;
    }
  },

  /**
   * Creates a new user (admin function).
   * @param {UserFormData} userData - The data for the new user.
   * @returns {Promise<{ success: boolean; data: User; message: string }>} Promise that resolves to the created user data.
   */
  createUser: async (
    userData: UserFormData
  ): Promise<{ success: boolean; data: User; message: string }> => {
    try {
      const token = getAuthToken();
      return await apiFetch("/users/users", {
        method: "POST",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: JSON.stringify(userData),
      });
    } catch (error: any) {
      if (
        error.message.includes("401") ||
        error.message.includes("Unauthorized")
      ) {
        handleUnauthorized();
      }
      throw error;
    }
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
    try {
      const token = getAuthToken();
      return await apiFetch(`/users/users/${id}`, {
        method: "PUT",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: JSON.stringify(userData),
      });
    } catch (error: any) {
      if (
        error.message.includes("401") ||
        error.message.includes("Unauthorized")
      ) {
        handleUnauthorized();
      }
      throw error;
    }
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
    try {
      const token = getAuthToken();
      return await apiFetch("/users/change-password", {
        method: "PUT",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: JSON.stringify(passwords),
      });
    } catch (error: any) {
      if (
        error.message.includes("401") ||
        error.message.includes("Unauthorized")
      ) {
        handleUnauthorized();
      }
      throw error;
    }
  },

  /**
   * Deletes a user (admin function).
   * @param {number} id - The ID of the user to delete.
   * @returns {Promise<{ success: boolean; message: string }>} Promise that resolves to the operation result.
   */
  deleteUser: async (
    id: number
  ): Promise<{ success: boolean; message: string }> => {
    try {
      const token = getAuthToken();
      return await apiFetch(`/users/users/${id}`, {
        method: "DELETE",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
    } catch (error: any) {
      if (
        error.message.includes("401") ||
        error.message.includes("Unauthorized")
      ) {
        handleUnauthorized();
      }
      throw error;
    }
  },
};

export default userApi;
