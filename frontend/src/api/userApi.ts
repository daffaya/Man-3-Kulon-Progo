// frontend/src/api/userApi.ts

import { User, UserProfileData, UserFormData } from "../types/userTypes";

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

const userApi = {
  /**
   * Mengambil data profil user yang sedang login.
   * @returns Data user
   */
  getUserProfile: async (): Promise<User> => {
    const response = await fetch(`${API_URL}/api/users/profile`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  /**
   * Memperbarui data profil user.
   * @param profileData Data profil yang akan diperbarui
   * @returns Data user yang sudah diperbarui
   */
  updateUserProfile: async (profileData: UserProfileData): Promise<User> => {
    const response = await fetch(`${API_URL}/api/users/profile`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeaders(),
      },
      body: JSON.stringify(profileData),
    });
    return handleResponse(response);
  },

  /**
   * Upload avatar user.
   * @param file File avatar yang akan diupload
   * @returns URL avatar yang sudah diupload
   */
  uploadAvatar: async (file: File): Promise<{ avatar: string }> => {
    const formData = new FormData();
    formData.append("avatar", file);

    const response = await fetch(`${API_URL}/api/users/profile/avatar`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: formData,
    });
    return handleResponse(response);
  },

  /**
   * Memperbarui avatar user melalui URL.
   * @param avatarUrl URL avatar yang akan digunakan
   * @returns URL avatar yang sudah diperbarui
   */
  updateAvatarByUrl: async (avatarUrl: string): Promise<{ avatar: string }> => {
    const response = await fetch(`${API_URL}/api/users/profile/avatar`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeaders(),
      },
      body: JSON.stringify({ avatarUrl }),
    });
    return handleResponse(response);
  },

  /**
   * Mengambil semua user (Super Admin only).
   * @returns Daftar semua user
   */
  getAllUsers: async (): Promise<User[]> => {
    const response = await fetch(`${API_URL}/api/users/users`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  /**
   * Membuat user baru (Super Admin only).
   * @param userData Data user yang akan dibuat
   * @returns User yang sudah dibuat
   */
  createUser: async (
    userData: UserFormData
  ): Promise<{ success: boolean; user: User; message: string }> => {
    const response = await fetch(`${API_URL}/api/users/users`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeaders(),
      },
      body: JSON.stringify(userData),
    });
    return handleResponse(response);
  },

  /**
   * Memperbarui user (Super Admin only).
   * @param id ID user yang akan diperbarui
   * @param userData Data user yang akan diperbarui
   * @returns User yang sudah diperbarui
   */
  updateUser: async (
    id: number,
    userData: UserFormData
  ): Promise<{ success: boolean; user: User; message: string }> => {
    const response = await fetch(`${API_URL}/api/users/users/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeaders(),
      },
      body: JSON.stringify(userData),
    });
    return handleResponse(response);
  },

  /**
   * Menghapus user (Super Admin only).
   * @param id ID user yang akan dihapus
   * @returns Hasil operasi penghapusan
   */
  deleteUser: async (
    id: number
  ): Promise<{ success: boolean; message: string }> => {
    const response = await fetch(`${API_URL}/api/users/users/${id}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },
};

export default userApi;
