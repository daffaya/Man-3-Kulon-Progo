/**
 * @fileoverview Service for the two-step student import.
 * `previewImport` uploads the file and returns a classified preview (nothing
 * is written); `commitImport` applies a previewed batch.
 */

import { ImportActions, ImportCommitResult, ImportPreview } from "../types/importTypes";

const backendUrl =
  import.meta.env.VITE_BACKEND_URL || "https://backend.man3kulonprogo.sch.id";

const readError = async (response: Response, fallback: string) => {
  try {
    const data = await response.json();
    return data.error || data.message || fallback;
  } catch {
    return fallback;
  }
};

/**
 * Uploads an Excel file and returns the per-row preview for an academic year.
 * @param {File} file - The .xlsx/.xls file.
 * @param {number} academicYearId - Target academic year (classes are matched in this year).
 * @param {string} token - Authentication bearer token.
 */
export const previewImport = async (
  file: File,
  academicYearId: number,
  token: string,
): Promise<ImportPreview> => {
  if (!token) throw new Error("Token tidak tersedia");

  const formData = new FormData();
  formData.append("file", file);
  formData.append("academic_year_id", String(academicYearId));

  const response = await fetch(`${backendUrl}/api/students/import/preview`, {
    credentials: "include",
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  });

  if (!response.ok) {
    throw new Error(await readError(response, "Gagal membaca file import"));
  }
  return response.json();
};

/**
 * Applies a previewed batch.
 * @param {number} batchId - `batch_id` from the preview.
 * @param {ImportActions} actions - What to do with changed / moved rows.
 * @param {string} token - Authentication bearer token.
 */
export const commitImport = async (
  batchId: number,
  actions: ImportActions,
  token: string,
): Promise<ImportCommitResult> => {
  if (!token) throw new Error("Token tidak tersedia");

  const response = await fetch(`${backendUrl}/api/students/import/commit`, {
    credentials: "include",
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ batch_id: batchId, actions }),
  });

  if (!response.ok) {
    throw new Error(await readError(response, "Gagal menyimpan import"));
  }
  return response.json();
};
