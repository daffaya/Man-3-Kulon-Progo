/**
 * @fileoverview ArchiveManagementPage component for displaying and managing archive files.
 * This component provides functionality to view, filter, download, edit, and delete archives.
 * It displays different UI elements based on user roles, with admin/arsiparis users having
 * additional permissions to modify archives.
 */

import React, { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { LogIn, ArrowLeft, Plus } from "lucide-react";
import Layout from "../../components/layout/Layout";
import AdminLayout from "../../components/layout/AdminLayout";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import Filters from "../../components/archive/ArchiveFilter";
import ArchiveTable from "../../components/tables/ArchiveTable";
import ArchiveAdminTable from "../../components/tables/ArchiveAdminTable";
import {
  ConfirmDialog,
  EmptyState,
  FilterSelect,
  PageHead,
  SearchBox,
  TableFooter,
  rangeText,
} from "../../components/admin/ListKit";
import { Archive, Category } from "../../types/archiveTypes";
import {
  fetchArchives,
  fetchCategories,
  downloadArchive,
  deleteArchive,
} from "../../api/archiveApi";
import { useToast } from "../../contexts/ToastContext";

export const ALLOWED_ROLES = ["arsiparis", "super_admin"] as const;

/**
 * Checks if the user has edit access based on their login status and role.
 * @param {boolean} isLoggedIn - Whether the user is logged in.
 * @param {string} [role] - The user's role.
 * @returns {boolean} True if the user has edit access, false otherwise.
 */
const hasEditAccess = (isLoggedIn: boolean, role?: string): boolean =>
  isLoggedIn && role
    ? ALLOWED_ROLES.includes(role as (typeof ALLOWED_ROLES)[number])
    : false;

/**
 * Component that renders the archive management page with filtering, viewing,
 * and CRUD operations for archive files. The UI adapts based on user permissions.
 */
const ArchiveManagementPage: React.FC = () => {
  const { isLoggedIn, user, token } = useAuth();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [archives, setArchives] = useState<Archive[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [urlParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(urlParams.get("q") ?? "");
  const [categoryId, setCategoryId] = useState("");
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [archiveToDelete, setArchiveToDelete] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const PER_PAGE = 10;

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

  useEffect(() => {
    const loadArchives = async () => {
      setLoading(true);
      try {
        const data = await fetchArchives(searchQuery, categoryId);
        setArchives(data);
      } catch (err) {
        showToast((err as Error).message, "error");
      } finally {
        setLoading(false);
      }
    };
    loadArchives();
  }, [searchQuery, categoryId, showToast]);

  /**
   * Handles the download of an archive file.
   * @param {number} id - The ID of the archive to download.
   * @param {string} fileName - The name of the file to download.
   */
  const handleDownloadClick = async (id: number, fileName: string) => {
    try {
      await downloadArchive(id, fileName);
    } catch (err) {
      showToast((err as Error).message, "error");
    }
  };

  /**
   * Handles navigation to the edit page for an archive.
   * Checks user permissions before allowing edit access.
   * @param {Archive} archive - The archive object to edit.
   */
  const handleEditClick = (archive: Archive) => {
    if (!isAdminOrArsiparis) {
      showToast("Anda tidak memiliki akses untuk mengedit arsip", "error");
      if (!isLoggedIn) {
        navigate("/login", { state: { redirectTo: "/archives" } });
      }
      return;
    }
    navigate(`/atmin/archives/:id/edit`, { state: { archive } });
  };

  /**
   * Handles the initiation of the delete process for an archive.
   * Shows a confirmation dialog and checks user permissions.
   * @param {number} id - The ID of the archive to delete.
   */
  const handleDeleteClick = (id: number) => {
    if (!isAdminOrArsiparis) {
      showToast("Anda tidak memiliki akses untuk menghapus arsip", "error");
      if (!isLoggedIn) {
        navigate("/login", { state: { redirectTo: "/archives" } });
      }
      return;
    }
    setArchiveToDelete(id);
    setShowConfirmation(true);
  };

  /**
   * Executes the actual deletion of an archive after confirmation.
   */
  const confirmDelete = async () => {
    if (archiveToDelete === null) return;
    try {
      await deleteArchive(archiveToDelete, token);
      setArchives((prev) =>
        prev.filter((archive) => archive.id !== archiveToDelete),
      );
      showToast("Arsip berhasil dihapus", "success");
    } catch (err) {
      showToast((err as Error).message, "error");
    } finally {
      setShowConfirmation(false);
      setArchiveToDelete(null);
    }
  };

  /**
   * Cancels the delete operation and closes the confirmation dialog.
   */
  const cancelDelete = () => {
    setShowConfirmation(false);
    setArchiveToDelete(null);
  };

  useEffect(() => setPage(1), [searchQuery, categoryId]);
  useEffect(() => {
    const q = urlParams.get("q");
    if (q !== null) setSearchQuery(q);
  }, [urlParams]);

  if (isAdminOrArsiparis) {
    const totalPages = Math.max(1, Math.ceil(archives.length / PER_PAGE));
    const cur = Math.min(page, totalPages);
    const rows = archives.slice((cur - 1) * PER_PAGE, cur * PER_PAGE);
    const filtered = !!searchQuery || !!categoryId;
    const resetFilters = () => {
      setSearchQuery("");
      setCategoryId("");
    };
    return (
      <AdminLayout>
        <div className="a-pg">
          <PageHead title="Arsip Dokumen" sub="Surat, SK, dan dokumen resmi madrasah.">
            <Link to="/atmin/uploadArchive" className="a-btn a-p">
              <Plus size={18} />
              Tambah Arsip
            </Link>
          </PageHead>

          <div className="a-cd" style={{ padding: 0 }}>
            <div className="a-tl">
              <SearchBox
                value={searchQuery}
                onChange={setSearchQuery}
                placeholder="Cari nama file, deskripsi…"
                label="Cari arsip"
              />
              <FilterSelect
                value={categoryId === "" ? "all" : categoryId}
                onChange={(v) => setCategoryId(v === "all" ? "" : v)}
                label="Semua kategori"
                options={categories.map((c) => [String(c.id), c.name])}
              />
            </div>

            {!loading && archives.length === 0 ? (
              <EmptyState
                filtered={filtered}
                entity="arsip"
                hint="Unggah dokumen pertama untuk mulai mengarsipkan."
                onReset={resetFilters}
              >
                <Link to="/atmin/uploadArchive" className="a-btn a-p">
                  <Plus size={18} />
                  Tambah Arsip
                </Link>
              </EmptyState>
            ) : (
              <ArchiveAdminTable
                archives={rows}
                loading={loading}
                onDownload={handleDownloadClick}
                onEdit={handleEditClick}
                onDelete={handleDeleteClick}
              />
            )}

            {archives.length > 0 && (
              <TableFooter
                text={filtered ? `${archives.length} hasil ditemukan` : rangeText(cur, PER_PAGE, archives.length, "arsip")}
                page={cur}
                totalPages={totalPages}
                loading={loading}
                onPrev={() => setPage(cur - 1)}
                onNext={() => setPage(cur + 1)}
              />
            )}
          </div>
        </div>

        <ConfirmDialog
          open={showConfirmation}
          title="Hapus arsip?"
          body="Arsip yang dihapus tidak dapat dikembalikan."
          onCancel={cancelDelete}
          onConfirm={confirmDelete}
        />
      </AdminLayout>
    );
  }

  const SelectedLayout = Layout;

  return (
    <SelectedLayout>
      <div className="container mx-auto px-4 sm:px-6 py-8 fade-in">
        {isAdminOrArsiparis && (
          <Link
            to="/atmin"
            className="text-sm text-secondary hover:text-accent flex items-center mb-4 transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Kembali ke admin dashboard
          </Link>
        )}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
          <h1 className="text-3xl font-serif font-bold mb-4 sm:mb-0 text-foreground">
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
        <div className="card p-6">
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
              <p className="text-secondary mb-4">
                Hanya arsiparis atau super admin yang dapat mengedit atau
                menghapus arsip.
              </p>
            ) : (
              <>
                <p className="text-secondary mb-4">
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
      </div>
      {showConfirmation && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="card p-6 max-w-md w-full">
            <h3 className="text-xl font-bold mb-4 text-foreground">
              Konfirmasi Hapus
            </h3>
            <p className="mb-6 text-secondary">
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

export default ArchiveManagementPage;
