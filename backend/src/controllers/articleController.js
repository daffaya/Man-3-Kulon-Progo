import slugify from "slugify";
import { calculateReadingTime } from "../utils/helper.js";
import { v4 as uuidv4 } from "uuid";

/**
 * Factory function to create an Article Controller with CRUD operations.
 * @param {Object} dependencies - Dependencies to be injected
 * @param {Object} dependencies.articleModel - Model for article operations
 * @param {Object} dependencies.categoryModel - Model for category operations (optional)
 * @param {Object} dependencies.userModel - Model for user operations (optional)
 * @returns {Object} Controller with CRUD methods
 */
const createArticleController = ({
  articleModel,
  categoryModel,
  userModel,
}) => {
  /**
   * Helper function to extract author information from user data
   * @param {Object} user - User object
   * @returns {Object} Author information with name and avatar
   */
  const getAuthorInfo = (user) => {
    if (!user) {
      return {
        name: "Penulis Pena",
        avatar: "/logo.png",
      };
    }

    return {
      name: user.full_name || user.username,
      avatar: user.avatar || "/logo.png",
    };
  };

  /**
   * Helper function to parse tags from request
   * @param {string|Array} tags - Tags from request body
   * @returns {Array} Parsed tags array
   */
  const parseTags = (tags) => {
    try {
      return typeof tags === "string" ? JSON.parse(tags) : tags;
    } catch {
      return [];
    }
  };

  /**
   * Helper function to prepare article data from request
   * @param {Object} req - Express request object
   * @param {string} [id] - Article ID (for updates)
   * @returns {Object} Prepared article data
   */
  const prepareArticleData = async (req, id = null) => {
    const {
      title = "",
      content = "",
      overview = "",
      coverImage = "",
      tags = "[]",
      publishedDate = new Date().toISOString().split("T")[0],
      featured = "false",
      published = "false",
      category_id = null,
    } = req.body;

    const parsedTags = parseTags(tags);
    const slug = slugify(title, {
      lower: true,
      strict: true,
      remove: /[*+~.()'"!:@]/g,
    });
    const readingTime = calculateReadingTime(content);
    const finalCoverImage = req.file
      ? `/uploads/covers/${req.file.filename}`
      : coverImage;

    let authorInfo = getAuthorInfo(null);
    if (userModel && req.user) {
      const user = await userModel.findById(req.user.id);
      authorInfo = getAuthorInfo(user);
    }

    return {
      id: id || uuidv4(),
      title,
      slug,
      content,
      overview,
      coverImage: finalCoverImage,
      tags: parsedTags,
      publishedDate,
      featured: featured === "true" || featured === true,
      published: published === "true" || published === true,
      authorName: authorInfo.name,
      authorAvatar: authorInfo.avatar,
      readingTime,
      categoryId: category_id ? parseInt(category_id, 10) : null,
    };
  };

  return {
    /**
     * Creates a new article with data from request body and file upload.
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     * @returns {Promise<void>}
     */
    createArticle: async (req, res) => {
      try {
        if (!req.body) {
          return res.status(400).json({ message: "Request body is missing" });
        }

        const { title, content, overview } = req.body;
        if (!title || !content || !overview) {
          return res.status(400).json({
            message: "Title, content, and overview are required",
          });
        }

        const articleData = await prepareArticleData(req);
        const newArticleId = await articleModel.create(articleData);
        const newArticle = await articleModel.findById(newArticleId);

        res.status(201).json({
          message: "Article created successfully",
          article: newArticle,
        });
      } catch (error) {
        res.status(500).json({
          message: "Failed to create article",
          error: error.message,
        });
      }
    },

    /**
     * Updates an article by ID.
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     * @returns {Promise<void>}
     */
    updateArticle: async (req, res) => {
      try {
        const { id } = req.params;

        if (!req.body) {
          return res.status(400).json({ message: "Request body is missing" });
        }

        const { title, content, overview } = req.body;
        if (!title || !content || !overview) {
          return res.status(400).json({
            message: "Title, content, and overview are required",
          });
        }

        const articleData = await prepareArticleData(req, id);
        const updated = await articleModel.update(id, articleData);

        if (!updated) {
          return res.status(404).json({ message: "Article not found" });
        }

        const updatedArticle = await articleModel.findById(id);
        res.status(200).json({
          message: "Article updated successfully",
          article: updatedArticle,
        });
      } catch (error) {
        res.status(500).json({
          message: "Failed to update article",
          error: error.message,
        });
      }
    },

    /**
     * Deletes an article by ID.
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     * @returns {Promise<void>}
     */
    deleteArticle: async (req, res) => {
      try {
        const { id } = req.params;
        const deleted = await articleModel.delete(id);

        if (!deleted) {
          return res.status(404).json({ message: "Article not found" });
        }

        res.status(200).json({ message: "Article deleted successfully" });
      } catch (error) {
        res.status(500).json({
          message: "Failed to delete article",
          error: error.message,
        });
      }
    },

    /**
     * Retrieves all articles for admin with filters and pagination.
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     * @returns {Promise<void>}
     */
    getAllArticles: async (req, res) => {
      try {
        const filters = {
          keyword: req.query.keyword || "",
          published:
            req.query.published === "true"
              ? true
              : req.query.published === "false"
              ? false
              : undefined,
          featured:
            req.query.featured === "true"
              ? true
              : req.query.featured === "false"
              ? false
              : undefined,
          tag: req.query.tag || "",
          category: req.query.category || "",
          page: parseInt(req.query.page, 10) || 1,
          limit: parseInt(req.query.limit, 10) || 10,
        };

        const result = await articleModel.findAll(filters);
        res.status(200).json(result);
      } catch (error) {
        res.status(500).json({
          message: "Failed to fetch articles",
          error: error.message,
        });
      }
    },

    /**
     * Retrieves public articles (only published: true) with filters.
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     * @returns {Promise<void>}
     */
    getAllPublicArticles: async (req, res) => {
      try {
        const filters = {
          keyword: req.query.keyword || "",
          tag: req.query.tag || "",
          category: req.query.category || "",
          page: parseInt(req.query.page, 10) || 1,
          limit: parseInt(req.query.limit, 10) || 10,
          published: true,
        };

        const result = await articleModel.findAll(filters);
        res.status(200).json(result);
      } catch (error) {
        res.status(500).json({
          message: "Failed to fetch articles",
          error: error.message,
        });
      }
    },

    /**
     * Retrieves an article by ID.
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     * @returns {Promise<void>}
     */
    getArticleById: async (req, res) => {
      try {
        const { id } = req.params;
        const article = await articleModel.findById(id);

        if (!article) {
          return res.status(404).json({ message: "Article not found" });
        }

        res.status(200).json(article);
      } catch (error) {
        res.status(500).json({
          message: "Failed to fetch article",
          error: error.message,
        });
      }
    },

    /**
     * Retrieves an article by slug.
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     * @returns {Promise<void>}
     */
    getArticleBySlug: async (req, res) => {
      try {
        const { slug } = req.params;
        const article = await articleModel.findBySlug(slug);

        if (!article) {
          return res.status(404).json({ message: "Article not found" });
        }

        res.status(200).json(article);
      } catch (error) {
        res.status(500).json({
          message: "Failed to fetch article",
          error: error.message,
        });
      }
    },
  };
};

export default createArticleController;
