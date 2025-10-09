import archiveModelFactory from "../models/ArchiveModel.js";
import path from "path";
import fsPromises from "fs/promises"; // Untuk operasi Promise-based
import fs from "fs"; // Untuk streaming

const archiveControllerFactory = ({ pool }) => {
  const {
    getArchive,
    getArchiveById,
    getArchiveCategories,
    createArchive,
    updateArchive,
    deleteArchive,
  } = archiveModelFactory({ pool });

  // Get list archives (public endpoint)
  const handleGetArchive = async (req, res) => {
    try {
      const { search, page = 1, limit = 10, categoryId } = req.query;

      // Validasi dan normalisasi input
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

  // Get archive categories (public endpoint untuk dropdown)
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

  // Download archive file (public endpoint)
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

      // Cek apakah file masih ada di server
      const filePath = path.resolve(archive.file_path);
      try {
        await fsPromises.access(filePath);
      } catch {
        return res.status(404).json({
          success: false,
          error: "File arsip tidak ditemukan di server",
        });
      }

      // Set headers untuk download
      res.setHeader("Content-Type", archive.mime_type);
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="${archive.file_name}"`
      );
      res.setHeader("Content-Length", archive.file_size);

      // Stream file
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

  // Create new archive (protected - arsiparis or super_admin)
  const handleCreateArchive = async (req, res) => {
    try {
      // Cek apakah ada file upload
      if (!req.file) {
        return res.status(400).json({
          success: false,
          error: "File arsip diperlukan",
        });
      }

      const { description, category_id, document_number, document_date } =
        req.body;

      // Validasi basic input
      if (!req.file.originalname) {
        return res.status(400).json({
          success: false,
          error: "Nama file tidak valid",
        });
      }

      // Validasi category_id
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

      // Parse document_date kalau ada
      let parsedDocumentDate = null;
      if (document_date) {
        parsedDocumentDate = new Date(document_date)
          .toISOString()
          .split("T")[0]; // Format YYYY-MM-DD
        if (isNaN(Date.parse(document_date))) {
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
        document_date: parsedDocumentDate,
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

      // Handle multer error
      if (error.message.includes("multer")) {
        return res.status(400).json({
          success: false,
          error:
            "Upload file gagal. Pastikan file berukuran tidak lebih dari 10MB dan format PDF/Word",
        });
      }

      // Handle foreign key error
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

  // Update archive (protected - arsiparis or super_admin)
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

      // Validasi category_id
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

      // Prepare update data
      const updateData = {
        description: description ? String(description).trim() : null,
        category_id: category_id ? parseInt(category_id) : null,
        document_number: document_number
          ? String(document_number).trim()
          : null,
        document_date: document_date
          ? new Date(document_date).toISOString().split("T")[0]
          : null,
      };

      // Handle file re-upload (optional)
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

      // Handle foreign key error
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

  // Delete archive (protected - arsiparis or super_admin)
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
