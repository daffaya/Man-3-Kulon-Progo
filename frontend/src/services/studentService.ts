// src/services/studentService.ts
import { Student } from "../types/studentTypes";

const API_URL = import.meta.env.VITE_BACKEND_API_URL;

export const studentService = {
  getStudents: async (params: {
    token: string;
    classId?: number;
    search?: string;
    academicYear?: string;
  }): Promise<Student[]> => {
    const { token, ...filters } = params;

    if (!token) {
      throw new Error("Token is required");
    }

    // Build query string
    const queryParams = new URLSearchParams();
    Object.keys(filters).forEach((key) => {
      if (filters[key as keyof typeof filters] !== undefined) {
        queryParams.append(key, String(filters[key as keyof typeof filters]));
      }
    });

    const url = `${API_URL}/api/students?${queryParams.toString()}`;
    console.log("Fetching from URL:", url);

    try {
      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      // Log response status
      console.log("Response status:", response.status);
      console.log(
        "Response content-type:",
        response.headers.get("content-type")
      );

      // Check if response is HTML (redirect to login page)
      const contentType = response.headers.get("content-type");
      if (contentType && contentType.includes("text/html")) {
        console.error("Received HTML response instead of JSON");
        throw new Error(
          "Authentication failed. Server returned HTML instead of JSON."
        );
      }

      if (!response.ok) {
        let errorMessage = "Failed to fetch students";

        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorMessage;
        } catch (e) {
          // Jika response bukan JSON, ambil sebagai text
          const textResponse = await response.text();
          console.error("Non-JSON response:", textResponse.substring(0, 200));

          if (textResponse.includes("<!DOCTYPE")) {
            errorMessage =
              "Server returned HTML page instead of JSON. Please check if you're authenticated.";
          } else if (
            textResponse.includes("token") ||
            textResponse.includes("authenticated")
          ) {
            errorMessage = "Authentication failed. Please login again.";
          }
        }

        throw new Error(errorMessage);
      }

      return response.json();
    } catch (error) {
      console.error("Fetch error:", error);
      throw error;
    }
  },

  createStudent: async (studentData: any, token: string): Promise<Student> => {
    if (!token) {
      throw new Error("Token is required");
    }

    const response = await fetch(`${API_URL}/api/students`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(studentData),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to create student");
    }

    return response.json();
  },

  updateStudent: async (
    id: number,
    studentData: any,
    token: string
  ): Promise<Student> => {
    if (!token) {
      throw new Error("Token is required");
    }

    const response = await fetch(`${API_URL}/api/students/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(studentData),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to update student");
    }

    return response.json();
  },

  deleteStudent: async (id: number, token: string): Promise<void> => {
    if (!token) {
      throw new Error("Token is required");
    }

    const response = await fetch(`${API_URL}/api/students/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to delete student");
    }
  },
};
