const createCategoryController = ({ categoryModel }) => {
  const handleError = (res, context, error) => {
    console.error(`[CategoryController] Error ${context}:`, error);
    return res.status(500).json({
      message: `Failed to ${context}`,
      error: error.message,
    });
  };

  return {
    // Ambil semua kategori untuk admin
    getAllCategories: async (req, res) => {
      try {
        const categories = await categoryModel.findAll();
        res.status(200).json(categories);
      } catch (error) {
        handleError(res, "fetch categories", error);
      }
    },

    // Buat kategori baru
    createCategory: async (req, res) => {
      try {
        const { name, description } = req.body;
        if (!name)
          return res.status(400).json({ message: "Category name is required" });

        const newCategory = await categoryModel.create({ name, description });
        res
          .status(201)
          .json({
            message: "Category created successfully",
            category: newCategory,
          });
      } catch (error) {
        handleError(res, "create category", error);
      }
    },

    // Update kategori
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

        res
          .status(200)
          .json({
            message: "Category updated successfully",
            category: updatedCategory,
          });
      } catch (error) {
        handleError(res, "update category", error);
      }
    },

    // Hapus kategori
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
