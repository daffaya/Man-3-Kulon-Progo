import slugify from "slugify";
import { calculateReadingTime } from "../utils/helper.js";
import { v4 as uuidv4 } from "uuid";

/**
 * Factory function untuk membuat Article Controller.
 * @param {Object} dependencies - Dependencies yang di-inject
 * @param {Object} dependencies.articleModel - Model untuk operasi artikel
 * @param {Object} dependencies.categoryModel - Model untuk kategori (opsional)
 * @returns {Object} Controller dengan method CRUD
 */
const createArticleController = ({ articleModel, categoryModel }) => {
  return {
    /**
     * Membuat artikel baru dengan data dari request body dan file upload.
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     */
    createArticle: async (req, res) => {
      try {
        if (!req.body) {
          return res.status(400).json({ message: "Request body is missing" });
        }

        const {
          title = "",
          content = "",
          overview = "",
          coverImage = "",
          tags = "[]",
          publishedDate = new Date().toISOString().split("T")[0],
          featured = "false",
          published = "false",
          author = '{"name":"Penulis Pena","avatar":"/profile.jpg"}',
          category_id = null,
        } = req.body;

        // Parse tags dan author dengan fallback
        let parsedTags = [];
        try {
          parsedTags = typeof tags === "string" ? JSON.parse(tags) : tags;
        } catch {
          parsedTags = [];
        }

        let parsedAuthor = { name: "Penulis Pena", avatar: "/profile.jpg" };
        try {
          parsedAuthor =
            typeof author === "string" ? JSON.parse(author) : author;
        } catch {}

        // Validasi field wajib
        if (!title || !content || !overview) {
          return res.status(400).json({
            message: "Title, content, and overview are required",
          });
        }

        const slug = slugify(title, {
          lower: true,
          strict: true,
          remove: /[*+~.()'"!:@]/g,
        });
        const readingTime = calculateReadingTime(content);
        const finalCoverImage = req.file
          ? `/uploads/covers/${req.file.filename}`
          : coverImage;
        const articleId = uuidv4();

        const newArticleId = await articleModel.create({
          id: articleId,
          title,
          slug,
          content,
          overview,
          coverImage: finalCoverImage,
          tags: parsedTags,
          publishedDate,
          featured: featured === "true" || featured === true,
          published: published === "true" || published === true,
          authorName: parsedAuthor.name,
          authorAvatar: parsedAuthor.avatar,
          readingTime,
          categoryId: category_id ? parseInt(category_id, 10) : null,
        });

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
     * Mengambil semua artikel untuk admin dengan filter dan paginasi.
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
     * Mengambil artikel publik (hanya yang published: true) dengan filter.
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
     * Mengambil artikel berdasarkan ID.
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
     * Mengambil artikel berdasarkan slug.
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

    /**
     * Memperbarui artikel berdasarkan ID.
     */
    updateArticle: async (req, res) => {
      try {
        const { id } = req.params;
        if (!req.body) {
          return res.status(400).json({ message: "Request body is missing" });
        }

        const {
          title = "",
          content = "",
          overview = "",
          coverImage = "",
          tags = "[]",
          publishedDate = new Date().toISOString().split("T")[0],
          featured = "false",
          published = "false",
          author = '{"name":"Penulis Pena","avatar":"/profile.jpg"}',
          category_id = null,
        } = req.body;

        let parsedTags = [];
        try {
          parsedTags = typeof tags === "string" ? JSON.parse(tags) : tags;
        } catch {
          parsedTags = [];
        }

        let parsedAuthor = { name: "Penulis Pena", avatar: "/profile.jpg" };
        try {
          parsedAuthor =
            typeof author === "string" ? JSON.parse(author) : author;
        } catch {}

        if (!title || !content || !overview) {
          return res.status(400).json({
            message: "Title, content, and overview are required",
          });
        }

        const slug = slugify(title, {
          lower: true,
          strict: true,
          remove: /[*+~.()'"!:@]/g,
        });
        const readingTime = calculateReadingTime(content);
        const finalCoverImage = req.file
          ? `/uploads/covers/${req.file.filename}`
          : coverImage;

        const updated = await articleModel.update(id, {
          title,
          slug,
          content,
          overview,
          coverImage: finalCoverImage,
          tags: parsedTags,
          publishedDate,
          featured: featured === "true" || featured === true,
          published: published === "true" || published === true,
          authorName: parsedAuthor.name,
          authorAvatar: parsedAuthor.avatar,
          readingTime,
          categoryId: category_id ? parseInt(category_id, 10) : null,
        });

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
     * Menghapus artikel berdasarkan ID.
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
  };
};

export default createArticleController;
