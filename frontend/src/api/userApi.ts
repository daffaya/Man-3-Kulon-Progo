// frontend/src/api/userApi.ts
import { User, UserProfileData, UserFormData } from "../types/userTypes";

const API_URL = import.meta.env.VITE_BACKEND_API_URL || "http://localhost:3001";

const userApi = {
  getAuthHeaders: (): Record<string, string> => {
    const token = localStorage.getItem("token");
    if (token) {
      return { Authorization: `Bearer ${token}` };
    }
    return {};
  },

  handleResponse: async (response: Response): Promise<any> => {
    if (!response.ok) {
      if (response.status === 401) {
        console.error("Unauthorized access, token might be invalid");
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        window.dispatchEvent(new CustomEvent("unauthorized"));
        throw new Error("Unauthorized: Please login again");
      }

      const errorData = await response.json().catch(() => ({}));
      const errorMessage = errorData.message || "Something went wrong";
      console.error("API Error:", errorMessage);
      throw new Error(errorMessage);
    }
    return response.json();
  },

  getUserProfile: async (): Promise<User> => {
    const response = await fetch(`${API_URL}/api/users/profile`, {
      headers: userApi.getAuthHeaders(),
    });
    const data = await userApi.handleResponse(response);

    // Pastikan avatar URL lengkap
    if (data.data && data.data.avatar && !data.data.avatar.startsWith("http")) {
      data.data.avatar = `${API_URL}${data.data.avatar}`;
    }

    return data.data;
  },

  updateUserProfile: async (profileData: UserProfileData): Promise<User> => {
    const headers = {
      "Content-Type": "application/json",
      ...userApi.getAuthHeaders(),
    };
    console.log("Update profile headers:", headers);
    console.log("Update profile data:", profileData);

    const response = await fetch(`${API_URL}/api/users/profile`, {
      method: "PUT",
      headers,
      body: JSON.stringify(profileData),
    });

    console.log("Response status:", response.status);

    if (!response.ok) {
      if (response.status === 401) {
        console.error("Unauthorized access, token might be invalid");
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        window.dispatchEvent(new CustomEvent("unauthorized"));
        throw new Error("Unauthorized: Please login again");
      }

      const errorData = await response.json().catch(() => ({}));
      const errorMessage = errorData.message || "Something went wrong";
      console.error("API Error:", errorMessage);
      throw new Error(errorMessage);
    }

    const data = await response.json();
    console.log("Update profile response data:", data);

    if (!data.data) {
      console.error("Invalid response structure:", data);
      throw new Error("Invalid response structure");
    }

    // Pastikan avatar URL lengkap
    if (data.data.avatar && !data.data.avatar.startsWith("http")) {
      data.data.avatar = `${API_URL}${data.data.avatar}`;
    }

    return data.data;
  },

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

  getAllUsers: async (): Promise<{ success: boolean; data: User[] }> => {
    const response = await fetch(`${API_URL}/api/users/users`, {
      headers: userApi.getAuthHeaders(),
    });
    return userApi.handleResponse(response);
  },

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
