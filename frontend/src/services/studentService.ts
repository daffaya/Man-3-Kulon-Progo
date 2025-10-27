// src/services/studentService.ts
import {
  Student,
  BulkMoveClassResponse,
  GraduateStudentsResponse,
  Angkatan,
  Class,
} from "../types/studentTypes";

const API_URL = import.meta.env.VITE_BACKEND_API_URL || "http://localhost:3000";

export const studentService = {
  getStudents: async (params: {
    token: string;
    classId?: number;
    search?: string;
    academicYear?: string;
    angkatan?: string;
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
      let errorMessage = "Failed to create student";

      try {
        const errorData = await response.json();
        errorMessage = errorData.error || errorData.message || errorMessage;
      } catch (e) {
        errorMessage = "Server error";
      }

      throw new Error(errorMessage);
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
      let errorMessage = "Failed to update student";
      try {
        const errorData = await response.json();
        errorMessage = errorData.error || errorData.message || errorMessage;
      } catch (e) {}
      throw new Error(errorMessage);
    }
    return response.json();

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
      let errorMessage = "Failed to delete student";
      try {
        const errorData = await response.json();
        errorMessage = errorData.error || errorData.message || errorMessage;
      } catch (e) {}
      throw new Error(errorMessage);
    }
  },

  moveStudentClass: async (
    studentId: number,
    classId: number,
    token: string | null
  ): Promise<void> => {
    if (!token) {
      throw new Error("Token is required");
    }

    const response = await fetch(
      `${API_URL}/api/students/${studentId}/move-class`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ classId }),
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to move student class");
    }
  },

  bulkMoveClass: async (
    data: {
      classIdFrom: number;
      classIdTo: number;
      academicYear: string;
      angkatan: string;
    },
    token: string | null
  ): Promise<BulkMoveClassResponse> => {
    if (!token) throw new Error("Token is required");

    const response = await fetch(`${API_URL}/api/students/bulk-move-class`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Failed to move students");
    }

    return response.json();
  },

  graduateStudents: async (
    data: { classIdFrom: number; academicYear: string; angkatan: string },
    token: string | null
  ): Promise<GraduateStudentsResponse> => {
    if (!token) throw new Error("Token is required");

    const response = await fetch(`${API_URL}/api/students/graduate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Failed to graduate students");
    }

    return response.json();
  },

  getAngkatans: async (token: string): Promise<Angkatan[]> => {
    if (!token) {
      throw new Error("Token is required");
    }

    const url = `${API_URL}/api/students/angkatans`;
    console.log("Fetching angkatans from URL:", url);

    try {
      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        let errorMessage = "Failed to fetch angkatans";

        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorMessage;
        } catch (e) {
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

  // Tambahkan metode ini
  getClassesByAngkatan: async (
    token: string,
    angkatan: string
  ): Promise<Class[]> => {
    if (!token) throw new Error("Token is required");

    const url = `${API_URL}/api/students?getClassesByAngkatan=true&angkatan=${encodeURIComponent(
      angkatan
    )}`;
    console.log("Fetching classes by angkatan from URL:", url);

    try {
      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      console.log("Response status:", response.status);

      if (!response.ok) {
        let errorMessage = "Failed to fetch classes by angkatan";

        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorMessage;
          console.error("Error response:", errorData);
        } catch (e) {
          const textResponse = await response.text();
          console.error("Non-JSON response:", textResponse.substring(0, 200));

          if (textResponse.includes("<!DOCTYPE")) {
            errorMessage =
              "Server returned HTML page instead of JSON. Please check if you're authenticated.";
          } else if (
            textResponse.includes("Cannot GET") ||
            textResponse.includes("404")
          ) {
            errorMessage =
              "Endpoint not found. Please check if the server is configured correctly.";
          }
        }

        throw new Error(errorMessage);
      }

      const data = await response.json();
      console.log("Classes by angkatan data:", data);
      return data;
    } catch (error) {
      console.error("Fetch error:", error);
      throw error;
    }
  },

  getClassesByLevel: async (token: string, level: string): Promise<Class[]> => {
    if (!token) throw new Error("Token is required");

    const url = `${API_URL}/api/students?getClassesByLevel=${level}`;
    console.log("Fetching classes by level from URL:", url);

    try {
      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      console.log("Response status:", response.status);

      if (!response.ok) {
        let errorMessage = "Failed to fetch classes by level";

        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorMessage;
          console.error("Error response:", errorData);
        } catch (e) {
          const textResponse = await response.text();
          console.error("Non-JSON response:", textResponse.substring(0, 200));

          if (textResponse.includes("<!DOCTYPE")) {
            errorMessage =
              "Server returned HTML page instead of JSON. Please check if you're authenticated.";
          } else if (
            textResponse.includes("Cannot GET") ||
            textResponse.includes("404")
          ) {
            errorMessage =
              "Endpoint not found. Please check if the server is configured correctly.";
          }
        }

        throw new Error(errorMessage);
      }

      const data = await response.json();
      console.log("Classes by level data:", data);
      return data;
    } catch (error) {
      console.error("Fetch error:", error);
      throw error;
    }
  },
};
