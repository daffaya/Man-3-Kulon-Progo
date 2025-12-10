/**
 * @fileoverview Custom hook for handling the student data import process.
 * This hook manages the entire import workflow, including file validation (type and size),
 * uploading to the server, tracking upload progress, and processing the import result,
 * which includes success/failure counts and specific row-level errors.
 */

import { useState } from "react";
import { useAuth } from "../contexts/AuthContext";

/**
 * Represents the result of a student data import operation.
 */
interface ImportResult {
  /** The number of students successfully imported. */
  success: number;
  /** The number of student records that failed to import. */
  failed: number;
  /** An array of objects detailing errors for specific rows in the file. */
  errors: Array<{ row: number; error: string }>;
}

/**
 * Defines the shape of the object returned by the useImportStudent hook.
 */
interface UseImportStudentReturn {
  /** Indicates whether a file is currently being uploaded. */
  isUploading: boolean;
  /** The upload progress percentage (0-100). */
  progress: number;
  /** The result of the import operation, or null if not yet completed. */
  importResult: ImportResult | null;
  /** An error message if the import process fails, or null otherwise. */
  error: string | null;
  /** Function to initiate the import process with a selected file. */
  importStudents: (file: File) => Promise<void>;
  /** Function to reset the hook's state to its initial values. */
  reset: () => void;
}

/**
 * Custom hook for managing the student data import process.
 * Provides state and functions to handle file validation, upload, progress tracking,
 * and result parsing for importing student data from a spreadsheet file.
 * @returns {UseImportStudentReturn} An object containing the state and functions for the import process.
 */
export const useImportStudent = (): UseImportStudentReturn => {
  const { token } = useAuth();
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  /**
   * Validates and uploads a student data file to the server.
   * It checks for file type, size, and token availability before proceeding.
   * Updates the state with progress, errors, and the final import result.
   * @param {File} file - The spreadsheet file to import.
   */
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
      const formData = new FormData();
      formData.append("file", file);

      const backendUrl =
        import.meta.env.VITE_BACKEND_URL ||
        "https://backend.man3kulonprogo.sch.id";

      const response = await fetch(`${backendUrl}/api/students/import`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Gagal mengimport data siswa");
      }

      const result: ImportResult = await response.json();
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

  /**
   * Resets all state variables to their initial values.
   */
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
