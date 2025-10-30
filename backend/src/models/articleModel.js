// backend/src/models/articleModel.js

/**
 * Factory function that creates an Article model for interacting with the database.
 *
 * @param {object} options
 * @param {import('mysql2/promise').Pool} options.pool - MySQL connection pool
 * @returns {object} Article model methods
 */
const createArticleModel = ({ pool }) => {
  /**
   * Normalize raw tag data from MySQL into a consistent string array.
   * Handles cases where tags may be JSON, string, array, or object.
   * @param {any} rawTags
   * @returns {string[]}
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
     * Create a new article record.
     * @param {object} articleData - Data for the new article.
     * @returns {Promise<string|number>} Inserted article ID.
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
     * Find all articles with optional filters and pagination.
     * Supports filters for keyword, published, featured, tag, and category.
     * @param {object} [filters={}]
     * @returns {Promise<{articles: object[], totalArticles: number, totalPages: number, currentPage: number, articlesPerPage: number}>}
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
     * Find article by its ID.
     * @param {string|number} id
     * @returns {Promise<object|null>}
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
     * Find article by slug.
     * @param {string} slug
     * @returns {Promise<object|null>}
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
     * Update article by ID.
     * @param {string|number} id
     * @param {object} articleData
     * @returns {Promise<boolean>} Whether the update succeeded
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
     * Delete article by ID.
     * @param {string|number} id
     * @returns {Promise<boolean>}
     */
    async delete(id) {
      const [result] = await pool.execute(
        "DELETE FROM articles WHERE id = ?;",
        [id]
      );
      return result.affectedRows > 0;
    },
  };
};

export default createArticleModel;
