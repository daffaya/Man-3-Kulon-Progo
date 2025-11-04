import { User, UserProfileData, UserFormData } from "../types/userTypes";

const API_URL = import.meta.env.VITE_BACKEND_API_URL || "http://localhost:3001";

/**
 * Objek yang berisi semua fungsi untuk berinteraksi dengan API terkait user.
 */
const userApi = {
  /**
   * Mengambil header Authorization jika token tersedia di localStorage.
   * @returns {Record<string, string>} Objek header untuk autentikasi.
   */
  getAuthHeaders: (): Record<string, string> => {
    const token = localStorage.getItem("token");
    if (token) {
      return { Authorization: `Bearer ${token}` };
    }
    return {}; // Mengembalikan objek kosong jika tidak ada token
  },

  /**
   * Menangani response dari fetch API.
   * Jika response tidak OK, akan membuang error.
   * Jika status 401 (Unauthorized), akan menghapus token/user dan redirect ke halaman login.
   * @param {Response} response - Response dari fetch.
   * @throws {Error} Error dengan pesan dari server atau pesan default.
   * @returns {Promise<any>} Data JSON dari response jika berhasil.
   */
  handleResponse: async (response: Response): Promise<any> => {
    if (!response.ok) {
      // Jika response 401 (Unauthorized), hapus token dan user dari localStorage
      if (response.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        // Redirect ke login page
        window.location.href = "/login";
      }

      const errorData = await response.json().catch(() => ({})); // Prevent error if response is not JSON
      throw new Error(errorData.message || "Something went wrong");
    }
    return response.json();
  },

  /**
   * Mengambil data profil user yang sedang login.
   * @returns {Promise<User>} Promise yang menghasilkan data user.
   */
  getUserProfile: async (): Promise<User> => {
    const response = await fetch(`${API_URL}/api/users/profile`, {
      headers: userApi.getAuthHeaders(),
    });
    return userApi.handleResponse(response);
  },

  /**
   * Memperbarui data profil user.
   * @param {UserProfileData} profileData - Data profil yang akan diperbarui.
   * @returns {Promise<User>} Promise yang menghasilkan data user yang sudah diperbarui.
   */
  updateUserProfile: async (profileData: UserProfileData): Promise<User> => {
    const response = await fetch(`${API_URL}/api/users/profile`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        ...userApi.getAuthHeaders(),
      },
      body: JSON.stringify(profileData),
    });
    return userApi.handleResponse(response);
  },

  /**
   * Upload avatar user dari file.
   * @param {File} file - File avatar yang akan diupload.
   * @returns {Promise<{ avatar: string }>} Promise yang menghasilkan URL avatar yang sudah diupload.
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
   * Memperbarui avatar user melalui URL.
   * @param {string} avatarUrl - URL avatar yang akan digunakan.
   * @returns {Promise<{ avatar: string }>} Promise yang menghasilkan URL avatar yang sudah diperbarui.
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
   * Mengambil semua data user (hanya untuk Super Admin).
   * @returns {Promise<User[]>} Promise yang menghasilkan daftar semua user.
   */
  getAllUsers: async (): Promise<User[]> => {
    const response = await fetch(`${API_URL}/api/users/users`, {
      headers: userApi.getAuthHeaders(),
    });
    return userApi.handleResponse(response);
  },

  /**
   * Membuat user baru (hanya untuk Super Admin).
   * @param {UserFormData} userData - Data user yang akan dibuat.
   * @returns {Promise<{ success: boolean; user: User; message: string }>} Promise yang menghasilkan objek hasil pembuatan user.
   */
  createUser: async (
    userData: UserFormData
  ): Promise<{ success: boolean; user: User; message: string }> => {
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
   * Memperbarui data user (hanya untuk Super Admin).
   * @param {number} id - ID user yang akan diperbarui.
   * @param {UserFormData} userData - Data user yang akan diperbarui.
   * @returns {Promise<{ success: boolean; user: User; message: string }>} Promise yang menghasilkan objek hasil pembaruan user.
   */
  updateUser: async (
    id: number,
    userData: UserFormData
  ): Promise<{ success: boolean; user: User; message: string }> => {
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
   * Menghapus user (hanya untuk Super Admin).
   * @param {number} id - ID user yang akan dihapus.
   * @returns {Promise<{ success: boolean; message: string }>} Promise yang menghasilkan objek hasil penghapusan user.
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
