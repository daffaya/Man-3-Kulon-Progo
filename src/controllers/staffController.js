/**
 * @fileoverview Staff Controller for managing teacher and staff data.
 * This module provides a factory function to create a Staff Controller.
 * The controller includes methods for CRUD (Create, Read, Update, Delete) operations
 * on the 'tendik' table in the database.
 */

/**
 * Factory function that creates a Staff Controller for managing staff data.
 *
 * @param {object} dependencies - Dependencies to be injected
 * @param {object} dependencies.staffModel - Model for staff operations
 * @returns {object} Controller with CRUD methods
 */
const createStaffController = ({ staffModel }) => {
  return {
    /**
     * Creates a new staff/teacher record.
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     * @returns {Promise<void>}
     */
    createStaff: async (req, res) => {
      try {
        if (!req.body) {
          return res.status(400).json({ message: "Request body is missing" });
        }

        const { type, nama, nip, gender, status, jabatan } = req.body;

        if (!type || !nama || !nip || !gender || !status || !jabatan) {
          return res.status(400).json({
            message: "All fields are required",
          });
        }

        const newId = await staffModel.create({
          type,
          nama,
          nip,
          gender,
          status,
          jabatan,
        });

        const newRecord = await staffModel.findById(newId);

        res.status(201).json({
          message: "Data created successfully",
          data: newRecord,
        });
      } catch (error) {
        res.status(500).json({
          message: "Failed to create data",
          error: error.message,
        });
      }
    },

    /**
     * Updates a staff/teacher record by ID.
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     * @returns {Promise<void>}
     */
    updateStaff: async (req, res) => {
      try {
        const { id } = req.params;

        if (!req.body) {
          return res.status(400).json({ message: "Request body is missing" });
        }

        const { type, nama, nip, gender, status, jabatan } = req.body;

        if (!type || !nama || !nip || !gender || !status || !jabatan) {
          return res.status(400).json({
            message: "All fields are required",
          });
        }

        const updated = await staffModel.update(id, {
          type,
          nama,
          nip,
          gender,
          status,
          jabatan,
        });

        if (!updated) {
          return res.status(404).json({ message: "Data not found" });
        }

        const updatedRecord = await staffModel.findById(id);
        res.status(200).json({
          message: "Data updated successfully",
          data: updatedRecord,
        });
      } catch (error) {
        res.status(500).json({
          message: "Failed to update data",
          error: error.message,
        });
      }
    },

    /**
     * Deletes a staff/teacher record by ID.
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     * @returns {Promise<void>}
     */
    deleteStaff: async (req, res) => {
      try {
        const { id } = req.params;
        const deleted = await staffModel.delete(id);

        if (!deleted) {
          return res.status(404).json({ message: "Data not found" });
        }

        res.status(200).json({ message: "Data deleted successfully" });
      } catch (error) {
        res.status(500).json({
          message: "Failed to delete data",
          error: error.message,
        });
      }
    },

    /**
     * Retrieves all staff/teachers with filters and pagination.
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     * @returns {Promise<void>}
     */
    getAllStaff: async (req, res) => {
      try {
        const filters = {
          keyword: req.query.keyword || "",
          type: req.query.type || "",
          gender: req.query.gender || "",
          status: req.query.status || "",
          page: parseInt(req.query.page, 10) || 1,
          limit: parseInt(req.query.limit, 10) || 10,
        };

        const result = await staffModel.findAll(filters);
        res.status(200).json(result);
      } catch (error) {
        res.status(500).json({
          message: "Failed to fetch data",
          error: error.message,
        });
      }
    },

    /**
     * Retrieves a single staff/teacher by ID.
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     * @returns {Promise<void>}
     */
    getStaffById: async (req, res) => {
      try {
        const { id } = req.params;
        const record = await staffModel.findById(id);

        if (!record) {
          return res.status(404).json({ message: "Data not found" });
        }

        res.status(200).json({ data: record });
      } catch (error) {
        res.status(500).json({
          message: "Failed to fetch data",
          error: error.message,
        });
      }
    },

    /**
     * Gets recapitulation data for teachers.
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     * @returns {Promise<void>}
     */
    getTeacherRecap: async (req, res) => {
      try {
        const data = await staffModel.getRecapByType("teacher");
        res.status(200).json({
          success: true,
          message: "Data rekapitulasi guru berhasil diambil",
          data,
        });
      } catch (error) {
        res.status(500).json({
          success: false,
          message: "Terjadi kesalahan pada server",
          error: error.message,
        });
      }
    },

    /**
     * Gets recapitulation data for staff.
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     * @returns {Promise<void>}
     */
    getStaffRecap: async (req, res) => {
      try {
        const data = await staffModel.getRecapByType("staff");
        res.status(200).json({
          success: true,
          message: "Data rekapitulasi staf berhasil diambil",
          data,
        });
      } catch (error) {
        res.status(500).json({
          success: false,
          message: "Terjadi kesalahan pada server",
          error: error.message,
        });
      }
    },

    /**
     * Gets all tendik data for detailed view.
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     * @returns {Promise<void>}
     */
    getAllTendik: async (req, res) => {
      try {
        const data = await staffModel.getAllTendik();
        res.status(200).json({
          success: true,
          message: "Data tendik berhasil diambil",
          data,
        });
      } catch (error) {
        res.status(500).json({
          success: false,
          message: "Terjadi kesalahan pada server",
          error: error.message,
        });
      }
    },
  };
};

export default createStaffController;
