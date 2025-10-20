import React, { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { File, LogIn, ArrowLeft, Plus } from "lucide-react"; // Tambah ArrowLeft
import Layout from "../../components/layout/Layout";
import AdminLayout from "../../components/layout/AdminLayout";
import { useNavigate, Link } from "react-router-dom"; // Tambah Link
import Filters from "../../components/archive/ArchiveFilter";
import ArchiveTable from "../../components/archive/ArchiveTable";
import { Archive, Category } from "../../types/archiveTypes";
import {
  fetchArchives,
  fetchCategories,
  downloadArchive,
  deleteArchive,
} from "../../api/archiveApi";
import Toast from "../../components/ui/Toast";
import { v4 as uuidv4 } from "uuid";

export const API_URL = import.meta.env.VITE_BACKEND_API_URL;
export const ALLOWED_ROLES = ["arsiparis", "super_admin"] as const;

const hasEditAccess = (isLoggedIn: boolean, role?: string): boolean =>
  isLoggedIn && role
    ? ALLOWED_ROLES.includes(role as (typeof ALLOWED_ROLES)[number])
    : false;

const ArchiveListPage: React.FC = () => {
  const { isLoggedIn, user, token } = useAuth();
  const navigate = useNavigate();
  const [archives, setArchives] = useState<Archive[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [archiveToDelete, setArchiveToDelete] = useState<number | null>(null);

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
    const loadArchives = async () => {
      setLoading(true);
      try {
        const data = await fetchArchives(searchQuery, categoryId);
        setArchives(data);
      } catch (err) {
        addToast((err as Error).message, "error");
      } finally {
        setLoading(false);
      }
    };
    loadArchives();
  }, [searchQuery, categoryId]);

  const handleDownloadClick = async (id: number, fileName: string) => {
    try {
      await downloadArchive(id, fileName);
    } catch (err) {
      addToast((err as Error).message, "error");
    }
  };

  const handleEditClick = (archive: Archive) => {
    if (!isAdminOrArsiparis) {
      addToast("Anda tidak memiliki akses untuk mengedit arsip", "error");
      if (!isLoggedIn) {
        navigate("/login", { state: { redirectTo: "/archives" } });
      }
      return;
    }
    navigate(`/atmin/editArchive/${archive.id}`, { state: { archive } });
  };

  const handleDeleteClick = (id: number) => {
    if (!isAdminOrArsiparis) {
      addToast("Anda tidak memiliki akses untuk menghapus arsip", "error");
      if (!isLoggedIn) {
        navigate("/login", { state: { redirectTo: "/archives" } });
      }
      return;
    }
    setArchiveToDelete(id);
    setShowConfirmation(true);
  };
  const confirmDelete = async () => {
    if (archiveToDelete === null) return;
    try {
      await deleteArchive(archiveToDelete, token);
      setArchives((prev) =>
        prev.filter((archive) => archive.id !== archiveToDelete)
      );
      addToast("Arsip berhasil dihapus", "success");
    } catch (err) {
      addToast((err as Error).message, "error");
    } finally {
      setShowConfirmation(false);
      setArchiveToDelete(null);
    }
  };

  const cancelDelete = () => {
    setShowConfirmation(false);
    setArchiveToDelete(null);
  };

  const SelectedLayout = isAdminOrArsiparis ? AdminLayout : Layout;

  return (
    <SelectedLayout>
      <div className="container mx-auto px-4 sm:px-6 py-8 fade-in">
        {isAdminOrArsiparis && (
          <Link
            to="/atmin"
            className="text-sm text-gray-600 dark:text-gray-400 hover:text-primary dark:hover:text-primary flex items-center mb-4 transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Kembali ke admin dashboard
          </Link>
        )}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
          <h1 className="text-3xl font-serif font-bold mb-4 sm:mb-0">
            Daftar Arsip
          </h1>
          {isAdminOrArsiparis && (
            <button
              onClick={() => navigate("/atmin/uploadArchive")}
              className="btn btn-primary flex items-center justify-center sm:justify-start"
            >
              <Plus size={18} className="mr-1" /> Tambah Arsip Baru
            </button>
          )}
        </div>
        <div className="bg-white dark:bg-semibackground rounded-xl shadow-md p-6">
          <Filters
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            categoryId={categoryId}
            setCategoryId={setCategoryId}
            categories={categories}
          />
          <ArchiveTable
            archives={archives}
            loading={loading}
            isAdminOrArsiparis={isAdminOrArsiparis}
            handleDownload={handleDownloadClick}
            handleEditClick={handleEditClick}
            handleDelete={handleDeleteClick}
          />
        </div>
        {!isAdminOrArsiparis && (
          <div className="mt-8 text-center">
            {isLoggedIn ? (
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Hanya arsiparis atau super admin yang dapat mengedit atau
                menghapus arsip.
              </p>
            ) : (
              <>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  Silakan login untuk mengedit atau menghapus arsip.
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
              </>
            )}
          </div>
        )}
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
      {showConfirmation && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full">
            <h3 className="text-xl font-bold mb-4">Konfirmasi Hapus</h3>
            <p className="mb-6 text-gray-600 dark:text-gray-400">
              Apakah Anda yakin ingin menghapus arsip ini? Tindakan ini tidak
              dapat dibatalkan.
            </p>
            <div className="flex justify-end space-x-4">
              <button onClick={cancelDelete} className="btn btn-secondary">
                Batal
              </button>
              <button onClick={confirmDelete} className="btn btn-danger">
                Hapus
              </button>
            </div>
          </div>
        </div>
      )}
    </SelectedLayout>
  );
};

export default ArchiveListPage;
