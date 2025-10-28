// src/hooks/useStudents.ts
import { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { Student } from "../types/studentTypes";
import { studentService } from "../services/studentService";

// Tambahkan interface untuk filters dan pagination
interface StudentFilters {
  token: string;
  classId?: number;
  search?: string;
  academicYear?: string;
  angkatan?: string;
  page?: number;
  limit?: number;
}

// Tambahkan interface untuk response pagination
interface StudentsResponse {
  data: Student[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
  };
}

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

  const fetchStudents = async () => {
    const currentToken = filters?.token || authToken;

    if (!currentToken) {
      const errorMessage = "Token tidak tersedia. Silakan login kembali.";
      setError(errorMessage);
      console.error(errorMessage);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      console.log(
        "Fetching students with filters:",
        JSON.stringify(filters, null, 2)
      );

      // Tambahkan parameter page dan limit ke request
      const response = await fetch(
        `${
          import.meta.env.VITE_BACKEND_API_URL || "http://localhost:3000"
        }/api/students?${new URLSearchParams({
          ...(filters?.classId && { classId: String(filters.classId) }),
          ...(filters?.search && { search: filters.search }),
          ...(filters?.academicYear && { academicYear: filters.academicYear }),
          ...(filters?.angkatan && { angkatan: filters.angkatan }),
          ...(filters?.page && { page: String(filters.page) }),
          ...(filters?.limit && { limit: String(filters.limit) }),
        })}`,
        {
          headers: {
            Authorization: `Bearer ${currentToken}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: StudentsResponse = await response.json();

      console.log("Students fetched successfully:", data.data.length);

      // Jika backend mengembalikan struktur dengan pagination
      if (data.pagination) {
        setStudents(data.data);
        setPagination(data.pagination);
      } else {
        // Fallback jika backend belum mendukung pagination
        setStudents(data as any);
        setPagination(null);
      }
    } catch (err: any) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error";
      setError(errorMessage);
      console.error("Error fetching students:", errorMessage);

      if (
        errorMessage.includes("token") ||
        errorMessage.includes("authenticated") ||
        errorMessage.includes("Token telah kadaluarsa") ||
        errorMessage.includes("HTML")
      ) {
        console.log("Authentication error detected");
      }
    } finally {
      setLoading(false);
    }
  };

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
        currentToken
      );
      setStudents((prev) =>
        prev.map((student) => (student.id === id ? updatedStudent : student))
      );
      return updatedStudent;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
      throw err;
    }
  };

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
