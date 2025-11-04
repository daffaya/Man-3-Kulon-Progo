import React, { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { Upload, LogIn, ArrowLeft, ChevronLeft } from "lucide-react";
import Layout from "../../components/layout/Layout";
import AdminLayout from "../../components/layout/AdminLayout";
import { Navigate, useNavigate, Link } from "react-router-dom";
import { Category } from "../../types/archiveTypes";
import { fetchCategories } from "../../api/archiveApi";
import { useToast } from "../../contexts/ToastContext";

export const API_URL = import.meta.env.VITE_BACKEND_API_URL;
export const ALLOWED_ROLES = ["arsiparis", "super_admin"] as const;

const hasEditAccess = (isLoggedIn: boolean, role?: string): boolean =>
  isLoggedIn && role
    ? ALLOWED_ROLES.includes(role as (typeof ALLOWED_ROLES)[number])
    : false;

const UploadArchivePage: React.FC = () => {
  const { isLoggedIn, user, token } = useAuth();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [file, setFile] = useState<File | null>(null);
  const [description, setDescription] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [documentNumber, setDocumentNumber] = useState("");
  const [documentDate, setDocumentDate] = useState("");
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);

  const isAdminOrArsiparis = hasEditAccess(isLoggedIn, user?.role);

  // Fetch categories
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const data = await fetchCategories();
        setCategories(data);
      } catch (err) {
        showToast((err as Error).message, "error");
      }
    };
    loadCategories();
  }, [showToast]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0] || null;
    setFile(selectedFile);

    if (selectedFile) {
      // Validasi jenis file
      const allowedTypes = [
        "application/pdf",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      ];
      if (!allowedTypes.includes(selectedFile.type)) {
        showToast(
          "Hanya file PDF atau Word (.doc, .docx) yang diperbolehkan",
          "error"
        );
        setFile(null);
        const fileInput = e.target as HTMLInputElement;
        fileInput.value = ""; // Reset input
        return;
      }

      // Validasi ukuran file (10MB = 10 * 1024 * 1024 bytes)
      const maxSize = 10 * 1024 * 1024;
      if (selectedFile.size > maxSize) {
        showToast("Ukuran file tidak boleh lebih dari 10MB", "error");
        setFile(null);
        const fileInput = e.target as HTMLInputElement;
        fileInput.value = ""; // Reset input
        return;
      }
    }
  };

  // Handle form submit
  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);

    if (!isLoggedIn) {
      showToast("Silakan login untuk mengunggah arsip", "error");
      navigate("/login", { state: { redirectTo: "/atmin/uploadArchive" } });
      setLoading(false);
      return;
    }

    if (!isAdminOrArsiparis) {
      showToast("Anda tidak memiliki akses untuk mengunggah arsip", "error");
      setLoading(false);
      return;
    }

    if (!file) {
      showToast("File wajib diisi", "error");
      setLoading(false);
      return;
    }
    if (!description.trim()) {
      showToast("Deskripsi wajib diisi", "error");
      setLoading(false);
      return;
    }
    if (!categoryId) {
      showToast("Kategori wajib diisi", "error");
      setLoading(false);
      return;
    }
    if (!documentNumber.trim()) {
      showToast("Nomor dokumen wajib diisi", "error");
      setLoading(false);
      return;
    }
    if (!documentDate) {
      showToast("Tanggal dokumen wajib diisi", "error");
      setLoading(false);
      return;
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("description", description);
    formData.append("category_id", categoryId);
    formData.append("document_number", documentNumber);
    formData.append("document_date", documentDate);

    try {
      const response = await fetch(`${API_URL}/api/archives`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await response.json();

      if (response.ok && data.success) {
        showToast(data.message || "Arsip berhasil diunggah", "success");
        // Reset form
        setFile(null);
        setDescription("");
        setCategoryId("");
        setDocumentNumber("");
        setDocumentDate("");
        const fileInput = document.getElementById("file") as HTMLInputElement;
        if (fileInput) fileInput.value = "";
        setTimeout(() => {
          navigate("/archives", { replace: true });
        }, 1000);
      } else {
        // Tampilkan pesan error spesifik dari backend
        showToast(data.error || "Gagal mengunggah arsip", "error");
      }
    } catch (err) {
      showToast("Terjadi kesalahan saat mengunggah arsip", "error");
    } finally {
      setLoading(false);
    }
  };

  const SelectedLayout = isAdminOrArsiparis ? AdminLayout : Layout;

  if (!isLoggedIn) {
    return (
      <Navigate
        to="/login"
        state={{ redirectTo: "/atmin/uploadArchive" }}
        replace
      />
    );
  }
  if (!isAdminOrArsiparis) {
    return <Navigate to="/archives" replace />;
  }

  return (
    <SelectedLayout>
      <div className="container mx-auto px-4 sm:px-6 py-12 fade-in">
        {isAdminOrArsiparis && (
          <div className="flex items-center mb-4">
            {" "}
            <Link
              to="/archives"
              className="mr-4 text-gray-600 dark:text-gray-400 hover:text-accent dark:hover:text-accent transition-colors"
            >
              <ChevronLeft size={20} />{" "}
            </Link>{" "}
            <h1 className="text-3xl font-serif font-bold">
              Tambahkan Arsip Baru
            </h1>{" "}
          </div>
        )}
        <div className="bg-white dark:bg-semibackground rounded-xl shadow-md p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="file"
                className="block text-sm font-medium text-foreground"
              >
                File (PDF/Word): <span className="text-red-500">*</span>
              </label>
              <input
                type="file"
                id="file"
                accept=".pdf,.doc,.docx"
                className="form-input w-full mt-1"
                onChange={handleFileChange}
                disabled={loading}
              />
              <p className="text-sm text-gray-500 mt-1">
                Hanya file PDF atau Word (.doc, .docx), maksimum 10MB.
              </p>
            </div>
            <div>
              <label
                htmlFor="description"
                className="block text-sm font-medium text-foreground"
              >
                Deskripsi: <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="description"
                className="form-input w-full mt-1"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                disabled={loading}
              />
            </div>
            <div>
              <label
                htmlFor="category"
                className="block text-sm font-medium text-foreground"
              >
                Kategori: <span className="text-red-500">*</span>
              </label>
              <select
                id="category"
                className="form-input w-full mt-1"
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                disabled={loading}
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
                htmlFor="documentNumber"
                className="block text-sm font-medium text-foreground"
              >
                Nomor Dokumen: <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="documentNumber"
                className="form-input w-full mt-1"
                value={documentNumber}
                onChange={(e) => setDocumentNumber(e.target.value)}
                disabled={loading}
              />
            </div>
            <div>
              <label
                htmlFor="documentDate"
                className="block text-sm font-medium text-foreground"
              >
                Tanggal Dokumen: <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                id="documentDate"
                className="form-input w-full mt-1"
                value={documentDate}
                onChange={(e) => setDocumentDate(e.target.value)}
                disabled={loading}
              />
            </div>
            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={() => navigate("/archives", { replace: true })}
                className="btn btn-secondary"
                disabled={loading}
              >
                Batal
              </button>
              <button
                type="submit"
                className="btn btn-primary flex items-center"
                disabled={loading}
              >
                {loading ? (
                  "Uploading..."
                ) : (
                  <>
                    <Upload className="h-5 w-5 mr-2" />
                    Upload
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </SelectedLayout>
  );
};

export default UploadArchivePage;
