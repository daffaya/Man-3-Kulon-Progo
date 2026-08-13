/**
 * Factory function to create a Category Controller with CRUD operations.
 * @param {Object} dependencies - Dependencies to be injected.
 * @param {Object} dependencies.categoryModel - Model for category operations.
 * @returns {Object} Controller with CRUD methods for categories.
 */
const createCategoryController = ({ categoryModel }) => {
  /**
   * Helper function to handle errors and send a standardized JSON response.
   * @param {Object} res - Express response object.
   * @param {string} context - The context in which the error occurred (e.g., "create category").
   * @param {Object} error - The error object.
   * @returns {Object} Express response object with a 500 status code.
   */
  const handleError = (res, context, error) => {
    return res.status(500).json({
      message: `Failed to ${context}`,
      error: error.message,
    });
  };

  return {
    /**
     * Retrieves all categories.
     * @async
     * @param {Object} req - Express request object.
     * @param {Object} res - Express response object.
     * @returns {Promise<void>}
     */
    getAllCategories: async (req, res) => {
      try {
        const categories = await categoryModel.findAll();
        res.status(200).json(categories);
      } catch (error) {
        handleError(res, "fetch categories", error);
      }
    },

    /**
     * Creates a new category.
     * @async
     * @param {Object} req - Express request object.
     * @param {Object} res - Express response object.
     * @returns {Promise<void>}
     */
    createCategory: async (req, res) => {
      try {
        const { name, description } = req.body;
        if (!name)
          return res.status(400).json({ message: "Category name is required" });

        const newCategory = await categoryModel.create({ name, description });
        res.status(201).json({
          message: "Category created successfully",
          category: newCategory,
        });
      } catch (error) {
        handleError(res, "create category", error);
      }
    },

    /**
     * Updates a category by its ID.
     * @async
     * @param {Object} req - Express request object.
     * @param {Object} res - Express response object.
     * @returns {Promise<void>}
     */
    updateCategory: async (req, res) => {
      try {
        const { id } = req.params;
        const { name, description } = req.body;
        if (!name)
          return res.status(400).json({ message: "Category name is required" });

        const updatedCategory = await categoryModel.update(id, {
          name,
          description,
        });
        if (!updatedCategory)
          return res.status(404).json({ message: "Category not found" });

        res.status(200).json({
          message: "Category updated successfully",
          category: updatedCategory,
        });
      } catch (error) {
        handleError(res, "update category", error);
      }
    },

    /**
     * Deletes a category by its ID.
     * @async
     * @param {Object} req - Express request object.
     * @param {Object} res - Express response object.
     * @returns {Promise<void>}
     */
    deleteCategory: async (req, res) => {
      try {
        const { id } = req.params;
        const deleted = await categoryModel.delete(id);
        if (!deleted)
          return res.status(404).json({ message: "Category not found" });

        res.status(200).json({ message: "Category deleted successfully" });
      } catch (error) {
        handleError(res, "delete category", error);
      }
    },
  };
};

export default createCategoryController;
