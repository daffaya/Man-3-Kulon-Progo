/**
 * @fileoverview AdminCategoriesPage component for managing article categories.
 * This component provides an interface for administrators and journalists to create,
 * edit, and delete article categories. It includes role-based access control and
 * various modal dialogs for category management operations.
 */

import React, { useEffect, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useArticles } from "../contexts/ArticleContext";
import { Category, CategoryFormData } from "../types/articleTypes";
import { Plus, Edit, Trash2, RefreshCw, X, ArrowLeft } from "lucide-react";
import Layout from "../components/layout/Layout";
import AdminLayout from "../components/layout/AdminLayout";
import { Link, useNavigate } from "react-router-dom";
import { useToastMessage } from "../hooks/useToastMessage";

/**
 * Array of roles that are allowed to edit categories.
 */
export const ALLOWED_ROLES = ["super_admin", "jurnalis"] as const;

/**
 * Checks if a user has edit access based on their login status and role.
 * @param isLoggedIn - Whether the user is logged in
 * @param role - The user's role
 * @returns Boolean indicating if the user has edit access
 */
const hasEditAccess = (isLoggedIn: boolean, role?: string): boolean =>
  isLoggedIn && role
    ? ALLOWED_ROLES.includes(role as (typeof ALLOWED_ROLES)[number])
    : false;

/**
 * Main component for the admin categories page.
 * Provides functionality to view, create, edit, and delete article categories.
 * Includes role-based access control and appropriate UI for different user types.
 */
const AdminCategoriesPage: React.FC = () => {
  const { isLoggedIn, user } = useAuth();
  const navigate = useNavigate();
  const {
    state,
    fetchAdminCategories,
    createCategory,
    updateCategory,
    deleteCategory,
  } = useArticles();

  const { showSuccessToast, showErrorToast } = useToastMessage();

  const adminCategories = state.adminCategories;
  const adminCategoriesLoading = state.adminCategoriesLoading;

  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);

  const [newCategoryName, setNewCategoryName] = useState("");
  const [newCategoryDescription, setNewCategoryDescription] = useState("");

  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(
    null,
  );

  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const isAdminOrJurnalis = hasEditAccess(isLoggedIn, user?.role);

  useEffect(() => {
    fetchAdminCategories().catch(() => {
      showErrorToast("Failed to fetch categories");
    });
  }, [fetchAdminCategories, showErrorToast]);

  /**
   * Handles the click event for adding a new category.
   * Checks user permissions and opens the add modal if authorized.
   */
  const handleAddClick = () => {
    if (!isAdminOrJurnalis) {
      showErrorToast("Anda tidak memiliki akses untuk menambah kategori");
      if (!isLoggedIn) {
        navigate("/login", { state: { redirectTo: "/atmin/categories" } });
      }
      return;
    }

    setNewCategoryName("");
    setNewCategoryDescription("");
    setErrorMessage(null);
    setShowAddModal(true);
  };

  /**
   * Handles saving a new category.
   * Validates input and creates the category through the API.
   */
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
      showSuccessToast("Kategori berhasil dibuat");
    } catch (error) {
      setErrorMessage("Failed to create category. Please try again.");
      showErrorToast("Gagal membuat kategori");
    }
  };

  /**
   * Handles canceling the add category operation.
   */
  const handleCancelAdd = () => {
    setShowAddModal(false);
    setErrorMessage(null);
  };

  /**
   * Handles the click event for editing a category.
   * Checks user permissions and opens the edit modal if authorized.
   * @param category - The category to edit
   */
  const handleEditClick = (category: Category) => {
    if (!isAdminOrJurnalis) {
      showErrorToast("Anda tidak memiliki akses untuk mengedit kategori");
      if (!isLoggedIn) {
        navigate("/login", { state: { redirectTo: "/atmin/categories" } });
      }
      return;
    }

    setEditingCategory(category);
    setErrorMessage(null);
    setShowEditModal(true);
  };

  /**
   * Handles saving an edited category.
   * Validates input and updates the category through the API.
   */
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
      showSuccessToast("Kategori berhasil diperbarui");
    } catch (error) {
      setErrorMessage("Failed to update category. Please try again.");
      showErrorToast("Gagal memperbarui kategori");
    }
  };

  /**
   * Handles canceling the edit category operation.
   */
  const handleCancelEdit = () => {
    setShowEditModal(false);
    setEditingCategory(null);
    setErrorMessage(null);
  };

  /**
   * Handles the click event for deleting a category.
   * Checks user permissions and opens the delete confirmation modal if authorized.
   * @param category - The category to delete
   */
  const handleDeleteClick = (category: Category) => {
    if (!isAdminOrJurnalis) {
      showErrorToast("Anda tidak memiliki akses untuk menghapus kategori");
      if (!isLoggedIn) {
        navigate("/login", { state: { redirectTo: "/atmin/categories" } });
      }
      return;
    }

    setCategoryToDelete(category);
    setErrorMessage(null);
    setShowDeleteConfirmation(true);
  };

  /**
   * Handles confirming the deletion of a category.
   * Deletes the category through the API and refreshes the category list.
   */
  const confirmDelete = async () => {
    if (!categoryToDelete) return;
    setErrorMessage(null);

    try {
      await deleteCategory(categoryToDelete.id);
      fetchAdminCategories();
      setShowDeleteConfirmation(false);
      setCategoryToDelete(null);
      showSuccessToast("Kategori berhasil dihapus");
    } catch (error) {
      setErrorMessage("Failed to delete category. Please try again.");
      showErrorToast("Gagal menghapus kategori");
    }
  };

  /**
   * Handles canceling the delete category operation.
   */
  const cancelDelete = () => {
    setShowDeleteConfirmation(false);
    setCategoryToDelete(null);
    setErrorMessage(null);
  };

  const SelectedLayout = isAdminOrJurnalis ? AdminLayout : Layout;

  if (adminCategoriesLoading) {
    return (
      <SelectedLayout>
        <div className="container mx-auto px-4 sm:px-6 py-12 text-center">
          <RefreshCw size={32} className="mx-auto animate-spin text-accent" />
          <p className="mt-4 text-secondary">Loading categories...</p>
        </div>
      </SelectedLayout>
    );
  }

  return (
    <SelectedLayout>
      <div className="container mx-auto px-4 sm:px-6 py-12 fade-in">
        {isAdminOrJurnalis && (
          <Link
            to="/atmin/articles"
            className="text-sm text-secondary hover:text-accent flex items-center mb-4 transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Kembali ke Manajemen Artikel
          </Link>
        )}

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
          <h1 className="text-3xl font-serif font-bold mb-4 sm:mb-0 text-foreground">
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

        <div className="card p-6">
          <h2 className="text-xl font-bold mb-4 text-foreground">
            Category List
          </h2>
          {adminCategories.length === 0 ? (
            <p className="text-secondary">No categories found.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-semibackground/20">
                <thead className="bg-semibackground">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-secondary uppercase tracking-wider">
                      Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-secondary uppercase tracking-wider">
                      Slug
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-secondary uppercase tracking-wider">
                      Description
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-secondary uppercase tracking-wider">
                      Created At
                    </th>
                    <th className="relative px-6 py-3">
                      <span className="sr-only">Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-semibackground/20">
                  {adminCategories.map((category) => (
                    <tr key={category.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-foreground">
                        {category.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-secondary">
                        {category.slug}
                      </td>
                      <td className="px-6 py-4 text-sm text-secondary max-w-xs truncate">
                        {category.description || "-"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-secondary">
                        {category.created_at
                          ? new Date(category.created_at).toLocaleDateString()
                          : "-"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => handleEditClick(category)}
                          className="text-accent hover:text-hover mr-4"
                          disabled={!isAdminOrJurnalis}
                        >
                          <Edit size={18} />
                          <span className="sr-only">Edit</span>
                        </button>
                        <button
                          onClick={() => handleDeleteClick(category)}
                          className="text-error hover:text-error/80"
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
              <p className="text-secondary mb-4">
                Hanya super admin atau jurnalis yang dapat mengedit atau
                menghapus kategori.
              </p>
            ) : (
              <>
                <p className="text-secondary mb-4">
                  Silakan login untuk mengedit atau menghapus kategori.
                </p>
                <button
                  onClick={() =>
                    navigate("/login", {
                      state: { redirectTo: "/atmin/categories" },
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

        {showAddModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="card p-6 max-w-md w-full">
              <h3 className="text-xl font-bold mb-4 text-foreground">
                Add New Category
              </h3>
              {errorMessage && (
                <div className="bg-error/10 border border-error text-error px-4 py-3 rounded mb-4 text-sm">
                  {errorMessage}
                </div>
              )}
              <div className="mb-4">
                <label
                  htmlFor="newCategoryName"
                  className="block text-sm font-medium mb-1 text-foreground"
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
                  className="block text-sm font-medium mb-1 text-foreground"
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
            <div className="card p-6 max-w-md w-full">
              <h3 className="text-xl font-bold mb-4 text-foreground">
                Edit Category
              </h3>
              {errorMessage && (
                <div className="bg-error/10 border border-error text-error px-4 py-3 rounded mb-4 text-sm">
                  {errorMessage}
                </div>
              )}
              <div className="mb-4">
                <label
                  htmlFor="editCategoryName"
                  className="block text-sm font-medium mb-1 text-foreground"
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
                  className="block text-sm font-medium mb-1 text-foreground"
                >
                  Slug (Generated)
                </label>
                <input
                  type="text"
                  id="editCategorySlug"
                  value={editingCategory.slug}
                  className="form-input w-full bg-semibackground cursor-not-allowed"
                  disabled
                />
              </div>
              <div className="mb-4">
                <label
                  htmlFor="editCategoryDescription"
                  className="block text-sm font-medium mb-1 text-foreground"
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
            <div className="card p-6 max-w-md w-full">
              <h3 className="text-xl font-bold mb-4 text-foreground">
                Confirm Deletion
              </h3>
              {errorMessage && (
                <div className="bg-error/10 border border-error text-error px-4 py-3 rounded mb-4 text-sm">
                  {errorMessage}
                </div>
              )}
              <p className="mb-6 text-secondary">
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
