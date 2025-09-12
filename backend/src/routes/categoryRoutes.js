import { Router } from "express";
import slugify from "slugify";

const categoryRouterFactory = ({ pool }) => {
  const categoryRouter = Router();

  categoryRouter.get("/", async (req, res) => {
    console.log(
      "[Category Route] GET / hit (mounted at /api/admin/categories)."
    );

    try {
      const sql = `SELECT id, name, slug, description, created_at, updated_at FROM categories ORDER BY name ASC`;

      console.log("[Category Route] Executing query:", sql);

      const [rows] = await pool.execute(sql);

      console.log(`[Category Route] Fetched ${rows.length} categories.`);

      res.status(200).json(rows);
    } catch (error) {
      console.error("[Category Route] Error fetching categories:", error);

      if (error.code) {
        console.error("MySQL Error Code:", error.code);
        console.error("MySQL Error No:", error.errno);
        console.error("MySQL SQL State:", error.sqlState);
        console.error("MySQL SQL Message:", error.sqlMessage);
        console.error("MySQL SQL Query:", error.sql);
      }
      res
        .status(500)
        .json({ message: "Failed to fetch categories", error: error.message });
    }
  });

  categoryRouter.get("/:id", async (req, res) => {
    console.log(
      "[Category Route] GET /:id hit (mounted at /api/admin/categories)."
    );
    const { id } = req.params;

    try {
      const [rows] = await pool.execute(
        "SELECT id, name, slug, description, created_at, updated_at FROM categories WHERE id = ? LIMIT 1",
        [id]
      );

      if (rows.length === 0) {
        console.log(`[Category Route] Category with ID ${id} not found.`);
        return res.status(404).json({ message: "Category not found." });
      }

      const category = rows[0];

      console.log(`[Category Route] Fetched category with ID ${id}.`);
      res.status(200).json(category);
    } catch (error) {
      console.error(
        `[Category Route] Error fetching category with ID ${id}:`,
        error
      );

      if (error.code) {
        console.error("MySQL Error Code:", error.code);
        console.error("MySQL Error No:", error.errno);
        console.error("MySQL SQL State:", error.sqlState);
        console.error("MySQL SQL Message:", error.sqlMessage);
        console.error("MySQL SQL Query:", error.sql);
      }
      res.status(500).json({ message: "Failed to fetch category." });
    }
  });

  categoryRouter.post("/", async (req, res) => {
    console.log(
      "[Category Route] POST / hit (mounted at /api/admin/categories)."
    );
    const { name, description } = req.body;

    if (!name) {
      return res.status(400).json({ message: "Category name is required." });
    }

    const slug = slugify(name, { lower: true, strict: true });

    try {
      const [existing] = await pool.execute(
        "SELECT id FROM categories WHERE name = ? OR slug = ? LIMIT 1",
        [name, slug]
      );

      if (existing.length > 0) {
        console.warn(
          `[Category Route] Category with name "${name}" or slug "${slug}" already exists.`
        );
        return res
          .status(409)
          .json({ message: "Category name or slug already exists." });
      }

      const [result] = await pool.execute(
        `INSERT INTO categories (name, slug, description)
         VALUES (?, ?, ?)`,
        [name, slug, description]
      );

      const newCategoryId = result.insertId;

      console.log(
        "[Category Route] New category created in DB:",
        newCategoryId
      );

      const [newRows] = await pool.execute(
        "SELECT id, name, slug, description, created_at, updated_at FROM categories WHERE id = ?",
        [newCategoryId]
      );

      const newCategory = newRows[0];

      res.status(201).json(newCategory);
    } catch (error) {
      console.error("[Category Route] Error creating category:", error);
      if (error.code) {
        console.error("MySQL Error Code:", error.code);
        console.error("MySQL Error No:", error.errno);
        console.error("MySQL SQL State:", error.sqlState);
        console.error("MySQL SQL Message:", error.sqlMessage);
        console.error("MySQL SQL Query:", error.sql);
      }
      res
        .status(500)
        .json({ message: "Failed to create category", error: error.message });
    }
  });

  categoryRouter.put("/:id", async (req, res) => {
    console.log(
      "[Category Route] PUT /:id hit (mounted at /api/admin/categories)."
    );
    const { id } = req.params;
    const { name, description } = req.body;

    if (!name) {
      return res
        .status(400)
        .json({ message: "Category name is required for update." });
    }

    const slug = slugify(name, { lower: true, strict: true });

    try {
      const [existing] = await pool.execute(
        "SELECT id FROM categories WHERE (name = ? OR slug = ?) AND id != ? LIMIT 1",
        [name, slug, id]
      );

      if (existing.length > 0) {
        console.warn(
          `[Category Route] Updated category name "${name}" or slug "${slug}" already exists for another category.`
        );
        return res.status(409).json({
          message: "Category name or slug already exists for another category.",
        });
      }

      const updates = {};
      if (name !== undefined) updates.name = name;
      if (description !== undefined) updates.description = description;

      if (name !== undefined) updates.slug = slug;

      const updateFields = Object.keys(updates);
      if (updateFields.length === 0) {
        return res
          .status(400)
          .json({ message: "No valid update fields provided." });
      }

      const setClauses = updateFields.map((field) => `${field} = ?`).join(", ");
      const updateValues = Object.values(updates);

      const [result] = await pool.execute(
        `UPDATE categories SET ${setClauses} WHERE id = ?`,
        [...updateValues, id]
      );

      console.log(
        `[Category Route] Category ID ${id} updated in DB. Rows affected: ${result.affectedRows}`
      );

      if (result.affectedRows === 0) {
        console.warn(
          `[Category Route] Category with ID ${id} not found for update.`
        );
        return res
          .status(404)
          .json({ message: "Category not found for update." });
      }

      const [updatedRows] = await pool.execute(
        "SELECT id, name, slug, description, created_at, updated_at FROM categories WHERE id = ?",
        [id]
      );

      const updatedCategory = updatedRows[0];

      res.status(200).json(updatedCategory);
    } catch (error) {
      console.error(
        `[Category Route] Error updating category with ID ${id}:`,
        error
      );
      if (error.code) {
        console.error("MySQL Error Code:", error.code);
        console.error("MySQL Error No:", error.errno);
        console.error("MySQL SQL State:", error.sqlState);
        console.error("MySQL SQL Message:", error.sqlMessage);
        console.error("MySQL SQL Query:", error.sql);
      }
      res
        .status(500)
        .json({ message: "Failed to update category", error: error.message });
    }
  });

  categoryRouter.delete("/:id", async (req, res) => {
    console.log(
      "[Category Route] DELETE /:id hit (mounted at /api/admin/categories)."
    );
    const { id } = req.params;

    try {
      const [result] = await pool.execute(
        "DELETE FROM categories WHERE id = ?",
        [id]
      );

      console.log(
        `[Category Route] Category ID ${id} deleted from DB. Rows affected: ${result.affectedRows}`
      );

      if (result.affectedRows === 0) {
        console.warn(
          `[Category Route] Category with ID ${id} not found for deletion.`
        );
        return res
          .status(404)
          .json({ message: "Category not found for deletion." });
      }

      res.status(200).json({ message: "Category deleted successfully." });
    } catch (error) {
      console.error(
        `[Category Route] Error deleting category with ID ${id}:`,
        error
      );
      if (error.code) {
        console.error("MySQL Error Code:", error.code);
        console.error("MySQL Error No:", error.errno);
        console.error("MySQL SQL State:", error.sqlState);
        console.error("MySQL SQL Message:", error.sqlMessage);
        console.error("MySQL SQL Query:", error.sql);
      }
      res
        .status(500)
        .json({ message: "Failed to delete category", error: error.message });
    }
  });

  return categoryRouter;
};

export default categoryRouterFactory;
