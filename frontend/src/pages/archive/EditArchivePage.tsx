import React, { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import {
  useNavigate,
  useParams,
  useLocation,
  Navigate,
  Link,
} from "react-router-dom";
import Layout from "../../components/layout/Layout";
import { Category, Archive } from "../../types/archiveTypes";
import { fetchCategories, updateArchive } from "../../api/archiveApi";
import { ALLOWED_ROLES } from "./ArchiveListPage";
import Toast from "../../components/ui/Toast";
import { v4 as uuidv4 } from "uuid";
import { ChevronLeft } from "lucide-react";

const hasEditAccess = (isLoggedIn: boolean, role?: string): boolean =>
  isLoggedIn && role
    ? ALLOWED_ROLES.includes(role as (typeof ALLOWED_ROLES)[number])
    : false;

const EditArchivePage: React.FC = () => {
  const { isLoggedIn, user, token } = useAuth();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const archive = location.state?.archive as Archive | undefined;

  const [categories, setCategories] = useState<Category[]>([]);
  const [editFile, setEditFile] = useState<File | null>(null);
  const [editDescription, setEditDescription] = useState("");
  const [editCategoryId, setEditCategoryId] = useState("");
  const [editDocumentNumber, setEditDocumentNumber] = useState("");
  const [editDocumentDate, setEditDocumentDate] = useState("");
  const [toasts, setToasts] = useState<
    { id: string; message: string; type: "success" | "error" }[]
  >([]);
  const [loading, setLoading] = useState(false);

  const isAdminOrArsiparis = hasEditAccess(isLoggedIn, user?.role);

  const addToast = (message: string, type: "success" | "error") => {
    const id = uuidv4();
    setToasts((prev) => [...prev, { id, message, type }]);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  };

  if (!isLoggedIn) {
    return <Navigate to="/login" state={{ redirectTo: "/archives" }} replace />;
  }
  if (!isAdminOrArsiparis) {
    return <Navigate to="/archives" replace />;
  }
  if (!archive || !id) {
    return <Navigate to="/archives" replace />;
  }

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const data = await fetchCategories();
        setCategories(data);
      } catch (err) {
        addToast((err as Error).message, "error");
      }
    };
    loadCategories();
  }, []);

  useEffect(() => {
    let initialDate = archive.document_date || "";
    if (initialDate.includes("T")) {
      initialDate = initialDate.split("T")[0];
    }
    setEditDescription(archive.description || "");
    setEditCategoryId(
      archive.category_name
        ? categories
            .find((cat) => cat.name === archive.category_name)
            ?.id.toString() || ""
        : ""
    );
    setEditDocumentNumber(archive.document_number || "");
    setEditDocumentDate(initialDate);
  }, [archive, categories]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setToasts([]);
    setLoading(true);

    const formData = new FormData();
    if (editFile) formData.append("file", editFile);
    formData.append("description", editDescription);
    formData.append("category_id", editCategoryId);
    formData.append("document_number", editDocumentNumber);
    if (editDocumentDate) {
      formData.append("document_date", editDocumentDate);
    }

    try {
      await updateArchive(parseInt(id), formData, token);
      addToast("Arsip berhasil diedit", "success");
      setTimeout(() => {
        navigate("/archives", {
          replace: true,
          state: { successMessage: "Arsip berhasil diedit" },
        });
      }, 2000);
    } catch (err) {
      addToast((err as Error).message, "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="container max-w-6xl mx-auto px-4 sm:px-6 py-12 fade-in">
        <div className="mb-8">
          {" "}
          <div className="flex items-center">
            {" "}
            <Link
              to="/archives"
              className="mr-4 text-gray-600 dark:text-gray-400 hover:text-accent dark:hover:text-accent transition-colors"
            >
              <ChevronLeft size={20} />{" "}
            </Link>{" "}
            <h1 className="text-3xl font-serif font-bold">Edit Arsip </h1>{" "}
          </div>{" "}
        </div>
        <div className="bg-white dark:bg-semibackground rounded-xl shadow-md p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
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
                disabled={loading}
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
                disabled={loading}
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
                disabled={loading}
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
                className="btn btn-primary"
                disabled={loading}
              >
                {loading ? "Menyimpan..." : "Simpan"}
              </button>
            </div>
          </form>
          {toasts.map((toast, index) => (
            <Toast
              key={toast.id}
              message={toast.message}
              type={toast.type}
              isVisible={true}
              onClose={() => removeToast(toast.id)}
              index={index}
            />
          ))}
        </div>
      </div>
    </Layout>
  );
};

export default EditArchivePage;
