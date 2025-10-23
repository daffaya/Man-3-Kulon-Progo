// src/hooks/useImportStudent.ts
import { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { studentService } from "../services/studentService";

interface ImportResult {
  success: number;
  failed: number;
  errors: Array<{ row: number; error: string }>;
}

interface UseImportStudentReturn {
  isUploading: boolean;
  progress: number;
  importResult: ImportResult | null;
  error: string | null;
  importStudents: (file: File) => Promise<void>;
  reset: () => void;
}

export const useImportStudent = (): UseImportStudentReturn => {
  const { token } = useAuth();
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const importStudents = async (file: File) => {
    if (!token) {
      setError("Token tidak tersedia. Silakan login kembali.");
      return;
    }

    // Validate file
    if (!file) {
      setError("Pilih file terlebih dahulu");
      return;
    }

    const validTypes = [
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", // .xlsx
      "application/vnd.ms-excel", // .xls
    ];

    if (!validTypes.includes(file.type)) {
      setError(
        "Format file tidak valid. Hanya .xlsx dan .xls yang diperbolehkan"
      );
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      // 5MB
      setError("Ukuran file terlalu besar. Maksimal 5MB");
      return;
    }

    setIsUploading(true);
    setProgress(0);
    setError(null);
    setImportResult(null);

    try {
      // Create FormData
      const formData = new FormData();
      formData.append("file", file);

      // Upload file
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_API_URL}/api/students/import`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Import error response:", errorData);
        throw new Error(errorData.error || "Gagal mengimport data siswa");
      }

      const result: ImportResult = await response.json();
      console.log("Import result:", result);
      setImportResult(result);
      // Simulate progress for better UX
      setProgress(100);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Terjadi kesalahan saat import";
      setError(errorMessage);
    } finally {
      setIsUploading(false);
    }
  };

  const reset = () => {
    setIsUploading(false);
    setProgress(0);
    setImportResult(null);
    setError(null);
  };

  return {
    isUploading,
    progress,
    importResult,
    error,
    importStudents,
    reset,
  };
};
