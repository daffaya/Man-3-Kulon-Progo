import { Router } from "express";

const tagRouterFactory = ({ pool }) => {
  const tagRouter = Router();

  tagRouter.get("/", async (req, res) => {
    console.log("[Tag Route] GET / hit (mounted at /api/tags).");
    try {
      const [rows] = await pool.execute(
        "SELECT tags FROM articles WHERE published = TRUE"
      );

      const allTags = new Set();

      rows.forEach((row) => {
        if (row.tags) {
          let tagsArray;
          if (typeof row.tags === "string") {
            try {
              tagsArray = JSON.parse(row.tags);
            } catch (e) {
              console.error(
                "[Tag Route] Error parsing JSON tags from DB:",
                row.tags,
                e
              );
              tagsArray = [];
            }
          } else if (Array.isArray(row.tags)) {
            tagsArray = row.tags;
          } else {
            console.warn(
              "[Tag Route] Tags data in unexpected format:",
              row.tags
            );
            tagsArray = [];
          }

          if (Array.isArray(tagsArray)) {
            tagsArray.forEach((tag) => {
              if (typeof tag === "string" && tag.trim() !== "") {
                allTags.add(tag.trim());
              } else {
                console.warn(
                  "[Tag Route] Tag item in unexpected format (not string or empty):",
                  tag
                );
              }
            });
          }
        }
      });

      const uniqueTags = Array.from(allTags).sort();

      console.log(
        "[Tag Route] Successfully fetched and processed unique tags:",
        uniqueTags.length,
        "tags found."
      );

      res.status(200).json(uniqueTags);
    } catch (error) {
      console.error("[Tag Route] Error fetching unique public tags:", error);
      if (error.code) {
        console.error("MySQL Error Code:", error.code);
        console.error("MySQL Error No:", error.errno);
        console.error("MySQL SQL State:", error.sqlState);
        console.error("MySQL SQL Message:", error.sqlMessage);
        console.error("MySQL SQL Query:", error.sql);
      }
      res
        .status(500)
        .json({ message: "Failed to fetch tags", error: error.message });
    }
  });

  return tagRouter;
};

export default tagRouterFactory;
