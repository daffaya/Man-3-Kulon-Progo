/**
 * @fileoverview Router for public article endpoints.
 * This module defines and configures an Express router for fetching published articles.
 * It provides endpoints for listing articles with pagination and filtering, and for fetching
 * individual articles by slug.
 */

import { Router } from "express";

/**
 * Factory function that creates the public article router.
 * This router handles endpoints for fetching published articles.
 *
 * @param {object} options - The options object.
 * @param {import('mysql2/promise').Pool} options.pool - MySQL connection pool.
 * @returns {import('express').Router} Express router for public article routes.
 */
const publicArticleRouterFactory = ({ pool }) => {
  const publicArticleRouter = Router();

  /**
   * GET /api/articles
   * Fetches a paginated list of published articles with optional filtering.
   *
   * @route GET /api/articles
   * @param {string} [req.query.tag] - Filter by one or multiple tags.
   * @param {string} [req.query.category] - Filter by category slug.
   * @param {string} [req.query.keyword] - Search by title or content.
   * @param {number} [req.query.page=1] - Page number for pagination.
   * @param {number} [req.query.limit=10] - Number of articles per page.
   * @returns {object} Paginated list of articles with metadata.
   */
  publicArticleRouter.get("/", async (req, res) => {
    const { tag, keyword, category: categoryFilter } = req.query;
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
          () => "JSON_CONTAINS(articles.tags, JSON_ARRAY(?), '$')"
        );
        conditions.push(`(${tagConditions.join(" OR ")})`);
        queryParams.push(...tagsToFilter);
      }

      if (categoryFilter) {
        conditions.push("categories.slug = ?");
        queryParams.push(categoryFilter);
      }

      const whereClause =
        conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

      const sql = `
        SELECT
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
        ORDER BY articles.published_date DESC
        LIMIT ${limit} OFFSET ${offset};
      `;

      const [rows] = await pool.execute(sql, queryParams);

      const [totalRows] = await pool.execute(
        `
        SELECT COUNT(*) AS total
        FROM articles
        LEFT JOIN categories ON articles.category_id = categories.id
        ${whereClause};
      `,
        queryParams
      );
      const totalArticles = totalRows[0].total;

      const articles = rows.map((row) => {
        let tagsArray = [];

        if (row.tags) {
          try {
            tagsArray = Array.isArray(row.tags)
              ? row.tags
              : JSON.parse(row.tags);
          } catch {
            tagsArray = [];
          }
        }

        if (!Array.isArray(tagsArray)) tagsArray = [];

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
            name: row.author_name || "Unknown Author",
            avatar: row.author_avatar || "/default-avatar.jpg",
          },
          category_id: row.category_id,
          category: row.category_id
            ? {
                id: row.category_id,
                name: row.category_name,
                slug: row.category_slug,
              }
            : null,
        };
      });

      res.status(200).json({
        articles,
        totalArticles,
        totalPages: Math.ceil(totalArticles / limit),
        currentPage: page,
        articlesPerPage: limit,
      });
    } catch (error) {
      console.error("Error fetching public articles:", error);
      res.status(500).json({
        message: "Failed to fetch articles.",
        error: error.message,
      });
    }
  });

  /**
   * GET /api/articles/:slug
   * Fetches a single published article by its slug.
   *
   * @route GET /api/articles/:slug
   * @param {string} req.params.slug - The slug of the article to fetch.
   * @returns {object} The requested article or an error message.
   */
  publicArticleRouter.get("/:slug", async (req, res) => {
    const { slug } = req.params;

    try {
      const [rows] = await pool.execute(
        `
        SELECT
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
        WHERE articles.slug = ? AND articles.published = TRUE
        LIMIT 1;
      `,
        [slug]
      );

      if (rows.length === 0)
        return res.status(404).json({ message: "Article not found." });

      const row = rows[0];
      let tagsArray = [];

      try {
        tagsArray = Array.isArray(row.tags)
          ? row.tags
          : JSON.parse(row.tags || "[]");
      } catch {
        tagsArray = [];
      }

      tagsArray = tagsArray
        .map((tag) => String(tag).trim())
        .filter((tag) => tag.length > 0);

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
        lastModified: row.last_modified,
        tags: tagsArray,
        author: {
          name: row.author_name || "Unknown Author",
          avatar: row.author_avatar || "/default-avatar.jpg",
        },
        category_id: row.category_id,
        category: row.category_id
          ? {
              id: row.category_id,
              name: row.category_name,
              slug: row.category_slug,
            }
          : null,
      };

      res.status(200).json(article);
    } catch (error) {
      console.error(`Error fetching article with slug "${slug}":`, error);
      res
        .status(500)
        .json({ message: "Failed to fetch article.", error: error.message });
    }
  });

  return publicArticleRouter;
};

export default publicArticleRouterFactory;
