/**
 * @fileoverview Custom hook for managing student data operations.
 * This hook provides functionality to fetch, add, update, and delete students,
 * with support for filtering and pagination.
 */

import { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { Student } from "../types/studentTypes";
import { studentService } from "../services/studentService";

/**
 * Interface defining the filters that can be applied when fetching students.
 */
interface StudentFilters {
  token: string;
  classId?: number;
  search?: string;
  academicYear?: string;
  angkatan?: string;
  page?: number;
  limit?: number;
}

/**
 * Interface defining the structure of the paginated response from the API.
 */
interface StudentsResponse {
  data: Student[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
  };
}

/**
 * Custom hook for managing student data operations.
 * Provides functions to fetch, add, update, and delete students, along with state management
 * for loading, errors, and pagination information.
 * @param {StudentFilters} [filters] - Optional filters to apply when fetching students.
 * @returns {Object} An object containing:
 *   - {Student[]} students - The array of students.
 *   - {boolean} loading - Loading state indicator.
 *   - {string | null} error - Error message if an error occurred.
 *   - {Object | null} pagination - Pagination information.
 *   - {Function} addStudent - Function to add a new student.
 *   - {Function} updateStudent - Function to update an existing student.
 *   - {Function} deleteStudent - Function to delete a student.
 *   - {Function} refetch - Function to refetch the student data.
 */
export const useStudents = (filters?: StudentFilters) => {
  const { token: authToken } = useAuth();
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<{
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
  } | null>(null);

  /**
   * Fetches students from the API based on the provided filters.
   * Updates the students state and pagination information.
   */
  const fetchStudents = async () => {
    const currentToken = filters?.token || authToken;

    if (!currentToken) {
      const errorMessage = "Token tidak tersedia. Silakan login kembali.";
      setError(errorMessage);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const backendUrl =
        import.meta.env.VITE_BACKEND_URL ||
        "https://backend.man3kulonprogo.sch.id";
      const response = await fetch(
        `${backendUrl}/api/students?${new URLSearchParams({
          ...(filters?.classId && { classId: String(filters.classId) }),
          ...(filters?.search && { search: filters.search }),
          ...(filters?.academicYear && {
            academicYear: filters.academicYear,
          }),
          ...(filters?.angkatan && { angkatan: filters.angkatan }),
          ...(filters?.page && { page: String(filters.page) }),
          ...(filters?.limit && { limit: String(filters.limit) }),
        })}`,
        {
          headers: {
            Authorization: `Bearer ${currentToken}`,
          },
        },
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: StudentsResponse = await response.json();

      if (data.pagination) {
        setStudents(data.data);
        setPagination(data.pagination);
      } else {
        setStudents(data as any);
        setPagination(null);
      }
    } catch (err: any) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error";
      setError(errorMessage);

      if (
        errorMessage.includes("token") ||
        errorMessage.includes("authenticated") ||
        errorMessage.includes("Token telah kadaluarsa") ||
        errorMessage.includes("HTML")
      ) {
        window.dispatchEvent(new CustomEvent("unauthorized"));
      }
    } finally {
      setLoading(false);
    }
  };

  /**
   * Adds a new student to the database.
   * @param {any} data - The student data to add.
   * @returns {Promise<Student>} The newly created student.
   */
  const addStudent = async (data: any) => {
    const currentToken = filters?.token || authToken;

    if (!currentToken) {
      setError("Token tidak tersedia. Silakan login kembali.");
      throw new Error("Token tidak tersedia");
    }

    try {
      const newStudent = await studentService.createStudent(data, currentToken);
      setStudents((prev) => [...prev, newStudent]);
      return newStudent;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
      throw err;
    }
  };

  /**
   * Updates an existing student in the database.
   * @param {number} id - The ID of the student to update.
   * @param {any} data - The updated student data.
   * @returns {Promise<Student>} The updated student.
   */
  const updateStudent = async (id: number, data: any) => {
    const currentToken = filters?.token || authToken;

    if (!currentToken) {
      setError("Token tidak tersedia. Silakan login kembali.");
      throw new Error("Token tidak tersedia");
    }

    try {
      const updatedStudent = await studentService.updateStudent(
        id,
        data,
        currentToken,
      );
      setStudents((prev) =>
        prev.map((student) => (student.id === id ? updatedStudent : student)),
      );
      return updatedStudent;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
      throw err;
    }
  };

  /**
   * Deletes a student from the database.
   * @param {number} id - The ID of the student to delete.
   */
  const deleteStudent = async (id: number) => {
    const currentToken = filters?.token || authToken;

    if (!currentToken) {
      setError("Token tidak tersedia. Silakan login kembali.");
      throw new Error("Token tidak tersedia");
    }

    try {
      await studentService.deleteStudent(id, currentToken);
      setStudents((prev) => prev.filter((student) => student.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
      throw err;
    }
  };

  useEffect(() => {
    fetchStudents();
  }, [authToken, JSON.stringify(filters)]);

  return {
    students,
    loading,
    error,
    pagination,
    addStudent,
    updateStudent,
    deleteStudent,
    refetch: fetchStudents,
  };
};
