import archiveModelFactory from "../models/archiveModel.js";
import path from "path";
import fsPromises from "fs/promises";
import fs from "fs";

/**
 * Factory function to create an Archive Controller with CRUD operations.
 * @param {Object} dependencies - Dependencies to be injected
 * @param {Object} dependencies.pool - Database connection pool
 * @returns {Object} Controller with CRUD methods
 */
const archiveControllerFactory = ({ pool }) => {
  const {
    getArchive,
    getArchiveById,
    getArchiveCategories,
    createArchive,
    updateArchive,
    deleteArchive,
  } = archiveModelFactory({ pool });

  /**
   * Retrieves archives with pagination and filtering.
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @returns {Promise<void>}
   */
  const handleGetArchive = async (req, res) => {
    try {
      const { search, page = 1, limit = 10, categoryId } = req.query;

      const validatedPage = Math.max(1, parseInt(page) || 1);
      const validatedLimit = Math.min(50, Math.max(1, parseInt(limit) || 10));
      const normalizedSearch = search ? String(search).trim() : "";
      const validatedCategoryId = categoryId ? parseInt(categoryId) : null;

      const result = await getArchive({
        search: normalizedSearch,
        page: validatedPage,
        limit: validatedLimit,
        categoryId: validatedCategoryId,
      });

      res.json({
        success: true,
        data: result.data,
        pagination: {
          currentPage: result.page,
          totalPages: result.totalPages,
          totalItems: result.total,
          itemsPerPage: result.limit,
          hasNextPage: result.page < result.totalPages,
          hasPrevPage: result.page > 1,
        },
      });
    } catch (error) {
      console.error(
        "[Archive Controller] Error fetching archives:",
        error.message
      );
      res.status(500).json({
        success: false,
        error: "Gagal mengambil daftar arsip",
      });
    }
  };

  /**
   * Retrieves all archive categories.
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @returns {Promise<void>}
   */
  const handleGetArchiveCategories = async (req, res) => {
    try {
      const categories = await getArchiveCategories();
      res.json({
        success: true,
        data: categories,
      });
    } catch (error) {
      console.error(
        "[Archive Controller] Error fetching categories:",
        error.message
      );
      res.status(500).json({
        success: false,
        error: "Gagal mengambil kategori arsip",
      });
    }
  };

  /**
   * Downloads an archive file by ID.
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @returns {Promise<void>}
   */
  const handleDownloadArchive = async (req, res) => {
    try {
      const { id } = req.params;

      if (!id || isNaN(parseInt(id))) {
        return res.status(400).json({
          success: false,
          error: "ID arsip tidak valid",
        });
      }

      const archive = await getArchiveById(id);
      if (!archive) {
        return res.status(404).json({
          success: false,
          error: "Arsip tidak ditemukan",
        });
      }

      const filePath = path.resolve(archive.file_path);
      try {
        await fsPromises.access(filePath);
      } catch {
        return res.status(404).json({
          success: false,
          error: "File arsip tidak ditemukan di server",
        });
      }

      res.setHeader("Content-Type", archive.mime_type);
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="${archive.file_name}"`
      );
      res.setHeader("Content-Length", archive.file_size);

      const fileStream = fs.createReadStream(filePath);
      fileStream.pipe(res);
    } catch (error) {
      console.error(
        "[Archive Controller] Error downloading archive:",
        error.message
      );
      res.status(500).json({
        success: false,
        error: "Gagal mengunduh arsip",
      });
    }
  };

  /**
   * Creates a new archive record with file upload.
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @returns {Promise<void>}
   */
  const handleCreateArchive = async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          error: "File arsip diperlukan",
        });
      }

      const { description, category_id, document_number, document_date } =
        req.body;

      if (!req.file.originalname) {
        return res.status(400).json({
          success: false,
          error: "Nama file tidak valid",
        });
      }

      if (category_id) {
        const [categories] = await pool.query(
          "SELECT id FROM archive_categories WHERE id = ?",
          [parseInt(category_id)]
        );
        if (categories.length === 0) {
          return res.status(400).json({
            success: false,
            error: "Category ID tidak valid",
          });
        }
      }

      let parsedDocumentDate = null;
      if (document_date) {
        parsedDocumentDate = String(document_date).trim();
        if (isNaN(Date.parse(parsedDocumentDate))) {
          return res.status(400).json({
            success: false,
            error: "Format tanggal dokumen tidak valid (gunakan YYYY-MM-DD)",
          });
        }
      }

      const archiveData = {
        file_name: req.file.originalname,
        file_path: req.file.path,
        mime_type: req.file.mimetype,
        description: description ? String(description).trim() : null,
        category_id: category_id ? parseInt(category_id) : null,
        file_size: req.file.size,
        document_number: document_number
          ? String(document_number).trim()
          : null,
        document_date: parsedDocumentDate || null,
      };

      const result = await createArchive(archiveData);

      res.status(201).json({
        success: true,
        ...result,
        data: {
          id: result.id,
          file_name: archiveData.file_name,
          upload_date: new Date().toISOString(),
        },
      });
    } catch (error) {
      console.error(
        "[Archive Controller] Error creating archive:",
        error.message
      );

      if (error.message.includes("multer")) {
        return res.status(400).json({
          success: false,
          error:
            "Upload file gagal. Pastikan file berukuran tidak lebih dari 10MB dan format PDF/Word",
        });
      }

      if (error.message.includes("foreign key constraint")) {
        return res.status(400).json({
          success: false,
          error: "Category ID tidak valid atau tidak ditemukan",
        });
      }

      res.status(500).json({
        success: false,
        error: "Gagal membuat arsip baru",
      });
    }
  };

  /**
   * Updates an existing archive by ID.
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @returns {Promise<void>}
   */
  const handleUpdateArchive = async (req, res) => {
    try {
      const { id } = req.params;

      if (!id || isNaN(parseInt(id))) {
        return res.status(400).json({
          success: false,
          error: "ID arsip tidak valid",
        });
      }

      const { description, category_id, document_number, document_date } =
        req.body;

      const existingArchive = await getArchiveById(id);
      if (!existingArchive) {
        return res.status(404).json({
          success: false,
          error: "Arsip tidak ditemukan",
        });
      }

      if (category_id) {
        const [categories] = await pool.query(
          "SELECT id FROM archive_categories WHERE id = ?",
          [parseInt(category_id)]
        );
        if (categories.length === 0) {
          return res.status(400).json({
            success: false,
            error: "Category ID tidak valid",
          });
        }
      }

      let newDocumentDate = existingArchive.document_date || null;

      if (
        document_date !== undefined &&
        document_date !== null &&
        String(document_date).trim() !== ""
      ) {
        const trimmedDate = String(document_date).trim();
        if (
          !/^\d{4}-\d{2}-\d{2}$/.test(trimmedDate) ||
          isNaN(Date.parse(trimmedDate))
        ) {
          return res.status(400).json({
            success: false,
            error: "Format tanggal dokumen tidak valid (gunakan YYYY-MM-DD)",
          });
        }
        newDocumentDate = trimmedDate;
      }

      const updateData = {
        description: description
          ? String(description).trim()
          : existingArchive.description || null,
        category_id: category_id
          ? parseInt(category_id)
          : existingArchive.category_id || null,
        document_number: document_number
          ? String(document_number).trim()
          : existingArchive.document_number || null,
        document_date: newDocumentDate,
        file_name: existingArchive.file_name,
        file_path: existingArchive.file_path,
        mime_type: existingArchive.mime_type,
        file_size: existingArchive.file_size,
      };

      if (req.file) {
        updateData.file_name = req.file.originalname;
        updateData.file_path = req.file.path;
        updateData.mime_type = req.file.mimetype;
        updateData.file_size = req.file.size;
      }

      const result = await updateArchive(id, updateData);

      res.json({
        success: true,
        ...result,
      });
    } catch (error) {
      console.error(
        "[Archive Controller] Error updating archive:",
        error.message
      );

      if (error.message === "Arsip tidak ditemukan") {
        return res.status(404).json({
          success: false,
          error: "Arsip tidak ditemukan",
        });
      }

      if (error.message.includes("foreign key constraint")) {
        return res.status(400).json({
          success: false,
          error: "Category ID tidak valid atau tidak ditemukan",
        });
      }

      res.status(500).json({
        success: false,
        error: "Gagal memperbarui arsip",
      });
    }
  };

  /**
   * Deletes an archive by ID.
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @returns {Promise<void>}
   */
  const handleDeleteArchive = async (req, res) => {
    try {
      const { id } = req.params;

      if (!id || isNaN(parseInt(id))) {
        return res.status(400).json({
          success: false,
          error: "ID arsip tidak valid",
        });
      }

      const result = await deleteArchive(id);

      res.json({
        success: true,
        ...result,
      });
    } catch (error) {
      console.error(
        "[Archive Controller] Error deleting archive:",
        error.message
      );

      if (error.message === "Arsip tidak ditemukan") {
        return res.status(404).json({
          success: false,
          error: "Arsip tidak ditemukan",
        });
      }

      res.status(500).json({
        success: false,
        error: "Gagal menghapus arsip",
      });
    }
  };

  return {
    handleGetArchive,
    handleGetArchiveCategories,
    handleDownloadArchive,
    handleCreateArchive,
    handleUpdateArchive,
    handleDeleteArchive,
  };
};

export default archiveControllerFactory;
