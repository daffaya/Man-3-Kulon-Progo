import { apiFetch } from "../lib/api";
import type {
  KelulusanResult,
  KelulusanSummary,
} from "../types/kelulusanTypes";

const getAuthToken = (): string | null => localStorage.getItem("token");

const kelulusanApi = {
  /** Publik — cek kelulusan by NISN */
  cekKelulusan: async (
    nisn: string,
  ): Promise<{ success: boolean; data: KelulusanResult }> => {
    return await apiFetch(`/kelulusan/cek/${nisn.trim()}`);
  },

  /** Admin — get semua data */
  getAll: async (params?: {
    tahun_ajaran?: string;
    search?: string;
    page?: number;
    limit?: number;
  }): Promise<{
    data: KelulusanSummary[];
    total: number;
    page: number;
    limit: number;
  }> => {
    const token = getAuthToken();
    const query = new URLSearchParams(
      Object.entries(params ?? {})
        .filter(([, v]) => v !== undefined && v !== "")
        .map(([k, v]) => [k, String(v)]),
    ).toString();
    return await apiFetch(`/kelulusan${query ? `?${query}` : ""}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
  },

  /** Admin — get tahun ajaran tersedia */
  getTahunAjaran: async (): Promise<{ data: string[]; aktif: string }> => {
    const token = getAuthToken();
    return await apiFetch("/kelulusan/tahun-ajaran", {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
  },

  /** Admin — import Excel */
  importExcel: async (
    file: File,
    tahun_ajaran: string,
  ): Promise<{ success: boolean; message: string; inserted: number }> => {
    const token = getAuthToken();
    const formData = new FormData();
    formData.append("file", file);
    formData.append("tahun_ajaran", tahun_ajaran);

    const baseUrl =
      import.meta.env.VITE_BACKEND_URL ||
      "https://backend.man3kulonprogo.sch.id/api";

    const response = await fetch(`${baseUrl}/kelulusan/import`, {
      method: "POST",
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: formData,
    });

    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.error || "Gagal mengimpor data");
    }

    return response.json();
  },

  /** Admin — hapus data tahun ajaran */
  deleteByTahunAjaran: async (
    tahun_ajaran: string,
  ): Promise<{ success: boolean; message: string }> => {
    const token = getAuthToken();
    return await apiFetch(`/kelulusan/${encodeURIComponent(tahun_ajaran)}`, {
      method: "DELETE",
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
  },
};

export default kelulusanApi;
