/**
 * @fileoverview Article model for database interactions.
 * This module provides a factory function to create an Article model.
 * The model includes methods for CRUD (Create, Read, Update, Delete) operations
 * on the 'articles' table in the database, including functionalities to find
 * articles by various criteria like ID, slug, tags, and category.
 */

/**
 * Factory function that creates an Article model for interacting with the database.
 *
 * @param {object} options
 * @param {import('mysql2/promise').Pool} options.pool - MySQL connection pool.
 * @returns {object} Article model methods.
 */
const createArticleModel = ({ pool }) => {
  /**
   * Normalizes raw tag data from the database into a consistent array of strings.
   * Handles various input formats such as JSON strings, comma-separated strings,
   * arrays, or objects.
   *
   * @param {any} rawTags - The raw tag data from the database.
   * @returns {string[]} An array of normalized tag strings.
   */
  const normalizeTags = (rawTags) => {
    let tagsArray = [];

    if (Array.isArray(rawTags)) {
      tagsArray = rawTags;
    } else if (typeof rawTags === "string") {
      try {
        tagsArray = JSON.parse(rawTags);
      } catch {
        tagsArray = rawTags.split(",").map((t) => t.trim());
      }
    } else if (rawTags && typeof rawTags === "object") {
      tagsArray = Object.values(rawTags);
    }

    if (!Array.isArray(tagsArray)) tagsArray = [];

    return tagsArray
      .map((tag) => String(tag).trim())
      .filter((tag) => tag.length > 0);
  };

  return {
    /**
     * Creates a new article record in the database.
     *
     * @param {object} articleData - Data for the new article.
     * @param {string|number} articleData.id - Unique identifier for the article.
     * @param {string} articleData.title - Title of the article.
     * @param {string} articleData.slug - URL-friendly slug for the article.
     * @param {string} articleData.content - Full content of the article.
     * @param {string} articleData.overview - A short summary or overview of the article.
     * @param {string|null} articleData.coverImage - URL to the article's cover image.
     * @param {string[]} articleData.tags - An array of tags associated with the article.
     * @param {Date} articleData.publishedDate - The publication date of the article.
     * @param {boolean} articleData.featured - Whether the article is featured.
     * @param {boolean} articleData.published - Whether the article is published.
     * @param {string} articleData.authorName - Name of the author.
     * @param {string} articleData.authorAvatar - URL to the author's avatar.
     * @param {number} articleData.readingTime - Estimated reading time in minutes.
     * @param {number} articleData.categoryId - ID of the article's category.
     * @returns {Promise<string|number>} A promise that resolves to the ID of the newly created article.
     */
    async create(articleData) {
      try {
        const {
          id,
          title,
          slug,
          content,
          overview,
          coverImage,
          tags,
          publishedDate,
          featured,
          published,
          authorName,
          authorAvatar,
          readingTime,
          categoryId,
        } = articleData;

        const sql = `
          INSERT INTO articles 
          SET 
            id = ?, 
            title = ?, 
            slug = ?, 
            content = ?, 
            overview = ?, 
            cover_image = ?, 
            tags = ?, 
            published_date = ?, 
            featured = ?, 
            published = ?, 
            author_name = ?, 
            author_avatar = ?, 
            reading_time = ?, 
            category_id = ?
        `;

        const params = [
          id,
          title,
          slug,
          content,
          overview,
          coverImage,
          JSON.stringify(tags),
          publishedDate,
          featured ? 1 : 0,
          published ? 1 : 0,
          authorName,
          authorAvatar,
          readingTime,
          categoryId,
        ];

        const [result] = await pool.execute(sql, params);
        return result.insertId || id;
      } catch (error) {
        console.error("[ArticleModel] Error creating article:", error);
        throw error;
      }
    },

    /**
     * Finds all articles with optional filters and pagination.
     *
     * @param {object} [filters={}] - Filtering and pagination options.
     * @param {string} [filters.keyword=""] - Keyword to search in title and content.
     * @param {boolean|null} [filters.published=null] - Filter by publication status.
     * @param {boolean|null} [filters.featured=null] - Filter by featured status.
     * @param {string|string[]} [filters.tag=""] - Filter by one or more tags.
     * @param {string} [filters.category=""] - Filter by category slug.
     * @param {number} [filters.page=1] - The page number for pagination.
     * @param {number} [filters.limit=10] - The number of articles per page.
     * @returns {Promise<{articles: object[], totalArticles: number, totalPages: number, currentPage: number, articlesPerPage: number}>} A promise that resolves to an object containing the articles and pagination metadata.
     */
    async findAll(filters = {}) {
      const {
        keyword = "",
        published = null,
        featured = null,
        tag = "",
        category = "",
        page = 1,
        limit = 10,
      } = filters;

      const offset = (page - 1) * limit;
      const conditions = [];
      const queryParams = [];

      if (keyword) {
        conditions.push("(articles.title LIKE ? OR articles.content LIKE ?)");
        queryParams.push(`%${keyword}%`, `%${keyword}%`);
      }

      if (published !== null) {
        conditions.push("articles.published = ?");
        queryParams.push(published ? 1 : 0);
      }

      if (featured !== null) {
        conditions.push("articles.featured = ?");
        queryParams.push(featured ? 1 : 0);
      }

      const tagsToFilter = Array.isArray(tag) ? tag : tag ? [tag] : [];
      if (tagsToFilter.length > 0) {
        const tagConditions = tagsToFilter.map(
          () => "JSON_CONTAINS(articles.tags, JSON_ARRAY(?), '$')"
        );
        conditions.push(`(${tagConditions.join(" OR ")})`);
        queryParams.push(...tagsToFilter);
      }

      if (category) {
        conditions.push("categories.slug = ?");
        queryParams.push(category);
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
          articles.last_modified,
          articles.featured,
          articles.published,
          articles.author_name,
          articles.author_avatar,
          articles.tags,
          articles.reading_time,
          articles.category_id,
          categories.name AS category_name,
          categories.slug AS category_slug
        FROM articles
        LEFT JOIN categories ON articles.category_id = categories.id
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

      const articles = rows.map((row) => ({
        id: row.id,
        title: row.title,
        slug: row.slug,
        content: row.content,
        overview: row.overview,
        coverImage: row.cover_image,
        publishedDate: row.published_date,
        lastModified: row.last_modified,
        featured: row.featured === 1,
        published: row.published === 1,
        readingTime: row.reading_time,
        tags: normalizeTags(row.tags),
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
      }));

      return {
        articles,
        totalArticles,
        totalPages: Math.ceil(totalArticles / limit),
        currentPage: page,
        articlesPerPage: limit,
      };
    },

    /**
     * Finds a single article by its unique ID.
     *
     * @param {string|number} id - The ID of the article to find.
     * @returns {Promise<object|null>} A promise that resolves to the article object if found, otherwise `null`.
     */
    async findById(id) {
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
          articles.last_modified,
          articles.featured,
          articles.published,
          articles.author_name,
          articles.author_avatar,
          articles.tags,
          articles.reading_time,
          articles.category_id,
          categories.name AS category_name,
          categories.slug AS category_slug
        FROM articles
        LEFT JOIN categories ON articles.category_id = categories.id
        WHERE articles.id = ?;
      `,
        [id]
      );

      if (rows.length === 0) return null;

      const row = rows[0];
      return {
        id: row.id,
        title: row.title,
        slug: row.slug,
        content: row.content,
        overview: row.overview,
        coverImage: row.cover_image,
        publishedDate: row.published_date,
        lastModified: row.last_modified,
        featured: row.featured === 1,
        published: row.published === 1,
        readingTime: row.reading_time,
        tags: normalizeTags(row.tags),
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
    },

    /**
     * Finds a single article by its unique slug.
     *
     * @param {string} slug - The slug of the article to find.
     * @returns {Promise<object|null>} A promise that resolves to the article object if found, otherwise `null`.
     */
    async findBySlug(slug) {
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
          articles.last_modified,
          articles.featured,
          articles.published,
          articles.author_name,
          articles.author_avatar,
          articles.tags,
          articles.reading_time,
          articles.category_id,
          categories.name AS category_name,
          categories.slug AS category_slug
        FROM articles
        LEFT JOIN categories ON articles.category_id = categories.id
        WHERE articles.slug = ?;
      `,
        [slug]
      );

      if (rows.length === 0) return null;

      const row = rows[0];
      return {
        id: row.id,
        title: row.title,
        slug: row.slug,
        content: row.content,
        overview: row.overview,
        coverImage: row.cover_image,
        publishedDate: row.published_date,
        lastModified: row.last_modified,
        featured: row.featured === 1,
        published: row.published === 1,
        readingTime: row.reading_time,
        tags: normalizeTags(row.tags),
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
    },

    /**
     * Updates an existing article in the database by its ID.
     *
     * @param {string|number} id - The ID of the article to update.
     * @param {object} articleData - An object containing the article data to be updated.
     * @returns {Promise<boolean>} A promise that resolves to `true` if the article was successfully updated, otherwise `false`.
     */
    async update(id, articleData) {
      const {
        title,
        slug,
        content,
        overview,
        coverImage,
        tags,
        publishedDate,
        featured,
        published,
        authorName,
        authorAvatar,
        readingTime,
        categoryId,
      } = articleData;

      const sql = `
        UPDATE articles SET
          title = ?,
          slug = ?,
          content = ?,
          overview = ?,
          cover_image = ?,
          tags = ?,
          published_date = ?,
          last_modified = NOW(),
          featured = ?,
          published = ?,
          author_name = ?,
          author_avatar = ?,
          reading_time = ?,
          category_id = ?
        WHERE id = ?;
      `;

      const [result] = await pool.execute(sql, [
        title,
        slug,
        content,
        overview,
        coverImage,
        JSON.stringify(tags),
        publishedDate,
        featured ? 1 : 0,
        published ? 1 : 0,
        authorName,
        authorAvatar,
        readingTime,
        categoryId,
        id,
      ]);

      return result.affectedRows > 0;
    },

    /**
     * Deletes an article from the database by its ID.
     *
     * @param {string|number} id - The ID of the article to delete.
     * @returns {Promise<boolean>} A promise that resolves to `true` if the article was successfully deleted, otherwise `false`.
     */
    async delete(id) {
      const [result] = await pool.execute(
        "DELETE FROM articles WHERE id = ?;",
        [id]
      );
      return result.affectedRows > 0;
    },

    /**
     * Unfeatures all articles except the one specified by ID.
     * @param {string|number} excludeId - The ID of the article to keep featured.
     * @returns {Promise<boolean>} A promise that resolves to `true` if successful.
     */
    async unfeatureAllExcept(excludeId) {
      try {
        const [featuredArticles] = await pool.execute(
          "SELECT id FROM articles WHERE featured = 1 AND id != ?",
          [excludeId]
        );

        if (featuredArticles.length === 0) {
          return true;
        }

        const sql = `
      UPDATE articles 
      SET featured = 0 
      WHERE id != ? AND featured = 1;
    `;
        const [result] = await pool.execute(sql, [excludeId]);

        console.log(
          `[ArticleModel] Unfeatured ${result.affectedRows} articles`
        );
        return result.affectedRows > 0;
      } catch (error) {
        console.error("[ArticleModel] Error unfeaturing articles:", error);
        throw error;
      }
    },
  };
};

export default createArticleModel;
