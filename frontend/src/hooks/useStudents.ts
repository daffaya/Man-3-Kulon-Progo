// src/hooks/useStudents.ts
import { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { Student } from "../types/studentTypes";
import { studentService } from "../services/studentService";

export const useStudents = (filters?: {
  classId?: number;
  search?: string;
  academicYear?: string;
}) => {
  const { token } = useAuth();
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchStudents = async () => {
    if (!token) {
      const errorMessage = "Token tidak tersedia. Silakan login kembali.";
      setError(errorMessage);
      console.error(errorMessage);
      return; // Hapus auto redirect di sini
    }

    setLoading(true);
    setError(null);

    try {
      console.log(
        "Fetching students with token:",
        token.substring(0, 20) + "..."
      );
      const data = await studentService.getStudents({
        ...filters,
        token,
      });
      console.log("Students fetched successfully:", data.length);
      setStudents(data);
    } catch (err: any) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error";
      setError(errorMessage);
      console.error("Error fetching students:", errorMessage);

      // Hapus auto redirect, biarkan komponen yang menangani
      // Cek jika error karena token expired
      if (
        errorMessage.includes("token") ||
        errorMessage.includes("authenticated") ||
        errorMessage.includes("Token telah kadaluarsa") ||
        errorMessage.includes("HTML")
      ) {
        console.log("Authentication error detected");
        // Tidak auto redirect, biarkan user melihat error message
      }
    } finally {
      setLoading(false);
    }
  };

  const addStudent = async (data: any) => {
    if (!token) {
      setError("Token tidak tersedia. Silakan login kembali.");
      throw new Error("Token tidak tersedia");
    }

    try {
      const newStudent = await studentService.createStudent(data, token);
      setStudents((prev) => [...prev, newStudent]);
      return newStudent;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
      throw err;
    }
  };

  const updateStudent = async (id: number, data: any) => {
    if (!token) {
      setError("Token tidak tersedia. Silakan login kembali.");
      throw new Error("Token tidak tersedia");
    }

    try {
      const updatedStudent = await studentService.updateStudent(
        id,
        data,
        token
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
    if (!token) {
      setError("Token tidak tersedia. Silakan login kembali.");
      throw new Error("Token tidak tersedia");
    }

    try {
      await studentService.deleteStudent(id, token);
      setStudents((prev) => prev.filter((student) => student.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
      throw err;
    }
  };

  useEffect(() => {
    fetchStudents();
  }, [token, JSON.stringify(filters)]);

  return {
    students,
    loading,
    error,
    addStudent,
    updateStudent,
    deleteStudent,
    refetch: fetchStudents,
  };
};
