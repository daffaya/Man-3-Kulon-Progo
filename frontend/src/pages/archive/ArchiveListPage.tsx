import React, { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import {
  Search,
  Download,
  Edit,
  Trash,
  LogIn,
  RefreshCw,
  File,
} from "lucide-react";
import Layout from "../../components/layout/Layout";
import { useNavigate } from "react-router-dom";
import { truncateText } from "../../lib/utils";

interface Category {
  id: number;
  name: string;
  description: string | null;
}

interface Archive {
  id: number;
  file_name: string;
  description: string | null;
  category_name: string | null;
  document_number: string | null;
  document_date: string | null;
  upload_date: string;
}

const ArchiveListPage: React.FC = () => {
  const { isLoggedIn, user, token } = useAuth();
  const navigate = useNavigate();
  const [archives, setArchives] = useState<Archive[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [editArchive, setEditArchive] = useState<Archive | null>(null);
  const [editFile, setEditFile] = useState<File | null>(null);
  const [editDescription, setEditDescription] = useState("");
  const [editCategoryId, setEditCategoryId] = useState("");
  const [editDocumentNumber, setEditDocumentNumber] = useState("");
  const [editDocumentDate, setEditDocumentDate] = useState("");

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch(
          `${import.meta.env.VITE_BACKEND_API_URL}/api/archives/categories`
        );
        const data = await response.json();
        if (response.ok && data.success) {
          setCategories(data.data);
        } else {
          setError(data.error || "Gagal memuat kategori");
        }
      } catch (err) {
        setError("Terjadi kesalahan saat memuat kategori");
      }
    };
    fetchCategories();
  }, []);

  // Fetch archives
  useEffect(() => {
    const fetchArchives = async () => {
      setLoading(true);
      try {
        const query = new URLSearchParams();
        if (searchQuery) query.append("search", searchQuery);
        if (categoryId) query.append("categoryId", categoryId);
        const response = await fetch(
          `${
            import.meta.env.VITE_BACKEND_API_URL
          }/api/archives?${query.toString()}`
        );
        const data = await response.json();
        if (response.ok && data.success) {
          setArchives(data.data);
        } else {
          setError(data.error || "Gagal memuat arsip");
        }
      } catch (err) {
        setError("Terjadi kesalahan saat memuat arsip");
      } finally {
        setLoading(false);
      }
    };
    fetchArchives();
  }, [searchQuery, categoryId]);

  const handleDownload = async (id: number, fileName: string) => {
    try {
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
    } catch (err) {
      setError("Gagal mendownload arsip");
    }
  };

  const handleEditClick = (archive: Archive) => {
    if (!isLoggedIn) {
      setError("Silakan login untuk mengedit arsip");
      navigate("/login", { state: { redirectTo: "/archives" } });
      return;
    }
    if (!["arsiparis", "super_admin"].includes(user?.role || "")) {
      setError("Anda tidak memiliki akses untuk mengedit arsip");
      return;
    }
    setEditArchive(archive);
    setEditDescription(archive.description || "");
    setEditCategoryId(
      archive.category_name
        ? categories
            .find((cat) => cat.name === archive.category_name)
            ?.id.toString() || ""
        : ""
    );
    setEditDocumentNumber(archive.document_number || "");
    setEditDocumentDate(archive.document_date || "");
  };

  const handleDelete = async (id: number) => {
    if (!isLoggedIn) {
      setError("Silakan login untuk menghapus arsip");
      navigate("/login", { state: { redirectTo: "/archives" } });
      return;
    }
    if (!["arsiparis", "super_admin"].includes(user?.role || "")) {
      setError("Anda tidak memiliki akses untuk menghapus arsip");
      return;
    }
    setError(null);
    setSuccess(null);
    if (!window.confirm("Yakin ingin menghapus arsip ini?")) return;
    try {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_API_URL}/api/archives/${id}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const data = await response.json();
      if (response.ok && data.success) {
        setArchives(archives.filter((archive) => archive.id !== id));
        setSuccess("Arsip berhasil dihapus");
      } else {
        setError(data.error || "Gagal menghapus arsip");
      }
    } catch (err) {
      setError("Terjadi kesalahan saat menghapus arsip");
    }
  };

  const handleEditSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!editArchive) return;
    setError(null);
    setSuccess(null);
    setLoading(true);

    if (!isLoggedIn) {
      setError("Silakan login untuk mengedit arsip");
      navigate("/login", { state: { redirectTo: "/archives" } });
      setLoading(false);
      return;
    }
    if (!["arsiparis", "super_admin"].includes(user?.role || "")) {
      setError("Anda tidak memiliki akses untuk mengedit arsip");
      setLoading(false);
      return;
    }

    const formData = new FormData();
    if (editFile) formData.append("file", editFile);
    formData.append("description", editDescription);
    formData.append("category_id", editCategoryId);
    formData.append("document_number", editDocumentNumber);
    formData.append("document_date", editDocumentDate);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_API_URL}/api/archives/${
          editArchive.id
        }`,
        {
          method: "PUT",
          headers: { Authorization: `Bearer ${token}` },
          body: formData,
        }
      );
      const data = await response.json();
      if (response.ok && data.success) {
        setArchives(
          archives.map((archive) =>
            archive.id === editArchive.id
              ? {
                  ...archive,
                  description: editDescription,
                  category_name:
                    categories.find(
                      (cat) => cat.id.toString() === editCategoryId
                    )?.name || null,
                  document_number: editDocumentNumber,
                  document_date: editDocumentDate,
                }
              : archive
          )
        );
        setSuccess("Arsip berhasil diedit");
        setEditArchive(null);
        setEditFile(null);
        setEditDescription("");
        setEditCategoryId("");
        setEditDocumentNumber("");
        setEditDocumentDate("");
      } else {
        setError(data.error || "Gagal mengedit arsip");
      }
    } catch (err) {
      setError("Terjadi kesalahan saat mengedit arsip");
    } finally {
      setLoading(false);
    }
  };

  const isAdminOrArsiparis =
    isLoggedIn &&
    user &&
    (user.role === "super_admin" || user.role === "arsiparis");

  return (
    <Layout>
      <div className="container mx-auto px-4 sm:px-6 py-12 fade-in">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
          <h1 className="text-3xl font-serif font-bold mb-4 sm:mb-0">
            Daftar Arsip
          </h1>
          {isAdminOrArsiparis && (
            <button
              onClick={() => navigate("/atmin/uploadArchive")}
              className="btn btn-primary flex items-center justify-center sm:justify-start"
            >
              <File size={18} className="mr-1" /> Unggah Arsip Baru
            </button>
          )}
        </div>
        <div className="bg-white dark:bg-semibackground rounded-xl shadow-md p-6">
          {!isLoggedIn && (
            <div className="mb-6 text-center">
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Silakan login untuk mengedit atau menghapus arsip
              </p>
              <button
                onClick={() =>
                  navigate("/login", { state: { redirectTo: "/archives" } })
                }
                className="btn btn-primary flex items-center justify-center mx-auto w-fit"
              >
                <LogIn className="h-5 w-5 mr-2" />
                Login Sekarang
              </button>
            </div>
          )}
          {error && (
            <p className="text-red-500 text-sm mb-4 text-center">{error}</p>
          )}
          {success && (
            <p className="text-green-500 text-sm mb-4 text-center">{success}</p>
          )}
          <div className="mb-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="search"
                className="block text-sm font-medium mb-1"
              >
                Cari Arsip
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  id="search"
                  placeholder="Cari nama file, deskripsi..."
                  className="form-input w-full pl-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
            <div>
              <label
                htmlFor="category"
                className="block text-sm font-medium mb-1"
              >
                Filter Berdasarkan Kategori
              </label>
              <select
                id="category"
                className="form-input w-full"
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
              >
                <option value="">Semua Kategori</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
          {loading ? (
            <div className="text-center py-12">
              <RefreshCw
                size={40}
                className="mx-auto animate-spin text-accent"
              />
              <p className="mt-4 text-gray-600 dark:text-gray-400">
                Memuat arsip...
              </p>
            </div>
          ) : archives.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-xl text-gray-600 dark:text-gray-400">
                Tidak ada arsip yang ditemukan
              </p>
              {isAdminOrArsiparis && (
                <button
                  onClick={() => navigate("/atmin/uploadArchive")}
                  className="mt-4 inline-block btn btn-primary flex items-center justify-center mx-auto w-fit"
                >
                  <File size={18} className="mr-1" />
                  Unggah Arsip Pertama
                </button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-800">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-800">
                <thead className="bg-gray-50 dark:bg-gray-900">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Nama File
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Kategori
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Deskripsi
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Nomor Dokumen
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Tanggal Dokumen
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Aksi
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {archives.map((archive) => (
                    <tr
                      key={archive.id}
                      className="hover:bg-gray-50 dark:hover:bg-gray-700"
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-foreground">
                        {truncateText(archive.file_name, 25)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {archive.category_name || "-"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {archive.description || "-"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {archive.document_number || "-"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {archive.document_date
                          ? new Date(archive.document_date).toLocaleDateString()
                          : "-"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end space-x-2">
                          <button
                            onClick={() =>
                              handleDownload(archive.id, archive.file_name)
                            }
                            className="text-accent hover:text-hover dark:text-accent dark:hover:text-hover"
                            aria-label="Download archive"
                          >
                            <Download size={18} />
                          </button>
                          {isAdminOrArsiparis && (
                            <>
                              <button
                                onClick={() => handleEditClick(archive)}
                                className="text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                                aria-label="Edit archive"
                              >
                                <Edit size={18} />
                              </button>
                              <button
                                onClick={() => handleDelete(archive.id)}
                                className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                                aria-label="Delete archive"
                              >
                                <Trash size={18} />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
        {editArchive && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full">
              <h3 className="text-xl font-bold mb-4">Edit Arsip</h3>
              <form onSubmit={handleEditSubmit} className="space-y-4">
                <div>
                  <label
                    htmlFor="editFile"
                    className="block text-sm font-medium text-foreground"
                  >
                    File (PDF/Word, kosongkan jika tidak diganti):
                  </label>
                  <input
                    type="file"
                    id="editFile"
                    accept=".pdf,.doc,.docx"
                    className="form-input w-full mt-1"
                    onChange={(e) => setEditFile(e.target.files?.[0] || null)}
                  />
                </div>
                <div>
                  <label
                    htmlFor="editDescription"
                    className="block text-sm font-medium text-foreground"
                  >
                    Deskripsi:
                  </label>
                  <input
                    type="text"
                    id="editDescription"
                    className="form-input w-full mt-1"
                    value={editDescription}
                    onChange={(e) => setEditDescription(e.target.value)}
                  />
                </div>
                <div>
                  <label
                    htmlFor="editCategory"
                    className="block text-sm font-medium text-foreground"
                  >
                    Kategori:
                  </label>
                  <select
                    id="editCategory"
                    className="form-input w-full mt-1"
                    value={editCategoryId}
                    onChange={(e) => setEditCategoryId(e.target.value)}
                  >
                    <option value="">Pilih Kategori</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label
                    htmlFor="editDocumentNumber"
                    className="block text-sm font-medium text-foreground"
                  >
                    Nomor Dokumen:
                  </label>
                  <input
                    type="text"
                    id="editDocumentNumber"
                    className="form-input w-full mt-1"
                    value={editDocumentNumber}
                    onChange={(e) => setEditDocumentNumber(e.target.value)}
                  />
                </div>
                <div>
                  <label
                    htmlFor="editDocumentDate"
                    className="block text-sm font-medium text-foreground"
                  >
                    Tanggal Dokumen:
                  </label>
                  <input
                    type="date"
                    id="editDocumentDate"
                    className="form-input w-full mt-1"
                    value={editDocumentDate}
                    onChange={(e) => setEditDocumentDate(e.target.value)}
                  />
                </div>
                <div className="flex justify-end space-x-4">
                  <button
                    type="button"
                    onClick={() => setEditArchive(null)}
                    className="btn btn-secondary"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={loading}
                  >
                    {loading ? "Menyimpan..." : "Simpan"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default ArchiveListPage;
