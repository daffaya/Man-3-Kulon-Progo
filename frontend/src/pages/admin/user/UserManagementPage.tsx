// frontend/src/pages/admin/user/UserManagementPage.tsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Users } from "lucide-react";
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

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const usersData = await userApi.getAllUsers();
      setUsers(usersData);
    } catch (error: any) {
      showToast(error.message || "Failed to fetch users", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUser = async (userData: UserFormData) => {
    try {
      setFormLoading(true);
      await userApi.createUser(userData);
      showToast("User created successfully", "success");
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
      await userApi.updateUser(editingUser.id, userData);
      showToast("User updated successfully", "success");
      setShowForm(false);
      setEditingUser(null);
      fetchUsers();
    } catch (error: any) {
      showToast(error.message || "Failed to update user", "error");
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeleteUser = async (id: number) => {
    if (!window.confirm("Are you sure you want to delete this user?")) {
      return;
    }

    try {
      await userApi.deleteUser(id);
      showToast("User deleted successfully", "success");
      fetchUsers();
    } catch (error: any) {
      showToast(error.message || "Failed to delete user", "error");
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

  return (
    <AdminLayout>
      <div className="pt-24 min-h-screen bg-background dark:bg-background py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                User Management
              </h1>
              <p className="mt-2 text-gray-600 dark:text-gray-400">
                Manage system users and their roles
              </p>
            </div>
            <button
              onClick={handleAddUser}
              className="flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <Plus size={16} className="mr-2" />
              Add User
            </button>
          </div>

          {showForm ? (
            <div className="mb-8">
              <UserManagementForm
                onSubmit={editingUser ? handleUpdateUser : handleCreateUser}
                onCancel={handleCancelForm}
                initialData={editingUser}
                isLoading={formLoading}
              />
            </div>
          ) : (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
              <div className="flex items-center mb-6">
                <Users className="h-5 w-5 text-gray-400 mr-2" />
                <h2 className="text-lg font-medium text-gray-900 dark:text-white">
                  System Users
                </h2>
              </div>
              <UserTable
                users={users}
                onDelete={handleDeleteUser}
                onEdit={handleEditUser}
                loading={loading}
              />
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
};

export default UserManagementPage;
