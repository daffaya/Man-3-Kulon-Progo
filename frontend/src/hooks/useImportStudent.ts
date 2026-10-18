/**
 * @fileoverview Hook for the two-step student import workflow:
 * idle -> (preview) -> previewed -> (commit) -> done.
 */

import { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { commitImport, previewImport } from "../services/importService";
import {
  ImportActions,
  ImportCommitResult,
  ImportPreview,
} from "../types/importTypes";

const VALID_TYPES = [
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", // .xlsx
  "application/vnd.ms-excel", // .xls
];

interface UseImportStudentReturn {
  /** True while a preview or commit request is running. */
  isWorking: boolean;
  preview: ImportPreview | null;
  commitResult: ImportCommitResult["result"] | null;
  error: string | null;
  /** Uploads and classifies a file for the given academic year. */
  runPreview: (file: File, academicYearId: number) => Promise<void>;
  /** Applies the previewed batch with the chosen actions. */
  runCommit: (actions: ImportActions) => Promise<boolean>;
  reset: () => void;
}

export const useImportStudent = (): UseImportStudentReturn => {
  const { token } = useAuth();
  const [isWorking, setIsWorking] = useState(false);
  const [preview, setPreview] = useState<ImportPreview | null>(null);
  const [commitResult, setCommitResult] = useState<
    ImportCommitResult["result"] | null
  >(null);
  const [error, setError] = useState<string | null>(null);

  const runPreview = async (file: File, academicYearId: number) => {
    if (!token) {
      setError("Token tidak tersedia. Silakan login kembali.");
      return;
    }
    if (!file) {
      setError("Pilih file terlebih dahulu");
      return;
    }
    if (!VALID_TYPES.includes(file.type)) {
      setError("Format file tidak valid. Hanya .xlsx dan .xls yang diperbolehkan");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError("Ukuran file terlalu besar. Maksimal 5MB");
      return;
    }

    setIsWorking(true);
    setError(null);
    setPreview(null);
    setCommitResult(null);
    try {
      setPreview(await previewImport(file, academicYearId, token));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan saat membaca file");
    } finally {
      setIsWorking(false);
    }
  };

  const runCommit = async (actions: ImportActions): Promise<boolean> => {
    if (!token || !preview) return false;
    setIsWorking(true);
    setError(null);
    try {
      const out = await commitImport(preview.batch_id, actions, token);
      setCommitResult(out.result);
      setPreview(null);
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan saat menyimpan import");
      return false;
    } finally {
      setIsWorking(false);
    }
  };

  const reset = () => {
    setIsWorking(false);
    setPreview(null);
    setCommitResult(null);
    setError(null);
  };

  return { isWorking, preview, commitResult, error, runPreview, runCommit, reset };
};
