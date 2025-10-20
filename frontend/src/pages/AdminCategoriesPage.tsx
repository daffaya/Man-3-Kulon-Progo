import React, { useEffect, useState, useCallback } from "react";
import Layout from "../components/layout/Layout";
import { useArticles } from "../contexts/ArticleContext";
import { Category, CategoryFormData } from "../types/articleTypes";
import { Plus, Edit, Trash2, RefreshCw, X } from "lucide-react";

const AdminCategoriesPage: React.FC = () => {
  const {
    adminCategories,
    adminCategoriesLoading,
    fetchAdminCategories,

    createCategory,
    updateCategory,
    deleteCategory,
  } = useArticles();

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

  useEffect(() => {
    console.log("[AdminCategoriesPage useEffect] Fetching admin categories...");
    fetchAdminCategories();
  }, [fetchAdminCategories]);

  const handleAddClick = () => {
    setNewCategoryName("");
    setNewCategoryDescription("");
    setErrorMessage(null);
    setShowAddModal(true);
  };

  const handleSaveNewCategory = async () => {
    console.log("[AdminCategoriesPage] Attempting to save new category:", {
      name: newCategoryName,
      description: newCategoryDescription,
    });
    setErrorMessage(null);

    if (!newCategoryName.trim()) {
      setErrorMessage("Category name cannot be empty.");
      return;
    }

    const categoryData: CategoryFormData = {
      name: newCategoryName.trim(),
      description: newCategoryDescription.trim() || undefined,
    };

    const newCategory = await createCategory(categoryData);

    if (newCategory) {
      console.log(
        "[AdminCategoriesPage] New category created successfully. Re-fetching list..."
      );
      fetchAdminCategories();
      setShowAddModal(false);
    } else {
      console.error("[AdminCategoriesPage] Failed to create new category.");

      setErrorMessage(
        "Failed to create category. Please try again. (Check backend logs for details)"
      );
    }
  };

  const handleCancelAdd = () => {
    setShowAddModal(false);
    setErrorMessage(null);
  };

  const handleEditClick = (category: Category) => {
    console.log("[AdminCategoriesPage] Editing category:", category);
    setEditingCategory(category);
    setErrorMessage(null);
    setShowEditModal(true);
  };

  const handleSaveEditedCategory = async () => {
    if (!editingCategory) return;
    console.log(
      "[AdminCategoriesPage] Attempting to save edited category:",
      editingCategory
    );
    setErrorMessage(null);

    if (!editingCategory.name.trim()) {
      setErrorMessage("Category name cannot be empty.");
      return;
    }

    const updates: Partial<CategoryFormData> = {
      name: editingCategory.name.trim(),
      description: editingCategory.description?.trim() || undefined,
    };

    const updatedCategory = await updateCategory(editingCategory.id, updates);

    if (updatedCategory) {
      console.log(
        `[AdminCategoriesPage] Category ID ${editingCategory.id} updated successfully. Re-fetching list...`
      );
      fetchAdminCategories();
      setShowEditModal(false);
      setEditingCategory(null);
    } else {
      console.error(
        `[AdminCategoriesPage] Failed to update category ID ${editingCategory.id}.`
      );

      setErrorMessage(
        "Failed to update category. Please try again. (Check backend logs for details)"
      );
    }
  };

  const handleCancelEdit = () => {
    setShowEditModal(false);
    setEditingCategory(null);
    setErrorMessage(null);
  };

  const handleDeleteClick = (category: Category) => {
    console.log("[AdminCategoriesPage] Deleting category:", category);
    setCategoryToDelete(category);
    setErrorMessage(null);
    setShowDeleteConfirmation(true);
  };

  const confirmDelete = async () => {
    if (!categoryToDelete) return;
    console.log(
      "[AdminCategoriesPage] Confirming delete for category ID:",
      categoryToDelete.id
    );
    setErrorMessage(null);

    const success = await deleteCategory(categoryToDelete.id);

    if (success) {
      console.log(
        `[AdminCategoriesPage] Category ID ${categoryToDelete.id} deleted successfully. Re-fetching list...`
      );
      fetchAdminCategories();
      setShowDeleteConfirmation(false);
      setCategoryToDelete(null);
    } else {
      console.error(
        `[AdminCategoriesPage] Failed to delete category ID ${categoryToDelete.id}.`
      );

      setErrorMessage(
        "Failed to delete category. Please try again. (Check backend logs for details)"
      );
    }
  };

  const cancelDelete = () => {
    setShowDeleteConfirmation(false);
    setCategoryToDelete(null);
    setErrorMessage(null);
  };

  if (adminCategoriesLoading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 sm:px-6 py-12 text-center">
          <RefreshCw size={32} className="mx-auto animate-spin text-accent" />
          <p className="mt-4">Loading categories...</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 sm:px-6 py-12 fade-in">
        {/* Header utama halaman kategori */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
          <h1 className="text-3xl font-serif font-bold mb-4 sm:mb-0">
            Manage Categories
          </h1>
          <button
            onClick={handleAddClick}
            className="btn btn-primary flex items-center justify-center sm:justify-start"
          >
            <Plus size={18} className="mr-1" /> Add New Category
          </button>
        </div>

        {/* Tabel Kategori */}
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
                        >
                          <Edit size={18} />
                          <span className="sr-only">Edit</span>
                        </button>
                        <button
                          onClick={() => handleDeleteClick(category)}
                          className="text-error hover:text-error-dark"
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

        {/* Add Category Modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full">
              <h3 className="text-xl font-bold mb-4">Add New Category</h3>
              {/* Display error message if any */}
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

        {/* Edit Category Modal */}
        {showEditModal && editingCategory && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full">
              <h3 className="text-xl font-bold mb-4">Edit Category</h3>
              {/* Display error message if any */}
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

        {/* Delete Confirmation Modal */}
        {showDeleteConfirmation && categoryToDelete && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full">
              <h3 className="text-xl font-bold mb-4">Confirm Deletion</h3>
              {/* Display error message if any */}
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
    </Layout>
  );
};

export default AdminCategoriesPage;
