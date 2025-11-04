// frontend/src/pages/admin/user/UserManagementPage.tsx
import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, RefreshCw, X, ArrowLeft } from "lucide-react";
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

  // State untuk data user
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  // State untuk form
  const [showForm, setShowForm] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [formLoading, setFormLoading] = useState(false);

  // State untuk filter
  const [keyword, setKeyword] = useState("");
  const [selectedRole, setSelectedRole] = useState<string>("all");
  const [debouncedKeyword, setDebouncedKeyword] = useState("");

  // State untuk pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const usersPerPage = 10;

  // State untuk konfirmasi hapus
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [userToDelete, setUserToDelete] = useState<number | null>(null);

  // Redirect if not logged in or not super_admin
  useEffect(() => {
    if (!isLoggedIn) {
      navigate("/login");
      return;
    }

    if (user?.role !== "super_admin") {
      navigate("/atmin");
      return;
    }

    fetchUsers();
  }, [isLoggedIn, user, navigate]);

  // Effect for debouncing the keyword input
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedKeyword(keyword);
    }, 500);

    return () => {
      clearTimeout(handler);
    };
  }, [keyword]);

  // Effect to fetch users when filters or pagination change
  useEffect(() => {
    if (isLoggedIn && user?.role === "super_admin") {
      fetchUsers();
    }
  }, [debouncedKeyword, selectedRole, currentPage, isLoggedIn, user]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await userApi.getAllUsers();

      if (response && response.success && Array.isArray(response.data)) {
        let filteredUsers = response.data;

        // Filter by keyword
        if (debouncedKeyword.trim() !== "") {
          const keywordLower = debouncedKeyword.toLowerCase();
          filteredUsers = filteredUsers.filter(
            (user) =>
              user.username.toLowerCase().includes(keywordLower) ||
              (user.full_name &&
                user.full_name.toLowerCase().includes(keywordLower))
          );
        }

        // Filter by role
        if (selectedRole !== "all") {
          filteredUsers = filteredUsers.filter(
            (user) => user.role === selectedRole
          );
        }

        // Calculate pagination
        const totalItems = filteredUsers.length;
        const totalPagesCount = Math.ceil(totalItems / usersPerPage);
        setTotalPages(totalPagesCount);

        // Apply pagination
        const startIndex = (currentPage - 1) * usersPerPage;
        const endIndex = startIndex + usersPerPage;
        const paginatedUsers = filteredUsers.slice(startIndex, endIndex);

        setUsers(paginatedUsers);
      } else {
        console.error("Invalid API response format:", response);
        setUsers([]);
        showToast("Invalid data format received from server", "error");
      }
    } catch (error: any) {
      console.error("Error fetching users:", error);
      setUsers([]);
      showToast(error.message || "Failed to fetch users", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUser = async (userData: UserFormData) => {
    try {
      setFormLoading(true);
      const response = await userApi.createUser(userData);
      showToast(response.message || "User created successfully", "success");
      setShowForm(false);
      fetchUsers();
    } catch (error: any) {
      showToast(error.message || "Failed to create user", "error");
    } finally {
      setFormLoading(false);
    }
  };

  const handleUpdateUser = async (userData: UserFormData) => {
    if (!editingUser) return;

    try {
      setFormLoading(true);
      const response = await userApi.updateUser(editingUser.id, userData);
      showToast(response.message || "User updated successfully", "success");
      setShowForm(false);
      setEditingUser(null);
      fetchUsers();
    } catch (error: any) {
      showToast(error.message || "Failed to update user", "error");
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeleteClick = (id: number) => {
    setUserToDelete(id);
    setShowConfirmation(true);
  };

  const confirmDelete = useCallback(async () => {
    if (userToDelete) {
      try {
        const response = await userApi.deleteUser(userToDelete);
        showToast(response.message || "User deleted successfully", "success");
        setShowConfirmation(false);
        setUserToDelete(null);
        fetchUsers();
      } catch (error: any) {
        showToast(error.message || "Failed to delete user", "error");
        console.error("Error deleting user:", error);
      }
    }
  }, [userToDelete, fetchUsers, showToast]);

  const cancelDelete = () => {
    setShowConfirmation(false);
    setUserToDelete(null);
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

  const handleRemoveFilters = () => {
    setKeyword("");
    setSelectedRole("all");
    setCurrentPage(1);
  };

  const handleKeywordInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setKeyword(e.target.value);
  };

  const handleKeywordInputKeyPress = (
    e: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (e.key === "Enter") {
      e.preventDefault();
      setCurrentPage(1);
    }
  };

  const handleRoleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedRole(e.target.value);
    setCurrentPage(1);
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const hasActiveFilters = keyword.trim() !== "" || selectedRole !== "all";
  const isPreviousDisabled = loading || currentPage <= 1;
  const isNextDisabled = loading || currentPage >= totalPages;

  if (!loading && users.length === 0 && hasActiveFilters) {
    return (
      <AdminLayout>
        <div className="container mx-auto px-4 sm:px-6 py-12 text-center">
          <p className="text-xl text-gray-600 dark:text-gray-400">
            Tidak ada user yang cocok dengan filter.
          </p>
          <button
            onClick={handleRemoveFilters}
            className="mt-4 text-accent hover:underline flex items-center justify-center mx-auto"
          >
            <X size={16} className="mr-1" /> Hapus Filter
          </button>
        </div>
      </AdminLayout>
    );
  }

  if (!loading && users.length === 0 && !hasActiveFilters) {
    return (
      <AdminLayout>
        <div className="container mx-auto px-4 sm:px-6 py-12 text-center">
          <p className="text-xl text-gray-600 dark:text-gray-400">
            Belum ada user yang ditemukan.
          </p>
          <button
            onClick={handleAddUser}
            className="mt-4 inline-block btn btn-primary flex items-center justify-center mx-auto w-fit"
          >
            <Plus size={18} className="mr-1" /> Buat User Pertama Anda
          </button>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="container mx-auto px-4 sm:px-6 py-12 fade-in">
        <button
          onClick={() => navigate("/atmin")}
          className="text-sm text-gray-600 dark:text-gray-400 hover:text-primary dark:hover:text-primary flex items-center mb-4 transition-colors"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Kembali ke admin dashboard
        </button>

        <div className="flex flex-col mx-4 sm:flex-row sm:items-center sm:justify-between mb-8">
          <h1 className="text-3xl font-serif font-bold mb-4 sm:mb-0">
            Manajemen User
          </h1>

          <div className="flex space-x-2">
            <button
              onClick={handleAddUser}
              className="btn btn-primary flex items-center"
            >
              <Plus size={18} className="mr-1" /> User Baru
            </button>
          </div>
        </div>

        <div className="bg-white dark:bg-semibackground rounded-xl shadow-md p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            {hasActiveFilters && (
              <button
                onClick={handleRemoveFilters}
                className="btn btn-secondary py-1 text-sm"
              >
                Hapus Filter
              </button>
            )}
          </div>

          <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="keyword"
                className="block text-sm font-medium mb-1"
              >
                Cari User{" "}
                <span className="text-xs text-gray-500">(Tekan Enter)</span>
              </label>
              <input
                type="text"
                id="keyword"
                value={keyword}
                onChange={handleKeywordInputChange}
                onKeyPress={handleKeywordInputKeyPress}
                placeholder="Cari username, nama..."
                className="form-input w-full"
              />
            </div>

            <div>
              <label
                htmlFor="roleFilter"
                className="block text-sm font-medium mb-1"
              >
                Filter Berdasarkan Role
              </label>
              <select
                id="roleFilter"
                value={selectedRole}
                onChange={handleRoleChange}
                className="form-input w-full"
              >
                <option value="all">Semua Role</option>
                <option value="super_admin">Super Admin</option>
                <option value="arsiparis">Arsiparis</option>
                <option value="pengelola_bmn">Pengelola BMN</option>
                <option value="guru_bk">Guru BK</option>
                <option value="jurnalis">Jurnalis</option>
              </select>
            </div>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <RefreshCw
                size={32}
                className="mx-auto animate-spin text-accent"
              />
              <p className="mt-4">Memuat user...</p>
            </div>
          ) : (
            <UserTable
              users={users}
              onDelete={handleDeleteClick}
              onEdit={handleEditUser}
              loading={loading}
            />
          )}

          {totalPages > 1 && (
            <div className="flex justify-center items-center mt-6 space-x-4">
              <button
                onClick={handlePreviousPage}
                disabled={isPreviousDisabled}
                className={`px-4 py-2 rounded-md transition-colors ${
                  isPreviousDisabled
                    ? "bg-gray-200 dark:bg-gray-700 text-gray-500 cursor-not-allowed"
                    : "bg-accent text-white hover:bg-accent-dark"
                }`}
              >
                Sebelumnya
              </button>
              <span className="text-gray-700 dark:text-gray-300">
                Halaman {currentPage} dari {totalPages}
              </span>
              <button
                onClick={handleNextPage}
                disabled={isNextDisabled}
                className={`px-4 py-2 rounded-md transition-colors ${
                  isNextDisabled
                    ? "bg-gray-200 dark:bg-gray-700 text-gray-500 cursor-not-allowed"
                    : "bg-accent text-white hover:bg-accent-dark"
                }`}
              >
                Berikutnya
              </button>
            </div>
          )}
        </div>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
            <UserManagementForm
              onSubmit={editingUser ? handleUpdateUser : handleCreateUser}
              onCancel={handleCancelForm}
              initialData={editingUser}
              isLoading={formLoading}
            />
          </div>
        </div>
      )}

      {showConfirmation && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full">
            <h3 className="text-xl font-bold mb-4">Konfirmasi Hapus</h3>
            <p className="mb-6 text-gray-600 dark:text-gray-400">
              Apakah Anda yakin ingin menghapus user ini? Tindakan ini tidak
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
    </AdminLayout>
  );
};

export default UserManagementPage;
