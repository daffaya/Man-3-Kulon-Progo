import { Router } from "express";

const publicCategoryRouterFactory = ({ pool }) => {
  const publicCategoryRouter = Router();

  publicCategoryRouter.get("/", async (req, res) => {
    try {
      const sql = `SELECT id, name, slug, description FROM categories ORDER BY name ASC`;

      console.log("[Public Category Route] Executing query:", sql);

      const [rows] = await pool.execute(sql);

      res.status(200).json(rows);
    } catch (error) {
      console.error(
        "[Public Category Route] Error fetching public categories:",
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
        .json({ message: "Failed to fetch categories", error: error.message });
    }
  });

  return publicCategoryRouter;
};

export default publicCategoryRouterFactory;
