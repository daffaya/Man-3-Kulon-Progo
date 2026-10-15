/**
 * @fileoverview User Management Page component for the admin panel.
 * This component provides a comprehensive interface for managing system users.
 * It includes functionality to view, search, filter, paginate, create, edit, and delete users.
 * Access is restricted to users with the 'super_admin' role.
 */

import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Plus } from "lucide-react";
import { useAuth } from "../../../contexts/AuthContext";
import { useToast } from "../../../contexts/ToastContext";
import AdminLayout from "../../../components/layout/AdminLayout";
import UserTable from "../../../components/tables/UserTable";
import UserManagementForm from "../../../components/forms/auth/UserManagementForm";
import userApi from "../../../api/userApi";
import {
  ConfirmDialog,
  EmptyState,
  FilterSelect,
  PageHead,
  SearchBox,
  TableFooter,
} from "../../../components/admin/ListKit";
import { User, UserFormData } from "../../../types/userTypes";

/**
 * Component that renders the user management page for super admins.
 * It handles user data fetching, client-side filtering, pagination, and CRUD operations.
 * Displays a user table, a form for creating/editing users, and a delete confirmation modal.
 */
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

  useEffect(() => {
    if (!isLoggedIn) {
      navigate("/login", { state: { redirectTo: "/atmin/users" } });
      return;
    }
    if (user?.role !== "super_admin") {
      showToast(
        "Akses ditolak. Hanya Super Admin yang dapat mengelola user.",
        "error",
      );
      navigate("/atmin");
      return;
    }
  }, [isLoggedIn, user, navigate, showToast]);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedKeyword(keyword), 400);
    return () => clearTimeout(timer);
  }, [keyword]);

  /**
   * Fetches all users from the API and applies client-side filtering and pagination.
   * Updates the users state with the paginated and filtered results.
   */
  const fetchUsers = useCallback(async () => {
    if (!isLoggedIn || user?.role !== "super_admin") return;

    setLoading(true);
    try {
      const response = await userApi.getAllUsers();
      if (!response?.success || !Array.isArray(response.data)) {
        throw new Error("Format data tidak valid");
      }

      let filtered = response.data;

      if (debouncedKeyword.trim()) {
        const term = debouncedKeyword.toLowerCase();
        filtered = filtered.filter(
          (u: User) =>
            u.username.toLowerCase().includes(term) ||
            (u.full_name && u.full_name.toLowerCase().includes(term)),
        );
      }

      if (selectedRole !== "all") {
        filtered = filtered.filter((u: User) => u.role === selectedRole);
      }

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

  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedKeyword, selectedRole]);

  /**
   * Handles the creation of a new user.
   * Sends user data to the API, shows a toast message, and refreshes the user list.
   * @param {UserFormData} data - The data for the new user.
   */
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

  /**
   * Handles the update of an existing user.
   * Sends updated data to the API, shows a toast message, and refreshes the user list.
   * @param {UserFormData} data - The updated user data.
   */
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

  /**
   * Sets the user to be deleted and shows the confirmation modal.
   * @param {number} id - The ID of the user to delete.
   */
  const handleDeleteClick = (id: number) => {
    setUserToDelete(id);
    setShowConfirmation(true);
  };

  /**
   * Confirms and performs the deletion of a user.
   * Sends a delete request to the API and refreshes the user list on success.
   */
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

  /**
   * Opens the user form in edit mode with the selected user's data.
   * @param {User} user - The user object to edit.
   */
  const handleEditUser = (user: User) => {
    setEditingUser(user);
    setShowForm(true);
  };

  /**
   * Opens the user form in create mode.
   */
  const handleAddUser = () => {
    setEditingUser(null);
    setShowForm(true);
  };

  /**
   * Closes the user form and resets the editing state.
   */
  const handleCancelForm = () => {
    setShowForm(false);
    setEditingUser(null);
  };

  /**
   * Resets all active filters to their default state.
   */
  const resetFilters = () => {
    setKeyword("");
    setSelectedRole("all");
    setCurrentPage(1);
  };

  const hasActiveFilters = keyword.trim() || selectedRole !== "all";

  const empty = !loading && users.length === 0;

  return (
    <AdminLayout>
      <div className="a-pg">
        <PageHead title="Manajemen User" sub="Kelola akun dan hak akses pengguna sistem.">
          <button type="button" onClick={handleAddUser} className="a-btn a-p">
            <Plus size={18} />
            User Baru
          </button>
        </PageHead>

        <div className="a-cd" style={{ padding: 0 }}>
          <div className="a-tl">
            <SearchBox value={keyword} onChange={setKeyword} placeholder="Cari username atau nama…" label="Cari user" />
            <FilterSelect
              value={selectedRole}
              onChange={setSelectedRole}
              label="Semua role"
              options={[
                ["super_admin", "Super Admin"],
                ["jurnalis", "Jurnalis"],
                ["guru_bk", "Guru BK"],
                ["arsiparis", "Arsiparis"],
                ["pengelola_bmn", "Pengelola BMN"],
              ]}
            />
          </div>

          {empty ? (
            <EmptyState
              filtered={!!hasActiveFilters}
              entity="user"
              hint="Tambahkan user pertama untuk mengelola sistem."
              onReset={resetFilters}
            >
              <button type="button" onClick={handleAddUser} className="a-btn a-p">
                <Plus size={18} />
                Tambah User Pertama
              </button>
            </EmptyState>
          ) : (
            <UserTable users={users} onEdit={handleEditUser} onDelete={handleDeleteClick} loading={loading} />
          )}

          {!empty && (
            <TableFooter
              text={loading ? "Memuat…" : `Halaman ${currentPage} dari ${totalPages}`}
              page={currentPage}
              totalPages={totalPages}
              loading={loading}
              onPrev={() => setCurrentPage((p) => Math.max(1, p - 1))}
              onNext={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            />
          )}
        </div>
      </div>

      {showForm && (
        <div className="a-mo">
          <div className="a-mc a-wide" style={{ maxWidth: 520 }}>
            <UserManagementForm
              onSubmit={editingUser ? handleUpdateUser : handleCreateUser}
              onCancel={handleCancelForm}
              initialData={editingUser}
              isLoading={formLoading}
            />
          </div>
        </div>
      )}

      <ConfirmDialog
        open={showConfirmation}
        title="Hapus user?"
        body="User yang dihapus tidak dapat mengakses sistem lagi."
        onCancel={() => {
          setShowConfirmation(false);
          setUserToDelete(null);
        }}
        onConfirm={confirmDelete}
      />
    </AdminLayout>
  );
};

export default UserManagementPage;
