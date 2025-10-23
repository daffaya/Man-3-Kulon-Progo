// src/services/importService.ts
import { ImportResult } from "../types/importTypes";

const API_URL = import.meta.env.VITE_BACKEND_API_URL;

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
