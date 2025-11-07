// frontend/src/pages/admin/user/UserManagementPage.tsx

import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, RefreshCw, X, ArrowLeft, Users, Search } from "lucide-react";
import { useAuth } from "../../../contexts/AuthContext";
import { useToast } from "../../../contexts/ToastContext";
import AdminLayout from "../../../components/layout/AdminLayout";
import UserTable from "../../../components/tables/UserTable";
import UserManagementForm from "../../../components/forms/auth/UserManagementForm";
import userApi from "../../../api/userApi";
import { User, UserFormData } from "../../../types/userTypes";

const UserManagementPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, isLoggedIn } = useAuth();
  const { showToast } = useToast();

  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [formLoading, setFormLoading] = useState(false);
  const [keyword, setKeyword] = useState("");
  const [selectedRole, setSelectedRole] = useState<string>("all");
  const [debouncedKeyword, setDebouncedKeyword] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [userToDelete, setUserToDelete] = useState<number | null>(null);

  const usersPerPage = 10;

  // Redirect if not super_admin
  useEffect(() => {
    if (!isLoggedIn) {
      navigate("/login", { state: { redirectTo: "/atmin/users" } });
      return;
    }
    if (user?.role !== "super_admin") {
      showToast(
        "Akses ditolak. Hanya Super Admin yang dapat mengelola user.",
        "error"
      );
      navigate("/atmin");
      return;
    }
  }, [isLoggedIn, user, navigate, showToast]);

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedKeyword(keyword), 400);
    return () => clearTimeout(timer);
  }, [keyword]);

  // Fetch users with filters & pagination
  const fetchUsers = useCallback(async () => {
    if (!isLoggedIn || user?.role !== "super_admin") return;

    setLoading(true);
    try {
      const response = await userApi.getAllUsers();
      if (!response?.success || !Array.isArray(response.data)) {
        throw new Error("Format data tidak valid");
      }

      let filtered = response.data;

      // Apply search filter
      if (debouncedKeyword.trim()) {
        const term = debouncedKeyword.toLowerCase();
        filtered = filtered.filter(
          (u: User) =>
            u.username.toLowerCase().includes(term) ||
            (u.full_name && u.full_name.toLowerCase().includes(term))
        );
      }

      // Apply role filter
      if (selectedRole !== "all") {
        filtered = filtered.filter((u: User) => u.role === selectedRole);
      }

      // Pagination
      const total = Math.ceil(filtered.length / usersPerPage);
      setTotalPages(total || 1);

      const start = (currentPage - 1) * usersPerPage;
      const paginated = filtered.slice(start, start + usersPerPage);

      setUsers(paginated);
    } catch (err: any) {
      showToast(err.message || "Gagal memuat data user", "error");
      setUsers([]);
    } finally {
      setLoading(false);
    }
  }, [
    debouncedKeyword,
    selectedRole,
    currentPage,
    isLoggedIn,
    user?.role,
    showToast,
  ]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // Reset page on filter change
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedKeyword, selectedRole]);

  const handleCreateUser = async (data: UserFormData) => {
    setFormLoading(true);
    try {
      const res = await userApi.createUser(data);
      showToast(res.message || "User berhasil dibuat", "success");
      setShowForm(false);
      fetchUsers();
    } catch (err: any) {
      showToast(err.message || "Gagal membuat user", "error");
    } finally {
      setFormLoading(false);
    }
  };

  const handleUpdateUser = async (data: UserFormData) => {
    if (!editingUser) return;
    setFormLoading(true);
    try {
      const res = await userApi.updateUser(editingUser.id, data);
      showToast(res.message || "User berhasil diperbarui", "success");
      setShowForm(false);
      setEditingUser(null);
      fetchUsers();
    } catch (err: any) {
      showToast(err.message || "Gagal memperbarui user", "error");
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeleteClick = (id: number) => {
    setUserToDelete(id);
    setShowConfirmation(true);
  };

  const confirmDelete = async () => {
    if (!userToDelete) return;
    try {
      const res = await userApi.deleteUser(userToDelete);
      showToast(res.message || "User berhasil dihapus", "success");
      setShowConfirmation(false);
      setUserToDelete(null);
      fetchUsers();
    } catch (err: any) {
      showToast(err.message || "Gagal menghapus user", "error");
    }
  };

  const handleEditUser = (user: User) => {
    setEditingUser(user);
    setShowForm(true);
  };

  const handleAddUser = () => {
    setEditingUser(null);
    setShowForm(true);
  };

  const handleCancelForm = () => {
    setShowForm(false);
    setEditingUser(null);
  };

  const resetFilters = () => {
    setKeyword("");
    setSelectedRole("all");
    setCurrentPage(1);
  };

  const hasActiveFilters = keyword.trim() || selectedRole !== "all";

  // Empty state: no users at all
  if (!loading && users.length === 0 && !hasActiveFilters) {
    return (
      <AdminLayout>
        <div className="container mx-auto px-4 py-12 text-center">
          <div className="card p-12 max-w-md mx-auto">
            <Users className="h-16 w-16 text-secondary/40 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-foreground mb-2">
              Belum Ada User
            </h3>
            <p className="text-secondary mb-6">
              Mulai tambahkan user pertama untuk mengelola sistem.
            </p>
            <button onClick={handleAddUser} className="btn btn-primary">
              <Plus size={18} className="mr-2" />
              Tambah User Pertama
            </button>
          </div>
        </div>
      </AdminLayout>
    );
  }

  // Empty state: filtered results
  if (!loading && users.length === 0 && hasActiveFilters) {
    return (
      <AdminLayout>
        <div className="container mx-auto px-4 py-12 text-center">
          <div className="card p-12 max-w-md mx-auto">
            <Search className="h-16 w-16 text-secondary/40 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-foreground mb-2">
              Tidak Ada Hasil
            </h3>
            <p className="text-secondary mb-6">
              Tidak ada user yang cocok dengan filter yang diterapkan.
            </p>
            <button onClick={resetFilters} className="btn btn-secondary">
              <X size={18} className="mr-2" />
              Hapus Filter
            </button>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="container mx-auto px-4 sm:px-6 py-8 fade-in">
        <button
          onClick={() => navigate("/atmin")}
          className="text-sm text-secondary hover:text-accent flex items-center mb-6 transition-colors"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Kembali ke Dashboard
        </button>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8 gap-4">
          <h1 className="text-3xl font-serif font-bold text-foreground">
            Manajemen User
          </h1>
          <button
            onClick={handleAddUser}
            className="btn btn-primary flex items-center"
          >
            <Plus size={18} className="mr-2" />
            User Baru
          </button>
        </div>

        <div className="card p-6">
          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <label
                htmlFor="search"
                className="block text-sm font-medium text-foreground mb-1"
              >
                Cari User
              </label>
              <input
                id="search"
                type="text"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && setCurrentPage(1)}
                placeholder="Username atau nama..."
                className="form-input w-full"
              />
            </div>

            <div>
              <label
                htmlFor="role"
                className="block text-sm font-medium text-foreground mb-1"
              >
                Filter Role
              </label>
              <select
                id="role"
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value)}
                className="form-input w-full"
              >
                <option value="all">Semua Role</option>
                <option value="super_admin">Super Admin</option>
                <option value="arsiparis">Arsiparis</option>
                <option value="pengelola_bmn">Pengelola BMN</option>
                <option value="guru_bk">Guru BK</option>
                <option value="jurnalis">Jurnalis</option>
                <option value="operator">Operator</option>
                <option value="kepala_sekolah">Kepala Sekolah</option>
              </select>
            </div>
          </div>

          {hasActiveFilters && (
            <div className="flex justify-end mb-4">
              <button
                onClick={resetFilters}
                className="text-sm text-secondary hover:text-accent flex items-center"
              >
                <X size={16} className="mr-1" />
                Hapus Filter
              </button>
            </div>
          )}

          {/* Loading State */}
          {loading ? (
            <div className="text-center py-12">
              <RefreshCw className="h-8 w-8 text-accent animate-spin mx-auto mb-3" />
              <p className="text-secondary">Memuat data user...</p>
            </div>
          ) : (
            <>
              <UserTable
                users={users}
                onEdit={handleEditUser}
                onDelete={handleDeleteClick}
                loading={loading}
              />

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-3 mt-6">
                  <button
                    onClick={() =>
                      setCurrentPage((prev) => Math.max(1, prev - 1))
                    }
                    disabled={currentPage === 1}
                    className="btn btn-secondary text-sm"
                  >
                    Sebelumnya
                  </button>
                  <span className="text-sm text-secondary">
                    Halaman <strong>{currentPage}</strong> dari{" "}
                    <strong>{totalPages}</strong>
                  </span>
                  <button
                    onClick={() =>
                      setCurrentPage((prev) => Math.min(totalPages, prev + 1))
                    }
                    disabled={currentPage === totalPages}
                    className="btn btn-secondary text-sm"
                  >
                    Berikutnya
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="card max-w-lg w-full max-h-[90vh] overflow-y-auto p-6">
            <UserManagementForm
              onSubmit={editingUser ? handleUpdateUser : handleCreateUser}
              onCancel={handleCancelForm}
              initialData={editingUser}
              isLoading={formLoading}
            />
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {showConfirmation && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="card p-6 max-w-sm w-full">
            <h3 className="text-lg font-semibold text-foreground mb-3">
              Konfirmasi Hapus
            </h3>
            <p className="text-secondary mb-6">
              User ini akan dihapus permanen. Lanjutkan?
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowConfirmation(false)}
                className="btn btn-secondary"
              >
                Batal
              </button>
              <button onClick={confirmDelete} className="btn btn-danger">
                Hapus
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default UserManagementPage;
