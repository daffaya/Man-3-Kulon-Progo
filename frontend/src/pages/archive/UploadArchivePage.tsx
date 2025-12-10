/**
 * @fileoverview UploadArchivePage component for uploading new archive documents.
 * This component provides a form for users with appropriate permissions to upload
 * archive documents with details such as file, description, category, document number,
 * and document date. It includes validation for file type and size.
 */

import React, { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { Upload, ArrowLeft } from "lucide-react";
import AdminLayout from "../../components/layout/AdminLayout";
import { Navigate, useNavigate, Link } from "react-router-dom";
import { Category } from "../../types/archiveTypes";
import { fetchCategories } from "../../api/archiveApi";
import { useToast } from "../../contexts/ToastContext";

const backendUrl =
  import.meta.env.VITE_BACKEND_URL || "https://backend.man3kulonprogo.sch.id";
export const ALLOWED_ROLES = ["arsiparis", "super_admin"] as const;

/**
 * Checks if a user has edit access based on their login status and role.
 * @param {boolean} isLoggedIn - Whether the user is logged in.
 * @param {string | undefined} role - The user's role.
 * @returns {boolean} True if the user has edit access, false otherwise.
 */
const hasEditAccess = (isLoggedIn: boolean, role?: string): boolean =>
  isLoggedIn && role
    ? ALLOWED_ROLES.includes(role as (typeof ALLOWED_ROLES)[number])
    : false;

/**
 * Component for uploading new archive documents.
 * Handles form submission, file validation, and user permission checks.
 */
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

  /**
   * Handles file input change and validates file type and size.
   * @param {React.ChangeEvent<HTMLInputElement>} e - The file input change event.
   */
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0] || null;
    setFile(selectedFile);

    if (selectedFile) {
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
        e.target.value = "";
        return;
      }

      const maxSize = 10 * 1024 * 1024;
      if (selectedFile.size > maxSize) {
        showToast("Ukuran file tidak boleh lebih dari 10MB", "error");
        setFile(null);
        e.target.value = "";
        return;
      }
    }
  };

  /**
   * Handles form submission to upload an archive document.
   * @param {React.FormEvent} event - The form submission event.
   */
  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);

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
      showToast("Kategori wajib dipilih", "error");
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
      const response = await fetch(`${backendUrl}/api/archives`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await response.json();

      if (response.ok && data.success) {
        showToast(data.message || "Arsip berhasil diunggah", "success");
        setTimeout(() => {
          navigate("/archives", { replace: true });
        }, 1000);
      } else {
        showToast(data.error || "Gagal mengunggah arsip", "error");
      }
    } catch (err) {
      showToast("Terjadi kesalahan saat mengunggah arsip", "error");
    } finally {
      setLoading(false);
    }
  };

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
    <AdminLayout>
      <div className="container mx-auto px-4 sm:px-6 py-12 fade-in">
        <div className="flex items-center mb-6">
          <Link
            to="/archives"
            className="mr-4 text-secondary hover:text-accent transition-colors"
          >
            <ArrowLeft size={20} />
          </Link>
          <h1 className="text-3xl font-serif font-bold text-foreground">
            Unggah Arsip Baru
          </h1>
        </div>

        <div className="card p-6 max-w-4xl mx-auto">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label
                htmlFor="file"
                className="block text-sm font-medium text-foreground"
              >
                File (PDF/Word): <span className="text-error">*</span>
              </label>
              <input
                type="file"
                id="file"
                accept=".pdf,.doc,.docx"
                className="form-input w-full mt-1"
                onChange={handleFileChange}
                disabled={loading}
                required
              />
              <p className="mt-1 text-sm text-secondary">
                Maksimal 10MB. Hanya PDF atau Word (.doc, .docx)
              </p>
            </div>

            <div>
              <label
                htmlFor="description"
                className="block text-sm font-medium text-foreground"
              >
                Deskripsi: <span className="text-error">*</span>
              </label>
              <input
                type="text"
                id="description"
                className="form-input w-full mt-1"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                disabled={loading}
                required
              />
            </div>

            <div>
              <label
                htmlFor="category"
                className="block text-sm font-medium text-foreground"
              >
                Kategori: <span className="text-error">*</span>
              </label>
              <select
                id="category"
                className="form-input w-full mt-1"
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                disabled={loading}
                required
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
                Nomor Dokumen: <span className="text-error">*</span>
              </label>
              <input
                type="text"
                id="documentNumber"
                className="form-input w-full mt-1"
                value={documentNumber}
                onChange={(e) => setDocumentNumber(e.target.value)}
                disabled={loading}
                required
              />
            </div>

            <div>
              <label
                htmlFor="documentDate"
                className="block text-sm font-medium text-foreground"
              >
                Tanggal Dokumen: <span className="text-error">*</span>
              </label>
              <input
                type="date"
                id="documentDate"
                className="form-input w-full mt-1"
                value={documentDate}
                onChange={(e) => setDocumentDate(e.target.value)}
                disabled={loading}
                required
              />
            </div>

            <div className="flex justify-end gap-4 pt-4">
              <button
                type="button"
                onClick={() => navigate("/archives")}
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
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                    Mengunggah...
                  </>
                ) : (
                  <>
                    <Upload size={18} className="mr-2" />
                    Unggah Arsip
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </AdminLayout>
  );
};

export default UploadArchivePage;
