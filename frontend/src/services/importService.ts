/**
 * @fileoverview Service for handling the import of student data from a file.
 * This module provides a function to upload a file to the backend API for processing and importing student records.
 */

import { ImportResult } from "../types/importTypes";

const API_URL = `https://backend.man3kulonprogo.sch.id`;

/**
 * Sends a file to the backend to import student data.
 * @param {File} file - The file (e.g., CSV, Excel) containing student data.
 * @param {string} token - The authentication bearer token.
 * @returns {Promise<ImportResult>} A promise that resolves with the import result, including counts of successful and failed imports.
 * @throws {Error} Throws an error if the token is missing, the upload fails, or the response is invalid.
 */
export const importStudents = async (
  file: File,
  token: string
): Promise<ImportResult> => {
  if (!token) {
    throw new Error("Token tidak tersedia");
  }

  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch(`${API_URL}/api/students/import`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });

  if (!response.ok) {
    const errorData: any = await response.json();
    throw new Error(errorData.message || "Gagal mengimport data siswa");
  }

  const data: any = await response.json();

  if (!data.results) {
    throw new Error("Response tidak valid");
  }

  return data.results;
};
