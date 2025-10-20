import { Archive, Category } from "../types/archiveTypes";

export const fetchCategories = async (): Promise<Category[]> => {
  const response = await fetch(
    `${import.meta.env.VITE_BACKEND_API_URL}/api/archives/categories`
  );
  const data = await response.json();
  if (response.ok && data.success) {
    return data.data;
  }
  throw new Error(data.error || "Gagal memuat kategori");
};

export const fetchArchives = async (
  searchQuery: string,
  categoryId: string
): Promise<Archive[]> => {
  const query = new URLSearchParams();
  if (searchQuery) query.append("search", searchQuery);
  if (categoryId) query.append("categoryId", categoryId);
  const response = await fetch(
    `${import.meta.env.VITE_BACKEND_API_URL}/api/archives?${query.toString()}`
  );
  const data = await response.json();
  if (response.ok && data.success) {
    return data.data;
  }
  throw new Error(data.error || "Gagal memuat arsip");
};

export const downloadArchive = async (id: number, fileName: string) => {
  const response = await fetch(
    `${import.meta.env.VITE_BACKEND_API_URL}/api/archives/${id}/download`
  );
  if (!response.ok) {
    throw new Error("Gagal mendownload arsip");
  }
  const blob = await response.blob();
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", fileName);
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
};

export const deleteArchive = async (id: number, token: string | null) => {
  const response = await fetch(
    `${import.meta.env.VITE_BACKEND_API_URL}/api/archives/${id}`,
    {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    }
  );
  const data = await response.json();
  if (response.ok && data.success) {
    return;
  }
  throw new Error(data.error || "Gagal menghapus arsip");
};

export const updateArchive = async (
  id: number,
  formData: FormData,
  token: string | null
): Promise<Partial<Archive>> => {
  const response = await fetch(
    `${import.meta.env.VITE_BACKEND_API_URL}/api/archives/${id}`,
    {
      method: "PUT",
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    }
  );
  const data = await response.json();
  if (response.ok && data.success) {
    return data.data;
  }
  throw new Error(data.error || "Gagal mengedit arsip");
};
