/**
 * @fileoverview Service module for managing student-related API operations.
 * This module provides functions to interact with the student endpoints of the API,
 * including CRUD operations, class management, graduation processes, and data retrieval.
 * It handles authentication, error handling, and response parsing.
 */

import {
  Student,
  BulkMoveClassResponse,
  GraduateStudentsResponse,
  Angkatan,
  Class,
} from "../types/studentTypes";

const backendUrl =
  import.meta.env.VITE_BACKEND_URL || "https://backend.man3kulonprogo.sch.id";

/**
 * Service object containing methods for student-related API operations.
 */
export const studentService = {
  /**
   * Retrieves a list of students based on provided filters.
   * @param {Object} params - Parameters for the request.
   * @param {string} params.token - Authentication token.
   * @param {number} params.classId - Optional class ID filter.
   * @param {string} params.search - Optional search term.
   * @param {string} params.academicYear - Optional academic year filter.
   * @param {string} params.angkatan - Optional angkatan (batch) filter.
   * @returns {Promise<Student[]>} Promise resolving to an array of students.
   */
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

    const queryParams = new URLSearchParams();
    Object.keys(filters).forEach((key) => {
      if (filters[key as keyof typeof filters] !== undefined) {
        queryParams.append(key, String(filters[key as keyof typeof filters]));
      }
    });

    const url = `${backendUrl}/api/students?${queryParams.toString()}`;

    try {
      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const contentType = response.headers.get("content-type");
      if (contentType && contentType.includes("text/html")) {
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
          const textResponse = await response.text();

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
      throw error;
    }
  },

  /**
   * Creates a new student record.
   * @param {any} studentData - The student data to create.
   * @param {string} token - Authentication token.
   * @returns {Promise<Student>} Promise resolving to the created student.
   */
  createStudent: async (studentData: any, token: string): Promise<Student> => {
    if (!token) {
      throw new Error("Token is required");
    }

    const response = await fetch(`${backendUrl}/api/students`, {
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

  /**
   * Updates an existing student record.
   * @param {number} id - The ID of the student to update.
   * @param {any} studentData - The updated student data.
   * @param {string} token - Authentication token.
   * @returns {Promise<Student>} Promise resolving to the updated student.
   */
  updateStudent: async (
    id: number,
    studentData: any,
    token: string
  ): Promise<Student> => {
    if (!token) {
      throw new Error("Token is required");
    }

    const response = await fetch(`${backendUrl}/api/students/${id}`, {
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
  },

  /**
   * Deletes a student record.
   * @param {number} id - The ID of the student to delete.
   * @param {string} token - Authentication token.
   */
  deleteStudent: async (id: number, token: string): Promise<void> => {
    if (!token) {
      throw new Error("Token is required");
    }

    const response = await fetch(`${backendUrl}/api/students/${id}`, {
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

  /**
   * Moves a student to a different class.
   * @param {number} studentId - The ID of the student to move.
   * @param {number} classId - The ID of the destination class.
   * @param {string | null} token - Authentication token.
   */
  moveStudentClass: async (
    studentId: number,
    classId: number,
    token: string | null
  ): Promise<void> => {
    if (!token) {
      throw new Error("Token is required");
    }

    const response = await fetch(
      `${backendUrl}/api/students/${studentId}/move-class`,
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

  /**
   * Moves multiple students to a different class in bulk.
   * @param {Object} data - The data for the bulk move operation.
   * @param {number} data.classIdFrom - The source class ID.
   * @param {number} data.classIdTo - The destination class ID.
   * @param {string} data.academicYear - The academic year.
   * @param {string} data.angkatan - The batch/angkatan.
   * @param {string | null} token - Authentication token.
   * @returns {Promise<BulkMoveClassResponse>} Promise resolving to the bulk move response.
   */
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

    const response = await fetch(`${backendUrl}/api/students/bulk-move-class`, {
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

  /**
   * Graduates multiple students from a class.
   * @param {Object} data - The data for the graduation operation.
   * @param {number} data.classIdFrom - The source class ID.
   * @param {string} data.academicYear - The academic year.
   * @param {string} data.angkatan - The batch/angkatan.
   * @param {string | null} token - Authentication token.
   * @returns {Promise<GraduateStudentsResponse>} Promise resolving to the graduation response.
   */
  graduateStudents: async (
    data: { classIdFrom: number; academicYear: string; angkatan: string },
    token: string | null
  ): Promise<GraduateStudentsResponse> => {
    if (!token) throw new Error("Token is required");

    const response = await fetch(`${backendUrl}/api/students/graduate`, {
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

  /**
   * Retrieves a list of all angkatans (batches).
   * @param {string} token - Authentication token.
   * @returns {Promise<Angkatan[]>} Promise resolving to an array of angkatans.
   */
  getAngkatans: async (token: string): Promise<Angkatan[]> => {
    if (!token) {
      throw new Error("Token is required");
    }

    const url = `${backendUrl}/api/students/angkatans`;

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
      throw error;
    }
  },

  /**
   * Retrieves classes filtered by angkatan (batch).
   * @param {string} token - Authentication token.
   * @param {string} angkatan - The angkatan to filter by.
   * @returns {Promise<Class[]>} Promise resolving to an array of classes.
   */
  getClassesByAngkatan: async (
    token: string,
    angkatan: string
  ): Promise<Class[]> => {
    if (!token) throw new Error("Token is required");

    const url = `${backendUrl}/api/students?getClassesByAngkatan=true&angkatan=${encodeURIComponent(
      angkatan
    )}`;

    try {
      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        let errorMessage = "Failed to fetch classes by angkatan";

        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorMessage;
        } catch (e) {
          const textResponse = await response.text();

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
      return data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Retrieves classes filtered by education level.
   * @param {string} token - Authentication token.
   * @param {string} level - The education level to filter by.
   * @returns {Promise<Class[]>} Promise resolving to an array of classes.
   */
  getClassesByLevel: async (token: string, level: string): Promise<Class[]> => {
    if (!token) throw new Error("Token is required");

    const url = `${backendUrl}/api/students?getClassesByLevel=${level}`;

    try {
      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        let errorMessage = "Failed to fetch classes by level";

        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorMessage;
        } catch (e) {
          const textResponse = await response.text();

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
      return data;
    } catch (error) {
      throw error;
    }
  },
};
