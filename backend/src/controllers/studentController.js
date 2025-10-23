import fs from "fs";

const studentControllerFactory = ({ pool, importStudentService }) => {
  // Import students from Excel
  // Pastikan return skipBreakdown di response:
  const importStudents = async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      const results = await importStudentService.processImportFile(
        req.file.path
      );

      // **FIX TOAST LOGIC: Warning kalau success=0 atau failed>0**
      const response = {
        success: results.success,
        failed: results.failed,
        skipped: results.skipped,
        updated: results.updated || 0,
        errors: results.errors,
        worksheetDetails: results.worksheetDetails,
        skipBreakdown: results.skipBreakdown || {},
      };

      res.json(response);
    } catch (error) {
      console.error("Import error:", error);
      res.status(500).json({
        message: "Failed to process file",
        error: error.message,
        success: 0,
        failed: 1,
      });
    }
  };
  return {
    importStudents,
  };
};

export default studentControllerFactory;
