import React, { useEffect, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useArticles } from "../contexts/ArticleContext";
import { Category, CategoryFormData } from "../types/articleTypes";
import { Plus, Edit, Trash2, RefreshCw, X, ArrowLeft } from "lucide-react";
import Layout from "../components/layout/Layout";
import AdminLayout from "../components/layout/AdminLayout";
import { Link, useNavigate } from "react-router-dom";
import Toast from "../components/ui/Toast";
import { v4 as uuidv4 } from "uuid";

/** Roles that are permitted to manage categories. */
export const ALLOWED_ROLES = ["super_admin", "jurnalis"] as const;

/**
 * Checks if a user has permission to manage categories based on their login status and role.
 * @param isLoggedIn - The user's login status.
 * @param role - The user's role.
 * @returns True if the user has management access, otherwise false.
 */
const hasEditAccess = (isLoggedIn: boolean, role?: string): boolean =>
  isLoggedIn && role
    ? ALLOWED_ROLES.includes(role as (typeof ALLOWED_ROLES)[number])
    : false;

/**
 * A page component for managing article categories in the admin panel.
 * It provides functionality to view, create, edit, and delete categories.
 */
const AdminCategoriesPage: React.FC = () => {
  const { isLoggedIn, user, token } = useAuth();
  const navigate = useNavigate();
  const {
    state,
    fetchAdminCategories,
    createCategory,
    updateCategory,
    deleteCategory,
  } = useArticles();

  const adminCategories = state.adminCategories;
  const adminCategoriesLoading = state.adminCategoriesLoading;

  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);

  const [newCategoryName, setNewCategoryName] = useState("");
  const [newCategoryDescription, setNewCategoryDescription] = useState("");

  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(
    null
  );

  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [toasts, setToasts] = useState<
    { id: string; message: string; type: "success" | "error" }[]
  >([]);

  const isAdminOrJurnalis = hasEditAccess(isLoggedIn, user?.role);

  /**
   * Adds a new toast notification to the queue.
   * @param message - The message to display.
   * @param type - The type of toast (success or error).
   */
  const addToast = (message: string, type: "success" | "error") => {
    const id = uuidv4();
    setToasts((prev) => [...prev, { id, message, type }]);
  };

  /**
   * Removes a toast notification by its unique ID.
   * @param id - The ID of the toast to remove.
   */
  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  };

  // Fetches categories when the component mounts.
  useEffect(() => {
    fetchAdminCategories().catch(() => {
      addToast("Failed to fetch categories", "error");
    });
  }, [fetchAdminCategories]);

  /** Opens the modal to add a new category after checking permissions. */
  const handleAddClick = () => {
    if (!isAdminOrJurnalis) {
      addToast("Anda tidak memiliki akses untuk menambah kategori", "error");
      if (!isLoggedIn) {
        navigate("/login", { state: { redirectTo: "/admin/categories" } });
      }
      return;
    }

    setNewCategoryName("");
    setNewCategoryDescription("");
    setErrorMessage(null);
    setShowAddModal(true);
  };

  /** Handles the API call to create a new category. */
  const handleSaveNewCategory = async () => {
    setErrorMessage(null);

    if (!newCategoryName.trim()) {
      setErrorMessage("Category name cannot be empty.");
      return;
    }

    const categoryData: CategoryFormData = {
      name: newCategoryName.trim(),
      description: newCategoryDescription.trim() || undefined,
    };

    try {
      await createCategory(categoryData);
      fetchAdminCategories();
      setShowAddModal(false);
      addToast("Kategori berhasil dibuat", "success");
    } catch (error) {
      setErrorMessage(
        "Failed to create category. Please try again. (Check backend logs for details)"
      );
      addToast("Gagal membuat kategori", "error");
    }
  };

  /** Closes the add category modal and resets its state. */
  const handleCancelAdd = () => {
    setShowAddModal(false);
    setErrorMessage(null);
  };

  /** Opens the modal to edit an existing category after checking permissions. */
  const handleEditClick = (category: Category) => {
    if (!isAdminOrJurnalis) {
      addToast("Anda tidak memiliki akses untuk mengedit kategori", "error");
      if (!isLoggedIn) {
        navigate("/login", { state: { redirectTo: "/admin/categories" } });
      }
      return;
    }

    setEditingCategory(category);
    setErrorMessage(null);
    setShowEditModal(true);
  };

  /** Handles the API call to update an existing category. */
  const handleSaveEditedCategory = async () => {
    if (!editingCategory) return;
    setErrorMessage(null);

    if (!editingCategory.name.trim()) {
      setErrorMessage("Category name cannot be empty.");
      return;
    }

    const updates: Partial<CategoryFormData> = {
      name: editingCategory.name.trim(),
      description: editingCategory.description?.trim() || undefined,
    };

    try {
      await updateCategory(editingCategory.id, updates);
      fetchAdminCategories();
      setShowEditModal(false);
      setEditingCategory(null);
      addToast("Kategori berhasil diperbarui", "success");
    } catch (error) {
      setErrorMessage(
        "Failed to update category. Please try again. (Check backend logs for details)"
      );
      addToast("Gagal memperbarui kategori", "error");
    }
  };

  /** Closes the edit category modal and resets its state. */
  const handleCancelEdit = () => {
    setShowEditModal(false);
    setEditingCategory(null);
    setErrorMessage(null);
  };

  /** Opens the delete confirmation modal for a specific category. */
  const handleDeleteClick = (category: Category) => {
    if (!isAdminOrJurnalis) {
      addToast("Anda tidak memiliki akses untuk menghapus kategori", "error");
      if (!isLoggedIn) {
        navigate("/login", { state: { redirectTo: "/admin/categories" } });
      }
      return;
    }

    setCategoryToDelete(category);
    setErrorMessage(null);
    setShowDeleteConfirmation(true);
  };

  /** Handles the API call to delete a category. */
  const confirmDelete = async () => {
    if (!categoryToDelete) return;
    setErrorMessage(null);

    try {
      await deleteCategory(categoryToDelete.id);
      fetchAdminCategories();
      setShowDeleteConfirmation(false);
      setCategoryToDelete(null);
      addToast("Kategori berhasil dihapus", "success");
    } catch (error) {
      setErrorMessage(
        "Failed to delete category. Please try again. (Check backend logs for details)"
      );
      addToast("Gagal menghapus kategori", "error");
    }
  };

  /** Closes the delete confirmation modal. */
  const cancelDelete = () => {
    setShowDeleteConfirmation(false);
    setCategoryToDelete(null);
    setErrorMessage(null);
  };

  // Dynamically selects the layout component based on user permissions.
  const SelectedLayout = isAdminOrJurnalis ? AdminLayout : Layout;

  if (adminCategoriesLoading) {
    return (
      <SelectedLayout>
        <div className="container mx-auto px-4 sm:px-6 py-12 text-center">
          <RefreshCw size={32} className="mx-auto animate-spin text-accent" />
          <p className="mt-4">Loading categories...</p>
        </div>
      </SelectedLayout>
    );
  }

  return (
    <SelectedLayout>
      <div className="container mx-auto px-4 sm:px-6 py-12 fade-in">
        {isAdminOrJurnalis && (
          <Link
            to="/admin"
            className="text-sm text-gray-600 dark:text-gray-400 hover:text-primary dark:hover:text-primary flex items-center mb-4 transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Kembali ke admin dashboard
          </Link>
        )}

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
          <h1 className="text-3xl font-serif font-bold mb-4 sm:mb-0">
            Manage Categories
          </h1>
          {isAdminOrJurnalis && (
            <button
              onClick={handleAddClick}
              className="btn btn-primary flex items-center justify-center sm:justify-start"
            >
              <Plus size={18} className="mr-1" /> Add New Category
            </button>
          )}
        </div>

        <div className="bg-white dark:bg-semibackground rounded-xl shadow-md p-6">
          <h2 className="text-xl font-bold mb-4">Category List</h2>
          {adminCategories.length === 0 ? (
            <p className="text-gray-600 dark:text-gray-400">
              No categories found.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                    >
                      Name
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                    >
                      Slug
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                    >
                      Description
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                    >
                      Created At
                    </th>
                    <th scope="col" className="relative px-6 py-3">
                      <span className="sr-only">Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-semibackground divide-y divide-gray-200 dark:divide-gray-700">
                  {adminCategories.map((category) => (
                    <tr key={category.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                        {category.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                        {category.slug}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-300 max-w-xs truncate">
                        {category.description || "-"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                        {category.created_at
                          ? new Date(category.created_at).toLocaleDateString()
                          : "-"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => handleEditClick(category)}
                          className="text-accent hover:text-accent-dark mr-4"
                          disabled={!isAdminOrJurnalis}
                        >
                          <Edit size={18} />
                          <span className="sr-only">Edit</span>
                        </button>
                        <button
                          onClick={() => handleDeleteClick(category)}
                          className="text-error hover:text-error-dark"
                          disabled={!isAdminOrJurnalis}
                        >
                          <Trash2 size={18} />
                          <span className="sr-only">Delete</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {!isAdminOrJurnalis && (
          <div className="mt-8 text-center">
            {isLoggedIn ? (
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Hanya super admin atau jurnalis yang dapat mengedit atau
                menghapus kategori.
              </p>
            ) : (
              <>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  Silakan login untuk mengedit atau menghapus kategori.
                </p>
                <button
                  onClick={() =>
                    navigate("/login", {
                      state: { redirectTo: "/admin/categories" },
                    })
                  }
                  className="btn btn-primary flex items-center justify-center mx-auto w-fit"
                >
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

        {showAddModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full">
              <h3 className="text-xl font-bold mb-4">Add New Category</h3>
              {errorMessage && (
                <div className="bg-error/10 border border-error text-error px-4 py-3 rounded mb-4 text-sm">
                  {errorMessage}
                </div>
              )}
              <div className="mb-4">
                <label
                  htmlFor="newCategoryName"
                  className="block text-sm font-medium mb-1"
                >
                  Category Name
                </label>
                <input
                  type="text"
                  id="newCategoryName"
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  className="form-input w-full"
                  required
                />
              </div>
              <div className="mb-4">
                <label
                  htmlFor="newCategoryDescription"
                  className="block text-sm font-medium mb-1"
                >
                  Description (Optional)
                </label>
                <textarea
                  id="newCategoryDescription"
                  value={newCategoryDescription}
                  onChange={(e) => setNewCategoryDescription(e.target.value)}
                  rows={3}
                  className="form-textarea w-full"
                />
              </div>
              <div className="flex justify-end space-x-4">
                <button onClick={handleCancelAdd} className="btn btn-secondary">
                  Cancel
                </button>
                <button
                  onClick={handleSaveNewCategory}
                  className="btn btn-primary"
                >
                  Save Category
                </button>
              </div>
            </div>
          </div>
        )}

        {showEditModal && editingCategory && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full">
              <h3 className="text-xl font-bold mb-4">Edit Category</h3>
              {errorMessage && (
                <div className="bg-error/10 border border-error text-error px-4 py-3 rounded mb-4 text-sm">
                  {errorMessage}
                </div>
              )}
              <div className="mb-4">
                <label
                  htmlFor="editCategoryName"
                  className="block text-sm font-medium mb-1"
                >
                  Category Name
                </label>
                <input
                  type="text"
                  id="editCategoryName"
                  value={editingCategory.name}
                  onChange={(e) =>
                    setEditingCategory({
                      ...editingCategory,
                      name: e.target.value,
                    })
                  }
                  className="form-input w-full"
                  required
                />
              </div>
              <div className="mb-4">
                <label
                  htmlFor="editCategorySlug"
                  className="block text-sm font-medium mb-1"
                >
                  Slug (Generated)
                </label>
                <input
                  type="text"
                  id="editCategorySlug"
                  value={editingCategory.slug}
                  className="form-input w-full bg-gray-100 dark:bg-gray-700 cursor-not-allowed"
                  disabled
                />
              </div>
              <div className="mb-4">
                <label
                  htmlFor="editCategoryDescription"
                  className="block text-sm font-medium mb-1"
                >
                  Description (Optional)
                </label>
                <textarea
                  id="editCategoryDescription"
                  value={editingCategory.description || ""}
                  onChange={(e) =>
                    setEditingCategory({
                      ...editingCategory,
                      description: e.target.value,
                    })
                  }
                  rows={3}
                  className="form-textarea w-full"
                />
              </div>
              <div className="flex justify-end space-x-4">
                <button
                  onClick={handleCancelEdit}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveEditedCategory}
                  className="btn btn-primary"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        )}

        {showDeleteConfirmation && categoryToDelete && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full">
              <h3 className="text-xl font-bold mb-4">Confirm Deletion</h3>
              {errorMessage && (
                <div className="bg-error/10 border border-error text-error px-4 py-3 rounded mb-4 text-sm">
                  {errorMessage}
                </div>
              )}
              <p className="mb-6 text-gray-600 dark:text-gray-400">
                Are you sure you want to delete the category "
                <strong>{categoryToDelete.name}</strong>"? Articles currently
                assigned to this category will have their category removed. This
                action cannot be undone.
              </p>
              <div className="flex justify-end space-x-4">
                <button onClick={cancelDelete} className="btn btn-secondary">
                  Cancel
                </button>
                <button onClick={confirmDelete} className="btn btn-danger">
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </SelectedLayout>
  );
};

export default AdminCategoriesPage;
