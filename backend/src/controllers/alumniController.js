import alumniModelFactory from "../models/alumniModel.js";

/**
 * Factory function to create an Alumni Controller.
 * @param {Object} dependencies - The dependencies to be injected.
 * @param {Object} dependencies.pool - The database connection pool.
 * @returns {Object} An object containing alumni controller methods.
 */
const alumniControllerFactory = ({ pool }) => {
  const alumniModel = alumniModelFactory({ pool });

  /**
   * Handles the request to get a list of alumni with filtering and pagination.
   * @async
   * @param {Object} req - Express request object.
   * @param {Object} res - Express response object.
   * @returns {Promise<void>}
   */
  const handleGetAlumni = async (req, res) => {
    const { search, graduationYear, page, limit } = req.query;

    try {
      const result = await alumniModel.getAlumni({
        search,
        graduationYear,
        page: page ? parseInt(page) : 1,
        limit: limit ? parseInt(limit) : 35,
      });
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };

  /**
   * Handles the request to update an alumnus's data by ID.
   * @async
   * @param {Object} req - Express request object.
   * @param {Object} res - Express response object.
   * @returns {Promise<void>}
   */
  const handleUpdateAlumni = async (req, res) => {
    const { id } = req.params;
    const { status, workplace, business, university } = req.body;

    try {
      const updated = await alumniModel.updateAlumni(id, {
        status,
        workplace,
        business,
        university,
      });

      if (!updated) {
        return res.status(404).json({ error: "Alumni tidak ditemukan" });
      }

      res.json({ success: true, message: "Data alumni diperbarui" });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };

  /**
   * Handles the request to get an alumnus's data by ID.
   * @async
   * @param {Object} req - Express request object.
   * @param {Object} req.params - Route parameters.
   * @param {string} req.params.id - The ID of the alumnus.
   * @param {Object} res - Express response object.
   * @returns {Promise<void>}
   */
  const handleGetAlumniById = async (req, res) => {
    const { id } = req.params;

    try {
      const alumni = await alumniModel.getAlumniById(id);

      if (!alumni) {
        return res.status(404).json({ error: "Alumni tidak ditemukan" });
      }

      res.json(alumni);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };

  return {
    handleGetAlumni,
    handleUpdateAlumni,
    handleGetAlumniById,
  };
};

export default alumniControllerFactory;
