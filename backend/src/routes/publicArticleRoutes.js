import { Router } from "express";
import slugify from "slugify";

const publicArticleRouterFactory = ({ pool }) => {
  const publicArticleRouter = Router();

  publicArticleRouter.get("/", async (req, res) => {
    console.log("[Public Article Route] GET / hit (mounted at /api/articles).");

    const tag = req.query.tag;
    const keyword = req.query.keyword;

    const categoryFilter = req.query.category;

    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.max(1, parseInt(req.query.limit) || 10);

    const offset = (page - 1) * limit;

    try {
      const conditions = ["articles.published = TRUE"];
      const queryParams = [];

      if (keyword) {
        conditions.push("(articles.title LIKE ? OR articles.content LIKE ?)");
        queryParams.push(`%${keyword}%`, `%${keyword}%`);
      }

      const tagsToFilter = Array.isArray(tag) ? tag : tag ? [tag] : [];
      if (tagsToFilter.length > 0) {
        const tagConditions = tagsToFilter.map(
          (t) => "JSON_CONTAINS(articles.tags, JSON_ARRAY(?), '$')"
        );
        conditions.push(`(${tagConditions.join(" OR ")})`);
        tagsToFilter.forEach((t) => {
          queryParams.push(t);
        });
        console.log(
          `[Public Article Route] Adding tag filter: ${tagsToFilter.join(", ")}`
        );
      }

      if (categoryFilter) {
        conditions.push("categories.slug = ?");
        queryParams.push(categoryFilter);
        console.log(
          `[Public Article Route] Adding category filter by slug: ${categoryFilter}`
        );
      }

      const whereClause =
        conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

      const sql = `SELECT
                        articles.id,
                        articles.title,
                        articles.slug,
                        articles.content,
                        articles.overview,
                        articles.cover_image,
                        articles.published_date,
                        articles.featured,
                        articles.published,
                        articles.author_name,
                        articles.author_avatar,
                        articles.tags,
                        articles.reading_time,
                        articles.last_modified,
                        articles.category_id,
                        categories.name AS category_name,
                        categories.slug AS category_slug
                    FROM
                        articles
                    LEFT JOIN
                        categories ON articles.category_id = categories.id
                    ${whereClause}
                    ORDER BY articles.published_date DESC -- Urutkan berdasarkan published_date untuk publik
                    LIMIT ${limit} OFFSET ${offset}`;
      const [rows] = await pool.execute(sql, queryParams);

      const [totalRows] = await pool.execute(
        `SELECT COUNT(*) AS total
           FROM articles
           LEFT JOIN categories ON articles.category_id = categories.id
           ${whereClause}`,
        queryParams
      );
      const totalArticles = totalRows[0].total;

      const articles = rows.map((row) => {
        let tagsArray = Array.isArray(row.tags) ? row.tags : [];

        if (!Array.isArray(tagsArray)) {
          console.warn(
            `[Public Article Route] Tags for article ID ${row.id} is not an array after check.`
          );
          tagsArray = [];
        }

        const authorName = row.author_name || "Unknown Author";
        const authorAvatar = row.author_avatar || "/default-avatar.jpg";

        const category = row.category_id
          ? {
              id: row.category_id,
              name: row.category_name,
              slug: row.category_slug,
            }
          : null;

        return {
          id: row.id,
          title: row.title,
          slug: row.slug,
          content: row.content,
          overview: row.overview,
          coverImage: row.cover_image,
          publishedDate: row.published_date,
          featured: row.featured === 1,
          published: row.published === 1,
          readingTime: row.reading_time,
          tags: tagsArray,
          author: {
            name: authorName,
            avatar: authorAvatar,
          },

          category_id: row.category_id,
          category: category,
        };
      });

      res.status(200).json({
        articles: articles,
        totalArticles: totalArticles,
        totalPages: Math.ceil(totalArticles / limit),
        currentPage: page,
        articlesPerPage: limit,
      });
    } catch (error) {
      console.error(
        "[Public Article Route] Error fetching public articles with filters and pagination:",
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
        .json({ message: "Failed to fetch articles", error: error.message });
    }
  });

  publicArticleRouter.get("/:slug", async (req, res) => {
    const { slug } = req.params;

    try {
      const [rows] = await pool.execute(
        `SELECT
                  articles.id,
                  articles.title,
                  articles.slug,
                  articles.content,
                  articles.overview,
                  articles.cover_image,
                  articles.published_date,
                  articles.featured,
                  articles.published,
                  articles.author_name,
                  articles.author_avatar,
                  articles.tags,
                  articles.reading_time,
                  articles.last_modified,
                  articles.category_id,
                  categories.name AS category_name,
                  categories.slug AS category_slug
              FROM
                  articles
              LEFT JOIN
                  categories ON articles.category_id = categories.id
              WHERE articles.slug = ? AND articles.published = TRUE LIMIT 1`,
        [slug]
      );

      if (rows.length === 0) {
        console.log(
          `[Public Article Route] Public article with slug "${slug}" not found or not published.`
        );
        return res.status(404).json({ message: "Article not found." });
      }

      const row = rows[0];

      let tagsArray = Array.isArray(row.tags) ? row.tags : [];

      if (!Array.isArray(tagsArray)) {
        console.warn(
          `[Public Article Route] Tags for article slug "${slug}" is not an array after check.`
        );
        tagsArray = [];
      }

      const authorName = row.author_name || "Unknown Author";
      const authorAvatar = row.author_avatar || "/default-avatar.jpg";

      const category = row.category_id
        ? {
            id: row.category_id,
            name: row.category_name,
            slug: row.category_slug,
          }
        : null;

      const article = {
        id: row.id,
        title: row.title,
        slug: row.slug,
        content: row.content,
        overview: row.overview,
        coverImage: row.cover_image,
        publishedDate: row.published_date,
        featured: row.featured === 1,
        published: row.published === 1,
        readingTime: row.reading_time,
        tags: tagsArray,
        author: {
          name: authorName,
          avatar: authorAvatar,
        },
        lastModified: row.last_modified,
        category_id: row.category_id,
        category: category,
      };

      console.log(
        `[Public Article Route] Fetched public article with slug "${slug}".`
      );
      res.status(200).json(article);
    } catch (error) {
      console.error(
        `[Public Article Route] Error fetching public article with slug "${slug}":`,
        error
      );

      if (error.code) {
        console.error("MySQL Error Code:", error.code);
        console.error("MySQL Error No:", error.errno);
        console.error("MySQL SQL State:", error.sqlState);
        console.error("MySQL SQL Message:", error.sqlMessage);
        console.error("MySQL SQL Query:", error.sql);
      }
      res.status(500).json({ message: "Failed to fetch article." });
    }
  });

  return publicArticleRouter;
};

export default publicArticleRouterFactory;
