// src/controllers/alumniController.js
import alumniModelFactory from "../models/alumniModel.js";

const alumniControllerFactory = ({ pool }) => {
  const alumniModel = alumniModelFactory({ pool });

  const handleGetAlumni = async (req, res) => {
    const { search, graduationYear } = req.query;

    try {
      const alumni = await alumniModel.getAlumni({ search, graduationYear });
      res.json({ data: alumni });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };

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

  return {
    handleGetAlumni,
    handleUpdateAlumni,
  };
};

export default alumniControllerFactory;
